import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Lista todos los proyectos
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const institution_id = searchParams.get('institution_id')
    const publicOnly = searchParams.get('public') === 'true'

    let query = supabase
      .from('project')
      .select(`
        *,
        institution (
          id,
          name,
          type,
          region
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (institution_id) {
      query = query.eq('institution_id', institution_id)
    }

    const { data: projects, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Error consultando proyectos', details: error }, { status: 500 })
    }

    // Si es público, filtrar información sensible
    if (publicOnly) {
      const publicProjects = projects?.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        location_region: p.location_region,
        status: p.status,
        progress_percentage: p.progress_percentage,
        beneficiaries_count: p.beneficiaries_count,
        institution: p.institution?.name,
        date_start: p.date_start,
        date_end_planned: p.date_end_planned
      }))

      return NextResponse.json({
        success: true,
        projects: publicProjects || []
      })
    }

    return NextResponse.json({
      success: true,
      projects: projects || []
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const body = await request.json()
    const {
      institution_id,
      title,
      description,
      category,
      location_address,
      location_region,
      location_coords,
      budget_approved,
      currency,
      date_approved,
      date_start,
      date_end_planned
    } = body

    if (!title || !institution_id) {
      return NextResponse.json({ error: 'Título e institución son requeridos' }, { status: 400 })
    }

    const { randomUUID } = await import('crypto')
    const projectId = randomUUID()

    const { data: project, error } = await supabase
      .from('project')
      .insert({
        id: projectId,
        institution_id,
        title,
        description,
        category,
        location_address,
        location_region,
        location_coords,
        budget_approved: budget_approved || 0,
        budget_spent: 0,
        currency: currency || 'USD',
        date_approved,
        date_start,
        date_end_planned,
        status: 'planning',
        progress_percentage: 0,
        beneficiaries_count: 0,
        members_integrated: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando proyecto', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Proyecto creado exitosamente',
      project
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
