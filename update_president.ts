import { db } from './src/lib/db'

async function main() {
  const president = await db.bee.findFirst({
    where: { memberType: 'presidente' }
  })
  
  if (president) {
    await db.bee.update({
      where: { id: president.id },
      data: {
        affiliationNumber: '001-000-9738355',
        eliteNumber: 1
      }
    })
    console.log('✅ Presidenta actualizada')
    console.log('   Afiliación: 001-000-9738355')
    console.log('   Elite Number: 001')
  }
}

main()
