// El Club de La Colmena - WhatsApp Bot Service
// Servicio para procesar mensajes y comandos del bot

import { db as prisma } from './db';

// Número de administrador para notificaciones
const ADMIN_PHONE = process.env.ADMIN_PHONE || '584121234567';

// Tipos de mensajes
export type WhatsAppMessage = {
  from: string;           // Número de teléfono del usuario
  body: string;           // Contenido del mensaje
  profileName?: string;   // Nombre del usuario en WhatsApp
  waId: string;          // WhatsApp ID
  mediaUrl?: string;      // URL de multimedia si aplica
};

export type WhatsAppResponse = {
  to: string;
  body: string;
};

// Comandos del bot
const COMMANDS = {
  START: ['hola', 'hi', 'hello', 'inicio', 'start', 'empezar'],
  INFO: ['info', 'informacion', 'información', 'club', 'colmena'],
  SALDO: ['saldo', 'balance', 'acciones', 'cuentas'],
  ACTIVAR: ['activar', 'activate', 'activacion', 'activación'],
  CODIGOS: ['codigos', 'códigos', 'invitar', 'regalo', 'regalar'],
  AYUDA: ['ayuda', 'help', 'comandos', 'menu', 'menú'],
  CONTACTO: ['contacto', 'contact', 'soporte', 'admin'],
  ADN: ['adn', 'dna', 'red', 'familia', 'patrocinador'],
  COMISIONES: ['comision', 'comisión', 'comisiones', 'ganancias', 'pagos'],
  SORTEO: ['sorteo', 'premio', 'ganar', 'loteria', 'lotería'],
  BENEFICIARIOS: ['niños', 'niños', 'becados', 'beneficiarios', 'ayuda'],
};

