'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Share2, ArrowLeft, CheckCircle } from 'lucide-react'
import { domToPng } from 'modern-screenshot'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  bee: {
    id: string
    cedula: string
    phone: string
    affiliationNumber: string
    isActive: boolean
    memberType: string
    eliteNumber: number | null
    founderNumber: number | null
    createdAt: string
  } | null
}

interface BeeData {
  id: string
  affiliationNumber: string
  cedula: string
  phone: string
  memberType: string
  eliteNumber: number | null
  founderNumber: number | null
  totalActions: number
  createdAt: string
  user: { name: string; email: string }
}

export default function CredentialPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [beeData, setBeeData] = useState<BeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const credentialRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchBeeData(parsedUser.id)
  }, [router])

  const fetchBeeData = async (userId: string) => {
    try {
      const response = await fetch(`/api/bee?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setBeeData(data.data)
      }
    } catch (error) {
      console.error('Error fetching bee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMemberTypeInfo = (memberType: string) => {
    switch (memberType) {
      case 'presidente':
        return { label: 'Presidente', color: 'bg-yellow-500', textColor: 'text-yellow-900', icon: '👑' }
      case 'elite':
        return { label: 'Socio Elite', color: 'bg-purple-600', textColor: 'text-white', icon: '⭐' }
      case 'fundador':
        return { label: 'Socio Fundador', color: 'bg-blue-600', textColor: 'text-white', icon: '🏅' }
      default:
        return { label: 'Socio Formal', color: 'bg-amber-600', textColor: 'text-white', icon: '🐝' }
    }
  }

  const getMemberBadge = (memberType: string) => {
    switch (memberType) {
      case 'presidente': return '👑 PRESIDENTE'
      case 'elite': return '⭐ ELITE'
      case 'fundador': return '🏅 FUNDADOR'
      default: return '🐝 FORMAL'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateQRData = () => {
    if (!beeData) return ''
    return JSON.stringify({
      club: 'El Club de La Colmena',
      nombre: beeData.user.name,
      afiliacion: beeData.affiliationNumber,
      tipo: beeData.memberType,
      acciones: beeData.totalActions,
      verificacion: `https://club-colmena.vercel.app/verify/${beeData.affiliationNumber}`
    })
  }

  const handleDownload = async () => {
    if (!credentialRef.current || !beeData) return
    
    setDownloading(true)
    setDownloadError(null)
    
    try {
      // Usar modern-screenshot para capturar
      const dataUrl = await domToPng(credentialRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      })
      
      // Crear enlace de descarga
      const link = document.createElement('a')
      link.download = `credencial-${beeData.affiliationNumber}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error descargando:', error)
      setDownloadError('Error al descargar. Intenta hacer captura de pantalla.')
      
      // Fallback: intentar con el método nativo
      try {
        if (credentialRef.current) {
          // Crear un canvas alternativo
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (ctx) {
            canvas.width = 400
            canvas.height = 600
            
            // Fondo blanco
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Texto básico
            ctx.fillStyle = '#d97706'
            ctx.font = 'bold 24px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('EL CLUB DE LA COLMENA', 200, 50)
            
            ctx.fillStyle = '#1f2937'
            ctx.font = 'bold 20px sans-serif'
            ctx.fillText(beeData.user.name, 200, 150)
            
            ctx.fillStyle = '#d97706'
            ctx.font = 'bold 28px monospace'
            ctx.fillText(beeData.affiliationNumber, 200, 250)
            
            ctx.fillStyle = '#6b7280'
            ctx.font = '14px sans-serif'
            ctx.fillText(`Tipo: ${getMemberBadge(beeData.memberType)}`, 200, 320)
            ctx.fillText(`Acciones: ${beeData.totalActions}`, 200, 350)
            ctx.fillText(`Miembro desde: ${formatDate(beeData.createdAt)}`, 200, 380)
            
            ctx.fillStyle = '#9ca3af'
            ctx.font = '12px sans-serif'
            ctx.fillText('www.clubcolmena.org', 200, 550)
            
            // Descargar
            const link = document.createElement('a')
            link.download = `credencial-${beeData.affiliationNumber}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
            
            setDownloadError(null)
          }
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!beeData) return
    
    const shareData = {
      title: 'Mi Credencial - El Club de La Colmena',
      text: `Soy ${beeData.user.name}, ${getMemberBadge(beeData.memberType)} del Club de La Colmena. Afiliación: ${beeData.affiliationNumber}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p>Cargando credencial...</p>
        </div>
      </div>
    )
  }

  if (!beeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p>No se encontraron datos</p>
            <Button onClick={() => router.push('/')} className="mt-4">Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const memberInfo = getMemberTypeInfo(beeData.memberType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 py-8 px-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20 mb-4"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-white text-center">Mi Credencial Digital</h1>
      </div>

      {/* Credencial */}
      <div className="max-w-md mx-auto" ref={credentialRef}>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {[...Array(20)].map((_, i) => (
                  <polygon 
                    key={i}
                    points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35"
                    fill="white"
                    transform={`translate(${(i % 5) * 25 - 10}, ${Math.floor(i / 5) * 30 - 10}) scale(0.3)`}
                  />
                ))}
              </svg>
            </div>
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white p-2 shadow-lg relative z-10 flex items-center justify-center">
              <span className="text-4xl">🐝</span>
            </div>
            <h2 className="text-2xl font-bold relative z-10">EL CLUB DE LA COLMENA</h2>
            <p className="text-amber-100 text-sm relative z-10">Fundación Educativa para Becas</p>
          </div>

          {/* Cuerpo */}
          <div className="p-6 bg-white">
            {/* Foto y Nombre */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {beeData.user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{beeData.user.name}</h3>
              <Badge className={`${memberInfo.color} ${memberInfo.textColor} mt-2 text-sm px-4 py-1`}>
                {memberInfo.icon} {memberInfo.label}
              </Badge>
            </div>

            {/* Información */}
            <div className="space-y-4 mb-6">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Número de Afiliación (ADN)</p>
                <p className="text-2xl font-bold text-amber-600 font-mono">{beeData.affiliationNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Acciones</p>
                  <p className="text-xl font-bold text-gray-800">{beeData.totalActions}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="w-5 h-5" />
                    Activo
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Miembro desde</p>
                <p className="font-medium text-gray-800">{formatDate(beeData.createdAt)}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-inner border-2 border-amber-200">
                <QRCodeSVG 
                  value={generateQRData()} 
                  size={150}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Escanea para verificar</p>
            </div>
          </div>

          {/* Pie */}
          <div className="bg-gray-800 text-white p-4 text-center">
            <p className="text-xs text-gray-400">www.clubcolmena.org</p>
            <p className="text-xs text-gray-500">Credencial válida mientras el socio esté activo</p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="max-w-md mx-auto mt-6 flex gap-4">
        <Button 
          className="flex-1 bg-white text-amber-600 hover:bg-gray-100"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="w-5 h-5 mr-2" />
          {downloading ? 'Descargando...' : 'Descargar'}
        </Button>
        <Button 
          variant="outline"
          className="flex-1 bg-transparent border-white text-white hover:bg-white/20"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartir
        </Button>
      </div>

      {/* Error de descarga */}
      {downloadError && (
        <div className="max-w-md mx-auto mt-4 bg-yellow-100 text-yellow-800 p-3 rounded-lg text-center text-sm">
          {downloadError}
        </div>
      )}

      {/* Información adicional */}
      <div className="max-w-md mx-auto mt-8 bg-white/20 rounded-xl p-4 text-white text-center">
        <p className="text-sm">
          🐝 Esta credencial certifica que eres parte de <strong>El Club de La Colmena</strong>, 
          una comunidad que transforma vidas a través de becas educativas.
        </p>
      </div>
    </div>
  )
}
