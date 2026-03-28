'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Users, 
  DollarSign, 
  Trophy, 
  Child, 
  Settings, 
  LogOut,
  TrendingUp,
  Gift,
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  CreditCard
} from 'lucide-react'
import { BeeIcon } from '@/components/bee-icon'

interface Stats {
  counts: {
    totalBees: number
    activeBees: number
    totalChildren: number
    totalRaffles: number
    completedRaffles: number
    pendingPayments: number
    totalGiftCodes: number
    activatedGiftCodes: number
  }
  financial: {
    totalCollected: number
    totalPrizesPaid: number
    totalActions: number
  }
  recent: {
    bees: Array<{
      id: string
      affiliationNumber: string
      createdAt: string
      user: { name: string; email: string }
    }>
    raffles: Array<{
      id: string
      name: string
      type: string
      scheduledDate: string
    }>
  }
}

interface BeeItem {
  id: string
  affiliationNumber: string
  cedula: string
  phone: string
  isActive: boolean
  createdAt: string
  user: { name: string; email: string }
  _count: {
    actions: number
    payments: number
    raffleWins: number
  }
}

interface PaymentItem {
  id: string
  type: string
  amount: number
  status: string
  referenceNumber: string
  payerName: string
  paymentProofImage: string
  bcvRate: number | null
  amountVes: number | null
  createdAt: string
  rejectionReason: string | null
  bee: {
    id: string
    affiliationNumber: string
    cedula: string
    phone: string
    user: {
      name: string
      email: string
    }
  }
}

