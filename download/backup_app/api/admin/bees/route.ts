import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Obtener todas las abejas (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const bees = await db.bee.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true }
        },
        _count: {
          select: { 
            actions: true,
            payments: true,
            raffleWins: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: bees
    })

  } catch (error) {
    console.error('Error obteniendo abejas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Actualizar estado de abeja
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { beeId, isActive } = body

    if (!beeId) {
      return NextResponse.json(
        { error: 'beeId es requerido' },
        { status: 400 }
      )
    }

    const bee = await db.bee.update({
      where: { id: beeId },
      data: { isActive }
    })

    return NextResponse.json({
      success: true,
      data: bee
    })

  } catch (error) {
    console.error('Error actualizando abeja:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
