'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart, 
  Users, 
  Trophy, 
  Gift, 
  CheckCircle, 
  Star,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Upload,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Check,
  Copy
} from 'lucide-react'
import { BeeIcon } from '@/components/bee-icon'

interface OrgBankData {
  accountHolder: string
  bankName: string
  phone: string
  rif: string
  accountType: string
}

export default function Home() {
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [giftCode, setGiftCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [orgBankData, setOrgBankData] = useState<OrgBankData | null>(null)
  const [copiedPhone, setCopiedPhone] = useState(false)
  
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
  
  const [paymentData, setPaymentData] = useState({
    referenceNumber: '',
    payerName: '',
    bcvRate: '',
    amountVes: '',
    paymentProofImage: ''
  })
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  // Cargar datos bancarios de la organización
  useEffect(() => {
    if (registerOpen) {
      fetch('/api/organization/bank')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrgBankData(data.data)
          }
        })
        .catch(err => console.error('Error cargando datos bancarios:', err))
    }
  }, [registerOpen])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentData({
          ...paymentData,
          paymentProofImage: reader.result as string
        })
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

    // Validar datos de pago
    if (!paymentData.referenceNumber || !paymentData.payerName || !paymentData.paymentProofImage) {
      setMessage({ type: 'error', text: 'Debes completar todos los datos de pago y subir el comprobante' })
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
          ...paymentData
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `¡Registro exitoso! Tu número de afiliación es: ${data.data.affiliationNumber}. Tu pago está siendo verificado.` 
        })
        setTimeout(() => {
          setRegisterOpen(false)
          setCurrentStep(1)
          // Resetear formularios
          setRegisterData({
            name: '', email: '', password: '', confirmPassword: '',
            cedula: '', phone: '', address: '', birthDate: ''
          })
          setPaymentData({
            referenceNumber: '', payerName: '', bcvRate: '',
            amountVes: '', paymentProofImage: ''
          })
          setGiftCode('')
        }, 3000)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al registrar' })
    }

    setLoading(false)
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Validar datos personales
      if (!registerData.name || !registerData.email || !registerData.password || 
          !registerData.cedula || !registerData.phone) {
        setMessage({ type: 'error', text: 'Completa todos los campos obligatorios' })
        return
      }
      if (registerData.password !== registerData.confirmPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
        return
      }
    }
    setMessage({ type: '', text: '' })
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <BeeIcon className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">El Club de La Colmena</h1>
              <p className="text-amber-100 text-sm">Unidos por la educación</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white text-amber-600 hover:bg-amber-50">
                  Iniciar Sesión
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
                  {message.text && loginOpen && (
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

            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  ¡Únete como Abeja!
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BeeIcon className="w-6 h-6 text-amber-500" />
                    Registro de Nueva Abeja
                  </DialogTitle>
                  <DialogDescription>
                    Únete a nuestra colmena y ayuda a niños a recibir educación de calidad
                  </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Paso {currentStep} de 2</span>
                    <span className="text-sm text-gray-500">
                      {currentStep === 1 ? 'Datos Personales' : 'Pago de Activación'}
                    </span>
                  </div>
                  <Progress value={currentStep * 50} className="h-2" />
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* STEP 1: Datos Personales */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {/* Código de regalo */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <Label htmlFor="gift-code" className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-500" />
                          ¿Tienes un código de regalo? (Opcional)
                        </Label>
                        <Input 
                          id="gift-code" 
                          placeholder="MIEL-XXXXXXXX" 
                          value={giftCode}
                          onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                          className="mt-2"
                        />
                        <p className="text-xs text-purple-600 mt-1">
                          Si tienes un código, regístralo aquí para bonificar a quien te invitó
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                            placeholder="V-12345678"
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
                          placeholder="0414-0000000"
                          required 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
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
                      
                      <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  )}

                  {/* STEP 2: Pago de Activación */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {/* Instrucciones de pago */}
                      <Alert className="bg-amber-50 border-amber-200">
                        <CreditCard className="h-4 w-4 text-amber-500" />
                        <AlertDescription>
                          <strong>Pago de Activación: $2 USD</strong><br/>
                          Realiza un Pago Móvil con los siguientes datos y sube tu comprobante.
                        </AlertDescription>
                      </Alert>

                      {/* Datos bancarios de la organización */}
                      {orgBankData && (
                        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-amber-500" />
                              Datos para Pago Móvil
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500">Titular</p>
                                <p className="font-bold">{orgBankData.accountHolder}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Banco</p>
                                <p className="font-bold">{orgBankData.bankName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">RIF</p>
                                <p className="font-bold">{orgBankData.rif}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Tipo de Cuenta</p>
                                <p className="font-bold capitalize">{orgBankData.accountType}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                              <p className="text-gray-500 text-sm">Teléfono Pago Móvil</p>
                              <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold text-amber-700">{orgBankData.phone}</p>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(orgBankData.phone)}
                                >
                                  {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-700">
                                <strong>Monto a pagar:</strong> $2 USD (equivalente en Bolívares a tasa BCV del día)
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Datos del Comprobante
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="referenceNumber">Número de Referencia *</Label>
                            <Input 
                              id="referenceNumber" 
                              value={paymentData.referenceNumber}
                              onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})}
                              placeholder="Ej: 123456789"
                              required 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="payerName">Nombre del Pagador *</Label>
                            <Input 
                              id="payerName" 
                              value={paymentData.payerName}
                              onChange={(e) => setPaymentData({...paymentData, payerName: e.target.value})}
                              placeholder="Nombre que aparece en el pago"
                              required 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="bcvRate">Tasa BCV (opcional)</Label>
                              <Input 
                                id="bcvRate" 
                                value={paymentData.bcvRate}
                                onChange={(e) => setPaymentData({...paymentData, bcvRate: e.target.value})}
                                placeholder="Ej: 36.50"
                              />
                            </div>
                            <div>
                              <Label htmlFor="amountVes">Monto en Bs. (opcional)</Label>
                              <Input 
                                id="amountVes" 
                                value={paymentData.amountVes}
                                onChange={(e) => setPaymentData({...paymentData, amountVes: e.target.value})}
                                placeholder="Ej: 73.00"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="paymentProof">Captura del Comprobante *</Label>
                            <div className="mt-2">
                              <Input 
                                id="paymentProof" 
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="cursor-pointer"
                              />
                            </div>
                            {paymentData.paymentProofImage && (
                              <div className="mt-3">
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Comprobante cargado correctamente
                                </p>
                                <img 
                                  src={paymentData.paymentProofImage} 
                                  alt="Comprobante" 
                                  className="mt-2 max-h-40 rounded border"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800">Verificación de Pago</p>
                            <p className="text-sm text-yellow-700">
                              Tu pago será verificado por nuestro equipo en un plazo de 24-48 horas.
                              Una vez aprobado, recibirás tu número de afiliación y tus 3 códigos de regalo.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {message.text && (
                    <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {message.text}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Atrás
                      </Button>
                    ) : (
                      <div></div>
                    )}

                    {currentStep < 2 ? (
                      <Button type="button" onClick={nextStep} className="bg-amber-500 hover:bg-amber-600">
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={loading}>
                        {loading ? (
                          'Registrando...'
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Completar Registro
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 honeycomb-pattern">
        <div className="container mx-auto text-center">
          <div className="animate-float inline-block mb-8">
            <div className="w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center shadow-2xl">
              <BeeIcon className="w-20 h-20 text-amber-800" />
            </div>
          </div>
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Sé parte del cambio que <span className="text-amber-500">transforma vidas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Únete a nuestra colmena de abejas solidarias y ayuda a niños de escasos recursos 
            a recibir una educación de calidad. Tu aporte genera oportunidades.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-lg px-8" onClick={() => setRegisterOpen(true)}>
              <Sparkles className="mr-2 h-5 w-5" />
              Quiero ser Abeja
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Conoce más
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">¿Cómo funciona el Club?</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>1. Regístrate</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Completa tus datos y realiza el pago de activación de $2 USD por Pago Móvil
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>2. Activa tu Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Verificamos tu pago y activamos tu cuenta. ¡Recibes 3 acciones de regalo para compartir!
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
                  Regala tus 3 acciones a amigos y haz crecer la colmena exponencialmente
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
      <section className="py-16 px-4 bg-amber-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Tu Inversión y Retorno</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-amber-400">
              <CardHeader className="bg-amber-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Tu Inversión
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Activación (una vez)</span>
                  <Badge className="bg-amber-500">$2 USD</Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Cuota mensual</span>
                  <Badge className="bg-amber-500">$2 USD/mes</Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Duración del compromiso</span>
                  <Badge className="bg-amber-600">52 semanas</Badge>
                </div>
                <div className="flex justify-between items-center pt-3 bg-amber-100 p-3 rounded-lg">
                  <span className="font-bold text-lg">Total Año 1</span>
                  <span className="font-bold text-2xl text-amber-600">$26 USD</span>
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
                  <span>Participación en sorteos semanales</span>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Participación en sorteos mensuales</span>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Participación en sorteos semestrales</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Gran Sorteo Anual</span>
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
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">Sistema de Acciones</h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Entre más acciones tengas, más probabilidades de ganar en los sorteos
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
      <section className="py-16 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">Sistema de Sorteos</h3>
          <p className="text-center text-amber-100 mb-12 max-w-2xl mx-auto">
            Premios en efectivo pagados directamente a tu cuenta por Pago Móvil
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-2" />
                <CardTitle className="text-white">Semanales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold mb-2">$15</p>
                <p className="text-amber-200 text-sm">Múltiples ganadores</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-2" />
                <CardTitle className="text-white">Mensuales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold mb-2">$75</p>
                <p className="text-amber-200 text-sm">5 ganadores</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader className="text-center">
                <Trophy className="w-10 h-10 mx-auto mb-2" />
                <CardTitle className="text-white">Semestrales</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold mb-2">$400</p>
                <p className="text-amber-200 text-sm">Grandes premios</p>
              </CardContent>
            </Card>

            <Card className="bg-white/20 backdrop-blur border-white/30">
              <CardHeader className="text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-2" />
                <CardTitle className="text-white">Anual</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold mb-2">$1,500</p>
                <p className="text-amber-200 text-sm">¡Gran Premio!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impacto */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">Nuestro Impacto</h3>
          <p className="text-center text-gray-600 mb-12">Juntos estamos transformando vidas</p>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">150+</div>
              <p className="text-gray-600">Niños becados</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">500+</div>
              <p className="text-gray-600">Abejas activas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">$25,000+</div>
              <p className="text-gray-600">Recaudado</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500 mb-2">100%</div>
              <p className="text-gray-600">Transparencia</p>
            </div>
          </div>
          
          <div className="mt-12 max-w-2xl mx-auto">
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <BeeIcon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold">El Club de La Colmena</h4>
              </div>
              <p className="text-gray-400">
                Asociación Civil sin fines de lucro dedicada a brindar educación de calidad a niños de escasos recursos.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contacto</h5>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +58 XXX-XXXXXXX</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@clubcolmena.org</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Venezuela</p>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-4">Enlaces Rápidos</h5>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-amber-400 cursor-pointer">¿Cómo funciona?</p>
                <p className="hover:text-amber-400 cursor-pointer">Términos y condiciones</p>
                <p className="hover:text-amber-400 cursor-pointer">Preguntas frecuentes</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 El Club de La Colmena. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
