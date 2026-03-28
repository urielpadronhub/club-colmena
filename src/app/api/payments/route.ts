import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Registrar un pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { beeId, type, paymentReference, periodMonth, periodYear } = body

    if (!beeId || !type) {
      return NextResponse.json(
        { error: 'beeId y type son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la abeja existe
    const bee = await db.bee.findUnique({
      where: { id: beeId }
    })

    if (!bee) {
      return NextResponse.json(
        { error: 'Abeja no encontrada' },
        { status: 404 }
      )
    }

    // Procesar según el tipo de pago
    if (type === 'activation') {
      // Buscar pago de activación pendiente
      const pendingPayment = await db.payment.findFirst({
        where: {
          beeId,
          type: 'activation',
          status: 'pending'
        }
      })

      if (!pendingPayment) {
        return NextResponse.json(
          { error: 'No hay pago de activación pendiente' },
          { status: 400 }
        )
      }

      // Actualizar el pago
      await db.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'completed',
          paymentReference,
          paidAt: new Date()
        }
      })

      // Activar la abeja
      await db.bee.update({
        where: { id: beeId },
        data: {
          isActive: true,
          activationPaid: true,
          activationDate: new Date()
        }
      })

      // Crear acción por activación
      await db.action.create({
        data: {
          beeId,
          type: 'activation',
          description: 'Acción por activación inicial',
          quantity: 1,
          referenceId: pendingPayment.id
        }
      })

      // Crear pagos mensuales pendientes para los 12 meses
      const now = new Date()
      for (let month = 1; month <= 12; month++) {
        const dueDate = new Date(now)
        dueDate.setMonth(dueDate.getMonth() + month)
        
        await db.payment.create({
          data: {
            beeId,
            type: 'monthly',
            amount: 2.0,
            status: 'pending',
            periodMonth: dueDate.getMonth() + 1,
            periodYear: dueDate.getFullYear(),
            dueDate
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Activación completada exitosamente',
        data: {
          activated: true,
          monthlyPaymentsCreated: 12
        }
      })

    } else if (type === 'monthly') {
      // Pago mensual
      if (!periodMonth || !periodYear) {
        return NextResponse.json(
          { error: 'periodMonth y periodYear son requeridos para pagos mensuales' },
          { status: 400 }
        )
      }

      const pendingPayment = await db.payment.findFirst({
        where: {
          beeId,
          type: 'monthly',
          status: 'pending',
          periodMonth,
          periodYear
        }
      })

      if (!pendingPayment) {
        return NextResponse.json(
          { error: 'No hay pago mensual pendiente para este período' },
          { status: 400 }
        )
      }

      // Actualizar el pago
      await db.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'completed',
          paymentReference,
          paidAt: new Date()
        }
      })

      // Crear acción por pago mensual
      await db.action.create({
        data: {
          beeId,
          type: 'monthly',
          description: `Acción por cuota mensual - Mes ${periodMonth}/${periodYear}`,
          quantity: 1,
          referenceId: pendingPayment.id
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Pago mensual registrado exitosamente',
        data: {
          month: periodMonth,
          year: periodYear
        }
      })
    }

    return NextResponse.json(
      { error: 'Tipo de pago no válido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error procesando pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Obtener pagos pendientes y historial
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const beeId = searchParams.get('beeId')

    if (!beeId) {
      return NextResponse.json(
        { error: 'beeId es requerido' },
        { status: 400 }
      )
    }

    const payments = await db.payment.findMany({
      where: { beeId },
      orderBy: { dueDate: 'asc' }
    })

    const pendingPayments = payments.filter(p => p.status === 'pending')
    const completedPayments = payments.filter(p => p.status === 'completed')

    return NextResponse.json({
      success: true,
      data: {
        all: payments,
        pending: pendingPayments,
        completed: completedPayments,
        totalPending: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
        totalPaid: completedPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    })

  } catch (error) {
    console.error('Error obteniendo pagos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
