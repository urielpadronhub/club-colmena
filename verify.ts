import { db } from './src/lib/db'

async function main() {
  const president = await db.bee.findFirst({
    where: { memberType: 'presidente' },
    include: { user: true, giftActionsGiven: { where: { status: 'available' } } }
  })
  
  if (president) {
    console.log('=== PRESIDENTA ===')
    console.log('Nombre:', president.user.name)
    console.log('Email:', president.user.email)
    console.log('Cédula:', president.cedula)
    console.log('Afiliación:', president.affiliationNumber)
    console.log('Códigos disponibles:', president.giftActionsGiven.length)
  }
  
  const allBees = await db.bee.findMany({
    include: { user: true }
  })
  console.log('\n=== TODOS LOS SOCIOS ===')
  allBees.forEach(b => {
    console.log(`${b.user.name} - ${b.memberType} - ${b.affiliationNumber}`)
  })
}

main()
