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
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle,
  Star,
  Award,
  RefreshCw,
  Send,
  Copy,
  Search
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

interface EliteCode {
  id: string
  code: string
  elite_number: number
  status: string
  assigned_to_name: string | null
  assigned_at: string | null
}

interface FounderCode {
  id: string
  code: string
  elite_number: number
  founder_number: number
  adn_prefix: string
  status: string
  assigned_to_name: string | null
  assigned_at: string | null
}

interface CodesData {
  elite: {
    stats: { total: number; available: number; assigned: number }
    codes: EliteCode[]
  }
  founder: {
    stats: { 
      total: number
      available: number
      assigned: number
      byElite: {
        becas: number
        becasAvailable: number
        comerciales: number
        comercialesAvailable: number
      }
    }
    codes: FounderCode[]
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
  const [codesData, setCodesData] = useState<CodesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newRaffle, setNewRaffle] = useState({
    name: '',
    description: '',
    type: 'weekly',
    prizeAmount: '',
    numberOfWinners: '1',
    scheduledDate: ''
  })
  
  // Estados separados para cada formulario
  const [eliteCode, setEliteCode] = useState('')
  const [eliteName, setEliteName] = useState('')
  const [founderCode, setFounderCode] = useState('')
  const [founderName, setFounderName] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [searchElite, setSearchElite] = useState('')
  const [searchFounder, setSearchFounder] = useState('')
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
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
      const [statsRes, beesRes, rafflesRes, codesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/bees'),
        fetch('/api/raffles'),
        fetch('/api/admin/codes')
      ])
      
      const statsData = await statsRes.json()
      const beesData = await beesRes.json()
      const rafflesData = await rafflesRes.json()
      const codesJson = await codesRes.json()
      
      if (statsData.success) setStats(statsData.data)
      if (beesData.success) setBees(beesData.data)
      if (rafflesData.success) setRaffles(rafflesData.data)
      if (codesJson.success) setCodesData(codesJson)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
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

  const handleInitCodes = async (type: 'elite' | 'founder') => {
    if (!confirm(`¿Inicializar todos los códigos ${type === 'elite' ? 'Elite (100)' : 'Fundador (500)'}?`)) return
    
    setInitLoading(true)
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'elite' ? 'init-elite' : 'init-founder',
          adminKey: 'COLMENA2025'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        showMessage('success', data.message)
        fetchData()
      } else {
        showMessage('error', data.error || 'Error al inicializar')
      }
    } catch (error) {
      console.error('Error initializing codes:', error)
      showMessage('error', 'Error al inicializar códigos')
    } finally {
      setInitLoading(false)
    }
  }

  const handleAssignEliteCode = async () => {
    if (!eliteCode || !eliteName) {
      showMessage('error', 'Por favor ingrese el código y el nombre')
      return
    }
    
    setAssigning(true)
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-elite',
          code: eliteCode,
          assignTo: eliteName,
          adminKey: 'COLMENA2025'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        showMessage('success', `✅ Código ${data.code} asignado a ${eliteName}. Número Elite: ${data.eliteNumber}`)
        setEliteCode('')
        setEliteName('')
        fetchData()
      } else {
        showMessage('error', data.error || 'Error al asignar')
      }
    } catch (error) {
      console.error('Error assigning code:', error)
      showMessage('error', 'Error al asignar código')
    } finally {
      setAssigning(false)
    }
  }

  const handleAssignFounderCode = async () => {
    if (!founderCode || !founderName) {
      showMessage('error', 'Por favor ingrese el código y el nombre')
      return
    }
    
    setAssigning(true)
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-founder',
          code: founderCode,
          assignTo: founderName,
          adminKey: 'COLMENA2025'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        showMessage('success', `✅ Código ${data.code} asignado a ${founderName}. ADN: ${data.adnPrefix}`)
        setFounderCode('')
        setFounderName('')
        fetchData()
      } else {
        showMessage('error', data.error || 'Error al asignar')
      }
    } catch (error) {
      console.error('Error assigning code:', error)
      showMessage('error', 'Error al asignar código')
    } finally {
      setAssigning(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showMessage('success', `Copiado: ${text}`)
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

  // Filtrar códigos para búsqueda
  const filteredEliteCodes = codesData?.elite.codes.filter(c => 
    c.code.toLowerCase().includes(searchElite.toLowerCase()) ||
    (c.assigned_to_name && c.assigned_to_name.toLowerCase().includes(searchElite.toLowerCase()))
  ) || []

  const filteredFounderCodes = codesData?.founder.codes.filter(c => 
    c.code.toLowerCase().includes(searchFounder.toLowerCase()) ||
    (c.assigned_to_name && c.assigned_to_name.toLowerCase().includes(searchFounder.toLowerCase()))
  ) || []

  // Separar fundadores por tipo
  const becasCodes = filteredFounderCodes.filter(c => c.elite_number === 0)
  const comercialesCodes = filteredFounderCodes.filter(c => c.elite_number > 0)

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

      {/* Mensaje de estado */}
      {message && (
        <div className={`container mx-auto px-4 mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

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
        <Tabs defaultValue="codigos" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="codigos">🎯 Códigos ADN</TabsTrigger>
            <TabsTrigger value="abejas">🐝 Socios</TabsTrigger>
            <TabsTrigger value="sorteos">🏆 Sorteos</TabsTrigger>
            <TabsTrigger value="resumen">📊 Resumen</TabsTrigger>
          </TabsList>

          {/* Tab: Códigos ADN */}
          <TabsContent value="codigos" className="space-y-6">
            
            {/* INSTRUCCIONES */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <h3 className="font-bold text-amber-800 mb-2">📌 Instrucciones</h3>
                <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1">
                  <li>Si los contadores están en 0, click en "Inicializar Códigos"</li>
                  <li>Para asignar: ingresa el código + nombre y click en "Asignar"</li>
                  <li>Los códigos verdes están disponibles, los ámbar ya asignados</li>
                </ol>
              </CardContent>
            </Card>

            {/* ESTADÍSTICAS GENERALES */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Estadísticas Elite */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Star className="w-5 h-5" />
                    Códigos Elite (100)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div className="p-2 bg-gray-100 rounded">
                      <p className="text-2xl font-bold text-purple-600">{codesData?.elite.stats.total || 0}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">{codesData?.elite.stats.available || 0}</p>
                      <p className="text-xs text-gray-500">Disponibles</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <p className="text-2xl font-bold text-amber-600">{codesData?.elite.stats.assigned || 0}</p>
                      <p className="text-xs text-gray-500">Asignados</p>
                    </div>
                  </div>
                  
                  {codesData?.elite.stats.total === 0 && (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleInitCodes('elite')}
                      disabled={initLoading}
                    >
                      {initLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
                      Inicializar 100 Códigos Elite
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Estadísticas Fundador */}
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Award className="w-5 h-5" />
                    Códigos Fundador (500)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div className="p-2 bg-gray-100 rounded">
                      <p className="text-2xl font-bold text-blue-600">{codesData?.founder.stats.total || 0}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">{codesData?.founder.stats.available || 0}</p>
                      <p className="text-xs text-gray-500">Disponibles</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <p className="text-2xl font-bold text-amber-600">{codesData?.founder.stats.assigned || 0}</p>
                      <p className="text-xs text-gray-500">Asignados</p>
                    </div>
                  </div>
                  
                  {codesData?.founder.stats.total === 0 && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleInitCodes('founder')}
                      disabled={initLoading}
                    >
                      {initLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
                      Inicializar 500 Códigos Fundador
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* FORMULARIO ASIGNAR ELITE */}
            <Card className="border-purple-300">
              <CardHeader className="bg-purple-100">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Star className="w-5 h-5" />
                  ⭐ Asignar Código Elite
                </CardTitle>
                <CardDescription>
                  Formato: ELITE-001 hasta ELITE-100 | El socio recibirá 1 acción Elite
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label className="font-semibold">Código Elite</Label>
                    <Input 
                      value={eliteCode}
                      onChange={(e) => setEliteCode(e.target.value.toUpperCase())}
                      placeholder="ELITE-001"
                      className="text-lg font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="font-semibold">Nombre del Socio Elite</Label>
                    <Input 
                      value={eliteName}
                      onChange={(e) => setEliteName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="text-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
                      onClick={handleAssignEliteCode}
                      disabled={assigning}
                    >
                      {assigning ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                      ASIGNAR ELITE
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FORMULARIO ASIGNAR FUNDADOR */}
            <Card className="border-blue-300">
              <CardHeader className="bg-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Award className="w-5 h-5" />
                  🏅 Asignar Código Fundador
                </CardTitle>
                <CardDescription>
                  Becas: FUND-000-001 al 200 | Comerciales: FUND-XXX-YYY | El socio recibe 50 acciones + 50 códigos MIEL
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label className="font-semibold">Código Fundador</Label>
                    <Input 
                      value={founderCode}
                      onChange={(e) => setFounderCode(e.target.value.toUpperCase())}
                      placeholder="FUND-000-001"
                      className="text-lg font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="font-semibold">Nombre del Socio Fundador</Label>
                    <Input 
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      placeholder="Ej: María García"
                      className="text-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                      onClick={handleAssignFounderCode}
                      disabled={assigning}
                    >
                      {assigning ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                      ASIGNAR FUNDADOR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GRID DE CÓDIGOS ELITE */}
            {codesData && codesData.elite.codes.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>⭐ Códigos Elite - Estado</CardTitle>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={searchElite}
                        onChange={(e) => setSearchElite(e.target.value)}
                        placeholder="Buscar código o nombre..."
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-20 gap-1">
                    {filteredEliteCodes.map((code) => (
                      <div 
                        key={code.id}
                        className={`p-2 rounded text-center text-xs font-mono cursor-pointer transition-all hover:scale-105 ${
                          code.status === 'available' 
                            ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300' 
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300'
                        }`}
                        title={`${code.code}\n${code.status === 'assigned' ? `Asignado a: ${code.assigned_to_name}` : 'Disponible'}`}
                        onClick={() => code.status === 'available' && setEliteCode(code.code)}
                      >
                        {code.elite_number.toString().padStart(3, '0')}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span>Disponible (click para seleccionar)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
                      <span>Asignado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CÓDIGOS FUNDADOR DE BECAS */}
            {becasCodes.length > 0 && (
              <Card className="border-amber-200">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-800">
                    📚 Fundadores de Becas (Elite 000 - El Club) - {becasCodes.filter(c => c.status === 'available').length} disponibles de {becasCodes.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-20 gap-1 max-h-60 overflow-y-auto">
                    {becasCodes.slice(0, 200).map((code) => (
                      <div 
                        key={code.id}
                        className={`p-2 rounded text-center text-xs font-mono cursor-pointer transition-all hover:scale-105 ${
                          code.status === 'available' 
                            ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300' 
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300'
                        }`}
                        title={`${code.code}\nADN: ${code.adn_prefix}\n${code.status === 'assigned' ? `Asignado a: ${code.assigned_to_name}` : 'Disponible'}`}
                        onClick={() => code.status === 'available' && setFounderCode(code.code)}
                      >
                        {code.founder_number.toString().padStart(3, '0')}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click en un código verde para seleccionarlo automáticamente</p>
                </CardContent>
              </Card>
            )}

            {/* CÓDIGOS FUNDADOR COMERCIALES */}
            {comercialesCodes.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800">
                    💼 Fundadores Comerciales (Elite 001-100) - {comercialesCodes.filter(c => c.status === 'available').length} disponibles de {comercialesCodes.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <Input 
                      value={searchFounder}
                      onChange={(e) => setSearchFounder(e.target.value)}
                      placeholder="Buscar por código o nombre..."
                      className="w-64"
                    />
                  </div>
                  
                  {/* Tabla de códigos */}
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-100 sticky top-0">
                        <tr>
                          <th className="p-2 text-left">Código</th>
                          <th className="p-2 text-left">ADN</th>
                          <th className="p-2 text-left">Estado</th>
                          <th className="p-2 text-left">Asignado a</th>
                          <th className="p-2 text-left">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comercialesCodes.slice(0, 100).map((code) => (
                          <tr key={code.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono">{code.code}</td>
                            <td className="p-2 font-mono text-blue-600">{code.adn_prefix}</td>
                            <td className="p-2">
                              <Badge className={code.status === 'available' ? 'bg-green-500' : 'bg-amber-500'}>
                                {code.status === 'available' ? 'Disponible' : 'Asignado'}
                              </Badge>
                            </td>
                            <td className="p-2">{code.assigned_to_name || '-'}</td>
                            <td className="p-2">
                              {code.status === 'available' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setFounderCode(code.code)}
                                >
                                  Seleccionar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CÓDIGOS ASIGNADOS RECIENTEMENTE */}
            {codesData && (codesData.elite.stats.assigned > 0 || codesData.founder.stats.assigned > 0) && (
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800">✅ Códigos Asignados Recientemente</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left">Tipo</th>
                          <th className="p-2 text-left">Código</th>
                          <th className="p-2 text-left">ADN/Número</th>
                          <th className="p-2 text-left">Asignado a</th>
                          <th className="p-2 text-left">Fecha</th>
                          <th className="p-2 text-left">Copiar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codesData.elite.codes.filter(c => c.status === 'assigned').slice(0, 5).map((code) => (
                          <tr key={code.id} className="border-b bg-purple-50">
                            <td className="p-2"><Badge className="bg-purple-500">Elite</Badge></td>
                            <td className="p-2 font-mono">{code.code}</td>
                            <td className="p-2">#{code.elite_number}</td>
                            <td className="p-2 font-semibold">{code.assigned_to_name}</td>
                            <td className="p-2 text-gray-500">{code.assigned_at ? new Date(code.assigned_at).toLocaleDateString() : '-'}</td>
                            <td className="p-2">
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code.code)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {codesData.founder.codes.filter(c => c.status === 'assigned').slice(0, 10).map((code) => (
                          <tr key={code.id} className="border-b bg-blue-50">
                            <td className="p-2"><Badge className="bg-blue-500">Fundador</Badge></td>
                            <td className="p-2 font-mono">{code.code}</td>
                            <td className="p-2 font-mono text-blue-600">{code.adn_prefix}</td>
                            <td className="p-2 font-semibold">{code.assigned_to_name}</td>
                            <td className="p-2 text-gray-500">{code.assigned_at ? new Date(code.assigned_at).toLocaleDateString() : '-'}</td>
                            <td className="p-2">
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code.code)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* Tab: Socios */}
          <TabsContent value="abejas">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Socios</CardTitle>
                <CardDescription>
                  Total: {bees.length} socios registrados
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
        </Tabs>
      </main>
    </div>
  )
}
// Build Thu Mar 12 12:43:56 UTC 2026
