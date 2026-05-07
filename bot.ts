// El Club de La Colmena - WhatsApp Bot
// Bot para interactuar con socios vía WhatsApp

import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Directorio para archivos de estado
const SESSION_DIR = join(process.cwd(), 'whatsapp-session');
const STATUS_FILE = join(SESSION_DIR, 'bot-status.json');
const QR_FILE = join(SESSION_DIR, 'qr-code.txt');

// Asegurar que existe el directorio
if (!existsSync(SESSION_DIR)) {
  mkdirSync(SESSION_DIR, { recursive: true });
}

// Función para guardar el estado
function saveStatus(data: { isReady?: boolean; isConnected?: boolean; qrCode?: string | null; phoneNumber?: string | null }) {
  try {
    const currentStatus = existsSync(STATUS_FILE) 
      ? JSON.parse(readFileSync(STATUS_FILE, 'utf-8'))
      : {};
    
    const newStatus = {
      ...currentStatus,
      ...data,
      lastUpdate: new Date().toISOString()
    };
    
    writeFileSync(STATUS_FILE, JSON.stringify(newStatus, null, 2));
  } catch (e) {
    console.log('Nota: No se pudo guardar el estado');
  }
}

// Función para guardar el QR
function saveQR(qr: string) {
  try {
    writeFileSync(QR_FILE, qr);
    saveStatus({ qrCode: qr, isConnected: false });
  } catch (e) {
    console.log('Nota: No se pudo guardar el QR');
  }
}

// Importar el procesador de mensajes (será compilado)
import { processMessage, WhatsAppMessage } from './src/lib/whatsapp-bot';

// Configuración del cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './whatsapp-session',
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
});

// Variables de estado
let isReady = false;
let connectionStartTime = Date.now();

// =====================================================
// EVENTOS DEL CLIENTE
// =====================================================

// Generar código QR para escanear
client.on('qr', (qr) => {
  // Guardar QR para la web
  saveQR(qr);
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       🐝 EL CLUB DE LA COLMENA - WhatsApp Bot 🐝');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('📱 Escanea este código QR con tu WhatsApp:');
  console.log('   (WhatsApp > Configuración > Dispositivos vinculados)');
  console.log('\n');
  console.log('🌐 O visita la página web para ver el QR:');
  console.log('   http://localhost:3000/whatsapp');
  console.log('\n');
  qrcode.generate(qr, { small: true });
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
});

