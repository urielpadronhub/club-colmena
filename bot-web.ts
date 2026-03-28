// El Club de La Colmena - WhatsApp Bot con QR para Web
// Bot para interactuar con socios vía WhatsApp

import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Importar el procesador de mensajes
import { processMessage, WhatsAppMessage } from './src/lib/whatsapp-bot';

// Rutas de archivos
const QR_IMAGE_PATH = path.join(process.cwd(), 'public', 'whatsapp-qr.png');
const STATUS_PATH = path.join(process.cwd(), 'whatsapp-status.json');

// Función para guardar estado
function saveStatus(status: string, message: string = '') {
  const data = {
    status,
    message,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2));
}

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
client.on('qr', async (qr) => {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('       🐝 EL CLUB DE LA COLMENA - WhatsApp Bot 🐝');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('📱 Escanea este código QR con tu WhatsApp:');
  console.log('   (WhatsApp > Configuración > Dispositivos vinculados)');
  console.log('\n');
  
  // Guardar QR como imagen PNG
  try {
    await qrcode.toFile(QR_IMAGE_PATH, qr, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ QR guardado en public/whatsapp-qr.png');
    console.log('🌐 Visita http://localhost:3000/whatsapp para verlo en la web');
    saveStatus('qr_ready', 'QR generado, escanéalo con WhatsApp');
  } catch (err) {
    console.error('Error generando imagen QR:', err);
  }
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  // También mostrar QR en terminal
  const { stdout } = await execAsync(`echo "${qr}"`).catch(() => ({ stdout: '' }));
});

// Cliente listo
client.on('ready', () => {
  isReady = true;
  const connectionTime = ((Date.now() - connectionStartTime) / 1000).toFixed(2);
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ BOT DE WHATSAPP CONECTADO EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   ⏱️  Tiempo de conexión: ${connectionTime} segundos`);
  console.log(`   📅 Fecha: ${new Date().toLocaleString('es-VE')}`);
  console.log('   🐝 El Club de La Colmena está activo');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Actualizar estado
  saveStatus('connected', 'Bot conectado y listo');
  
  // Eliminar QR si existe
  if (fs.existsSync(QR_IMAGE_PATH)) {
    fs.unlinkSync(QR_IMAGE_PATH);
  }
  
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
  saveStatus('authenticated', 'Autenticación exitosa');
});

// Error de autenticación
client.on('auth_failure', (msg) => {
  console.error('❌ Error de autenticación:', msg);
  console.log('💡 Intenta eliminar la carpeta "whatsapp-session" y reiniciar');
  saveStatus('error', `Error de autenticación: ${msg}`);
});

// Cliente desconectado
client.on('disconnected', (reason) => {
  isReady = false;
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ⚠️  BOT DESCONECTADO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Razón: ${reason}`);
  console.log('   Intentando reconectar...');
  console.log('═══════════════════════════════════════════════════════════');
  
  saveStatus('disconnected', `Desconectado: ${reason}`);
  
  // Intentar reiniciar el cliente
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

// Cambio de estado
client.on('change_state', (state) => {
  console.log(`📊 Estado de conexión: ${state}`);
  saveStatus(state.toLowerCase(), `Estado: ${state}`);
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
console.log('🌐 El QR estará disponible en: http://localhost:3000/whatsapp');
console.log('\n');

// Guardar estado inicial
saveStatus('starting', 'Iniciando bot...');

// Iniciar cliente
client.initialize().catch((error) => {
  console.error('❌ Error iniciando el cliente:', error);
  saveStatus('error', `Error iniciando: ${error.message}`);
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
  
  saveStatus('stopped', 'Bot detenido manualmente');
  
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
  saveStatus('stopped', 'Bot detenido por SIGTERM');
  try {
    await client.destroy();
  } catch (error) {
    // Ignorar errores al cerrar
  }
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  saveStatus('error', `Error no capturado: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  saveStatus('error', `Promesa rechazada: ${reason}`);
});

export { client, isReady };
