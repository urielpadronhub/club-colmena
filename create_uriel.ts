import { db } from './src/lib/db'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  console.log('Limpiando registros existentes...')
  
  // Eliminar todo excepto admin y presidenta
  await db.action.deleteMany({})
  await db.payment.deleteMany({})
  await db.giftAction.deleteMany({})
  
  // Eliminar bees que no sean presidente
  await db.bee.deleteMany({ where: { memberType: { not: 'presidente' } } })
  
  // Eliminar usuarios que no sean admin ni presidenta
  const adminEmails = ['admin@clubcolmena.org', 'yanixa@clubcolmena.org']
  await db.user.deleteMany({ where: { email: { notIn: adminEmails } } })
  
  // Restaurar códigos ELITE a la presidenta
  const president = await db.bee.findFirst({ where: { memberType: 'presidente' } })
  if (president) {
    for (let i = 0; i < 100; i++) {
      await db.giftAction.create({
        data: {
          giverBeeId: president.id,
          giftCode: `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'available'
        }
      })
    }
    console.log('✓ 100 códigos ELITE restaurados a la presidenta')
  }
  
  console.log('Creando nuevo usuario...')
  
  // Crear usuario
  const user = await db.user.create({
    data: {
      email: 'urielpadron8505@gmail.com',
      password: simpleHash('Uriel8505!'),
      name: 'Uriel Adolfo Padrón Guerra',
      role: 'bee'
    }
  })
  
  // Crear bee con el número de afiliación personalizado
  const bee = await db.bee.create({
    data: {
      userId: user.id,
      cedula: '8505982',
      phone: '04140000000',
      memberType: 'formal',
      affiliationNumber: '000-000-8505982',
      isActive: true,
      activationPaid: true,
      activationDate: new Date()
    }
  })
  
  // Crear 3 códigos MIEL
  const codes = []
  for (let i = 0; i < 3; i++) {
    const code = `MIEL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    await db.giftAction.create({
      data: {
        giverBeeId: bee.id,
        giftCode: code,
        status: 'available'
      }
    })
    codes.push(code)
  }
  
  console.log('\n✅ USUARIO CREADO\n')
  console.log('Nombre:', user.name)
  console.log('Email:', user.email)
  console.log('Contraseña: Uriel8505!')
  console.log('Cédula: 8505982')
  console.log('Afiliación:', bee.affiliationNumber)
  console.log('Tipo: FORMAL')
  console.log('\nCódigos MIEL:')
  codes.forEach(c => console.log('  -', c))
}

main()
