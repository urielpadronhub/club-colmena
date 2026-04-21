import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener datos bancarios de la organización para pagos
export async function GET() {
  try {
    const bankAccount = await db.organizationBankAccount.findFirst({
      where: { isActive: true }
    })

    if (!bankAccount) {
      return NextResponse.json(
        { error: 'No hay cuenta bancaria configurada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        accountHolder: bankAccount.accountHolder,
        bankName: bankAccount.bankName,
        phone: bankAccount.phone,
        rif: bankAccount.rif,
        accountType: bankAccount.accountType
      }
    })
  } catch (error) {
    console.error('Error obteniendo cuenta bancaria:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos bancarios' },
      { status: 500 }
    )
  }
}
