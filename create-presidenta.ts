import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function createPresidenta() {
  try {
    // Crear usuario
    const hashedPassword = await hash('Colmena2025!', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'yanixa@clubcolmena.org',
        name: 'Yanixa Maribi Hernández Churinos',
        password: hashedPassword,
        role: 'bee',
      }
    });

    console.log('✅ Usuario creado:', user.email);

    // Crear Bee (Presidenta)
    const bee = await prisma.bee.create({
      data: {
        userId: user.id,
        cedula: '9738355',
        phone: '04141234567',
        memberType: 'presidente',
        eliteNumber: 1,
        founderNumber: 1,
        affiliationNumber: '001-001-9738355',
        isActive: true,
        activationPaid: true,
        activationDate: new Date(),
      }
    });

    console.log('✅ Bee creado:', bee.affiliationNumber);

    // Crear códigos de regalo ELITE para la presidenta (100 códigos)
    const giftCodes = [];
    for (let i = 0; i < 100; i++) {
      const code = `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      giftCodes.push({
        giverBeeId: bee.id,
        giftCode: code,
        status: 'available',
      });
    }

    await prisma.giftAction.createMany({ data: giftCodes });
    console.log('✅ 100 códigos ELITE creados');

    // Crear acción inicial
    await prisma.action.create({
      data: {
        beeId: bee.id,
        type: 'activation',
        description: 'Activación inicial - Presidente',
        quantity: 1,
      }
    });
    console.log('✅ Acción inicial creada');

    console.log('\n🎉 PRESIDENTA CREADA EXITOSAMENTE');
    console.log('=====================================');
    console.log('Email: yanixa@clubcolmena.org');
    console.log('Password: Colmena2025!');
    console.log('Afiliación: 001-001-9738355');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPresidenta();
