// backend/src/modules/appointments/appointment.service.ts
import { prisma } from '@config/database';
import { AppError } from '@shared/middlewares/error.middleware';
import { CreateAppointmentInput, AvailabilityQuery, ManualBookingInput } from './appointment.dto';
import { AppointmentStatus } from '@prisma/client';

const SLOT_INTERVAL = 30;

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export class AppointmentService {
  
  /**
   * 🔥 Calcular slots disponibles para un barbero en una fecha
   */
  async getAvailability(query: AvailabilityQuery) {
    const { barberId, date, durationMinutes } = query;
    
    // ← FIX: Crear fechas en UTC para evitar problemas de timezone
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = targetDate.getUTCDay();

    // ── 1. Verificar día libre ──
    const dayOff = await prisma.dayOff.findFirst({
      where: {
        barberId,
        date: {
          gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)),
          lt: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
        },
      },
    });

    if (dayOff) {
      return {
        available: false,
        reason: dayOff.reason || 'Día no disponible',
        slots: [],
        schedule: null,
        breaks: [],
        appointments: [],
      };
    }

    // ── 2. Obtener horario laboral ──
    const schedule = await prisma.workSchedule.findUnique({
      where: {
        barberId_dayOfWeek: { barberId, dayOfWeek },
      },
    });

    if (!schedule || !schedule.isActive) {
      return {
        available: false,
        reason: 'El barbero no atiende este día',
        slots: [],
        schedule: null,
        breaks: [],
        appointments: [],
      };
    }

    // ── 3. Obtener descansos y citas en paralelo ──
    const [breaks, existingAppointments] = await Promise.all([
      prisma.break.findMany({
        where: { barberId, dayOfWeek },
      }),
      prisma.appointment.findMany({
        where: {
          barberId,
          startTime: {
            gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)),
            lt: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
          },
          status: {
            notIn: ['CANCELLED', 'NO_SHOW'],
          },
        },
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          client: {
            select: { firstName: true, lastName: true },
          },
          guestName: true,
        },
      }),
    ]);

    // ── 4. Calcular slots ──
    const slots = this.calculateSlots(
      schedule.startTime,
      schedule.endTime,
      breaks,
      existingAppointments,
      durationMinutes,
      date
    );
    
    return {
      available: slots.length > 0,
      reason: slots.length > 0 ? undefined : 'No hay cupos disponibles para esta fecha',
      schedule: {
        start: schedule.startTime,
        end: schedule.endTime,
      },
      slots,
      breaks: breaks.map(b => ({
        start: b.startTime,
        end: b.endTime,
      })),
      appointments: existingAppointments.map(apt => ({
        id: apt.id,
        start: this.formatTime(apt.startTime),
        end: this.formatTime(apt.endTime),
        status: apt.status,
        clientName: apt.client 
          ? `${apt.client.firstName} ${apt.client.lastName}`
          : (apt.guestName || 'Walk-in'),
      })),
    };
  }

  /**
   * 📊 Estadísticas del día para dashboard
   */
  async getTodayStats(barberId: string) {
    // ← FIX: Usar la fecha local del servidor, no UTC
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      barberId,
      startTime: { 
        gte: today, 
        lt: tomorrow 
      },
    };

    const [
      total, 
      pending, 
      confirmed, 
      inProgress, 
      completed, 
      cancelled
    ] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: 'PENDING' } }),
      prisma.appointment.count({ where: { ...where, status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.appointment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return { total, pending, confirmed, inProgress, completed, cancelled };
  }

  /**
   * Obtener citas de un barbero (con filtro opcional por fecha)
   */
  async getBarberAppointments(barberId: string, date?: string) {
    const where: any = { barberId };
    
    if (date) {
      // ← FIX: Parsear fecha correctamente en UTC
      const [year, month, day] = date.split('-').map(Number);
      where.startTime = {
        gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)),
        lt: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
      };
    }

    return prisma.appointment.findMany({
      where,
      include: {
        services: {
          include: { service: true },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * 🛡️ Crear cita con transacción atómica
   */
  async create(data: CreateAppointmentInput, clientId: string) {
    const { barberId, startTime, serviceIds, notes, paymentReference } = data;

    const barber = await prisma.barberProfile.findUnique({
      where: { id: barberId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!barber) {
      throw new AppError(404, 'Barbero no encontrado');
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length !== serviceIds.length) {
      throw new AppError(400, 'Uno o más servicios no existen');
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

    const start = new Date(startTime);
    const end = new Date(start.getTime() + totalDuration * 60000);

    const appointment = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.appointment.findFirst({
        where: {
          barberId,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (overlapping) {
        throw new AppError(409, 'Este horario ya fue reservado. Por favor selecciona otro.');
      }

      const dayOfWeek = start.getDay();
      const workSchedule = await tx.workSchedule.findUnique({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
      });

      if (!workSchedule || !workSchedule.isActive) {
        throw new AppError(400, 'El barbero no trabaja en este horario');
      }

      const [wsStartH, wsStartM] = workSchedule.startTime.split(':').map(Number);
      const [wsEndH, wsEndM] = workSchedule.endTime.split(':').map(Number);

      const workStart = new Date(start);
      workStart.setHours(wsStartH, wsStartM, 0, 0);
      
      const workEnd = new Date(start);
      workEnd.setHours(wsEndH, wsEndM, 0, 0);

      if (start < workStart || end > workEnd) {
        throw new AppError(400, 'La cita debe estar dentro del horario laboral');
      }

      const breaks = await tx.break.findMany({
        where: { barberId, dayOfWeek },
      });

      for (const b of breaks) {
        const [bStartH, bStartM] = b.startTime.split(':').map(Number);
        const [bEndH, bEndM] = b.endTime.split(':').map(Number);
        
        const bStart = new Date(start);
        bStart.setHours(bStartH, bStartM, 0, 0);
        
        const bEnd = new Date(start);
        bEnd.setHours(bEndH, bEndM, 0, 0);

        if (start < bEnd && end > bStart) {
          throw new AppError(400, 'La cita coincide con un descanso del barbero');
        }
      }

      const dayOff = await tx.dayOff.findFirst({
        where: {
          barberId,
          date: {
            gte: new Date(start.toISOString().split('T')[0] + 'T00:00:00'),
            lt: new Date(start.toISOString().split('T')[0] + 'T23:59:59.999'),
          },
        },
      });

      if (dayOff) {
        throw new AppError(400, 'El barbero tiene día libre en esta fecha');
      }

      return tx.appointment.create({
        data: {
          clientId,
          barberId,
          startTime: start,
          endTime: end,
          totalPrice,
          totalDuration,
          status: 'PENDING',
          notes,
          services: {
            create: services.map((service) => ({
              serviceId: service.id,
              priceAtBooking: service.price,
              durationAtBooking: service.durationMinutes,
            })),
          },
        },
        include: {
          services: {
            include: { service: true },
          },
          client: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          barber: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    }, {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000,
    });

    return appointment;
  }

  /**
   * 🛡️ Crear cita MANUAL por barbero (walk-in)
   */
  async createManual(data: ManualBookingInput, barberId: string) {
    const { guestName, guestPhone, startTime, serviceIds, notes } = data;

    const barber = await prisma.barberProfile.findUnique({
      where: { id: barberId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!barber) {
      throw new AppError(404, 'Perfil de barbero no encontrado');
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length !== serviceIds.length) {
      throw new AppError(400, 'Uno o más servicios no existen');
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

    const start = new Date(startTime);
    const end = new Date(start.getTime() + totalDuration * 60000);

    const appointment = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.appointment.findFirst({
        where: {
          barberId,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (overlapping) {
        throw new AppError(409, 'Este horario ya fue reservado. Por favor selecciona otro.');
      }

      const dayOfWeek = start.getDay();
      const workSchedule = await tx.workSchedule.findUnique({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
      });

      if (!workSchedule || !workSchedule.isActive) {
        throw new AppError(400, 'El barbero no trabaja en este horario');
      }

      const [wsStartH, wsStartM] = workSchedule.startTime.split(':').map(Number);
      const [wsEndH, wsEndM] = workSchedule.endTime.split(':').map(Number);

      const workStart = new Date(start);
      workStart.setHours(wsStartH, wsStartM, 0, 0);
      
      const workEnd = new Date(start);
      workEnd.setHours(wsEndH, wsEndM, 0, 0);

      if (start < workStart || end > workEnd) {
        throw new AppError(400, 'La cita debe estar dentro del horario laboral');
      }

      const breaks = await tx.break.findMany({
        where: { barberId, dayOfWeek },
      });

      for (const b of breaks) {
        const [bStartH, bStartM] = b.startTime.split(':').map(Number);
        const [bEndH, bEndM] = b.endTime.split(':').map(Number);
        
        const bStart = new Date(start);
        bStart.setHours(bStartH, bStartM, 0, 0);
        
        const bEnd = new Date(start);
        bEnd.setHours(bEndH, bEndM, 0, 0);

        if (start < bEnd && end > bStart) {
          throw new AppError(400, 'La cita coincide con un descanso del barbero');
        }
      }

      const dayOff = await tx.dayOff.findFirst({
        where: {
          barberId,
          date: {
            gte: new Date(start.toISOString().split('T')[0] + 'T00:00:00'),
            lt: new Date(start.toISOString().split('T')[0] + 'T23:59:59.999'),
          },
        },
      });

      if (dayOff) {
        throw new AppError(400, 'El barbero tiene día libre en esta fecha');
      }

      return tx.appointment.create({
        data: {
          guestName,
          guestPhone,
          barberId,
          startTime: start,
          endTime: end,
          totalPrice,
          totalDuration,
          status: 'PENDING',
          notes: notes ? `[Agendado por barbero] ${notes}` : '[Agendado por barbero]',
          services: {
            create: services.map((service) => ({
              serviceId: service.id,
              priceAtBooking: service.price,
              durationAtBooking: service.durationMinutes,
            })),
          },
        },
        include: {
          services: {
            include: { service: true },
          },
          client: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          barber: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    }, {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000,
    });

    return appointment;
  }

  /**
   * Obtener citas de un cliente
   */
  async getClientAppointments(clientId: string) {
    return prisma.appointment.findMany({
      where: { clientId },
      include: {
        services: {
          include: { service: true },
        },
        barber: {
          include: { user: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateStatus(
    appointmentId: string,
    barberId: string,
    status: AppointmentStatus,
    reason?: string
  ) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, barberId },
      include: {
        client: { select: { firstName: true, lastName: true, phone: true } },
        services: { include: { service: { select: { name: true } } } },
      },
    });

    if (!appointment) {
      throw new AppError(404, 'Cita no encontrada o no pertenece a este barbero');
    }

    const allowedNext = VALID_TRANSITIONS[appointment.status];
    if (!allowedNext.includes(status)) {
      throw new AppError(
        400,
        `Transición inválida: ${appointment.status} → ${status}. Permitidas: ${allowedNext.join(', ')}`
      );
    }

    const updateData: any = { status };
    
    if (reason) {
      const timestamp = new Date().toISOString();
      updateData.notes = `${appointment.notes || ''}\n[${timestamp}] Estado ${status}: ${reason}`.trim();
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        client: { select: { firstName: true, lastName: true, phone: true } },
        services: { include: { service: { select: { name: true } } } },
      },
    });

    return updated;
  }

  /**
   * ⏱️ Extender cita +20min
   */
  async extend(
    appointmentId: string,
    barberId: string,
    additionalMinutes: number = 20
  ) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, barberId, status: 'IN_PROGRESS' },
    });

    if (!appointment) {
      throw new AppError(404, 'Cita no encontrada o no está en progreso');
    }

    const newEndTime = new Date(appointment.endTime.getTime() + additionalMinutes * 60000);

    const conflicting = await prisma.appointment.findFirst({
      where: {
        barberId,
        id: { not: appointmentId },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        startTime: {
          gt: appointment.endTime,
          lt: newEndTime,
        },
      },
    });

    if (conflicting) {
      throw new AppError(
        409,
        `No se puede extender ${additionalMinutes}min. Conflicto con cita a las ${this.formatTime(conflicting.startTime)}`
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        endTime: newEndTime,
        totalDuration: appointment.totalDuration + additionalMinutes,
        notes: `${appointment.notes || ''}\n[${new Date().toISOString()}] Extensión: +${additionalMinutes}min`.trim(),
      },
      include: {
        client: { select: { firstName: true, lastName: true, phone: true } },
        services: { include: { service: { select: { name: true } } } },
      },
    });

    return updated;
  }

  // ========== MÉTODOS PRIVADOS ==========

  private calculateSlots(
    workStart: string,
    workEnd: string,
    breaks: any[],
    appointments: any[],
    durationMinutes: number,
    date: string
  ): string[] {
    const slots: string[] = [];
    
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(workStart);
    const endMinutes = toMinutes(workEnd);
    const duration = Number(durationMinutes);

    const occupied: Array<{ start: number; end: number }> = [];

    for (const b of breaks) {
      occupied.push({
        start: toMinutes(b.startTime),
        end: toMinutes(b.endTime),
      });
    }

    for (const apt of appointments) {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      occupied.push({
        start: aptStart.getUTCHours() * 60 + aptStart.getUTCMinutes(),
        end: aptEnd.getUTCHours() * 60 + aptEnd.getUTCMinutes(),
      });
    }

    occupied.sort((a, b) => a.start - b.start);

    let currentTime = startMinutes;

    for (const block of occupied) {
      while (currentTime + duration <= block.start) {
        slots.push(this.minutesToTime(currentTime));
        currentTime += SLOT_INTERVAL;
      }
      currentTime = Math.max(currentTime, block.end);
    }

    while (currentTime + duration <= endMinutes) {
      slots.push(this.minutesToTime(currentTime));
      currentTime += SLOT_INTERVAL;
    }

    return slots;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

export const appointmentService = new AppointmentService();