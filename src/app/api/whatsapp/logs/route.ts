// API para obtener logs de conversaciones de WhatsApp
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// Obtener logs de WhatsApp
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Si se especifica un teléfono, obtener conversación de ese número
    if (phone) {
      const logs = await prisma.whatsAppLog.findMany({
        where: {
          phoneNumber: {
            contains: phone,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: limit,
        skip: offset,
      });
      
      return NextResponse.json({
        success: true,
        data: logs,
      });
    }
    
    // Obtener todos los números únicos con su último mensaje
    const logs = await prisma.whatsAppLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    // Agrupar por número de teléfono
    const conversations = new Map();
    
    for (const log of logs) {
      if (!conversations.has(log.phoneNumber)) {
        conversations.set(log.phoneNumber, {
          phoneNumber: log.phoneNumber,
          userName: log.userName || 'Unknown',
          lastMessage: log.message.substring(0, 100) + (log.message.length > 100 ? '...' : ''),
          lastMessageTime: log.createdAt,
          direction: log.direction,
          messageCount: 1,
        });
      } else {
        const existing = conversations.get(log.phoneNumber);
        existing.messageCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: Array.from(conversations.values()),
      total: logs.length,
    });
    
  } catch (error) {
    console.error('Error fetching WhatsApp logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch logs',
    }, { status: 500 });
  }
}