// Respuestas del bot
const RESPONSES = {
  WELCOME: `🐝 ¡Bienvenido/a a El Club de La Colmena!

Somos una Asociación Civil sin fines de lucro que brinda apoyo educativo a niños y jóvenes a través de becas escolares.

📋 *Comandos disponibles:*
• Escribe *INFO* - Información del club
• Escribe *SALDO* - Consulta tu saldo y acciones
• Escribe *ACTIVAR* - Cómo activar tu cuenta
• Escribe *CODIGOS* - Tus códigos de invitación
• Escribe *ADN* - Tu red de referidos
• Escribe *COMISIONES* - Tus ganancias
• Escribe *SORTEO* - Premios y sorteos
• Escribe *BENEFICIARIOS* - Niños apoyados
• Escribe *AYUDA* - Lista de comandos
• Escribe *CONTACTO* - Contactar soporte

¿En qué puedo ayudarte? 🍯`,

  INFO: `🏛️ *EL CLUB DE LA COLMENA*

Somos una Asociación Civil dedicada a transformar vidas a través de la educación. Nuestro objetivo es proporcionar becas escolares a niños y jóvenes que necesitan apoyo.

🌟 *Nuestros 4 niveles de socios:*

👑 *PRESIDENTE* (1 solo)
   - Recibe 2% del total de donaciones

🥇 *ELITE* (100 socios)
   - Recibe 3% de su red ADN

🥈 *FUNDADOR* (500 socios)
   - Recibe $20 por cada acción en su ADN

🥉 *FORMAL* (500,000 socios)
   - Donación: $2 activación + $2/mes
   - Participa en sorteos semanales

🎁 *Beneficios:*
• Apoyas la educación de niños
• Participas en sorteos semanales
• Recibes acciones de regalo para invitar
• Construyes tu red de referidos

¿Quieres ser parte de nuestra colmena? 🐝`,

  AYUDA: `📋 *LISTA DE COMANDOS*

🔄 *Comandos principales:*
• *INFO* - Información del club y niveles
• *SALDO* - Tu saldo y acciones
• *ACTIVAR* - Cómo activar tu cuenta
• *CODIGOS* - Tus códigos de invitación
• *ADN* - Tu red de referidos
• *COMISIONES* - Tus ganancias y pagos
• *SORTEO* - Sorteos y premios
• *BENEFICIARIOS* - Niños beneficiados
• *CONTACTO* - Soporte y contacto

💡 *Tips:*
• Puedes escribir el comando que quieras
• No importan mayúsculas o minúsculas
• Si necesitas ayuda humana, escribe CONTACTO

¿Qué más necesitas saber? 🐝`,

  CONTACTO: `📞 *CONTACTO Y SOPORTE*

🌐 *Sitio Web:* www.clubcolmena.org
📧 *Email:* info@clubcolmena.org

🕐 Horario de atención:
Lunes a Viernes: 8:00 AM - 5:00 PM
Sábados: 9:00 AM - 1:00 PM

¡Estamos aquí para ayudarte! 🐝

Si necesitas ayuda inmediata, escribe tu mensaje y te responderemos lo antes posible.

💡 También puedes visitar nuestro sitio web para más información.`,

  NO_REGISTRADO: `🤔 No encontré tu número registrado en El Club de La Colmena.

¿Quieres unirte a nuestra colmena? 🐝

Puedes registrarte en:
🌐 www.clubcolmena.org

O usa un código de invitación de un socio activo.

Escribe *INFO* para conocer más sobre nuestro club.`,

  ACTIVAR_INFO: `✨ *CÓMO ACTIVAR TU CUENTA* ✨

Para activar tu cuenta en El Club de La Colmena:

1️⃣ *Pago de Activación* - $2 USD (único)
   Este pago activa tu cuenta y te da:
   • 3 acciones de regalo para invitar
   • Acceso al dashboard del socio
   • Participación en sorteos

2️⃣ *Cuota Mensual* - $2 USD/mes
   Mantiene tu cuenta activa y acumula acciones.

💳 *Métodos de Pago:*
• Pago Móvil
• Transferencia Bancaria

📱 *Pasos:*
1. Realiza el pago de $2
2. Envía el comprobante por aquí
3. Activamos tu cuenta en 24-48h

¿Ya realizaste tu pago? Envía el comprobante 📄`,

  CODIGOS_INFO: `🎁 *TUS CÓDIGOS DE INVITACIÓN* 🎁

Los códigos de invitación son acciones de regalo que puedes compartir con familiares y amigos para que se unan a la colmena.

📋 *Tipos de códigos:*
• *ELITE-XXXXXX* - Para socios Elite
• *FUND-XXXXXX* - Para socios Fundador  
• *MIEL-XXXXXXXX* - Para socios Formal

💡 *Cómo usar:*
1. Comparte tu código con un amigo
2. Tu amigo se registra con ese código
3. Ambos reciben beneficios

Para ver tus códigos personales, asegúrate de estar registrado y activo.

Escribe *SALDO* para ver tu estado de cuenta.`,

  ADN_INFO: `🧬 *TU RED ADN (Árbol de Naturaleza)*

El ADN es tu red de referidos en El Club de La Colmena. Cuando alguien se registra con tu código, entra en tu ADN.

📊 *Estructura ADN:*
• Tu Patrocinador Elite
• Tu Patrocinador Fundador
• Tu red de referidos directos

💰 *Beneficios según tu nivel:*
• Elite: 3% de donaciones en tu ADN
• Fundador: $20 por acción en tu ADN
• Formal: Acciones de regalo por referidos

Para ver tu ADN completo, asegúrate de estar registrado.

Escribe *SALDO* para ver tu información.`,

  SORTEO_INFO: `🎰 *SORTEOS Y PREMIOS* 🎰

En El Club de La Colmena realizamos sorteos emocionantes para nuestros socios activos.

📅 *Tipos de Sorteos:*
• *Semanal* - Premios en efectivo
• *Mensual* - Premios especiales
• *Semestral* - Grandes premios
• *Anual* - ¡Premio Mayor!

🎫 *¿Cómo participar?*
• Activa tu cuenta con $2
• Cada acción = 1 ticket de sorteo
• Más acciones = más oportunidades

🏆 *Premios:*
• Los ganadores se anuncian en nuestro grupo
• Los pagos se realizan dentro de 48h

💡 Escribe *SALDO* para ver cuántos tickets tienes.`,

  BENEFICIARIOS_INFO: `👶 *NIÑOS BENEFICIADOS* 👶

El Club de La Colmena apoya la educación de niños y jóvenes a través de becas escolares.

📚 *Nuestro Programa:*
• Útiles escolares
• Uniformes
• Matrícula escolar
• Apoyo mensual

📊 *Impacto:*
• Cientos de niños beneficiados
• Escuelas en comunidades necesitadas
• Seguimiento académico personalizado

🤝 *Cómo ayudas:*
• Tu donación de $2/mes alimenta este programa
• Cada acción cuenta
• Juntos construimos futuro

¿Quieres conocer más? Escribe *CONTACTO* para hablar con nosotros.`,

  DEFAULT: `🤔 No entendí tu mensaje.

Escribe *AYUDA* para ver los comandos disponibles.

O escribe una de estas opciones:
• INFO - Información del club
• SALDO - Tu cuenta
• CODIGOS - Invitar amigos
• CONTACTO - Hablar con soporte`,
};

