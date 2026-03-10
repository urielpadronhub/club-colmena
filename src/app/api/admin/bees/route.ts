import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Obtener todas las abejas (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const memberType = searchParams.get('memberType')

    const where: Record<string, unknown> = {}
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    if (memberType) {
      where.memberType = memberType
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
            raffleWins: true,
            referredBees: true
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

// Actualizar abeja (estado, tipo de miembro, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { beeId, isActive, memberType, eliteNumber, founderNumber, activationPaid } = body

    if (!beeId) {
      return NextResponse.json(
        { error: 'beeId es requerido' },
        { status: 400 }
      )
    }

    // Datos a actualizar
    const updateData: Record<string, unknown> = {}
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    
    if (activationPaid !== undefined) {
      updateData.activationPaid = activationPaid
      if (activationPaid) {
        updateData.activationDate = new Date()
      }
    }
    
    if (memberType) {
      updateData.memberType = memberType
      
      // Asignar número si es Elite o Fundador
      if (memberType === 'elite' && eliteNumber === undefined) {
        const lastElite = await db.bee.findFirst({
          where: { memberType: 'elite' },
          orderBy: { eliteNumber: 'desc' }
        })
        updateData.eliteNumber = (lastElite?.eliteNumber || 0) + 1
      } else if (memberType === 'fundador' && founderNumber === undefined) {
        const lastFounder = await db.bee.findFirst({
          where: { memberType: 'fundador' },
          orderBy: { founderNumber: 'desc' }
        })
        updateData.founderNumber = (lastFounder?.founderNumber || 0) + 1
      }
      
      // Limpiar números si cambia a formal
      if (memberType === 'formal') {
        updateData.eliteNumber = null
        updateData.founderNumber = null
      }
    }
    
    if (eliteNumber !== undefined) {
      updateData.eliteNumber = eliteNumber
    }
    
    if (founderNumber !== undefined) {
      updateData.founderNumber = founderNumber
    }

    // Actualizar número de afiliación
    const bee = await db.bee.findUnique({
      where: { id: beeId }
    })
    
    if (bee && memberType) {
      const cedulaClean = bee.cedula.replace(/[^0-9]/g, '').padStart(8, '0').slice(-8)
      let newAffiliation = ''
      
      switch (memberType) {
        case 'presidente':
          newAffiliation = `001-000-${cedulaClean}`
          break
        case 'elite':
          const eNum = (updateData.eliteNumber || bee.eliteNumber || 1).toString().padStart(3, '0')
          newAffiliation = `${eNum}-000-${cedulaClean}`
          break
        case 'fundador':
          const fNum = (updateData.founderNumber || bee.founderNumber || 1).toString().padStart(3, '0')
          newAffiliation = `000-${fNum}-${cedulaClean}`
          break
        default:
          newAffiliation = `000-000-${cedulaClean}`
      }
      
      updateData.affiliationNumber = newAffiliation
    }

    const updatedBee = await db.bee.update({
      where: { id: beeId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedBee
    })

  } catch (error) {
    console.error('Error actualizando abeja:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Eliminar abeja (solo admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const beeId = searchParams.get('beeId')

    if (!beeId) {
      return NextResponse.json(
        { error: 'beeId es requerido' },
        { status: 400 }
      )
    }

    // Obtener la abeja para conseguir el userId
    const bee = await db.bee.findUnique({
      where: { id: beeId },
      include: { user: true }
    })

    if (!bee) {
      return NextResponse.json(
        { error: 'Abeja no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar en orden (primero las relaciones)
    await db.giftAction.deleteMany({
      where: { 
        OR: [
          { giverBeeId: beeId },
          { receiverBeeId: beeId }
        ]
      }
    })
    
    await db.raffleTicket.deleteMany({ where: { beeId } })
    await db.raffleWinner.deleteMany({ where: { beeId } })
    await db.payment.deleteMany({ where: { beeId } })
    await db.action.deleteMany({ where: { beeId } })
    await db.bankAccount.deleteMany({ where: { beeId } })
    
    // Eliminar la abeja
    await db.bee.delete({ where: { id: beeId } })
    
    // Eliminar el usuario
    await db.user.delete({ where: { id: bee.userId } })

    return NextResponse.json({
      success: true,
      message: 'Socio eliminado correctamente'
    })

  } catch (error) {
    console.error('Error eliminando abeja:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
