import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Eliminar una acción individual
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actionId = searchParams.get('actionId')

    if (!actionId) {
      return NextResponse.json(
        { error: 'actionId es requerido' },
        { status: 400 }
      )
    }

    // Eliminar la acción
    await db.action.delete({
      where: { id: actionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Acción eliminada correctamente'
    })

  } catch (error) {
    console.error('Error eliminando acción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
