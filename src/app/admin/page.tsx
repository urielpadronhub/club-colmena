'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  DollarSign, 
  Trophy, 
  Baby, 
  Settings, 
  LogOut,
  TrendingUp,
  Gift,
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle
} from 'lucide-react'

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
  memberType: string
  createdAt: string
  user: { name: string; email: string }
  _count: {
    actions: number
    payments: number
    raffleWins: number
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

interface UserData {
  id: string
  name: string
  email: string
  role: string
  bee: {
    memberType: string
  } | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [bees, setBees] = useState<BeeItem[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [newRaffle, setNewRaffle] = useState({
    name: '',
    description: '',
    type: 'weekly',
    prizeAmount: '',
    numberOfWinners: '1',
    scheduledDate: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Permitir acceso a admin y presidenta
    const isAdmin = parsedUser.role === 'admin'
    const isPresidenta = parsedUser.bee?.memberType === 'presidente'
    
    if (!isAdmin && !isPresidenta) {
      router.push('/dashboard')
      return
    }
    
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [statsRes, beesRes, rafflesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/bees'),
        fetch('/api/raffles')
      ])
      
      const statsData = await statsRes.json()
      const beesData = await beesRes.json()
      const rafflesData = await rafflesRes.json()
      
      if (statsData.success) setStats(statsData.data)
      if (beesData.success) setBees(beesData.data)
      if (rafflesData.success) setRaffles(rafflesData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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

  const handleDeleteBee = async (beeId: string, beeName: string) => {
    if (!confirm(`¿Está seguro de eliminar al socio "${beeName}"? Esta acción no se puede deshacer.`)) return
    
    try {
      const response = await fetch('/api/admin/delete-bee', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beeId,
          requestUserId: user?.id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Socio eliminado correctamente')
        fetchData()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting bee:', error)
      alert('Error al eliminar socio')
    }
  }

  const getMemberTypeLabel = (memberType: string) => {
    switch (memberType) {
      case 'presidente': return { label: '👑 Presidente', color: 'bg-yellow-400 text-yellow-900' }
      case 'elite': return { label: '⭐ Elite', color: 'bg-purple-600 text-white' }
      case 'fundador': return { label: '🏅 Fundador', color: 'bg-blue-500 text-white' }
      default: return { label: '🐝 Formal', color: 'bg-gray-400 text-white' }
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
          <img src="/logo-abeja.png" alt="Abeja" className="w-16 h-16 mx-auto mb-4 animate-buzz" />
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
            <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                <img src="/logo-icono.png" alt="Abejas" className="w-12 h-12" />
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
                <Baby className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="resumen" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="abejas">Abejas</TabsTrigger>
            <TabsTrigger value="sorteos">Sorteos</TabsTrigger>
          </TabsList>

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
                        <th className="text-left p-3">Tipo</th>
                        <th className="text-left p-3">Estado</th>
                        <th className="text-left p-3">Operaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bees.map((bee) => {
                        const memberInfo = getMemberTypeLabel(bee.memberType)
                        return (
                          <tr key={bee.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-sm">{bee.affiliationNumber}</td>
                            <td className="p-3">{bee.user.name}</td>
                            <td className="p-3 text-sm text-gray-500">{bee.user.email}</td>
                            <td className="p-3">{bee.cedula}</td>
                            <td className="p-3">
                              <Badge className={memberInfo.color}>{memberInfo.label}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge className={bee.isActive ? 'bg-green-500' : 'bg-red-500'}>
                                {bee.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  title={bee.isActive ? 'Desactivar' : 'Activar'}
                                  onClick={() => handleToggleBeeStatus(bee.id, bee.isActive)}
                                >
                                  {bee.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  title="Eliminar socio"
                                  onClick={() => handleDeleteBee(bee.id, bee.user.name)}
                                >
                                  🗑️
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
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
    </div>
  )
}
