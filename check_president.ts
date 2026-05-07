import { db } from './src/lib/db'

async function main() {
  const president = await db.bee.findFirst({
    where: { memberType: 'presidente' },
    include: { user: true }
  })
  
  if (president) {
    console.log('=== PRESIDENTA ===')
    console.log('Nombre:', president.user.name)
    console.log('Email:', president.user.email)
    console.log('Cédula:', president.cedula)
    console.log('Teléfono:', president.phone)
    console.log('Afiliación:', president.affiliationNumber)
    console.log('Tipo:', president.memberType)
    console.log('Activo:', president.isActive)
  } else {
    console.log('No se encontró presidenta')
    
    // Buscar a Yanixa
    const yanixa = await db.user.findFirst({
      where: { email: { contains: 'yanixa' } }
    })
    console.log('Yanixa user:', yanixa)
  }
}

main().catch(console.error)
