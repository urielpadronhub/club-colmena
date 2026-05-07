import { db } from './src/lib/db'

async function main() {
  // Buscar presidenta
  const president = await db.bee.findFirst({
    where: { memberType: 'presidente' }
  })
  
  if (!president) {
    console.log('No se encontró presidenta')
    return
  }
  
  // Crear 100 códigos ELITE
  const codes = []
  for (let i = 0; i < 100; i++) {
    codes.push({
      giverBeeId: president.id,
      giftCode: `ELITE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'available'
    })
  }
  
  await db.giftAction.createMany({ data: codes })
  
  console.log(`✅ 100 códigos ELITE creados para la Presidenta`)
  
  // Mostrar algunos códigos
  const sample = await db.giftAction.findMany({
    where: { giverBeeId: president.id },
    take: 5
  })
  
  console.log('\nEjemplo de códigos:')
  sample.forEach(g => console.log(`  ${g.giftCode}`))
}

main()
