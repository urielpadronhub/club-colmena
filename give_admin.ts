import { db } from './src/lib/db'

async function main() {
  // Dar permisos de admin a la presidenta
  const president = await db.user.findFirst({
    where: { email: 'yanixa@clubcolmena.org' }
  })
  
  if (president) {
    await db.user.update({
      where: { id: president.id },
      data: { role: 'admin' }
    })
    console.log('✅ Presidenta ahora tiene permisos de administrador')
  }
  
  // Dar permisos de admin a Uriel también
  const uriel = await db.user.findFirst({
    where: { email: 'urielpadron8505@gmail.com' }
  })
  
  if (uriel) {
    await db.user.update({
      where: { id: uriel.id },
      data: { role: 'admin' }
    })
    console.log('✅ Uriel ahora tiene permisos de administrador')
  }
}

main()