interface Raffle {
  id: string
  name: string
  type: string
  prizeAmount: number
  numberOfWinners: number
  status: string
  scheduledDate: string
  _count: {
    tickets: number
    winners: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [bees, setBees] = useState<BeeItem[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [pendingPayments, setPendingPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)
  const [showProofDialog, setShowProofDialog] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [newRaffle, setNewRaffle] = useState({
    name: '',
    description: '',
    type: 'weekly',
    prizeAmount: '',
    numberOfWinners: '1',
    scheduledDate: ''
  })

  // Get user data
  const [adminUser, setAdminUser] = useState<{id: string, name: string, email: string} | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    setAdminUser(parsedUser)
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [statsRes, beesRes, rafflesRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/bees'),
        fetch('/api/raffles'),
        fetch('/api/admin/payments?status=pending&type=activation')
      ])
      
      const statsData = await statsRes.json()
      const beesData = await beesRes.json()
      const rafflesData = await rafflesRes.json()
      const paymentsData = await paymentsRes.json()
      
      if (statsData.success) setStats(statsData.data)
      if (beesData.success) setBees(beesData.data)
      if (rafflesData.success) setRaffles(rafflesData.data)
      if (paymentsData.success) setPendingPayments(paymentsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async (paymentId: string) => {
    if (!adminUser) return
    
    if (!confirm('¿Está seguro de APROBAR este pago? Esto activará la cuenta del usuario.')) return
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'approve',
          reviewedBy: adminUser.id
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(`¡Pago aprobado!\n\nAbeja activada: ${data.data.affiliationNumber}\nCódigos de regalo generados: ${data.data.giftCodes.join(', ')}`)
        fetchData()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error approving payment:', error)
      alert('Error al aprobar el pago')
    }
  }

  const handleRejectPayment = async () => {
    if (!adminUser || !selectedPayment) return
    
    if (!rejectionReason.trim()) {
      alert('Debe ingresar una razón de rechazo')
      return
    }
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: 'reject',
          rejectionReason,
          reviewedBy: adminUser.id
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert('Pago rechazado correctamente')
        setRejectDialogOpen(false)
        setRejectionReason('')
        setSelectedPayment(null)
        fetchData()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
      alert('Error al rechazar el pago')
    }
  }

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRaffle,
          prizeAmount: parseFloat(newRaffle.prizeAmount),
          numberOfWinners: parseInt(newRaffle.numberOfWinners)
        })
      })
      
      if (response.ok) {
        setNewRaffle({
          name: '',
          description: '',
          type: 'weekly',
          prizeAmount: '',
          numberOfWinners: '1',
          scheduledDate: ''
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating raffle:', error)
    }
  }

  const handleExecuteRaffle = async (raffleId: string) => {
    if (!confirm('¿Está seguro de ejecutar este sorteo? Esta acción no se puede deshacer.')) return
    
    try {
      const response = await fetch('/api/raffles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId,
          action: 'execute'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(`Sorteo ejecutado. ${data.data.winners.length} ganador(es).`)
        fetchData()
      }
    } catch (error) {
      console.error('Error executing raffle:', error)
    }
  }

  const handleToggleBeeStatus = async (beeId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/bees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beeId,
          isActive: !currentStatus
        })
      })
      fetchData()
    } catch (error) {
      console.error('Error toggling bee status:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <BeeIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Panel de Administración</h1>
              <p className="text-gray-400 text-sm">El Club de La Colmena</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">{adminUser?.name}</span>
            <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Alerta de pagos pendientes */}
        {pendingPayments.length > 0 && (
          <Card className="mb-6 border-2 border-orange-400 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-orange-800">
                    ¡Tienes {pendingPayments.length} pago(s) de activación pendiente(s)!
                  </p>
                  <p className="text-sm text-orange-600">
                    Revisa la pestaña "Pagos Pendientes" para aprobar o rechazar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas principales */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Total Abejas</p>
                  <p className="text-3xl font-bold">{stats?.counts.totalBees || 0}</p>
                  <p className="text-amber-200 text-sm">{stats?.counts.activeBees || 0} activas</p>
                </div>
                <BeeIcon className="w-12 h-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Recaudado</p>
                  <p className="text-3xl font-bold">${stats?.financial.totalCollected.toFixed(2) || '0.00'}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Acciones en Sistema</p>
                  <p className="text-3xl font-bold">{stats?.financial.totalActions || 0}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Niños Becados</p>
                  <p className="text-3xl font-bold">{stats?.counts.totalChildren || 0}</p>
                </div>
                <Child className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="pagos" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="pagos" className="relative">
              Pagos Pendientes
              {pendingPayments.length > 0 && (
                <Badge className="ml-2 bg-orange-500">{pendingPayments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="abejas">Abejas</TabsTrigger>
            <TabsTrigger value="sorteos">Sorteos</TabsTrigger>
          </TabsList>

          {/* Tab: Pagos Pendientes */}
          <TabsContent value="pagos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Pagos de Activación Pendientes
                </CardTitle>
                <CardDescription>
                  Revisa y aprueba los pagos de activación de nuevos socios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPayments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                    <p className="text-lg">¡No hay pagos pendientes!</p>
                    <p className="text-sm">Todos los pagos han sido procesados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <Card key={payment.id} className="border-2 border-orange-200">
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            {/* Info del solicitante */}
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Solicitante</p>
                              <p className="font-bold text-lg">{payment.bee.user.name}</p>
                              <p className="text-sm text-gray-600">{payment.bee.user.email}</p>
                              <div className="mt-2 space-y-1 text-sm">
                                <p><span className="text-gray-500">Cédula:</span> {payment.bee.cedula}</p>
                                <p><span className="text-gray-500">Teléfono:</span> {payment.bee.phone}</p>
                                <p><span className="text-gray-500">Afiliación:</span> {payment.bee.affiliationNumber}</p>
                              </div>
                            </div>
                            
                            {/* Info del pago */}
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Datos del Pago</p>
                              <p className="font-bold text-2xl text-green-600">${payment.amount} USD</p>
                              {payment.amountVes && (
                                <p className="text-sm text-gray-600">Bs. {payment.amountVes}</p>
                              )}
                              <div className="mt-2 space-y-1 text-sm">
                                <p><span className="text-gray-500">Referencia:</span> <span className="font-mono">{payment.referenceNumber}</span></p>
                                <p><span className="text-gray-500">Pagador:</span> {payment.payerName}</p>
                                {payment.bcvRate && (
                                  <p><span className="text-gray-500">Tasa BCV:</span> {payment.bcvRate}</p>
                                )}
                                <p><span className="text-gray-500">Fecha:</span> {new Date(payment.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            {/* Comprobante y acciones */}
                            <div className="space-y-3">
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setShowProofDialog(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Comprobante
                              </Button>
                              <Button 
                                className="w-full bg-green-500 hover:bg-green-600"
                                onClick={() => handleApprovePayment(payment.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprobar Pago
                              </Button>
                              <Button 
                                variant="destructive"
                                className="w-full"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setRejectDialogOpen(true)
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rechazar Pago
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Resumen */}
          <TabsContent value="resumen" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Últimas abejas */}
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Abejas Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recent.bees.map((bee) => (
                      <div key={bee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{bee.user.name}</p>
                          <p className="text-sm text-gray-500">{bee.affiliationNumber}</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(bee.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded">
                    <span>Códigos de regalo activados</span>
                    <Badge className="bg-amber-500">
                      {stats?.counts.activatedGiftCodes}/{stats?.counts.totalGiftCodes}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>Sorteos completados</span>
                    <Badge className="bg-green-500">
                      {stats?.counts.completedRaffles}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span>Pagos pendientes</span>
                    <Badge className="bg-orange-500">
                      {stats?.counts.pendingPayments}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span>Premios pagados</span>
                    <Badge className="bg-purple-500">
                      ${stats?.financial.totalPrizesPaid.toFixed(2)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Abejas */}
          <TabsContent value="abejas">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Abejas</CardTitle>
                <CardDescription>
                  Total: {bees.length} abejas registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Afiliación</th>
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Cédula</th>
                        <th className="text-left p-3">Acciones</th>
                        <th className="text-left p-3">Estado</th>
                        <th className="text-left p-3">Operación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bees.map((bee) => (
                        <tr key={bee.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{bee.affiliationNumber}</td>
                          <td className="p-3">{bee.user.name}</td>
                          <td className="p-3 text-sm text-gray-500">{bee.user.email}</td>
                          <td className="p-3">{bee.cedula}</td>
                          <td className="p-3">
                            <Badge variant="outline">{bee._count.actions}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={bee.isActive ? 'bg-green-500' : 'bg-red-500'}>
                              {bee.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleBeeStatus(bee.id, bee.isActive)}
                            >
                              {bee.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sorteos */}
          <TabsContent value="sorteos" className="space-y-6">
            {/* Crear sorteo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Crear Nuevo Sorteo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRaffle} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del sorteo</Label>
                    <Input 
                      value={newRaffle.name}
                      onChange={(e) => setNewRaffle({...newRaffle, name: e.target.value})}
                      placeholder="Ej: Sorteo Semanal #5"
                      required
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newRaffle.type}
                      onChange={(e) => setNewRaffle({...newRaffle, type: e.target.value})}
                    >
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                      <option value="semester">Semestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <Label>Monto del premio ($)</Label>
                    <Input 
                      type="number"
                      value={newRaffle.prizeAmount}
                      onChange={(e) => setNewRaffle({...newRaffle, prizeAmount: e.target.value})}
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <Label>Número de ganadores</Label>
                    <Input 
                      type="number"
                      value={newRaffle.numberOfWinners}
                      onChange={(e) => setNewRaffle({...newRaffle, numberOfWinners: e.target.value})}
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Fecha programada</Label>
                    <Input 
                      type="datetime-local"
                      value={newRaffle.scheduledDate}
                      onChange={(e) => setNewRaffle({...newRaffle, scheduledDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descripción (opcional)</Label>
                    <Input 
                      value={newRaffle.description}
                      onChange={(e) => setNewRaffle({...newRaffle, description: e.target.value})}
                      placeholder="Descripción del sorteo"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Crear Sorteo
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Lista de sorteos */}
            <Card>
              <CardHeader>
                <CardTitle>Sorteos Programados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {raffles.map((raffle) => (
                    <div key={raffle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium">{raffle.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline">{raffle.type}</Badge>
                          <span className="text-sm text-gray-500">
                            ${raffle.prizeAmount} - {raffle.numberOfWinners} ganador(es)
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Fecha: {new Date(raffle.scheduledDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          raffle.status === 'completed' ? 'bg-green-500' :
                          raffle.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                        }>
                          {raffle.status === 'completed' ? 'Completado' :
                           raffle.status === 'active' ? 'Activo' : 'Programado'}
                        </Badge>
                        {raffle.status === 'scheduled' && (
                          <Button 
                            size="sm"
                            onClick={() => handleExecuteRaffle(raffle.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Trophy className="w-4 h-4 mr-1" />
                            Ejecutar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog para ver comprobante */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
            <DialogDescription>
              {selectedPayment?.bee.user.name} - Ref: {selectedPayment?.referenceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment?.paymentProofImage && (
            <div className="mt-4">
              <img 
                src={selectedPayment.paymentProofImage} 
                alt="Comprobante de pago" 
                className="w-full rounded-lg border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para rechazar */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Rechazar Pago
            </DialogTitle>
            <DialogDescription>
              Indica la razón del rechazo. El usuario podrá subir un nuevo comprobante.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Razón del rechazo *</Label>
              <Input 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Comprobante ilegible, monto incorrecto, etc."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRejectPayment} className="flex-1">
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
