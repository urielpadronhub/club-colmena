import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  console.log('🌱 Iniciando seed de La Colmena...')

  // Crear cuenta bancaria de la organización
  const orgBankAccount = await db.organizationBankAccount.upsert({
    where: { id: 'org-bank-account' },
    update: {},
    create: {
      id: 'org-bank-account',
      accountHolder: 'Sara Mestre',
      bankName: 'Banco del Caribe',
      phone: '04140379406',
      rif: 'J297354239',
      accountType: 'corriente',
      isActive: true
    }
  })
  console.log('✅ Cuenta bancaria de la organización creada:', orgBankAccount.accountHolder)

  // Crear usuario admin
  const adminPassword = simpleHash('admin123')
  const admin = await db.user.upsert({
    where: { email: 'admin@colmena.org' },
    update: {},
    create: {
      email: 'admin@colmena.org',
      name: 'Administrador',
      password: adminPassword,
      role: 'admin'
    }
  })

  console.log('✅ Usuario admin creado:', admin.email)

  // Crear usuario de prueba (abeja)
  const testPassword = simpleHash('test123')
  const testUser = await db.user.upsert({
    where: { email: 'test@colmena.org' },
    update: {},
    create: {
      email: 'test@colmena.org',
      name: 'María García',
      password: testPassword,
      role: 'bee'
    }
  })

  console.log('✅ Usuario de prueba creado:', testUser.email)

  // Crear datos de la abeja de prueba
  if (testUser) {
    const bee = await db.bee.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        cedula: 'V-12345678',
        phone: '0414-1234567',
        address: 'Caracas, Venezuela',
        affiliationNumber: 'ABEJA-0001-2024',
        isActive: true,
        activationPaid: true,
        activationDate: new Date()
      }
    })

    console.log('✅ Abeja de prueba creada:', bee.affiliationNumber)

    // Crear acciones de regalo para la abeja de prueba
    const existingGifts = await db.giftAction.count({
      where: { giverBeeId: bee.id }
    })

    if (existingGifts === 0) {
      await db.giftAction.createMany({
        data: [
          { giverBeeId: bee.id, giftCode: 'MIEL-TEST0001', status: 'available' },
          { giverBeeId: bee.id, giftCode: 'MIEL-TEST0002', status: 'available' },
          { giverBeeId: bee.id, giftCode: 'MIEL-TEST0003', status: 'available' }
        ]
      })
      console.log('✅ Códigos de regalo creados')
    }

    // Crear acción inicial
    const existingActions = await db.action.count({
      where: { beeId: bee.id }
    })

    if (existingActions === 0) {
      await db.action.create({
        data: {
          beeId: bee.id,
          type: 'activation',
          description: 'Acción por activación inicial',
          quantity: 1
        }
      })
      console.log('✅ Acción inicial creada')
    }

    // Crear cuenta bancaria de prueba
    const existingBank = await db.bankAccount.findUnique({
      where: { beeId: bee.id }
    })

    if (!existingBank) {
      await db.bankAccount.create({
        data: {
          beeId: bee.id,
          bankName: 'Banco de Venezuela',
          accountType: 'corriente',
          accountNumber: '0102-0000-00-00000001',
          cedula: 'V-12345678',
          phone: '0414-1234567'
        }
      })
      console.log('✅ Cuenta bancaria de prueba creada')
    }
  }

  // Crear un sorteo de ejemplo
  const existingRaffles = await db.raffle.count()
  
  if (existingRaffles === 0) {
    await db.raffle.create({
      data: {
        name: 'Primer Sorteo Semanal',
        description: 'Sorteo de bienvenida para la colmena',
        type: 'weekly',
        prizeAmount: 15,
        numberOfWinners: 1,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'scheduled'
      }
    })
    console.log('✅ Sorteo de ejemplo creado')
  }

  // Crear niño becado de ejemplo
  const existingChildren = await db.child.count()
  
  if (existingChildren === 0) {
    await db.child.create({
      data: {
        name: 'José Pérez',
        cedula: 'V-87654321',
        grade: '5to Grado',
        school: 'Escuela Básica Nacional',
        representativeName: 'Ana Pérez',
        representativePhone: '0424-9876543',
        representativeEmail: 'ana@email.com',
        monthlyBenefit: 50,
        status: 'active'
      }
    })
    console.log('✅ Niño becado de ejemplo creado')
  }

  console.log('\n🎉 ¡Seed completado con éxito!')
  console.log('\n📋 Credenciales de acceso:')
  console.log('   Admin: admin@colmena.org / admin123')
  console.log('   Usuario de prueba: test@colmena.org / test123')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
