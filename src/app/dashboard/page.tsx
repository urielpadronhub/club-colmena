'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Gift, 
  Trophy, 
  CreditCard, 
  Users, 
  Star, 
  Sparkles, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Copy,
  Check,
  LogOut,
  Settings,
  Bell
} from 'lucide-react'

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
    activationPaid: boolean
    activationDate: string | null
  } | null
}

interface BeeData {
  id: string
  affiliationNumber: string
  cedula: string
  phone: string
  address: string
  isActive: boolean
  activationPaid: boolean
  createdAt: string
  memberType: string
  eliteNumber: number | null
  founderNumber: number | null
  user: { name: string; email: string }
  actions: Array<{
    id: string
    type: string
    description: string
    quantity: number
    createdAt: string
  }>
  payments: Array<{
    id: string
    type: string
    amount: number
    status: string
    periodMonth: number | null
    periodYear: number | null
    dueDate: string
    paidAt: string | null
  }>
  raffleWins: Array<{
    id: string
    prizeAmount: number
    prizePosition: number
    paymentStatus: string
    raffle: { name: string; type: string }
  }>
  bankAccount: {
    bankName: string
    accountType: string
    accountNumber: string
    phone: string
  } | null
  totalActions: number
  availableGiftActions: Array<{
    id: string
    giftCode: string
    status: string
  }>
  activeReferrals: number
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [beeData, setBeeData] = useState<BeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountType: 'corriente',
    accountNumber: '',
    cedula: '',
    phone: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    if (parsedUser.role === 'admin') {
      router.push('/admin')
      return
    }

