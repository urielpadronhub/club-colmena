'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Users, 
  Ticket, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw,
  Crown,
  Star,
  Gift
} from 'lucide-react'

interface Participante {
  beeId: string
  nombre: string
  afiliacion: string
  cantidadAcciones: number
  numeros: number[]
}

interface SorteoData {
  id: string
  nombre: string
  tipo: string
  premio: number
  descripcion: string
  cantidadGanadores: number
  estado: string
  fechaProgramada: string
  ejecutadoEn: string | null
}

interface Ganador {
  id: string
  posicion: number
  monto: number
  beeId: string
  nombre: string
  afiliacion: string
}

interface NumeroData {
  numero: number
  beeId: string
  nombre: string
  afiliacion: string
}

export default function SorteoPublicoPage() {
  const params = useParams()
  const sorteoId = params.id as string

  const [sorteo, setSorteo] = useState<SorteoData | null>(null)
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [todosLosNumeros, setTodosLosNumeros] = useState<NumeroData[]>([])
  const [ganadores, setGanadores] = useState<Ganador[]>([])
  const [loading, setLoading] = useState(true)

  // Estados del sorteo en vivo
  const [etapa, setEtapa] = useState<'info' | 'participantes' | 'numeros' | 'sorteo' | 'ganadores'>('info')
  const [mostrandoNumeros, setMostrandoNumeros] = useState<NumeroData[]>([])
  const [numeroActual, setNumeroActual] = useState<NumeroData | null>(null)
  const [animando, setAnimando] = useState(false)
  const [ganadorActual, setGanadorActual] = useState<Ganador | null>(null)
  const [velocidad, setVelocidad] = useState(50) // ms entre números
  const [pausado, setPausado] = useState(false)

  // Cargar datos
  useEffect(() => {
    fetchSorteoData()
  }, [sorteoId])

  const fetchSorteoData = async () => {
    try {
      const res = await fetch(`/api/sorteo/${sorteoId}`)
      const data = await res.json()
      
      if (data.success) {
        setSorteo(data.sorteo)
        setParticipantes(data.participantes)
        setTodosLosNumeros(data.todosLosNumeros)
        setGanadores(data.ganadores || [])
        
        // Si ya tiene ganadores, mostrar resultados
        if (data.ganadores && data.ganadores.length > 0) {
          setEtapa('ganadores')
        }
      }
    } catch (error) {
      console.error('Error cargando sorteo:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para mostrar números gradualmente
  const mostrarNumerosGradualmente = useCallback(async () => {
    if (pausado) return
    
    setAnimando(true)
    const numerosCopia = [...todosLosNumeros]
    
    // Mezclar aleatoriamente para mostrar
    for (let i = numerosCopia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosCopia[i], numerosCopia[j]] = [numerosCopia[j], numerosCopia[i]]
    }

    for (let i = 0; i < numerosCopia.length; i++) {
      if (pausado) break
      
      setNumeroActual(numerosCopia[i])
      setMostrandoNumeros(prev => [...prev, numerosCopia[i]])
      
      await new Promise(resolve => setTimeout(resolve, velocidad))
    }
    
    setAnimando(false)
  }, [todosLosNumeros, velocidad, pausado])

  // Función para sortear un ganador
  const sortearGanador = async () => {
    if (todosLosNumeros.length === 0) return
    
    setAnimando(true)
    setEtapa('sorteo')
    
    // Animación de números girando
    const numerosParaSorteo = [...todosLosNumeros]
    let iteraciones = 0
    const maxIteraciones = 30
    
    const intervalo = setInterval(() => {
      const indiceAleatorio = Math.floor(Math.random() * numerosParaSorteo.length)
      setNumeroActual(numerosParaSorteo[indiceAleatorio])
      iteraciones++
      
      if (iteraciones >= maxIteraciones) {
        clearInterval(intervalo)
        
        // Seleccionar el ganador final
        const indiceFinal = Math.floor(Math.random() * numerosParaSorteo.length)
        const ganadorFinal = numerosParaSorteo[indiceFinal]
        
        // Guardar ganador
        const nuevoGanador: Ganador = {
          id: Date.now().toString(),
          posicion: ganadores.length + 1,
          monto: sorteo?.premio || 0,
          beeId: ganadorFinal.beeId,
          nombre: ganadorFinal.nombre,
          afiliacion: ganadorFinal.afiliacion
        }
        
        setGanadorActual(nuevoGanador)
        setGanadores(prev => [...prev, nuevoGanador])
        setAnimando(false)
      }
    }, 100)
  }

  // Función para reiniciar
  const reiniciar = () => {
    setEtapa('info')
    setMostrandoNumeros([])
    setNumeroActual(null)
    setGanadorActual(null)
    setAnimando(false)
    setPausado(false)
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'weekly': return { label: 'Semanal', color: 'bg-blue-500' }
      case 'monthly': return { label: 'Mensual', color: 'bg-purple-500' }
      case 'semester': return { label: 'Semestral', color: 'bg-amber-500' }
      case 'annual': return { label: 'Anual', color: 'bg-green-500' }
      default: return { label: tipo, color: 'bg-gray-500' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl animate-bounce mb-4">🐝</div>
          <p className="text-2xl">Cargando sorteo...</p>
        </div>
      </div>
    )
  }

  if (!sorteo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-4">😕</div>
          <p className="text-2xl">Sorteo no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-amber-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo-icono.png" alt="Logo" className="w-12 h-12 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-amber-400">El Club de La Colmena</h1>
                <p className="text-amber-200 text-sm">Sorteo Público y Transparente</p>
              </div>
            </div>
            <Badge className={`${getTipoLabel(sorteo.tipo).color} text-white text-lg px-4 py-2`}>
              {getTipoLabel(sorteo.tipo).label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Info del Sorteo */}
        <Card className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white mb-8 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2">{sorteo.nombre}</h2>
              <p className="text-amber-200 mb-4">{sorteo.descripcion || 'Gran sorteo de El Club de La Colmena'}</p>
              
              <div className="flex justify-center gap-8 flex-wrap">
                <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-4">
                  <p className="text-amber-200 text-sm">Premio Total</p>
                  <p className="text-4xl font-black">${sorteo.premio.toFixed(2)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-4">
                  <p className="text-amber-200 text-sm">Participantes</p>
                  <p className="text-4xl font-black">{participantes.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-4">
                  <p className="text-amber-200 text-sm">Total Números</p>
                  <p className="text-4xl font-black">{todosLosNumeros.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles del Presentador */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-4 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              onClick={() => setEtapa('info')}
              variant={etapa === 'info' ? 'default' : 'outline'}
              className={etapa === 'info' ? 'bg-amber-500' : 'border-amber-500 text-amber-400'}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Info
            </Button>
            <Button 
              onClick={() => setEtapa('participantes')}
              variant={etapa === 'participantes' ? 'default' : 'outline'}
              className={etapa === 'participantes' ? 'bg-amber-500' : 'border-amber-500 text-amber-400'}
            >
              <Users className="w-4 h-4 mr-2" /> Participantes
            </Button>
            <Button 
              onClick={() => setEtapa('numeros')}
              variant={etapa === 'numeros' ? 'default' : 'outline'}
              className={etapa === 'numeros' ? 'bg-amber-500' : 'border-amber-500 text-amber-400'}
            >
              <Ticket className="w-4 h-4 mr-2" /> Ver Números
            </Button>
            <Button 
              onClick={sortearGanador}
              disabled={animando || todosLosNumeros.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" /> ¡Sortear!
            </Button>
            <Button 
              onClick={reiniciar}
              variant="outline"
              className="border-red-500 text-red-400"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
            </Button>
          </div>
          
          {/* Control de velocidad */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-amber-200 text-sm">Velocidad:</span>
            <input 
              type="range" 
              min="10" 
              max="200" 
              value={200 - velocidad} 
              onChange={(e) => setVelocidad(200 - parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-amber-200 text-sm">{velocidad}ms</span>
          </div>
        </div>

        {/* Etapa: Participantes */}
        {etapa === 'participantes' && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {participantes.map((p, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur border-amber-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                      {p.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{p.nombre}</p>
                      <p className="text-amber-300 text-sm">{p.afiliacion}</p>
                    </div>
                    <Badge className="bg-amber-600 ml-auto">
                      <Ticket className="w-3 h-3 mr-1" /> {p.cantidadAcciones}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Etapa: Números */}
        {etapa === 'numeros' && (
          <Card className="bg-black/30 backdrop-blur border-amber-500/30 mb-8">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-amber-400">Números Participantes</h3>
                <p className="text-amber-200">Total: {todosLosNumeros.length} números</p>
              </div>
              
              {!animando && mostrandoNumeros.length === 0 && (
                <Button 
                  onClick={mostrarNumerosGradualmente}
                  className="bg-amber-500 hover:bg-amber-600 mx-auto block"
                >
                  <Play className="w-4 h-4 mr-2" /> Mostrar Números
                </Button>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center max-h-96 overflow-y-auto">
                {mostrandoNumeros.map((n, idx) => (
                  <div 
                    key={idx}
                    className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:bg-amber-500 transition-all cursor-default"
                    title={`${n.nombre} - ${n.afiliacion}`}
                  >
                    {n.numero}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Sorteo en vivo */}
        {etapa === 'sorteo' && (
          <div className="text-center py-12">
            {/* Número actual girando */}
            <div className="mb-8">
              <p className="text-amber-300 text-xl mb-4">
                {animando ? '🎰 Girando...' : '¡Número Ganador!'}
              </p>
              <div className={`text-9xl font-black text-white ${animando ? 'animate-pulse' : 'animate-bounce'}`}>
                {numeroActual?.numero || '?'}
              </div>
            </div>

            {/* Ganador revelado */}
            {ganadorActual && !animando && (
              <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white max-w-md mx-auto animate-pulse">
                <CardContent className="pt-6">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                  <p className="text-sm text-green-200">¡GANADOR!</p>
                  <h3 className="text-3xl font-black mb-2">{ganadorActual.nombre}</h3>
                  <p className="text-green-200">{ganadorActual.afiliacion}</p>
                  <p className="text-4xl font-black mt-4">${ganadorActual.monto.toFixed(2)}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Etapa: Ganadores */}
        {etapa === 'ganadores' && ganadores.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-center text-amber-400 mb-6">
              <Trophy className="w-8 h-8 inline mr-2" />
              Ganadores del Sorteo
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {ganadores.map((g, idx) => (
                <Card 
                  key={idx} 
                  className={`text-white ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    idx === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-800' :
                    'bg-gradient-to-r from-green-600 to-emerald-600'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏆'}
                      </div>
                      <div>
                        <p className="text-sm opacity-80">#{g.posicion} Lugar</p>
                        <p className="text-xl font-bold">{g.nombre}</p>
                        <p className="text-sm opacity-80">{g.afiliacion}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-2xl font-black">${g.monto.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lista de todos los ganadores históricos */}
        {ganadores.length > 0 && etapa !== 'sorteo' && (
          <div className="mt-8">
            <Button 
              onClick={() => setEtapa('ganadores')}
              className="bg-amber-500 hover:bg-amber-600 mx-auto block"
            >
              <Trophy className="w-4 h-4 mr-2" /> Ver Ganadores
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur border-t border-amber-500/30 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-300">
            🐝 El Club de La Colmena - Sorteo Público y Transparente
          </p>
          <p className="text-amber-200/60 text-sm mt-1">
            Todos los números y ganadores son seleccionados aleatoriamente
          </p>
        </div>
      </footer>
    </div>
  )
}
