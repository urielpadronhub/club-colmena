import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Obtener beneficiarios del proyecto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { id } = await params

    const { data: beneficiaries, error } = await supabase
      .from('ProjectBeneficiary')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Error consultando beneficiarios', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      beneficiaries: beneficiaries || []
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Agregar beneficiario al proyecto
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
      name,
      cedula,
      phone,
      email,
      role,
      bee_id,
      integrated_to_club,
      referral_code
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }

    const { randomUUID } = await import('crypto')
    const beneficiaryId = randomUUID()

    const { data: beneficiary, error } = await supabase
      .from('ProjectBeneficiary')
      .insert({
        id: beneficiaryId,
        project_id: id,
        name,
        cedula,
        phone,
        email,
        role,
        bee_id,
        integrated_to_club: integrated_to_club || false,
        integration_date: integrated_to_club ? new Date().toISOString().split('T')[0] : null,
        referral_code,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando beneficiario', details: error }, { status: 500 })
    }

    // Actualizar contador en el proyecto
    const { data: project } = await supabase
      .from('Project')
      .select('beneficiaries_count')
      .eq('id', id)
      .single()

    if (project) {
      await supabase
        .from('Project')
        .update({
          beneficiaries_count: (project.beneficiaries_count || 0) + 1,
          members_integrated: integrated_to_club 
            ? (project.beneficiaries_count || 0) + 1 
            : project.beneficiaries_count || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    }

    return NextResponse.json({
      success: true,
      message: 'Beneficiario agregado exitosamente',
      beneficiary
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
