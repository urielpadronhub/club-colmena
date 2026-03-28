import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  // Verificar si ya existe
  const existing = await db.user.findUnique({
    where: { email: 'urielpadron8505@gmail.com' }
  })
  
  if (existing) {
    // Eliminar existente
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
  
  // Crear usuario
  const user = await db.user.create({
    data: {
      email: 'urielpadron8505@gmail.com',
      password: simpleHash('Uriel8505!'),
      name: 'Uriel Adolfo Padrón Guerra',
      role: 'bee'
    }
  })
  
  // Crear bee como Elite #001 (asociado a la presidenta)
  const bee = await db.bee.create({
    data: {
      userId: user.id,
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
  
  // Crear 50 códigos FUND para este Elite
  const codes = []
  for (let i = 0; i < 50; i++) {
    const code = `FUND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    codes.push({
      giverBeeId: bee.id,
      giftCode: code,
      status: 'available'
    })
  }
  await db.giftAction.createMany({ data: codes })
  
  console.log('\n✅ SOCIO ELITE CREADO')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Nombre: Uriel Adolfo Padrón Guerra')
  console.log('Email: urielpadron8505@gmail.com')
  console.log('Contraseña: Uriel8505!')
  console.log('Cédula: 8505982')
  console.log('Afiliación: 000-000-8505982')
  console.log('Tipo: ELITE #001')
  console.log('Códigos FUND disponibles: 50')
}

main()
