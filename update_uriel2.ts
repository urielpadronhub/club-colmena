import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  // Buscar usuario existente
  const existing = await db.user.findUnique({
    where: { email: 'urielpadron8505@gmail.com' },
    include: { bee: true }
  })
  
  if (existing && existing.bee) {
    // Actualizar el bee existente
    await db.bee.update({
      where: { id: existing.bee.id },
      data: {
        memberType: 'elite',
        eliteNumber: 1,
        affiliationNumber: '000-000-8505982',
        cedula: '8505982',
        isActive: true,
        activationPaid: true,
        activationDate: new Date()
      }
    })
    
    // Actualizar nombre si es necesario
    await db.user.update({
      where: { id: existing.id },
      data: { name: 'Uriel Adolfo Padrón Guerra' }
    })
    
    // Eliminar códigos anteriores
    await db.giftAction.deleteMany({
      where: { giverBeeId: existing.bee.id }
    })
    
    // Crear 50 códigos FUND
    const codes = []
    for (let i = 0; i < 50; i++) {
      const code = `FUND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      codes.push({
        giverBeeId: existing.bee.id,
        giftCode: code,
        status: 'available'
      })
    }
    await db.giftAction.createMany({ data: codes })
    
    console.log('✅ USUARIO ACTUALIZADO')
  } else {
    // Crear nuevo
    const user = await db.user.create({
      data: {
        email: 'urielpadron8505@gmail.com',
        password: simpleHash('Uriel8505!'),
        name: 'Uriel Adolfo Padrón Guerra',
        role: 'bee'
      }
    })
    
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
    
    console.log('✅ USUARIO CREADO')
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Nombre: Uriel Adolfo Padrón Guerra')
  console.log('Email: urielpadron8505@gmail.com')
  console.log('Contraseña: Uriel8505!')
  console.log('Cédula: 8505982')
  console.log('Afiliación: 000-000-8505982')
  console.log('Tipo: ELITE #001')
  console.log('Códigos FUND: 50')
}

main()
