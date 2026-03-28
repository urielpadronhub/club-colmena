import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  console.log('🧹 Limpiando base de datos...\n')
  
  // Eliminar todos los datos en orden correcto
  await db.giftAction.deleteMany({})
  console.log('✓ Códigos de regalo eliminados')
  
  await db.action.deleteMany({})
  console.log('✓ Acciones eliminadas')
  
  await db.payment.deleteMany({})
  console.log('✓ Pagos eliminados')
  
  await db.raffleTicket.deleteMany({})
  console.log('✓ Tickets de sorteo eliminados')
  
  await db.raffleWinner.deleteMany({})
  console.log('✓ Ganadores eliminados')
  
  await db.raffle.deleteMany({})
  console.log('✓ Sorteos eliminados')
  
  await db.bankAccount.deleteMany({})
  console.log('✓ Cuentas bancarias eliminadas')
  
  await db.bee.deleteMany({})
  console.log('✓ Bees eliminados')
  
  await db.user.deleteMany({})
  console.log('✓ Usuarios eliminados')
  
  console.log('\n📝 Creando usuarios base...\n')
  
  // Crear Admin
  const adminPassword = simpleHash('admin123')
  const admin = await db.user.create({
    data: {
      email: 'admin@clubcolmena.org',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin'
    }
  })
  console.log('✅ Admin creado:')
  console.log('   Email: admin@clubcolmena.org')
  console.log('   Contraseña: admin123\n')
  
  // Crear Presidenta
  const presidentPassword = simpleHash('Colmena2025!')
  const president = await db.user.create({
    data: {
      email: 'yanixa@clubcolmena.org',
      password: presidentPassword,
      name: 'Yanixa Maribi Hernández Churinos',
      role: 'bee'
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
  
  // Crear 100 códigos ELITE para la presidenta
  const eliteCodes = []
  for (let i = 0; i < 100; i++) {
    eliteCodes.push({
      giverBeeId: presidentBee.id,
      giftCode: `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'available'
    })
  }
  await db.giftAction.createMany({ data: eliteCodes })
  
  console.log('✅ Presidenta creada:')
  console.log('   Nombre: Yanixa Maribi Hernández Churinos')
  console.log('   Email: yanixa@clubcolmena.org')
  console.log('   Contraseña: Colmena2025!')
  console.log('   Cédula: 9738355')
  console.log('   Afiliación: 001-000-9738355')
  console.log('   Tipo: PRESIDENTE')
  console.log('   Códigos ELITE disponibles: 100\n')
  
  console.log('🎉 ¡Base de datos lista para empezar!')
  console.log('\n📋 NIVELES DEL SISTEMA:')
  console.log('   👑 PRESIDENTE (1): 2% del total de donaciones')
  console.log('   🥇 ELITE (100): 3% de su red ADN')
  console.log('   🥈 FUNDADOR (500): $20 por acción en su ADN')
  console.log('   🥉 FORMAL (500,000): $2 activación + $2/mes')
}

main().catch(console.error)
