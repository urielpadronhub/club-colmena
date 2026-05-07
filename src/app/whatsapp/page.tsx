'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Loader2, QrCode, MessageSquare } from 'lucide-react';

interface BotStatus {
  success: boolean;
  status: string;
  hasSession?: boolean;
  message?: string;
  timestamp?: string;
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrExists, setQrExists] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      setStatus(data);
      
      // Verificar si existe la imagen del QR
      try {
        const qrResponse = await fetch('/whatsapp-qr.png');
        setQrExists(qrResponse.ok);
      } catch {
        setQrExists(false);
      }
    } catch (error) {
      setStatus({ success: false, status: 'error', message: 'Error conectando con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Actualizar cada 5 segundos
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (!status) return null;
    
    switch (status.status) {
      case 'connected':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Conectado</Badge>;
      case 'running':
        return <Badge className="bg-blue-500"><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Ejecutándose</Badge>;
      case 'qr_ready':
        return <Badge className="bg-yellow-500"><QrCode className="w-4 h-4 mr-1" /> Esperando QR</Badge>;
      case 'starting':
        return <Badge className="bg-blue-500"><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Iniciando</Badge>;
      case 'stopped':
        return <Badge className="bg-gray-500"><XCircle className="w-4 h-4 mr-1" /> Detenido</Badge>;
      case 'disconnected':
        return <Badge className="bg-orange-500"><XCircle className="w-4 h-4 mr-1" /> Desconectado</Badge>;
      default:
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Error</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🐝</span>
            <h1 className="text-3xl md:text-4xl font-bold text-amber-900">
              WhatsApp Bot
            </h1>
            <span className="text-5xl">📱</span>
          </div>
          <p className="text-amber-700 text-lg">
            El Club de La Colmena - Centro de Control
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6 shadow-lg border-amber-200">
          <CardHeader className="bg-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-900">Estado del Bot</CardTitle>
                <CardDescription>Información en tiempo real</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <Button variant="outline" size="sm" onClick={checkStatus} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading && !status ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <span className="text-amber-800 font-medium">Estado:</span>
                  <span className="text-amber-900 capitalize">{status?.status || 'Desconocido'}</span>
                </div>
                {status?.message && (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <span className="text-amber-800 font-medium">Mensaje:</span>
                    <span className="text-amber-900">{status.message}</span>
                  </div>
                )}
                {status?.timestamp && (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <span className="text-amber-800 font-medium">Última actualización:</span>
                    <span className="text-amber-900 text-sm">
                      {new Date(status.timestamp).toLocaleString('es-VE')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="mb-6 shadow-lg border-amber-200">
          <CardHeader className="bg-amber-100">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Código QR de Conexión
            </CardTitle>
            <CardDescription>
              Escanea este código con WhatsApp para vincular el bot
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {status?.status === 'connected' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700 mb-2">¡Bot Conectado!</h3>
                <p className="text-green-600">
                  El bot está activo y respondiendo mensajes
                </p>
              </div>
            ) : qrExists ? (
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
                  <Image 
                    src="/whatsapp-qr.png" 
                    alt="QR Code para WhatsApp" 
                    width={300} 
                    height={300}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2 text-amber-700">
                  <p className="font-medium">📱 Cómo escanear:</p>
                  <ol className="text-left max-w-md mx-auto space-y-2 text-sm">
                    <li>1. Abre WhatsApp en tu teléfono</li>
                    <li>2. Ve a Configuración → Dispositivos vinculados</li>
                    <li>3. Toca "Vincular un dispositivo"</li>
                    <li>4. Escanea el código QR de arriba</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-amber-700 mb-2">
                  {status?.status === 'starting' ? 'Iniciando bot...' : 'Bot no iniciado'}
                </h3>
                <p className="text-amber-600 mb-4">
                  {status?.status === 'starting' 
                    ? 'Espere mientras se genera el código QR...'
                    : 'Ejecuta el comando para iniciar el bot:'
                  }
                </p>
                {status?.status !== 'starting' && (
                  <code className="bg-amber-100 px-4 py-2 rounded-lg text-amber-800 font-mono">
                    bun run bot
                  </code>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commands Card */}
        <Card className="shadow-lg border-amber-200">
          <CardHeader className="bg-amber-100">
            <CardTitle className="text-amber-900">💬 Comandos Disponibles</CardTitle>
            <CardDescription>Los usuarios pueden enviar estos comandos al bot</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { cmd: 'HOLA', desc: 'Bienvenida' },
                { cmd: 'INFO', desc: 'Info del club' },
                { cmd: 'SALDO', desc: 'Tu cuenta' },
                { cmd: 'CODIGOS', desc: 'Códigos de invitación' },
                { cmd: 'ADN', desc: 'Red de referidos' },
                { cmd: 'ACTIVAR', desc: 'Cómo activar' },
                { cmd: 'COMISIONES', desc: 'Ganancias' },
                { cmd: 'SORTEO', desc: 'Premios' },
                { cmd: 'AYUDA', desc: 'Ayuda' },
                { cmd: 'CONTACTO', desc: 'Soporte' },
              ].map((item) => (
                <div 
                  key={item.cmd}
                  className="p-3 bg-amber-50 rounded-lg text-center hover:bg-amber-100 transition-colors"
                >
                  <span className="font-bold text-amber-800 block">{item.cmd}</span>
                  <span className="text-xs text-amber-600">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-amber-700">
          <p>🐝 El Club de La Colmena - Asociación Civil sin fines de lucro</p>
        </div>
      </div>
    </div>
  );
}
