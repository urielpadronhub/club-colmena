import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Obtener sorteos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (type) where.type = type

    const raffles = await db.raffle.findMany({
      where,
      include: {
        winners: {
          include: {
            bee: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        },
        _count: {
          select: { tickets: true, winners: true }
        }
      },
      orderBy: { scheduledDate: 'desc' }
    })

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
    const body = await request.json()
    const { name, description, type, prizeAmount, prizeDescription, numberOfWinners, scheduledDate } = body

    if (!name || !type || !prizeAmount || !scheduledDate) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const raffle = await db.raffle.create({
      data: {
        name,
        description: description || null,
        type,
        prizeAmount: parseFloat(prizeAmount),
        prizeDescription: prizeDescription || null,
        numberOfWinners: numberOfWinners || 1,
        scheduledDate: new Date(scheduledDate),
        status: 'scheduled'
      }
    })

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
    const body = await request.json()
    const { raffleId, action } = body

    if (action === 'execute') {
      // Obtener el sorteo
      const raffle = await db.raffle.findUnique({
        where: { id: raffleId }
      })

      if (!raffle) {
        return NextResponse.json(
          { error: 'Sorteo no encontrado' },
          { status: 404 }
        )
      }

      if (raffle.status !== 'scheduled') {
        return NextResponse.json(
          { error: 'El sorteo ya fue ejecutado' },
          { status: 400 }
        )
      }

      // Generar tickets para todas las abejas activas
      const activeBees = await db.bee.findMany({
        where: { isActive: true },
        include: {
          actions: true
        }
      })

      if (activeBees.length === 0) {
        return NextResponse.json(
          { error: 'No hay abejas activas para el sorteo' },
          { status: 400 }
        )
      }

      // Crear array de participantes con sus tickets
      const participants: { beeId: string; tickets: number }[] = []
      
      for (const bee of activeBees) {
        const totalActions = bee.actions.reduce((sum, a) => sum + a.quantity, 0)
        if (totalActions > 0) {
          participants.push({ beeId: bee.id, tickets: totalActions })
        }
      }

      if (participants.length === 0) {
        return NextResponse.json(
          { error: 'No hay participantes con acciones para el sorteo' },
          { status: 400 }
        )
      }

      // Crear array de tickets para sorteo (ponderado)
      const ticketPool: string[] = []
      for (const p of participants) {
        for (let i = 0; i < p.tickets; i++) {
          ticketPool.push(p.beeId)
        }
      }

      // Seleccionar ganadores aleatoriamente
      const winners: { beeId: string; prizePosition: number }[] = []
      const usedBeeIds = new Set<string>()

      for (let pos = 1; pos <= raffle.numberOfWinners; pos++) {
        let winnerId: string | null = null
        let attempts = 0

        while (!winnerId && attempts < ticketPool.length) {
          const randomIndex = Math.floor(Math.random() * ticketPool.length)
          const candidateId = ticketPool[randomIndex]
          
          if (!usedBeeIds.has(candidateId)) {
            winnerId = candidateId
            usedBeeIds.add(candidateId)
          }
          attempts++
        }

        if (winnerId) {
          winners.push({ beeId: winnerId, prizePosition: pos })
        }
      }

      // Guardar ganadores
      for (const winner of winners) {
        await db.raffleWinner.create({
          data: {
            raffleId: raffle.id,
            beeId: winner.beeId,
            prizeAmount: raffle.prizeAmount / winners.length,
            prizePosition: winner.prizePosition,
            paymentStatus: 'pending'
          }
        })
      }

      // Actualizar estado del sorteo
      await db.raffle.update({
        where: { id: raffleId },
        data: {
          status: 'completed',
          executedAt: new Date()
        }
      })

      // Obtener ganadores con datos
      const savedWinners = await db.raffleWinner.findMany({
        where: { raffleId: raffle.id },
        include: {
          bee: {
            include: {
              user: { select: { name: true } },
              bankAccount: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Sorteo ejecutado exitosamente',
        data: {
          raffle,
          winners: savedWinners,
          totalParticipants: participants.length,
          totalTickets: ticketPool.length
        }
      })
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error ejecutando sorteo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
