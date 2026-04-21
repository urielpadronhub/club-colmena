import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Obtener avances del proyecto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { id } = await params

    const { data: progress, error } = await supabase
      .from('projectprogress')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Error consultando avances', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      progress: progress || []
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Agregar avance al proyecto
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
      title,
      description,
      progress_type,
      percentage_before,
      percentage_after,
      amount_spent,
      notes,
      created_by
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Título es requerido' }, { status: 400 })
    }

    const { randomUUID } = await import('crypto')
    const progressId = randomUUID()

    // Crear el avance
    const { data: progress, error } = await supabase
      .from('projectprogress')
      .insert({
        id: progressId,
        project_id: id,
        title,
        description,
        progress_type: progress_type || 'milestone',
        percentage_before,
        percentage_after,
        amount_spent,
        notes,
        created_by,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando avance', details: error }, { status: 500 })
    }

    // Actualizar el porcentaje del proyecto
    if (percentage_after !== undefined) {
      await supabase
        .from('project')
        .update({
          progress_percentage: percentage_after,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    }

    // Actualizar monto gastado
    if (amount_spent) {
      const { data: project } = await supabase
        .from('project')
        .select('budget_spent')
        .eq('id', id)
        .single()

      if (project) {
        await supabase
          .from('project')
          .update({
            budget_spent: (project.budget_spent || 0) + amount_spent,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Avance agregado exitosamente',
      progress
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
