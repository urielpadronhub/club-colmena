import { db } from './src/lib/db'

async function main() {
  const president = await db.bee.findFirst({
    where: { memberType: 'presidente' },
    include: { 
      user: true,
      giftActionsGiven: { where: { status: 'available' } }
    }
  })
  
  if (president) {
    console.log('=== PRESIDENTA ===')
    console.log('Nombre:', president.user.name)
    console.log('Email:', president.user.email)
    console.log('Afiliación:', president.affiliationNumber)
    console.log('Códigos ELITE disponibles:', president.giftActionsGiven.length)
    console.log('\nPrimeros 5 códigos:')
    president.giftActionsGiven.slice(0, 5).forEach(g => {
      console.log('  -', g.giftCode)
    })
  }
}

main()