// Función para normalizar texto
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Detectar comando
function detectCommand(message: string): string | null {
  const normalizedMessage = normalizeText(message);
  
  for (const [command, keywords] of Object.entries(COMMANDS)) {
    for (const keyword of keywords) {
      if (normalizedMessage.includes(normalizeText(keyword))) {
        return command;
      }
    }
  }
  
  return null;
}

// Buscar socio por teléfono
async function findBeeByPhone(phone: string) {
  // Limpiar número de teléfono
  const cleanPhone = phone.replace(/\D/g, '');
  
  const bee = await prisma.bee.findFirst({
    where: {
      phone: {
        contains: cleanPhone.slice(-10), // Últimos 10 dígitos
      },
    },
    include: {
      user: true,
      actions: true,
      giftActionsGiven: {
        where: { status: 'available' }
      },
    },
  });
  
  return bee;
}

// Generar respuesta personalizada de saldo
async function getSaldoResponse(phone: string, name?: string): Promise<string> {
  const bee = await findBeeByPhone(phone);
  
  if (!bee) {
    return RESPONSES.NO_REGISTRADO;
  }
  
  const totalActions = bee.actions.reduce((sum, a) => sum + a.quantity, 0);
  const availableGifts = bee.giftActionsGiven.length;
  const isActive = bee.isActive && bee.activationPaid;
  
  const statusEmoji = isActive ? '✅' : '⏳';
  const statusText = isActive ? 'Activo' : 'Pendiente de activación';
  
  return `📊 *TU CUENTA - ${name || bee.user.name}*

${statusEmoji} *Estado:* ${statusText}
🆔 *Afiliación:* ${bee.affiliationNumber}
📱 *Cédula:* ${bee.cedula}

💼 *Tus Acciones:* ${totalActions}
🎁 *Códigos disponibles:* ${availableGifts}

${isActive 
  ? '✨ ¡Tu cuenta está activa! Sigue acumulando acciones.' 
  : '⚠️ Activa tu cuenta con $2 para desbloquear todos los beneficios.\n\nEscribe *ACTIVAR* para saber cómo.'}`;
}

