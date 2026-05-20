"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    // ========== BARBERO DE PRUEBA ==========
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
        where: { email: 'barbero@barbershop.com' },
        update: {},
        create: {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'barbero@barbershop.com',
            passwordHash: hashedPassword,
            firstName: 'Juan',
            lastName: 'Pérez',
            phone: '+573001234567',
            role: 'BARBER',
        },
    });
    // Crear perfil de barbero y capturar su ID
    const barberProfile = await prisma.barberProfile.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
            userId: adminUser.id,
            bio: 'Barbero profesional con 10 años de experiencia. Especialista en fades y diseños.',
            defaultSlotDuration: 60,
        },
    });
    // ===== CORRECCIÓN CLAVE: usar barberProfile.id, NO adminUser.id =====
    const barberId = barberProfile.id;
    // Horario del barbero (Lunes a Sábado, 9am - 9pm)
    const days = [1, 2, 3, 4, 5, 6];
    for (const day of days) {
        await prisma.workSchedule.upsert({
            where: {
                barberId_dayOfWeek: {
                    barberId: barberId, // ← CORREGIDO
                    dayOfWeek: day
                }
            },
            update: {},
            create: {
                barberId: barberId, // ← CORREGIDO
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '21:00',
                isActive: true,
            },
        });
    }
    // Descanso almuerzo (13:00 - 14:00 todos los días)
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
        await prisma.break.createMany({
            skipDuplicates: true,
            data: {
                barberId: barberId, // ← CORREGIDO
                dayOfWeek: day,
                startTime: '13:00',
                endTime: '14:00',
                isRecurring: true,
            },
        });
    }
    console.log('✅ Barbero de prueba creado: barbero@barbershop.com / admin123');
    // ========== CLIENTE DE PRUEBA ==========
    const clientPassword = await bcryptjs_1.default.hash('cliente123', 12);
    await prisma.user.upsert({
        where: { email: 'cliente@email.com' },
        update: {},
        create: {
            id: '22222222-2222-2222-2222-222222222222',
            email: 'cliente@email.com',
            passwordHash: clientPassword,
            firstName: 'Carlos',
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
