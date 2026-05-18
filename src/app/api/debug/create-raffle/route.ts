import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secretKey, name, description, type, prizeAmount, prizeDescription, numberOfWinners, scheduledDate } = body

    if (secretKey !== 'Colmena2025!') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!name || !type || !prizeAmount || !scheduledDate) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Crear el sorteo usando Prisma
    const raffle = await db.raffle.create({
      data: {
        name: name,
        description: description || 'Sorteo de prueba',
        type: type,
        prizeAmount: parseFloat(prizeAmount),
        prizeDescription: prizeDescription || 'Premio de prueba',
        numberOfWinners: numberOfWinners || 1,
        scheduledDate: new Date(scheduledDate),
        status: 'scheduled'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Sorteo creado exitosamente',
      raffle: raffle
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno', details: String(error) }, { status: 500 })
  }
}