// Generar respuesta de códigos
async function getCodigosResponse(phone: string): Promise<string> {
  const bee = await findBeeByPhone(phone);
  
  if (!bee) {
    return RESPONSES.NO_REGISTRADO;
  }
  
  const availableCodes = bee.giftActionsGiven.filter(g => g.status === 'available');
  
  if (availableCodes.length === 0) {
    return `🎁 *TUS CÓDIGOS DE INVITACIÓN*

🤷 No tienes códigos disponibles en este momento.

Los códigos de regalo se te entregan cuando:
• Activas tu cuenta (3 códigos)
• Recibes bonificaciones especiales

¿Necesitas activar tu cuenta? Escribe *ACTIVAR*`;
  }
  
  const codesList = availableCodes
    .slice(0, 5) // Mostrar máximo 5
    .map(g => `• \`${g.giftCode}\``)
    .join('\n');
  
  const moreCodes = availableCodes.length > 5 
    ? `\n\n...y ${availableCodes.length - 5} códigos más.` 
    : '';
  
  // Determinar tipo de código según el tipo de socio
  let tipoCodigo = 'MIEL';
  if (bee.memberType === 'elite') tipoCodigo = 'ELITE';
  if (bee.memberType === 'fundador') tipoCodigo = 'FUND';
  
  return `🎁 *TUS CÓDIGOS DE INVITACIÓN*

📱 *Socio ${bee.memberType.toUpperCase()}*
Tienes ${availableCodes.length} código(s) disponible(s):

${codesList}${moreCodes}

💡 *Comparte estos códigos con familiares y amigos*

Cuando alguien se registre con tu código:
• Ellos se unen a tu ADN
• Ambos reciben beneficios
• Creces tu red de influencia

¡Comparte la miel! 🍯`;
}

// Generar respuesta de ADN personalizada
async function getADNResponse(phone: string): Promise<string> {
  const bee = await findBeeByPhone(phone);
  
  if (!bee) {
    return RESPONSES.NO_REGISTRADO;
  }
  
  // Buscar el Elite patrocinador
  let eliteName = 'No asignado';
  if (bee.parentEliteId) {
    const elite = await prisma.bee.findUnique({
      where: { id: bee.parentEliteId },
      include: { user: true }
    });
    if (elite) {
      eliteName = `${elite.user.name} (Elite #${elite.eliteNumber})`;
    }
  }
  
  // Buscar el Fundador patrocinador
  let founderName = 'No asignado';
  if (bee.parentFounderId) {
    const founder = await prisma.bee.findUnique({
      where: { id: bee.parentFounderId },
      include: { user: true }
    });
    if (founder) {
      founderName = `${founder.user.name} (Fundador #${founder.founderNumber})`;
    }
  }
  
  // Contar referidos directos
  const referidosDirectos = await prisma.bee.count({
    where: { referredByBeeId: bee.id }
  });
  
  // Construir respuesta según tipo de socio
  let beneficiosInfo = '';
  switch (bee.memberType) {
    case 'presidente':
      beneficiosInfo = '\n👑 *PRESIDENTE*\nRecibes 2% del TOTAL de todas las donaciones.';
      break;
    case 'elite':
      beneficiosInfo = '\n🥇 *ELITE*\nRecibes 3% de las donaciones de tu ADN.';
      break;
    case 'fundador':
      beneficiosInfo = '\n🥈 *FUNDADOR*\nRecibes $20 por cada acción activada en tu ADN.';
      break;
    default:
      beneficiosInfo = '\n🥉 *FORMAL*\nAcumula acciones y recibe códigos de regalo.';
  }
  
  return `🧬 *TU RED ADN*

📋 *Tu Afiliación:* ${bee.affiliationNumber}
${beneficiosInfo}

📊 *Tu Estructura ADN:*

🥇 *Tu Elite:* ${eliteName}
🥈 *Tu Fundador:* ${founderName}

👥 *Tus Referidos Directos:* ${referidosDirectos}
📈 *Total de tu Red:* ${bee.totalDownline}

💡 *Tip:* Mientras más personas invites con tus códigos, más crece tu ADN.

Escribe *CODIGOS* para ver tus códigos de invitación.`;
}

