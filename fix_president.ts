import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  // Eliminar la presidenta anterior
  const existing = await db.user.findUnique({
    where: { email: 'yanixa@clubcolmena.org' }
  })
  
  if (existing) {
    await db.giftAction.deleteMany({
      where: { giverBeeId: existing.id }
    })
    await db.bee.deleteMany({
      where: { userId: existing.id }
    })
    await db.user.delete({
      where: { id: existing.id }
    })
    console.log('Usuario anterior eliminado')
  }
  
  // Crear con el hash correcto
  const hashedPassword = simpleHash('Colmena2025!')
  console.log('Hash de contraseña:', hashedPassword)
  
  const user = await db.user.create({
    data: {
      email: 'yanixa@clubcolmena.org',
      password: hashedPassword,
      name: 'Yanixa Maribi Hernández Churinos',
      role: 'bee'
    }
  })
  
  const bee = await db.bee.create({
    data: {
      userId: user.id,
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
  
  // Crear 100 códigos ELITE
  const giftActions = []
  for (let i = 0; i < 100; i++) {
    const code = `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    giftActions.push({
      giverBeeId: bee.id,
      giftCode: code,
      status: 'available'
    })
  }
  
  await db.giftAction.createMany({ data: giftActions })
  
  console.log('\n✅ PRESIDENTA CREADA CORRECTAMENTE')
  console.log('Nombre:', user.name)
  console.log('Email:', user.email)
  console.log('Contraseña: Colmena2025!')
  console.log('Afiliación:', bee.affiliationNumber)
}

main().catch(console.error)