// Cliente listo
client.on('ready', async () => {
  isReady = true;
  const connectionTime = ((Date.now() - connectionStartTime) / 1000).toFixed(2);
  
  // Obtener información del número conectado
  let phoneNumber = null;
  try {
    const info = await client.getWwebVersion();
    const me = client.info?.wid?.user || null;
    phoneNumber = me;
  } catch (e) {
    console.log('Nota: No se pudo obtener el número');
  }
  
  // Guardar estado conectado
  saveStatus({ 
    isReady: true, 
    isConnected: true, 
    qrCode: null,
    phoneNumber 
  });
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ BOT DE WHATSAPP CONECTADO EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ⏱️  Tiempo de conexión: ${connectionTime} segundos`);
  console.log(`   📅 Fecha: ${new Date().toLocaleString('es-VE')}`);
  if (phoneNumber) console.log(`   📱 Número: ${phoneNumber}`);
  console.log('   🐝 El Club de La Colmena está activo');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('💬 Comandos disponibles para los usuarios:');
  console.log('   • HOLA - Mensaje de bienvenida');
  console.log('   • INFO - Información del club');
  console.log('   • SALDO - Consultar cuenta');
  console.log('   • CODIGOS - Ver códigos de invitación');
  console.log('   • ADN - Red de referidos');
  console.log('   • ACTIVAR - Cómo activar cuenta');
  console.log('   • COMISIONES - Ganancias y pagos');
  console.log('   • SORTEO - Premios y sorteos');
  console.log('   • BENEFICIARIOS - Niños apoyados');
  console.log('   • AYUDA - Lista de comandos');
  console.log('   • CONTACTO - Información de contacto');
  console.log('\n');
  console.log('🔴 Para detener el bot presiona Ctrl+C');
  console.log('═══════════════════════════════════════════════════════════');
});

// Cliente autenticado
client.on('authenticated', () => {
  console.log('🔐 Autenticación exitosa!');
});

// Error de autenticación
client.on('auth_failure', (msg) => {
  console.error('❌ Error de autenticación:', msg);
  console.log('💡 Intenta eliminar la carpeta "whatsapp-session" y reiniciar');
});

// Cliente desconectado
client.on('disconnected', (reason) => {
  isReady = false;
  
  // Guardar estado desconectado
  saveStatus({ isReady: false, isConnected: false, qrCode: null });
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ⚠️  BOT DESCONECTADO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Razón: ${reason}`);
  console.log('   Intentando reconectar...');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Intentar reiniciar el cliente
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

// Cambio de estado
client.on('change_state', (state) => {
  console.log(`📊 Estado de conexión: ${state}`);
});

// =====================================================
// PROCESAMIENTO DE MENSAJES
// =====================================================

client.on('message', async (message: Message) => {
  try {
    // Ignorar mensajes de grupos
    if (message.from.includes('@g.us')) {
      return;
    }

    // Ignorar mensajes propios
    if (message.fromMe) {
      return;
    }

    // Obtener información del contacto
    const contact = await message.getContact();
    const chat = await message.getChat();

    // Marcar como leído
    await chat.sendSeen();

    // Preparar datos del mensaje
    const whatsappMessage: WhatsAppMessage = {
      from: message.from.replace('@c.us', ''),
      body: message.body,
      profileName: contact.pushname || contact.name || 'Usuario',
      waId: message.from,
      mediaUrl: undefined,
    };

    // Verificar si hay multimedia
    if (message.hasMedia) {
      try {
        const media = await message.downloadMedia();
        if (media) {
          whatsappMessage.mediaUrl = media.data;
        }
      } catch (mediaError) {
        console.log('Nota: No se pudo descargar multimedia');
      }
    }

    // Log del mensaje recibido
    console.log(`\n📥 [${new Date().toLocaleTimeString()}] Mensaje de ${whatsappMessage.profileName} (${whatsappMessage.from}):`);
    console.log(`   "${message.body}"`);

    // Procesar mensaje con la lógica del bot
    const response = await processMessage(whatsappMessage);

    // Enviar respuesta
    await message.reply(response.body);

    // Log de la respuesta
    console.log(`\n📤 Respuesta enviada a ${whatsappMessage.profileName}:`);
    console.log(`   "${response.body.substring(0, 100)}${response.body.length > 100 ? '...' : ''}"`);

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
    
    // Enviar mensaje de error amigable
    try {
      await message.reply(
        '😔 Lo siento, hubo un error procesando tu mensaje.\n\n' +
        'Por favor intenta de nuevo o escribe *AYUDA* para ver las opciones disponibles.'
      );
    } catch (replyError) {
      console.error('Error enviando mensaje de error:', replyError);
    }
  }
});

// Manejar mensajes de bienvenida cuando alguien escribe por primera vez
client.on('message_create', async (message: Message) => {
  // Solo para mensajes nuevos (no propios)
  if (message.fromMe || message.from.includes('@g.us')) {
    return;
  }
  
  // El procesamiento se hace en el evento 'message'
});

// =====================================================
// INICIALIZACIÓN
// =====================================================

console.log('\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('       🐝 EL CLUB DE LA COLMENA - WhatsApp Bot 🐝');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n');
console.log('🔄 Iniciando bot...');
console.log('   Esto puede tomar unos segundos la primera vez.');
console.log('\n');

// Iniciar cliente
client.initialize().catch((error) => {
  console.error('❌ Error iniciando el cliente:', error);
  process.exit(1);
});

// =====================================================
// MANEJO DE SEÑALES DEL SISTEMA
// =====================================================

process.on('SIGINT', async () => {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🛑 Deteniendo el bot de WhatsApp...');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    await client.destroy();
    console.log('   ✅ Bot detenido correctamente');
  } catch (error) {
    console.log('   ⚠️  Bot detenido (puede que la sesión aún esté activa)');
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando...');
  try {
    await client.destroy();
  } catch (error) {
    // Ignorar errores al cerrar
  }
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

export { client, isReady };
