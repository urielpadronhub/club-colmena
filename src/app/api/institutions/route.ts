import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Lista todas las instituciones
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let query = supabase
      .from('institution')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: institutions, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Error consultando instituciones', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      institutions: institutions || []
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nueva institución
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const body = await request.json()
    const {
      name,
      type,
      region,
      address,
      phone,
      email,
      contact_name,
      contact_phone,
      contact_email
    } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
    }

    const { randomUUID } = await import('crypto')
    const institutionId = randomUUID()

    const { data: institution, error } = await supabase
      .from('institution')
      .insert({
        id: institutionId,
        name,
        type,
        region,
        address,
        phone,
        email,
        contact_name,
        contact_phone,
        contact_email,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando institución', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Institución creada exitosamente',
      institution
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
