import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const body = await request.json()
    const { beeId, quantity, type, secretKey } = body

    if (secretKey !== 'Colmena2025!') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!beeId || !quantity) {
      return NextResponse.json({ error: 'beeId y quantity son requeridos' }, { status: 400 })
    }

    const action = await supabase
      .from('Action')
      .insert({
        id: randomUUID(),
        beeId: beeId,
        type: type || 'bonus',
        description: `Acciones de prueba para sorteo`,
        quantity: parseInt(quantity),
        createdAt: new Date().toISOString()
      })
      .select()
      .single()

    if (action.error) {
      return NextResponse.json({ error: 'Error creando acción', details: action.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${quantity} acciones agregadas`,
      action: action.data
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
