// WhatsApp Webhook API - Compatible con Twilio y Meta WhatsApp Business API
import { NextRequest, NextResponse } from 'next/server';
import { processMessage, WhatsAppMessage } from '@/lib/whatsapp-bot';

// Verificación del webhook (Meta WhatsApp)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Meta WhatsApp verification
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Token de verificación (configurar en variables de entorno)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'colmena2025';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }
  
  // Twilio verification (no requiere verificación especial)
  return NextResponse.json({ 
    status: 'ok', 
    message: 'WhatsApp webhook is active',
    service: 'El Club de La Colmena Bot'
  });
}

// Recepción de mensajes
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let message: WhatsAppMessage;
    
    if (contentType.includes('application/json')) {
      // Meta WhatsApp Business API format
      const body = await request.json();
      
      // Extraer mensaje del formato de Meta
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const contact = value?.contacts?.[0];
      const msg = value?.messages?.[0];
      
      if (!msg) {
        return NextResponse.json({ status: 'ignored', reason: 'no_message' });
      }
      
      message = {
        from: msg.from,
        body: msg.text?.body || '',
        profileName: contact?.profile?.name || 'Unknown',
        waId: msg.from,
      };
      
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Twilio format
      const formData = await request.formData();
      
      message = {
        from: formData.get('From') as string || '',
        body: formData.get('Body') as string || '',
        profileName: formData.get('ProfileName') as string || 'Unknown',
        waId: formData.get('WaId') as string || '',
        mediaUrl: formData.get('MediaUrl0') as string || undefined,
      };
      
    } else {
      return NextResponse.json({ 
        error: 'Unsupported content type' 
      }, { status: 400 });
    }
    
    console.log('📱 WhatsApp message received:', {
      from: message.from,
      body: message.body.substring(0, 50) + '...',
      profileName: message.profileName,
    });
    
    // Procesar el mensaje con el bot
    const response = await processMessage(message);
    
    // Preparar respuesta según el formato
    const responseType = process.env.WHATSAPP_PROVIDER || 'twilio';
    
    if (responseType === 'meta') {
      // Para Meta, la respuesta se envía via API
      // Aquí solo confirmamos recepción
      // El envío se hace en otra función
      return NextResponse.json({ 
        status: 'processed',
        response: response.body 
      });
      
    } else {
      // Para Twilio, respondemos con TwiML
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response.body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
</Response>`;
      
      return new NextResponse(twiml, {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing WhatsApp message:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
