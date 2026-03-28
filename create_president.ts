import { db } from './src/lib/db'
import { hash } from 'bcryptjs'

async function main() {
  // Datos de la presidenta
  const email = 'yanixa@clubcolmena.org'
  const password = await hash('Colmena2025!', 10)
  const name = 'Yanixa Maribi Hernández Churinos'
  const cedula = '9738355'
  const phone = '584121234567'
  
  // Eliminar si existe
  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    const existingBee = await db.bee.findUnique({ where: { userId: existingUser.id } })
    if (existingBee) {
      await db.giftAction.deleteMany({ where: { giverBeeId: existingBee.id } })
      await db.bee.delete({ where: { id: existingBee.id } })
    }
    await db.user.delete({ where: { id: existingUser.id } })
    console.log('Usuario anterior eliminado')
  }
  
  // Crear usuario
  const user = await db.user.create({
    data: {
      email,
      password,
      name,
      role: 'bee'
    }
  })
  
  // Número de afiliación: 001-000-CEDULA (Presidente es Elite #001)
  const affiliationNumber = `001-000-${cedula}`
  
  // Crear abeja presidente
  const bee = await db.bee.create({
    data: {
      userId: user.id,
      cedula,
      phone,
      memberType: 'presidente',
      eliteNumber: 1, // La presidenta es Elite #001
      founderNumber: null,
      affiliationNumber,
      isActive: true,
      activationPaid: true,
      activationDate: new Date()
    }
  })
  
  // Crear 100 códigos ELITE para la presidenta
  const giftCodes = []
  for (let i = 0; i < 100; i++) {
    const code = `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    giftCodes.push({
      giverBeeId: bee.id,
      giftCode: code,
      status: 'available'
    })
  }
  
  await db.giftAction.createMany({ data: giftCodes })
  
  console.log('✅ PRESIDENTA CREADA')
  console.log('Nombre:', name)
  console.log('Email:', email)
  console.log('Contraseña: Colmena2025!')
  console.log('Cédula:', cedula)
  console.log('Afiliación:', affiliationNumber)
  console.log('Códigos ELITE creados: 100')
}

main().catch(console.error)
