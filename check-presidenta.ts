import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'yanixa@clubcolmena.org' },
    include: { bee: true }
  });
  
  if (user) {
    console.log('=== USUARIO ===');
    console.log('Nombre:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    
    if (user.bee) {
      console.log('\n=== DATOS BEE ===');
      console.log('Cédula:', user.bee.cedula);
      console.log('Teléfono:', user.bee.phone);
      console.log('Tipo:', user.bee.memberType);
      console.log('Afiliación:', user.bee.affiliationNumber);
      console.log('Elite #:', user.bee.eliteNumber);
      console.log('Fundador #:', user.bee.founderNumber);
      console.log('Activo:', user.bee.isActive);
    } else {
      console.log('\n❌ NO TIENE REGISTRO BEE');
    }
  } else {
    console.log('❌ Usuario no encontrado');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
