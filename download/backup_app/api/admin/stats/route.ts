import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Estadísticas generales del sistema
export async function GET(request: NextRequest) {
  try {
    // Conteos básicos
    const totalBees = await db.bee.count()
    const activeBees = await db.bee.count({ where: { isActive: true } })
    const totalChildren = await db.child.count({ where: { status: 'active' } })
    const totalRaffles = await db.raffle.count()
    const completedRaffles = await db.raffle.count({ where: { status: 'completed' } })

    // Pagos
    const payments = await db.payment.findMany()
    const totalCollected = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const pendingPayments = payments.filter(p => p.status === 'pending').length

    // Premios entregados
    const winners = await db.raffleWinner.findMany()
    const totalPrizesPaid = winners
      .filter(w => w.paymentStatus === 'paid')
      .reduce((sum, w) => sum + w.prizeAmount, 0)

    // Acciones en el sistema
    const actions = await db.action.findMany()
    const totalActions = actions.reduce((sum, a) => sum + a.quantity, 0)

    // Códigos de regalo
    const totalGiftCodes = await db.giftAction.count()
    const activatedGiftCodes = await db.giftAction.count({ where: { status: 'activated' } })

    // Últimas abejas registradas
    const recentBees = await db.bee.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    // Próximos sorteos
    const upcomingRaffles = await db.raffle.findMany({
      where: { status: 'scheduled' },
      take: 5,
      orderBy: { scheduledDate: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          totalBees,
          activeBees,
          totalChildren,
          totalRaffles,
          completedRaffles,
          pendingPayments,
          totalGiftCodes,
          activatedGiftCodes
        },
        financial: {
          totalCollected,
          totalPrizesPaid,
          totalActions
        },
        recent: {
          bees: recentBees,
          raffles: upcomingRaffles
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