// Generar respuesta de comisiones
async function getComisionesResponse(phone: string): Promise<string> {
  const bee = await findBeeByPhone(phone);
  
  if (!bee) {
    return RESPONSES.NO_REGISTRADO;
  }
  
  // Calcular comisiones según el tipo de socio
  let comisionInfo = '';
  
  switch (bee.memberType) {
    case 'presidente':
      // Presidente recibe 2% del total
      const totalDonaciones = await prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      });
      const comisionPresidente = (totalDonaciones._sum.amount || 0) * 0.02;
      comisionInfo = `👑 *PRESIDENTE*
      
💰 *Tu Comisión:* 2% del total de donaciones
📊 *Total Donaciones:* $${(totalDonaciones._sum.amount || 0).toFixed(2)}
💵 *Tu Ganancia:* $${comisionPresidente.toFixed(2)}`;
      break;
      
    case 'elite':
      // Elite recibe 3% de su ADN
      comisionInfo = `🥇 *ELITE*
      
💰 *Tu Comisión:* 3% de donaciones en tu ADN
👥 *Total en tu Red:* ${bee.totalDownline}

Para ver el detalle de tus ganancias, ingresa al dashboard web.`;
      break;
      
    case 'fundador':
      // Fundador recibe $20 por acción en su ADN
      const accionesADN = await prisma.action.count({
        where: {
          bee: { referredByBeeId: bee.id }
        }
      });
      const gananciaFundador = accionesADN * 20;
      comisionInfo = `🥈 *FUNDADOR*
      
💰 *Tu Comisión:* $20 por cada acción en tu ADN
🎯 *Acciones Activadas:* ${accionesADN}
💵 *Tu Ganancia:* $${gananciaFundador.toFixed(2)}`;
      break;
      
    default:
      comisionInfo = `🥉 *FORMAL*
      
Como socio Formal, acumulas acciones y participas en sorteos.

💡 *Tip:* Para recibir comisiones, necesitas ser Fundador o Elite.
Escribe *INFO* para conocer los niveles de socios.`;
  }
  
  return `💼 *TUS COMISIONES Y GANANCIAS*

${comisionInfo}

📅 *Próximo pago:* Según calendario establecido
🏦 *Método de pago:* Configura tu cuenta bancaria en el dashboard

¿Tienes dudas? Escribe *CONTACTO*`;
}

// Procesar mensaje entrante
export async function processMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  const { from, body, profileName } = message;
  
  // Guardar mensaje en log
  try {
    await prisma.whatsAppLog.create({
      data: {
        phoneNumber: from,
        userName: profileName || 'Unknown',
        direction: 'incoming',
        message: body,
      },
    });
  } catch (e) {
    // Si no existe la tabla, continuar
    console.log('Note: WhatsAppLog table may not exist yet');
  }
  
  // Detectar comando
  const command = detectCommand(body);
  
  let responseBody: string;
  
  switch (command) {
    case 'START':
      responseBody = RESPONSES.WELCOME;
      break;
      
    case 'INFO':
      responseBody = RESPONSES.INFO;
      break;
      
    case 'AYUDA':
      responseBody = RESPONSES.AYUDA;
      break;
      
    case 'CONTACTO':
      responseBody = RESPONSES.CONTACTO;
      break;
      
    case 'ACTIVAR':
      responseBody = RESPONSES.ACTIVAR_INFO;
      break;
      
    case 'CODIGOS':
      responseBody = await getCodigosResponse(from);
      break;
      
    case 'SALDO':
      responseBody = await getSaldoResponse(from, profileName);
      break;
      
    case 'ADN':
      responseBody = await getADNResponse(from);
      break;
      
    case 'COMISIONES':
      responseBody = await getComisionesResponse(from);
      break;
      
    case 'SORTEO':
      responseBody = RESPONSES.SORTEO_INFO;
      break;
      
    case 'BENEFICIARIOS':
      responseBody = RESPONSES.BENEFICIARIOS_INFO;
      break;
      
    default:
      // Si no reconoce el comando, respuesta por defecto
      responseBody = RESPONSES.DEFAULT;
  }
  
  // Guardar respuesta en log
  try {
    await prisma.whatsAppLog.create({
      data: {
        phoneNumber: from,
        userName: profileName || 'Unknown',
        direction: 'outgoing',
        message: responseBody,
      },
    });
  } catch (e) {
    console.log('Note: WhatsAppLog table may not exist yet');
  }
  
  return {
    to: from,
    body: responseBody,
  };
}

// Exportar respuestas para uso externo
export { RESPONSES };
