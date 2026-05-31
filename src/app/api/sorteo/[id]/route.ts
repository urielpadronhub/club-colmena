import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Obtener datos del sorteo para pantalla pública
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sorteoId } = await params

    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    // Obtener datos del sorteo
    const { data: sorteo, error: sorteoError } = await supabase
      .from('Raffle')
      .select('*')
      .eq('id', sorteoId)
      .single()

    if (sorteoError || !sorteo) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 })
    }

    // Obtener todos los participantes con sus tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('RaffleTicket')
      .select(`
        id,
        ticketCount,
        ticketNumbers,
        beeId,
        Bee (
          id,
          affiliationNumber,
          user (name, email)
        )
      `)
      .eq('raffleId', sorteoId)

    if (ticketsError) {
      console.error('Error obteniendo tickets:', ticketsError)
    }

    // Procesar participantes
    const participantes = (tickets || []).map((t: any) => {
      let numeros: number[] = []
      try {
        numeros = JSON.parse(t.ticketNumbers || '[]')
      } catch {
        numeros = []
      }

      return {
        beeId: t.beeId,
        nombre: t.Bee?.user?.name || 'Socio',
        afiliacion: t.Bee?.affiliationNumber || '',
        cantidadAcciones: t.ticketCount,
        numeros: numeros
      }
    })

    // Obtener ganadores si ya existen
    const { data: ganadores, error: ganadoresError } = await supabase
      .from('RaffleWinner')
      .select(`
        id,
        prizeAmount,
        prizePosition,
        paymentStatus,
        beeId,
        Bee (
          id,
          affiliationNumber,
          user (name, email)
        )
      `)
      .eq('raffleId', sorteoId)
      .order('prizePosition', { ascending: true })

    // Crear lista de todos los números para el sorteo
    const todosLosNumeros: { numero: number; beeId: string; nombre: string; afiliacion: string }[] = []
    
    participantes.forEach((p: any) => {
      p.numeros.forEach((n: number) => {
        todosLosNumeros.push({
          numero: n,
          beeId: p.beeId,
          nombre: p.nombre,
          afiliacion: p.afiliacion
        })
      })
    })

    return NextResponse.json({
      success: true,
      sorteo: {
        id: sorteo.id,
        nombre: sorteo.name,
        tipo: sorteo.type,
        premio: sorteo.prizeAmount,
        descripcion: sorteo.description,
        cantidadGanadores: sorteo.numberOfWinners,
        estado: sorteo.status,
        fechaProgramada: sorteo.scheduledDate,
        ejecutadoEn: sorteo.executedAt
      },
      participantes: participantes.map((p: any) => ({
        beeId: p.beeId,
        nombre: p.nombre,
        afiliacion: p.afiliacion,
        cantidadAcciones: p.cantidadAcciones,
        numeros: p.numeros
      })),
      todosLosNumeros,
      totalNumeros: todosLosNumeros.length,
      ganadores: (ganadores || []).map((g: any) => ({
        id: g.id,
        posicion: g.prizePosition,
        monto: g.prizeAmount,
        beeId: g.beeId,
        nombre: g.Bee?.user?.name || 'Socio',
        afiliacion: g.Bee?.affiliationNumber || ''
      }))
    })

  } catch (error) {
    console.error('Error en API sorteo:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Ejecutar sorteo (seleccionar ganadores)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sorteoId } = await params
    const body = await request.json()
    const { cantidadGanadores = 1, adminKey } = body

    if (adminKey !== 'COLMENA2025') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    // Verificar que el sorteo existe y no se ha ejecutado
    const { data: sorteo, error: sorteoError } = await supabase
      .from('Raffle')
      .select('*')
      .eq('id', sorteoId)
      .single()

    if (sorteoError || !sorteo) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 })
    }

    if (sorteo.status === 'completed') {
      return NextResponse.json({ error: 'Este sorteo ya fue ejecutado' }, { status: 400 })
    }

    // Obtener todos los tickets
    const { data: tickets } = await supabase
      .from('RaffleTicket')
      .select(`
        id,
        ticketNumbers,
        beeId,
        Bee (
          id,
          affiliationNumber,
          user (name, email)
        )
      `)
      .eq('raffleId', sorteoId)

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'No hay participantes en el sorteo' }, { status: 400 })
    }

    // Crear array de todos los números con su dueño
    const todosLosNumeros: { numero: number; beeId: string; nombre: string }[] = []
    
    tickets.forEach((t: any) => {
      let numeros: number[] = []
      try {
        numeros = JSON.parse(t.ticketNumbers || '[]')
      } catch {
        numeros = []
      }
      
      numeros.forEach(n => {
        todosLosNumeros.push({
          numero: n,
          beeId: t.beeId,
          nombre: t.Bee?.user?.name || 'Socio'
        })
      })
    })

    if (todosLosNumeros.length === 0) {
      return NextResponse.json({ error: 'No hay números en el sorteo' }, { status: 400 })
    }

    // Seleccionar ganadores aleatorios (sin repetir)
    const ganadoresSeleccionados: { numero: number; beeId: string; nombre: string; posicion: number }[] = []
    const numerosDisponibles = [...todosLosNumeros]
    
    for (let i = 0; i < Math.min(cantidadGanadores, numerosDisponibles.length); i++) {
      const indiceAleatorio = Math.floor(Math.random() * numerosDisponibles.length)
      const ganador = numerosDisponibles.splice(indiceAleatorio, 1)[0]
      ganadoresSeleccionados.push({
        ...ganador,
        posicion: i + 1
      })
    }

    // Guardar ganadores en la base de datos
    for (const ganador of ganadoresSeleccionados) {
      await supabase
        .from('RaffleWinner')
        .insert({
          raffleId: sorteoId,
          beeId: ganador.beeId,
          prizeAmount: sorteo.prizeAmount / ganadoresSeleccionados.length,
          prizePosition: ganador.posicion,
          paymentStatus: 'pending'
        })
    }

    // Actualizar estado del sorteo
    await supabase
      .from('Raffle')
      .update({ 
        status: 'completed', 
        executedAt: new Date().toISOString(),
        numberOfWinners: ganadoresSeleccionados.length
      })
      .eq('id', sorteoId)

    return NextResponse.json({
      success: true,
      ganadores: ganadoresSeleccionados,
      mensaje: `Sorteo ejecutado. ${ganadoresSeleccionados.length} ganador(es) seleccionado(s).`
    })

  } catch (error) {
    console.error('Error ejecutando sorteo:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
