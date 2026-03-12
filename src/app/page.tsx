'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Trophy, 
  Gift, 
  CheckCircle, 
  Star,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function Home() {
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [giftCode, setGiftCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [registerStep, setRegisterStep] = useState(1)
  const [paymentFile, setPaymentFile] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState({
    referenceNumber: '',
    payerName: ''
  })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cedula: '',
    phone: '',
    address: '',
    birthDate: ''
  })
  const [copied, setCopied] = useState('')
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  const bankData = {
    titular: 'Sara Mestre',
    banco: 'Banco del Caribe',
    telefono: '0414 0379406',
    rif: 'J297354239',
    monto: '$2 USD (tasa BCV)'
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentFile(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      setLoading(false)
      return
    }

    if (!paymentFile || !paymentData.referenceNumber || !paymentData.payerName) {
      setMessage({ type: 'error', text: 'Por favor sube el comprobante de pago y completa los datos del pago' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerData,
          giftCode: giftCode || null,
          paymentProofImage: paymentFile,
          referenceNumber: paymentData.referenceNumber,
          payerName: paymentData.payerName
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `¡Registro exitoso! Tu número de afiliación es: ${data.data.affiliationNumber}. Tu pago está pendiente de aprobación.` })
        setLoading(false)
        setTimeout(() => {
          setRegisterOpen(false)
          setRegisterStep(1)
          setPaymentFile(null)
          setPaymentData({ referenceNumber: '', payerName: '' })
          setRegisterData({
            name: '', email: '', password: '', confirmPassword: '',
            cedula: '', phone: '', address: '', birthDate: ''
          })
          window.location.href = '/dashboard'
        }, 5000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al registrar' })
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error de conexión. Por favor intenta de nuevo.' })
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        setMessage({ type: 'success', text: '¡Inicio de sesión exitoso!' })
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin'
          } else {
            window.location.href = '/dashboard'
          }
        }, 1000)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al iniciar sesión' })
    }

    setLoading(false)
  }

  const handleCloseRegister = () => {
    const hasData = registerData.name || registerData.email || registerData.cedula || registerData.phone || paymentFile
    if (hasData) {
      if (window.confirm('¿Estás seguro de que quieres cerrar? Perderás los datos ingresados.')) {
        setRegisterOpen(false)
        setTimeout(() => {
          setRegisterStep(1)
          setPaymentFile(null)
          setPaymentData({ referenceNumber: '', payerName: '' })
          setMessage({ type: '', text: '' })
          setRegisterData({
            name: '', email: '', password: '', confirmPassword: '',
            cedula: '', phone: '', address: '', birthDate: ''
          })
        }, 300)
      }
    } else {
      setRegisterOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-500 text-white shadow-lg relative overflow-hidden">
        {/* Abeja Robot decorativa */}
        <img src="/abeja-robot.png" alt="Abeja Robot" className="absolute -right-4 -top-4 w-24 h-24 opacity-20 rotate-12" />
        
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo y nombre */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo-icono.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">El Club de La Colmena</h1>
                <p className="text-amber-100 text-xs sm:text-sm hidden sm:block">🐝 Maracaibo, Zulia - Unidos por la educación</p>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex gap-1 sm:gap-3 flex-shrink-0">
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white text-amber-600 hover:bg-amber-50 text-xs sm:text-sm px-2 sm:px-4">
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                    <span className="sm:hidden">Entrar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Iniciar Sesión</DialogTitle>
                    <DialogDescription>
                      Accede a tu cuenta de abeja
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Correo electrónico</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required 
                      />
                    </div>
                    {message.text && (
                      <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                      </div>
                    )}
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={loading}>
                      {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={registerOpen} onOpenChange={(open) => {
                if (!open) handleCloseRegister()
                else setRegisterOpen(true)
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-xs sm:text-sm px-2 sm:px-4">
                    <span className="hidden sm:inline">¡Únete como Abeja!</span>
                    <span className="sm:hidden">¡Únete!</span>
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
                  onInteractOutside={(e) => e.preventDefault()}
                  onEscapeKeyDown={(e) => e.preventDefault()}
                  showCloseButton={false}
                >
                  <DialogHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <DialogTitle>Registro de Nueva Abeja</DialogTitle>
                        <DialogDescription>
                          Únete a nuestra colmena y ayuda a niños a recibir educación de calidad
                        </DialogDescription>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={handleCloseRegister}
                      >
                        ✕
                      </Button>
                    </div>
                  </DialogHeader>
                  
                  {/* Indicador de pasos */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${registerStep === 1 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                      {registerStep > 1 ? '✓' : '1'}
                    </div>
                    <div className="w-12 h-1 bg-gray-200">
                      <div className={`h-full bg-amber-500 transition-all ${registerStep === 2 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${registerStep === 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      2
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className="text-sm text-gray-500">
                      {registerStep === 1 ? 'Paso 1: Datos Personales' : 'Paso 2: Pago de Activación'}
                    </span>
                  </div>

                  {registerStep === 1 ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gift-code">¿Tienes un código de regalo? (Opcional)</Label>
                        <Input 
                          id="gift-code" 
                          placeholder="MIEL-XXXXXXXX" 
                          value={giftCode}
                          onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre completo *</Label>
                          <Input 
                            id="name" 
                            value={registerData.name}
                            onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="cedula">Cédula *</Label>
                          <Input 
                            id="cedula" 
                            value={registerData.cedula}
                            onChange={(e) => setRegisterData({...registerData, cedula: e.target.value})}
                            required 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Correo electrónico *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input 
                          id="phone" 
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Contraseña *</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                            required 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                          <Input 
                            id="birthDate" 
                            type="date" 
                            value={registerData.birthDate}
                            onChange={(e) => setRegisterData({...registerData, birthDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Dirección</Label>
                          <Input 
                            id="address" 
                            value={registerData.address}
                            onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        className="w-full bg-amber-500 hover:bg-amber-600" 
                        onClick={() => {
                          if (!registerData.name || !registerData.email || !registerData.password || !registerData.cedula || !registerData.phone) {
                            setMessage({ type: 'error', text: 'Por favor completa todos los campos obligatorios' })
                            return
                          }
                          if (registerData.password !== registerData.confirmPassword) {
                            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
                            return
                          }
                          setMessage({ type: '', text: '' })
                          setRegisterStep(2)
                        }}
                      >
                        Continuar al Pago →
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* Datos bancarios para copiar */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                          💳 Datos para el Pago Móvil
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center p-2 bg-white rounded border">
                            <div>
                              <span className="text-gray-500">Titular:</span>
                              <span className="font-medium ml-2">{bankData.titular}</span>
                            </div>
                            <Button type="button" size="sm" variant="ghost" onClick={() => copyToClipboard(bankData.titular, 'titular')}>
                              {copied === 'titular' ? '✓' : '📋'}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white rounded border">
                            <div>
                              <span className="text-gray-500">Banco:</span>
                              <span className="font-medium ml-2">{bankData.banco}</span>
                            </div>
                            <Button type="button" size="sm" variant="ghost" onClick={() => copyToClipboard(bankData.banco, 'banco')}>
                              {copied === 'banco' ? '✓' : '📋'}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white rounded border">
                            <div>
                              <span className="text-gray-500">Teléfono:</span>
                              <span className="font-medium ml-2">{bankData.telefono}</span>
                            </div>
                            <Button type="button" size="sm" variant="ghost" onClick={() => copyToClipboard(bankData.telefono, 'telefono')}>
                              {copied === 'telefono' ? '✓' : '📋'}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white rounded border">
                            <div>
                              <span className="text-gray-500">RIF:</span>
                              <span className="font-medium ml-2">{bankData.rif}</span>
                            </div>
                            <Button type="button" size="sm" variant="ghost" onClick={() => copyToClipboard(bankData.rif, 'rif')}>
                              {copied === 'rif' ? '✓' : '📋'}
                            </Button>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-amber-100 rounded border border-amber-300">
                            <div>
                              <span className="text-gray-500">Monto:</span>
                              <span className="font-bold ml-2 text-amber-700">{bankData.monto}</span>
                            </div>
                            <Button type="button" size="sm" variant="ghost" onClick={() => copyToClipboard('$2', 'monto')}>
                              {copied === 'monto' ? '✓' : '📋'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Campos del pago */}
                      <div>
                        <Label htmlFor="payerName">Nombre del pagador (quien hizo el pago) *</Label>
                        <Input 
                          id="payerName" 
                          value={paymentData.payerName}
                          onChange={(e) => setPaymentData({...paymentData, payerName: e.target.value})}
                          placeholder="Nombre que aparece en el pago"
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="referenceNumber">Número de referencia del pago *</Label>
                        <Input 
                          id="referenceNumber" 
                          value={paymentData.referenceNumber}
                          onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})}
                          placeholder="Ej: 123456789"
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentProof">Captura del comprobante de pago *</Label>
                        <Input 
                          id="paymentProof" 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          required 
                        />
                        {paymentFile && (
                          <div className="mt-2">
                            <img src={paymentFile} alt="Comprobante" className="max-h-32 rounded border" />
                          </div>
                        )}
                      </div>
                      
                      {message.text && (
                        <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {message.text}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setRegisterStep(1)}
                        >
                          ← Volver
                        </Button>
                        <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={loading}>
                          {loading ? 'Registrando...' : 'Registrarme como Abeja'}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Video de Presentación */}
      <section className="relative bg-amber-500">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <video
              key="video-presentacion"
              className="w-full rounded-2xl shadow-2xl"
              controls
              playsInline
              autoPlay={false}
            >
              <source src="/video-nuevo-1.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      </section>

      {/* Hero Section - Impactante */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-600 to-amber-400">
        {/* Imagen de fondo con abejas en Maracaibo */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/abejas-maracaibo.png" 
            alt="Abejas llegando a Maracaibo" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/80 via-amber-800/60 to-transparent"></div>
        </div>
        
        {/* Contenido del Hero */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Badge de ubicación */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-pulse">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            <span className="text-white text-sm font-medium">Maracaibo, Venezuela 🇻🇪</span>
          </div>
          
          {/* Título principal */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
            <span className="block">🐝 LAS ABEJAS 🐝</span>
            <span className="block text-amber-300">LLEGARON A MARACAIBO</span>
          </h1>
          
          {/* Subtítulo animado */}
          <p className="text-lg sm:text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto drop-shadow-lg">
            🐝 Unidas por la educación de nuestros niños
          </p>
          
          {/* Estadísticas en vivo */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-3xl sm:text-4xl font-bold text-white">150+</div>
              <div className="text-amber-200 text-sm">Niños becados</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-3xl sm:text-4xl font-bold text-white">500+</div>
              <div className="text-amber-200 text-sm">Abejas activas</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30">
              <div className="text-3xl sm:text-4xl font-bold text-white">$25K+</div>
              <div className="text-amber-200 text-sm">Recaudado</div>
            </div>
          </div>
          
          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-lg px-8 py-6 rounded-full shadow-2xl shadow-amber-500/50 hover:scale-105 transition-transform animate-bounce"
              onClick={() => setRegisterOpen(true)}
            >
              <Sparkles className="mr-2 h-6 w-6" />
              ¡Quiero ser Abeja! 🐝
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold text-lg px-8 py-6 rounded-full transition-all"
            >
              Conoce más
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full animate-ping"></div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-12 sm:py-16 px-4 bg-white relative overflow-hidden">
        {/* Abeja Robot dando bienvenida */}
        <div className="absolute right-0 top-0 w-32 sm:w-48 opacity-10">
          <img src="/abeja-robot.png" alt="Abeja Robot" className="w-full h-auto rotate-12" />
        </div>
        
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">¿Cómo funciona el Club?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>1. Regístrate</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Crea tu cuenta y obtén tu número de afiliación único como Abeja
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>2. Activa cada Acción</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Cada acción de regalo requiere $2 de activación. ¡Tú decides cuántas activar!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>3. Comparte tus Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Regala tus 3 acciones a amigos. Ellos pagan $2 para activar y tú ganas bonificación
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>4. Participa en Sorteos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Sorteos semanales, mensuales, semestrales y anuales con premios en efectivo
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Inversión y Retorno */}
      <section className="py-12 sm:py-16 px-4 bg-amber-50">
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">Cómo Funcionan las Acciones</h3>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-amber-400">
              <CardHeader className="bg-amber-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Activación de Acciones
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Cada acción se activa con</span>
                  <Badge className="bg-amber-500">$2 USD</Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Recibes 3 acciones al registrarte</span>
                  <Badge className="bg-amber-500">Gratis</Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Acciones de regalo (código MIEL)</span>
                  <Badge className="bg-amber-500">$2 c/u</Badge>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg mt-4">
                  <p className="text-sm text-amber-700 font-medium text-center">
                    💡 Tú decides cuántas acciones activar
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-400">
              <CardHeader className="bg-green-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-6 w-6" />
                  Lo que Recibes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>3 Acciones de regalo para compartir</span>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>$2 de bonificación por cada acción activada</span>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Participación en todos los sorteos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Premios por Pago Móvil directo</span>
                </div>
                <div className="bg-green-100 p-3 rounded-lg mt-4">
                  <p className="text-sm text-green-700 font-medium text-center">
                    ¡Premios pagados por Pago Móvil directamente a tu cuenta!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sistema de Acciones */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">Sistema de Acciones</h3>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Entre más acciones tengas, más probabilidades de ganar en los sorteos
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Star className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <CardTitle>Acciones Base</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>+1 por activación</li>
                  <li>+1 por cada mes pagado</li>
                  <li>Máximo 12 por año</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Gift className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                <CardTitle>Acciones de Regalo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>3 acciones al activarte</li>
                  <li>Regálalas a amigos</li>
                  <li>Crece la colmena</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <CardTitle>Bonificaciones</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>+1 por cada referido activado</li>
                  <li>Sin límite de bonos</li>
                  <li>Crecimiento exponencial</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sorteos */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white relative overflow-hidden">
        {/* Abejas robots celebrando */}
        <img src="/abeja-robot.png" alt="Abeja Robot" className="absolute left-4 bottom-4 w-16 h-16 sm:w-24 sm:h-24 opacity-20 -rotate-12" />
        <img src="/abeja-robot.png" alt="Abeja Robot" className="absolute right-4 top-4 w-12 h-12 sm:w-20 sm:h-20 opacity-15 rotate-45" />
        
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">Sistema de Sorteos</h3>
          <p className="text-center text-amber-100 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Premios en efectivo pagados directamente a tu cuenta por Pago Móvil
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader className="text-center">
                <Calendar className="w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-2" />
                <CardTitle className="text-white text-sm sm:text-base">Semanales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl sm:text-3xl font-bold mb-2">$15</p>
                <p className="text-amber-200 text-xs sm:text-sm">Múltiples ganadores</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader className="text-center">
                <Calendar className="w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-2" />
                <CardTitle className="text-white text-sm sm:text-base">Mensuales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl sm:text-3xl font-bold mb-2">$75</p>
                <p className="text-amber-200 text-xs sm:text-sm">5 ganadores</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader className="text-center">
                <Trophy className="w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-2" />
                <CardTitle className="text-white text-sm sm:text-base">Semestrales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl sm:text-3xl font-bold mb-2">$400</p>
                <p className="text-amber-200 text-xs sm:text-sm">Grandes premios</p>
              </CardContent>
            </Card>

            <Card className="bg-white/20 backdrop-blur border-white/30">
              <CardHeader className="text-center">
                <Sparkles className="w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-2" />
                <CardTitle className="text-white text-sm sm:text-base">Anual</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl sm:text-3xl font-bold mb-2">$1,500</p>
                <p className="text-amber-200 text-xs sm:text-sm">¡Gran Premio!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impacto */}
      <section className="py-12 sm:py-16 px-4 bg-white relative overflow-hidden">
        {/* Abeja Robot motivando */}
        <img src="/abeja-robot.png" alt="Abeja Robot" className="absolute left-0 top-1/2 -translate-y-1/2 w-20 sm:w-32 opacity-10 rotate-12" />
        
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">Nuestro Impacto</h3>
          <p className="text-center text-gray-600 mb-8 sm:mb-12">Juntos estamos transformando vidas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-500 mb-2">150+</div>
              <p className="text-gray-600 text-sm sm:text-base">Niños becados</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-500 mb-2">500+</div>
              <p className="text-gray-600 text-sm sm:text-base">Abejas activas</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-500 mb-2">$25,000+</div>
              <p className="text-gray-600 text-sm sm:text-base">Recaudado</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-500 mb-2">100%</div>
              <p className="text-gray-600 text-sm sm:text-base">Transparencia</p>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 max-w-2xl mx-auto">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Distribución de fondos</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Becas para niños</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2 bg-amber-200 [&>div]:bg-green-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Premios y sorteos</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2 bg-amber-200 [&>div]:bg-amber-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Operación del club</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2 bg-amber-200 [&>div]:bg-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sección del Colegio Sara Mestre */}
      <section className="py-12 sm:py-16 px-4 bg-blue-50">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-8 mb-6">
            <img src="/logo-fusion-colmena.png" alt="Club de la Colmena" className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">En alianza con</h3>
          <div className="flex justify-center mb-6">
            <img src="/logo-colegio-sara-mestre.png" alt="Colegio Sara Mestre" className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-blue-600 mb-2">Colegio Sara Mestre</h4>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Formando niños con valores y educación de calidad desde hace más de 20 años.
            Juntos transformamos vidas a través de la educación.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12 px-4 relative overflow-hidden">
        {/* Abeja Robot despidiendo */}
        <img src="/abeja-robot.png" alt="Abeja Robot" className="absolute right-4 bottom-4 w-16 h-16 sm:w-24 sm:h-24 opacity-10 rotate-12" />
        
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-icono.png" alt="Logo Club" className="w-10 h-10 rounded-full" />
                <h4 className="text-lg sm:text-xl font-bold">El Club de La Colmena</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Asociación Civil sin fines de lucro dedicada a brindar educación de calidad a niños de escasos recursos.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Aliado Educativo</h5>
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo-colegio-sara-mestre.png" alt="Colegio" className="w-8 h-8" />
                <span className="text-gray-400 text-sm">Colegio Sara Mestre</span>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contacto</h5>
              <p className="text-gray-400 text-sm mb-2">📧 info@clubcolmena.org</p>
              <p className="text-gray-400 text-sm">📱 +58 414 0379406</p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Síguenos</h5>
              <p className="text-gray-400 text-sm">Redes sociales próximamente</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 El Club de La Colmena. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