    fetchBeeData(parsedUser.id)
  }, [router])

  const fetchBeeData = async (userId: string) => {
    try {
      const response = await fetch(`/api/bee?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setBeeData(data.data)
        if (data.data.bankAccount) {
          setBankForm({
            bankName: data.data.bankAccount.bankName,
            accountType: data.data.bankAccount.accountType,
            accountNumber: data.data.bankAccount.accountNumber,
            cedula: data.data.bankAccount.cedula,
            phone: data.data.bankAccount.phone
          })
        }
      }
    } catch (error) {
      console.error('Error fetching bee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleActivate = async () => {
    if (!beeData) return
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beeId: beeData.id,
          type: 'activation',
          paymentReference: 'MANUAL-' + Date.now()
        })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchBeeData(user!.id)
      }
    } catch (error) {
      console.error('Error activating:', error)
    }
  }

  const handlePayMonthly = async (month: number, year: number) => {
    if (!beeData) return
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beeId: beeData.id,
          type: 'monthly',
          periodMonth: month,
          periodYear: year,
          paymentReference: 'MANUAL-' + Date.now()
        })
      })
      
      const data = await response.json()
      if (data.success) {
        fetchBeeData(user!.id)
      }
    } catch (error) {
      console.error('Error paying monthly:', error)
    }
  }

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!beeData) return

    try {
      await fetch('/api/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beeId: beeData.id,
          ...bankForm
        })
      })
      fetchBeeData(user!.id)
    } catch (error) {
      console.error('Error saving bank:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <img src="/logo-abeja.png" alt="Abeja" className="w-16 h-16 mx-auto mb-4 animate-buzz" />
          <p className="text-gray-600">Cargando tu colmena...</p>
        </div>
      </div>
    )
  }

  if (!beeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p>No se encontraron datos de abeja</p>
            <Button onClick={() => router.push('/')} className="mt-4">Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingMonthlyPayments = beeData.payments.filter(p => p.type === 'monthly' && p.status === 'pending')
  const paidMonthlyPayments = beeData.payments.filter(p => p.type === 'monthly' && p.status === 'completed')

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo-icono.png" alt="Logo" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-xl font-bold">El Club de La Colmena</h1>
              <p className="text-amber-100 text-sm">Panel de Abeja</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:bg-amber-600">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-amber-600" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tarjeta de afiliación */}
        <Card className="mb-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-amber-100 text-sm">Número de Afiliación</p>
                <p className="text-2xl font-bold">{beeData.affiliationNumber}</p>
                <p className="text-amber-100 mt-2">{beeData.user.name}</p>
              </div>
              <div className="text-right">
                {/* Badge de tipo de socio */}
                <Badge className={
                  beeData.memberType === 'presidente' ? "bg-yellow-400 text-yellow-900" :
                  beeData.memberType === 'elite' ? "bg-purple-600" :
                  beeData.memberType === 'fundador' ? "bg-blue-500" :
                  "bg-gray-400"
                }>
                  {beeData.memberType === 'presidente' ? '👑 Presidente' :
                   beeData.memberType === 'elite' ? '⭐ Elite' :
                   beeData.memberType === 'fundador' ? '🏅 Fundador' :
                   '🐝 Formal'}
                </Badge>
                <Badge className={beeData.isActive ? "bg-green-500 ml-2" : "bg-red-500 ml-2"}>
                  {beeData.isActive ? 'Activo' : 'Pendiente'}
                </Badge>
                <p className="text-amber-100 text-sm mt-2">
                  Carga Accionaria: <span className="font-bold text-white">{beeData.totalActions}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjetas de resumen */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Acciones</p>
                  <p className="text-2xl font-bold">{beeData.totalActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acciones de Regalo</p>
                  <p className="text-2xl font-bold">{beeData.availableGiftActions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Referidos Activos</p>
                  <p className="text-2xl font-bold">{beeData.activeReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Premios Ganados</p>
                  <p className="text-2xl font-bold">{beeData.raffleWins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="acciones" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="acciones">Mis Acciones</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="sorteos">Sorteos</TabsTrigger>
            <TabsTrigger value="cuenta">Mi Cuenta</TabsTrigger>
          </TabsList>

          {/* Tab: Mis Acciones */}
          <TabsContent value="acciones" className="space-y-6">
            {/* Acciones de regalo disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Acciones de Regalo Disponibles
                </CardTitle>
                <CardDescription>
                  Comparte estos códigos con tus amigos para que se unan a la colmena
                </CardDescription>
              </CardHeader>
              <CardContent>
                {beeData.availableGiftActions.length > 0 ? (
                  <div className="space-y-3">
                    {beeData.availableGiftActions.map((gift) => (
                      <div key={gift.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <code className="text-lg font-mono font-bold text-purple-700">{gift.giftCode}</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(gift.giftCode)}
                        >
                          {copiedCode === gift.giftCode ? (
                            <><Check className="w-4 h-4 mr-1" /> Copiado</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-1" /> Copiar</>
                          )}
                        </Button>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-2">
                      Comparte estos códigos. Cuando alguien se registre con uno, recibirás +1 acción bonus.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tienes acciones de regalo disponibles</p>
                    <p className="text-sm">Se renuevan al activar tu cuenta</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historial de acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {beeData.actions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{action.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(action.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-amber-500">+{action.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Pagos */}
          <TabsContent value="pagos" className="space-y-6">
            {/* Activación */}
            {!beeData.activationPaid && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pago de Activación Pendiente
                  </CardTitle>
                  <CardDescription>
                    Activa tu cuenta con $2 USD para comenzar a participar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">$2.00</p>
                      <p className="text-sm text-gray-500">Pago único de activación</p>
                    </div>
                    <Button onClick={handleActivate} className="bg-orange-500 hover:bg-orange-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Registrar Pago
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cuotas mensuales */}
            <Card>
              <CardHeader>
                <CardTitle>Cuotas Mensuales</CardTitle>
                <CardDescription>
                  Progreso: {paidMonthlyPayments.length}/12 meses pagados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={(paidMonthlyPayments.length / 12) * 100} className="mb-4" />
                
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium">Pagos Pendientes</h4>
                  {pendingMonthlyPayments.slice(0, 6).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-amber-50 rounded border">
                      <div>
                        <p className="font-medium">Mes {payment.periodMonth}/{payment.periodYear}</p>
                        <p className="text-sm text-gray-500">
                          Vence: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${payment.amount.toFixed(2)}</span>
                        <Button 
                          size="sm" 
                          onClick={() => handlePayMonthly(payment.periodMonth!, payment.periodYear!)}
                        >
                          Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sorteos */}
          <TabsContent value="sorteos" className="space-y-6">
            {/* Premios ganados */}
            {beeData.raffleWins.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    ¡Premios Ganados!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {beeData.raffleWins.map((win) => (
                      <div key={win.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{win.raffle.name}</p>
                          <p className="text-sm text-gray-500">
                            {win.prizePosition}° lugar - {win.raffle.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">${win.prizeAmount.toFixed(2)}</p>
                          <Badge className={win.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {win.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximos sorteos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Sorteos</CardTitle>
                <CardDescription>
                  Participas con {beeData.totalActions} tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-medium">Sorteo Semanal</h4>
                    <p className="text-sm text-gray-500">Cada domingo</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Sparkles className="w-8 h-8 text-purple-500 mb-2" />
                    <h4 className="font-medium">Sorteo Mensual</h4>
                    <p className="text-sm text-gray-500">Último día del mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Mi Cuenta */}
          <TabsContent value="cuenta" className="space-y-6">
            {/* Datos bancarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Datos para Pago Móvil
                </CardTitle>
                <CardDescription>
                  Aquí recibirá tus premios en efectivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBank} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Banco</Label>
                      <Input 
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                        placeholder="Ej: Banco de Venezuela"
                      />
                    </div>
                    <div>
                      <Label>Tipo de Cuenta</Label>
                      <select 
                        className="w-full p-2 border rounded"
                        value={bankForm.accountType}
                        onChange={(e) => setBankForm({...bankForm, accountType: e.target.value})}
                      >
                        <option value="corriente">Corriente</option>
                        <option value="ahorro">Ahorro</option>
                      </select>
                    </div>
                    <div>
                      <Label>Número de Cuenta</Label>
                      <Input 
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                        placeholder="0000-0000-00-0000000000"
                      />
                    </div>
                    <div>
                      <Label>Cédula del Titular</Label>
                      <Input 
                        value={bankForm.cedula}
                        onChange={(e) => setBankForm({...bankForm, cedula: e.target.value})}
                        placeholder="V-00000000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Teléfono para Pago Móvil</Label>
                      <Input 
                        value={bankForm.phone}
                        onChange={(e) => setBankForm({...bankForm, phone: e.target.value})}
                        placeholder="0414-0000000"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                    Guardar Datos Bancarios
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Información personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{beeData.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{beeData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cédula</p>
                    <p className="font-medium">{beeData.cedula}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{beeData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
