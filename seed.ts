import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  console.log('🌱 Creando usuarios base...\n')
  
  // 1. Crear Admin
  const adminPassword = simpleHash('admin123')
  const admin = await db.user.create({
    data: {
      email: 'admin@clubcolmena.org',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin'
    }
  })
  console.log('✅ Admin: admin@clubcolmena.org / admin123')
  
  // 2. Crear Presidenta (Admin + Presidente)
  const presidentPassword = simpleHash('Colmena2025!')
  const president = await db.user.create({
    data: {
      email: 'yanixa@clubcolmena.org',
      password: presidentPassword,
      name: 'Yanixa Maribi Hernández Churinos',
      role: 'admin'
    }
  })
  
  const presidentBee = await db.bee.create({
    data: {
      userId: president.id,
      cedula: '9738355',
      phone: '04141234567',
      memberType: 'presidente',
      eliteNumber: 1,
      affiliationNumber: '001-000-9738355',
      isActive: true,
      activationPaid: true,
      activationDate: new Date()
    }
  })
  
  // 100 códigos ELITE para la presidenta
  const eliteCodes = []
  for (let i = 0; i < 100; i++) {
    eliteCodes.push({
      giverBeeId: presidentBee.id,
      giftCode: `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'available'
    })
  }
  await db.giftAction.createMany({ data: eliteCodes })
  console.log('✅ Presidenta: yanixa@clubcolmena.org / Colmena2025!')
  console.log('   Afiliación: 001-000-9738355')
  console.log('   100 códigos ELITE')
  
  // 3. Crear Uriel (Admin + Elite)
  const urielPassword = simpleHash('Uriel8505!')
  const uriel = await db.user.create({
    data: {
      email: 'urielpadron8505@gmail.com',
      password: urielPassword,
      name: 'Uriel Adolfo Padrón Guerra',
      role: 'admin'
    }
  })
  
  const urielBee = await db.bee.create({
    data: {
      userId: uriel.id,
      cedula: '8505982',
      phone: '04140000000',
      memberType: 'elite',
      eliteNumber: 1,
      affiliationNumber: '000-000-8505982',
      isActive: true,
      activationPaid: true,
      activationDate: new Date()
    }
  })
  
  // 50 códigos FUND para Uriel
  const fundCodes = []
  for (let i = 0; i < 50; i++) {
    fundCodes.push({
      giverBeeId: urielBee.id,
      giftCode: `FUND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'available'
    })
  }
  await db.giftAction.createMany({ data: fundCodes })
  console.log('✅ Uriel: urielpadron8505@gmail.com / Uriel8505!')
  console.log('   Afiliación: 000-000-8505982')
  console.log('   50 códigos FUND')
  
  console.log('\n🎉 ¡Listo!')
}

main()
