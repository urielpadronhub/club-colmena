'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Calendar, 
  Users, 
  DollarSign, 
  Eye, 
  Play,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Raffle {
  id: string
  name: string
  type: string
  prizeAmount: number
  description: string
  numberOfWinners: number
  status: string
  scheduledDate: string
  executedAt: string | null
}

export default function SorteosPublicosPage() {
  const [sorteos, setSorteos] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSorteos()
  }, [])

  const fetchSorteos = async () => {
    try {
      const res = await fetch('/api/raffles')
      const data = await res.json()
      if (data.success) {
        setSorteos(data.data)
      }
    } catch (error) {
      console.error('Error cargando sorteos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'weekly': return { label: 'Semanal', color: 'bg-blue-500', icon: '📅' }
      case 'monthly': return { label: 'Mensual', color: 'bg-purple-500', icon: '🗓️' }
      case 'semester': return { label: 'Semestral', color: 'bg-amber-500', icon: '📚' }
      case 'annual': return { label: 'Anual', color: 'bg-green-500', icon: '🎉' }
      default: return { label: tipo, color: 'bg-gray-500', icon: '🏆' }
    }
  }

  const getEstadoBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return { label: 'Programado', color: 'bg-blue-500', icon: <Clock className="w-3 h-3" /> }
      case 'active': return { label: 'Activo', color: 'bg-green-500', icon: <Play className="w-3 h-3" /> }
      case 'completed': return { label: 'Completado', color: 'bg-gray-500', icon: <CheckCircle className="w-3 h-3" /> }
      default: return { label: status, color: 'bg-gray-500', icon: null }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🐝</div>
          <p className="text-gray-600">Cargando sorteos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo-icono.png" alt="Logo" className="w-12 h-12 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold">Sorteos Públicos</h1>
                <p className="text-amber-100 text-sm">El Club de La Colmena</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="bg-white text-amber-600">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sorteos Disponibles</h2>
          <p className="text-gray-600">Sorteos transparentes y públicos de El Club de La Colmena</p>
        </div>

        {sorteos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗓️</div>
            <p className="text-gray-600 text-lg">No hay sorteos disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorteos.map((sorteo) => {
              const tipoInfo = getTipoLabel(sorteo.type)
              const estadoInfo = getEstadoBadge(sorteo.status)
              
              return (
                <Card 
                  key={sorteo.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-amber-200"
                >
                  {/* Header de la tarjeta */}
                  <div className={`${tipoInfo.color} text-white p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-2xl">{tipoInfo.icon}</span>
                        <h3 className="text-xl font-bold mt-1">{sorteo.name}</h3>
                      </div>
                      <Badge className="bg-white/20 text-white">
                        {tipoInfo.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="pt-4">
                    <p className="text-gray-600 text-sm mb-4">
                      {sorteo.description || 'Participa por grandes premios'}
                    </p>
                    
                    {/* Info del sorteo */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" /> Premio:
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          ${sorteo.prizeAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Ganadores:
                        </span>
                        <span className="font-medium">{sorteo.numberOfWinners}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Fecha:
                        </span>
                        <span className="text-sm">
                          {new Date(sorteo.scheduledDate).toLocaleDateString('es-VE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Estado */}
                    <div className="flex justify-between items-center mb-4">
                      <Badge className={`${estadoInfo.color} text-white`}>
                        {estadoInfo.icon}
                        <span className="ml-1">{estadoInfo.label}</span>
                      </Badge>
                    </div>
                    
                    {/* Botón */}
                    <Link href={`/sorteo/${sorteo.id}`}>
                      <Button className="w-full bg-amber-500 hover:bg-amber-600">
                        <Eye className="w-4 h-4 mr-2" /> Ver Sorteo
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Info adicional */}
        <div className="mt-12 bg-amber-100 rounded-xl p-6">
          <h3 className="text-xl font-bold text-amber-800 mb-4">¿Cómo funcionan los sorteos?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-amber-900">Acciones = Tickets</p>
                <p className="text-sm text-amber-700">Cada acción que tienes equivale a un número en el sorteo</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-amber-900">Sorteo Transparente</p>
                <p className="text-sm text-amber-700">Los números se seleccionan aleatoriamente de forma pública</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-amber-900">Premios Directos</p>
                <p className="text-sm text-amber-700">Los premios se pagan por Pago Móvil directamente</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-600 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold">🐝 El Club de La Colmena</p>
          <p className="text-amber-200 text-sm">Unidos por la educación de nuestros niños</p>
        </div>
      </footer>
    </div>
  )
}
