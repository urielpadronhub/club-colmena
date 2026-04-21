import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Obtener datos completos de la abeja
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const beeId = searchParams.get('beeId')

    if (!userId && !beeId) {
      return NextResponse.json(
        { error: 'userId o beeId es requerido' },
        { status: 400 }
      )
    }

    // Obtener la abeja con todos sus datos
    const bee = await db.bee.findFirst({
      where: userId ? { userId } : { id: beeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        actions: {
          orderBy: { createdAt: 'desc' }
        },
        giftActionsGiven: {
          include: {
            receiverBee: {
              select: {
                affiliationNumber: true,
                user: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        raffleWins: {
          include: {
            raffle: true
          },
          orderBy: { createdAt: 'desc' }
        },
        bankAccount: true,
        _count: {
          select: {
            referredBees: true
          }
        }
      }
    })

    if (!bee) {
      return NextResponse.json(
        { error: 'Abeja no encontrada' },
        { status: 404 }
      )
    }

    // Calcular carga accionaria total
    const totalActions = bee.actions.reduce((sum, action) => sum + action.quantity, 0)

    // Acciones de regalo disponibles
    const availableGiftActions = await db.giftAction.findMany({
      where: {
        giverBeeId: bee.id,
        status: 'available'
      }
    })

    // Contar referidos activos
    const activeReferrals = await db.bee.count({
      where: {
        referredByBeeId: bee.id,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...bee,
        totalActions,
        availableGiftActions,
        activeReferrals,
        giftActionsCount: availableGiftActions.length
      }
    })

  } catch (error) {
    console.error('Error obteniendo abeja:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
