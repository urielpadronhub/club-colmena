import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener pagos pendientes de aprobación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const type = searchParams.get('type') || 'activation'

    const payments = await db.payment.findMany({
      where: {
        status,
        type
      },
      include: {
        bee: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: payments
    })
  } catch (error) {
    console.error('Error obteniendo pagos:', error)
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    )
  }
}

// PUT - Aprobar o rechazar un pago
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, action, rejectionReason, reviewedBy } = body

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: 'Se requiere paymentId y action (approve/reject)' },
        { status: 400 }
      )
    }

    // Obtener el pago
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        bee: {
          include: {
            user: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Este pago ya fue procesado' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // APROBAR EL PAGO
      
      // 1. Actualizar el pago
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'approved',
          reviewedBy,
          reviewedAt: new Date(),
          paidAt: new Date()
        }
      })

      // 2. Activar la abeja
      await db.bee.update({
        where: { id: payment.beeId },
        data: {
          isActive: true,
          activationPaid: true,
          activationDate: new Date()
        }
      })

      // 3. Crear la acción inicial por activación
      await db.action.create({
        data: {
          beeId: payment.beeId,
          type: 'activation',
          description: 'Acción por activación - $2 USD',
          quantity: 1,
          referenceId: paymentId
        }
      })

      // 4. Generar los 3 códigos de regalo
      const giftCodes = []
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      
      for (let i = 0; i < 3; i++) {
        let code = 'MIEL-'
        for (let j = 0; j < 8; j++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        
        // Verificar que no exista
        const exists = await db.giftAction.findUnique({
          where: { giftCode: code }
        })
        
        if (!exists) {
          await db.giftAction.create({
            data: {
              giverBeeId: payment.beeId,
              giftCode: code,
              status: 'available'
            }
          })
          giftCodes.push(code)
        } else {
          i-- // Reintentar
        }
      }

      // 5. Si vino referido, dar bonificación al que refirió y marcar código como activado
      if (payment.bee.referredByCode) {
        const giftAction = await db.giftAction.findUnique({
          where: { giftCode: payment.bee.referredByCode }
        })
        
        if (giftAction && payment.bee.referredByBeeId) {
          // Marcar el código como activado
          await db.giftAction.update({
            where: { giftCode: payment.bee.referredByCode },
            data: {
              status: 'activated',
              activatedAt: new Date()
            }
          })
          
          // Dar bonificación al que refirió
          await db.action.create({
            data: {
              beeId: payment.bee.referredByBeeId,
              type: 'bonus_referral',
              description: `Bonificación por referido activado: ${payment.bee.user.name}`,
              quantity: 1,
              referenceId: payment.bee.id
            }
          })
        }
      }

      // 6. Crear las 12 cuotas mensuales pendientes
      const now = new Date()
      for (let i = 1; i <= 12; i++) {
        const dueDate = new Date(now)
        dueDate.setMonth(dueDate.getMonth() + i)
        
        await db.payment.create({
          data: {
            beeId: payment.beeId,
            type: 'monthly',
            amount: 2.0,
            status: 'pending',
            periodMonth: dueDate.getMonth() + 1,
            periodYear: dueDate.getFullYear(),
            dueDate
          }
        })
      }

      // 7. Registrar actividad
      await db.activityLog.create({
        data: {
          userId: reviewedBy,
          action: 'PAYMENT_APPROVED',
          details: JSON.stringify({
            paymentId,
            beeId: payment.beeId,
            affiliationNumber: payment.bee.affiliationNumber,
            giftCodes
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: '¡Pago aprobado! La abeja ha sido activada.',
        data: {
          payment: updatedPayment,
          giftCodes,
          affiliationNumber: payment.bee.affiliationNumber
        }
      })

    } else if (action === 'reject') {
      // RECHAZAR EL PAGO
      
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'rejected',
          reviewedBy,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || 'Sin razón especificada'
        }
      })

      // Si tenía código de referido, liberarlo
      if (payment.bee.referredByCode) {
        await db.giftAction.update({
          where: { giftCode: payment.bee.referredByCode },
          data: {
            status: 'available',
            receiverBeeId: null
          }
        })
      }

      // Registrar actividad
      await db.activityLog.create({
        data: {
          userId: reviewedBy,
          action: 'PAYMENT_REJECTED',
          details: JSON.stringify({
            paymentId,
            beeId: payment.beeId,
            reason: rejectionReason
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Pago rechazado.',
        data: { payment: updatedPayment }
      })

    } else {
      return NextResponse.json(
        { error: 'Acción no válida. Use approve o reject' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error procesando pago:', error)
    return NextResponse.json(
      { error: 'Error al procesar pago' },
      { status: 500 }
    )
  }
}
