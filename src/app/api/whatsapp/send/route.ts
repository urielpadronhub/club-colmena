// API para enviar mensajes de WhatsApp manualmente
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

interface SendMessageRequest {
  to: string;
  message: string;
}

// Enviar mensaje de WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { to, message } = body;
    
    if (!to || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: to, message',
      }, { status: 400 });
    }
    
    // Limpiar número de teléfono
    const cleanPhone = to.replace(/\D/g, '');
    
    // Determinar el proveedor de WhatsApp
    const provider = process.env.WHATSAPP_PROVIDER || 'twilio';
    
    let result;
    
    if (provider === 'twilio') {
      // Enviar via Twilio
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
        // Modo desarrollo: solo guardar en log
        console.log('📱 [DEV] Would send WhatsApp to:', cleanPhone, 'Message:', message.substring(0, 50));
        
        await prisma.whatsAppLog.create({
          data: {
            phoneNumber: cleanPhone,
            userName: 'Admin',
            direction: 'outgoing',
            message: `[ADMIN] ${message}`,
          },
        });
        
        return NextResponse.json({
          success: true,
          mode: 'development',
          message: 'Message logged (no Twilio credentials configured)',
        });
      }
      
      // Enviar via Twilio API
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('From', `whatsapp:${twilioFromNumber}`);
      formData.append('To', `whatsapp:${cleanPhone}`);
      formData.append('Body', message);
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message via Twilio');
      }
      
    } else if (provider === 'meta') {
      // Enviar via Meta WhatsApp Business API
      const metaToken = process.env.WHATSAPP_META_TOKEN;
      const metaPhoneId = process.env.WHATSAPP_META_PHONE_ID;
      
      if (!metaToken || !metaPhoneId) {
        // Modo desarrollo
        console.log('📱 [DEV] Would send WhatsApp to:', cleanPhone, 'Message:', message.substring(0, 50));
        
        await prisma.whatsAppLog.create({
          data: {
            phoneNumber: cleanPhone,
            userName: 'Admin',
            direction: 'outgoing',
            message: `[ADMIN] ${message}`,
          },
        });
        
        return NextResponse.json({
          success: true,
          mode: 'development',
          message: 'Message logged (no Meta credentials configured)',
        });
      }
      
      const metaUrl = `https://graph.facebook.com/v18.0/${metaPhoneId}/messages`;
      
      const response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: {
            body: message,
          },
        }),
      });
      
      result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send message via Meta');
      }
    }
    
    // Guardar en log
    await prisma.whatsAppLog.create({
      data: {
        phoneNumber: cleanPhone,
        userName: 'Admin',
        direction: 'outgoing',
        message: `[ADMIN] ${message}`,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      result,
    });
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }, { status: 500 });
  }
}
