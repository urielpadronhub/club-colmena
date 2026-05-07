import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Obtener y crear cuentas bancarias
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

    const bankAccount = await db.bankAccount.findUnique({
      where: { beeId }
    })

    return NextResponse.json({
      success: true,
      data: bankAccount
    })

  } catch (error) {
    console.error('Error obteniendo cuenta bancaria:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { beeId, bankName, accountType, accountNumber, cedula, phone } = body

    if (!beeId || !bankName || !accountType || !accountNumber || !cedula || !phone) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una cuenta
    const existing = await db.bankAccount.findUnique({
      where: { beeId }
    })

    let bankAccount

    if (existing) {
      // Actualizar
      bankAccount = await db.bankAccount.update({
        where: { beeId },
        data: {
          bankName,
          accountType,
          accountNumber,
          cedula,
          phone
        }
      })
    } else {
      // Crear
      bankAccount = await db.bankAccount.create({
        data: {
          beeId,
          bankName,
          accountType,
          accountNumber,
          cedula,
          phone
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Cuenta bancaria guardada exitosamente',
      data: bankAccount
    })

  } catch (error) {
    console.error('Error guardando cuenta bancaria:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
