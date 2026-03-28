import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Verificar si ya hay usuarios
  const users = await prisma.user.count()
  console.log(`Usuarios existentes: ${users}`)

  if (users === 0) {
    console.log('Creando usuarios iniciales...')
    
    // Crear admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@clubcolmena.org',
        password: adminPassword,
        name: 'Administrador',
        role: 'admin'
      }
    })
    console.log('Admin creado:', admin.email)

    // Crear presidenta
    const presidentPassword = await bcrypt.hash('Colmena2025!', 10)
    const presidenta = await prisma.user.create({
      data: {
        email: 'yanixa@clubcolmena.org',
        password: presidentPassword,
        name: 'Yanixa Maribi Hernández Churinos',
        role: 'admin'
      }
    })
    
    // Crear Bee para presidenta
    await prisma.bee.create({
      data: {
        userId: presidenta.id,
        cedula: 'V-00000000',
        phone: '041400000000',
        memberType: 'presidente',
        eliteNumber: 1,
        founderNumber: 1,
        affiliationNumber: '001-001-00000000',
        isActive: true,
        activationPaid: true,
        activationDate: new Date()
      }
    })
    console.log('Presidenta creada:', presidenta.email)

    // Crear Elite (Uriel)
    const elitePassword = await bcrypt.hash('Uriel8505!', 10)
    const elite = await prisma.user.create({
      data: {
        email: 'urielpadron8505@gmail.com',
        password: elitePassword,
        name: 'Uriel Padrón',
        role: 'bee'
      }
    })
    
    await prisma.bee.create({
      data: {
        userId: elite.id,
        cedula: '000-000-8505982',
        phone: '041400000000',
        memberType: 'elite',
        eliteNumber: 1,
        affiliationNumber: '001-000-8505982',
        isActive: true,
        activationPaid: true,
        activationDate: new Date()
      }
    })
    console.log('Elite creado:', elite.email)

    console.log('¡Base de datos inicializada correctamente!')
  } else {
    console.log('La base de datos ya tiene usuarios.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
