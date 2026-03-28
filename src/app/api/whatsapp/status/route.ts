// API para obtener el estado del bot de WhatsApp
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Verificar si hay un proceso de bot corriendo
    const { stdout } = await execAsync('ps aux | grep "bot.ts" | grep -v grep').catch(() => ({ stdout: '' }));
    const isRunning = stdout.includes('bot.ts');

    // Verificar si hay sesión guardada
    const sessionPath = path.join(process.cwd(), 'whatsapp-session');
    const hasSession = fs.existsSync(sessionPath);

    // Verificar si hay un QR generado recientemente
    const qrPath = path.join(process.cwd(), 'whatsapp-qr.txt');
    let qrCode = null;
    if (fs.existsSync(qrPath)) {
      const stats = fs.statSync(qrPath);
      const fileAge = Date.now() - stats.mtime.getTime();
      // Solo mostrar QR si fue generado en los últimos 5 minutos
      if (fileAge < 5 * 60 * 1000) {
        qrCode = fs.readFileSync(qrPath, 'utf-8');
      }
    }

    return NextResponse.json({
      success: true,
      status: isRunning ? 'running' : 'stopped',
      hasSession,
      qrCode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Error checking bot status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, qrCode } = body;

    if (action === 'save-qr' && qrCode) {
      // Guardar QR en archivo
      const qrPath = path.join(process.cwd(), 'whatsapp-qr.txt');
      fs.writeFileSync(qrPath, qrCode);
      return NextResponse.json({ success: true, message: 'QR saved' });
    }

    if (action === 'clear-qr') {
      const qrPath = path.join(process.cwd(), 'whatsapp-qr.txt');
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
      return NextResponse.json({ success: true, message: 'QR cleared' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
