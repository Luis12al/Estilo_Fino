import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ========== SERVICIOS BASE ==========
  const services = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Corte de cabello', description: 'Corte clásico o moderno a tu estilo', price: 20000, durationMinutes: 60 },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Cejas', description: 'Diseño y arreglo de cejas', price: 4000, durationMinutes: 5 },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Barba', description: 'Arreglo y delineado de barba', price: 8000, durationMinutes: 10 },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Pigmentación', description: 'Pigmentación temporal para barba o cabello', price: 5000, durationMinutes: 10 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }
  console.log('✅ Servicios base creados');

  // ========== CONFIGURACIÓN DE BARBEROS ==========
  const barbers = [
    {
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'leo@barbershop.com',
      password: 'admin123',
      firstName: 'Leo',
      lastName: 'Jaramillo',
      phone: '+573001234567',
      bio: 'Barbero profesional con 10 años de experiencia. Especialista en fades y diseños.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    {
      userId: '22222222-2222-2222-2222-222222222222',
      email: 'dogy@barbershop.com',
      password: 'admin123',
      firstName: 'Carlos',
      lastName: 'Herrera',
      phone: '+573002345678',
      bio: 'Especialista en barbas y cortes clásicos. Experto en pigmentación.',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    },
  ];

  for (const barberData of barbers) {
    const hashedPassword = await bcrypt.hash(barberData.password, 12);

    const user = await prisma.user.upsert({
      where: { email: barberData.email },
      update: {},
      create: {
        id: barberData.userId,
        email: barberData.email,
        passwordHash: hashedPassword,
        firstName: barberData.firstName,
        lastName: barberData.lastName,
        phone: barberData.phone,
        role: 'BARBER',
      },
    });

    const barberProfile = await prisma.barberProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: barberData.bio,
        avatarUrl: barberData.avatarUrl,
        defaultSlotDuration: 60,
      },
    });

    const barberId = barberProfile.id;

    // Horario del barbero (Lunes a Sábado, 9am - 9pm)
    const days = [1, 2, 3, 4, 5, 6];
    for (const day of days) {
      await prisma.workSchedule.upsert({
        where: {
          barberId_dayOfWeek: {
            barberId: barberId,
            dayOfWeek: day,
          },
        },
        update: {},
        create: {
          barberId: barberId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '21:00',
          isActive: true,
        },
      });
    }

    // Descanso almuerzo (12:00 - 14:00 todos los días)
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      await prisma.break.upsert({
        where: {
          id: `${barberId}-break-${day}`,
        },
        update: {},
        create: {
          barberId: barberId,
          dayOfWeek: day,
          startTime: '12:00',
          endTime: '14:00',
          isRecurring: true,
        },
      });
    }

    console.log(`✅ Barbero creado: ${barberData.email} / ${barberData.password}`);
  }

  // ========== CLIENTE DE PRUEBA ==========
  const clientPassword = await bcrypt.hash('cliente123', 12);
  await prisma.user.upsert({
    where: { email: 'cliente@email.com' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'cliente@email.com',
      passwordHash: clientPassword,
      firstName: 'Andrés',
      lastName: 'Gómez',
      phone: '+573009876543',
      role: 'CLIENT',
    },
  });
  console.log('✅ Cliente de prueba creado: cliente@email.com / cliente123');

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });