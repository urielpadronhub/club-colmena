import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Generate a CUID-like ID
function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `c${timestamp}${random}`
}

// Obtener sorteos
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let query = supabase
      .from('Raffle')
      .select(`
        *,
        winners:RaffleWinner(
          *,
          bee:Bee(
            *,
            user:User(name, email)
          )
        )
      `)
      .order('scheduledDate', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('type', type)
    }

    const { data: raffles, error } = await query

    if (error) {
      console.error('Error obteniendo sorteos:', error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: raffles
    })

  } catch (error) {
    console.error('Error obteniendo sorteos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Crear sorteo
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, description, type, prizeAmount, prizeDescription, numberOfWinners, scheduledDate } = body

    if (!name || !type || !prizeAmount || !scheduledDate) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const raffleData = {
      id: generateId(),
      name,
      description: description || null,
      type,
      prizeAmount: parseFloat(prizeAmount),
      prizeDescription: prizeDescription || null,
      numberOfWinners: numberOfWinners || 1,
      scheduledDate: scheduledDate,
      status: 'scheduled'
    }

    const { data: raffle, error } = await supabase
      .from('Raffle')
      .insert([raffleData])
      .select()
      .single()

    if (error) {
      console.error('Error creando sorteo:', error)
      return NextResponse.json(
        { error: 'Error interno del servidor', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: raffle
    })

  } catch (error) {
    console.error('Error creando sorteo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Ejecutar sorteo
export async function PUT(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { raffleId, action } = body

    if (action === 'execute') {
      // Get raffle
      const { data: raffle, error: raffleError } = await supabase
        .from('Raffle')
        .select('*')
        .eq('id', raffleId)
        .single()

      if (raffleError || !raffle) {
        return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 })
      }

      if (raffle.status !== 'scheduled') {
        return NextResponse.json({ error: 'El sorteo ya fue ejecutado' }, { status: 400 })
      }

      // Get all active bees
      const { data: activeBees } = await supabase
        .from('Bee')
        .select('id')
        .eq('isActive', true)

      if (!activeBees || activeBees.length === 0) {
        return NextResponse.json({ error: 'No hay socios activos' }, { status: 400 })
      }

      // Get actions for each bee separately
      const participants: { beeId: string; tickets: number }[] = []
      
      for (const bee of activeBees) {
        const { data: actions } = await supabase
          .from('Action')
          .select('quantity')
          .eq('beeId', bee.id)
        
        const totalActions = actions?.reduce((sum, a) => sum + (a.quantity || 0), 0) || 0
        if (totalActions > 0) {
          participants.push({ beeId: bee.id, tickets: totalActions })
        }
      }

      if (participants.length === 0) {
        return NextResponse.json({ error: 'No hay participantes con acciones' }, { status: 400 })
      }

      // Create ticket pool
      const ticketPool: string[] = []
      for (const p of participants) {
        for (let i = 0; i < p.tickets; i++) {
          ticketPool.push(p.beeId)
        }
      }

      // Select winner
      const randomIndex = Math.floor(Math.random() * ticketPool.length)
      const winnerBeeId = ticketPool[randomIndex]

      // Get winner details
      const { data: winnerBee } = await supabase
        .from('Bee')
        .select('id, affiliationNumber, memberType')
        .eq('id', winnerBeeId)
        .single()

      const { data: winnerUser } = await supabase
        .from('User')
        .select('name, email')
        .eq('id', winnerBee?.userId || '')
        .single()

      // Save winner
      await supabase
        .from('RaffleWinner')
        .insert([{
          id: generateId(),
          raffleId: raffle.id,
          beeId: winnerBeeId,
          prizeAmount: raffle.prizeAmount,
          prizePosition: 1,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString()
        }])

      // Update raffle status
      await supabase
        .from('Raffle')
        .update({ status: 'completed', executedAt: new Date().toISOString() })
        .eq('id', raffleId)

      return NextResponse.json({
        success: true,
        message: 'Sorteo ejecutado exitosamente',
        data: {
          raffleName: raffle.name,
          prizeAmount: raffle.prizeAmount,
          winner: {
            beeId: winnerBeeId,
            name: winnerUser?.name,
            email: winnerUser?.email,
            affiliationNumber: winnerBee?.affiliationNumber,
            memberType: winnerBee?.memberType
          },
          totalParticipants: participants.length,
          totalTickets: ticketPool.length,
          winnerTickets: participants.find(p => p.beeId === winnerBeeId)?.tickets || 0
        }
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error ejecutando sorteo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
