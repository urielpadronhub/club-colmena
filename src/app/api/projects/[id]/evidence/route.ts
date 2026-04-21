import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Obtener evidencias del proyecto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get('public') === 'true'

    let query = supabase
      .from('ProjectEvidence')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (publicOnly) {
      query = query.eq('is_public', true)
    }

    const { data: evidence, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Error consultando evidencias', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      evidence: evidence || []
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Agregar evidencia al proyecto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      type,
      title,
      description,
      file_url,
      file_name,
      file_size,
      progress_id,
      is_public
    } = body

    if (!file_url || !type) {
      return NextResponse.json({ error: 'URL del archivo y tipo son requeridos' }, { status: 400 })
    }

    const { randomUUID } = await import('crypto')
    const evidenceId = randomUUID()

    const { data: evidence, error } = await supabase
      .from('ProjectEvidence')
      .insert({
        id: evidenceId,
        project_id: id,
        progress_id,
        type,
        title,
        description,
        file_url,
        file_name,
        file_size,
        is_public: is_public ?? true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando evidencia', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Evidencia agregada exitosamente',
      evidence
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
