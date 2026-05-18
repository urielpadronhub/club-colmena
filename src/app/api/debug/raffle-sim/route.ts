import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { prizeAmount, secretKey } = body

    if (secretKey !== 'Colmena2025!') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get all active bees
    const { data: activeBees } = await supabase
      .from('Bee')
      .select('id, affiliationNumber, memberType, userId')
      .eq('isActive', true)

    if (!activeBees || activeBees.length === 0) {
      return NextResponse.json({ error: 'No hay socios activos' }, { status: 400 })
    }

    // Get actions for each bee
    const participants: any[] = []
    
    for (const bee of activeBees) {
      const { data: actions } = await supabase
        .from('Action')
        .select('quantity')
        .eq('beeId', bee.id)
      
      const totalActions = actions?.reduce((sum, a) => sum + (a.quantity || 0), 0) || 0
      if (totalActions > 0) {
        // Get user name
        const { data: user } = await supabase
          .from('User')
          .select('name, email')
          .eq('id', bee.userId)
          .single()
        
        participants.push({ 
          beeId: bee.id, 
          tickets: totalActions,
          name: user?.name,
          email: user?.email,
          affiliationNumber: bee.affiliationNumber,
          memberType: bee.memberType
        })
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
    const winner = participants.find(p => p.beeId === winnerBeeId)

    // Create raffle record
    const raffleId = generateId()
    await supabase
      .from('Raffle')
      .insert([{
        id: raffleId,
        name: 'Sorteo Simulado',
        type: 'monthly',
        prizeAmount: prizeAmount || 100,
        numberOfWinners: 1,
        status: 'completed',
        scheduledDate: new Date().toISOString(),
        executedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])

    // Save winner
    await supabase
      .from('RaffleWinner')
      .insert([{
        id: generateId(),
        raffleId: raffleId,
        beeId: winnerBeeId,
        prizeAmount: prizeAmount || 100,
        prizePosition: 1,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      }])

    return NextResponse.json({
      success: true,
      message: 'Sorteo ejecutado exitosamente',
      data: {
        raffleId: raffleId,
        winner: {
          name: winner?.name,
          email: winner?.email,
          memberType: winner?.memberType,
          affiliationNumber: winner?.affiliationNumber,
          tickets: winner?.tickets
        },
        totalParticipants: participants.length,
        totalTickets: ticketPool.length,
        participants: participants.map(p => ({
          name: p.name,
          tickets: p.tickets,
          memberType: p.memberType
        }))
      }
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno', details: error.message }, { status: 500 })
  }
}
