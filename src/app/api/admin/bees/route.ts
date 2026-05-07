import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Obtener todas las abejas (admin)
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const memberType = searchParams.get('memberType')

    let query = supabase
      .from('Bee')
      .select(`
        id,
        cedula,
        phone,
        affiliationNumber,
        memberType,
        isActive,
        activationPaid,
        createdAt,
        User (name, email)
      `)
      .order('createdAt', { ascending: false })

    if (isActive !== null) {
      query = query.eq('isActive', isActive === 'true')
    }
    if (memberType) {
      query = query.eq('memberType', memberType)
    }

    const { data: bees, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transformar datos para el frontend
    const transformedBees = bees?.map(bee => ({
      id: bee.id,
      cedula: bee.cedula,
      phone: bee.phone,
      affiliationNumber: bee.affiliationNumber,
      memberType: bee.memberType,
      isActive: bee.isActive,
      activationPaid: bee.activationPaid,
      createdAt: bee.createdAt,
      user: Array.isArray(bee.User) ? bee.User[0] : bee.User,
      _count: { actions: 0, payments: 0, raffleWins: 0 }
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedBees
    })

  } catch (error) {
    console.error('Error obteniendo abejas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Actualizar abeja (estado, tipo de miembro, etc.)
export async function PUT(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const { beeId, isActive, memberType, eliteNumber, founderNumber, activationPaid } = body

    if (!beeId) {
      return NextResponse.json({ error: 'beeId es requerido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    
    if (isActive !== undefined) updateData.isActive = isActive
    if (activationPaid !== undefined) {
      updateData.activationPaid = activationPaid
      if (activationPaid) updateData.activationDate = new Date().toISOString()
    }
    if (memberType) {
      updateData.memberType = memberType
      if (memberType === 'formal') {
        updateData.eliteNumber = null
        updateData.founderNumber = null
      }
    }
    if (eliteNumber !== undefined) updateData.eliteNumber = eliteNumber
    if (founderNumber !== undefined) updateData.founderNumber = founderNumber

    updateData.updatedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('Bee')
      .update(updateData)
      .eq('id', beeId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error actualizando abeja:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Eliminar abeja (solo admin)
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const beeId = searchParams.get('beeId')

    if (!beeId) {
      return NextResponse.json({ error: 'beeId es requerido' }, { status: 400 })
    }

    // Obtener la abeja
    const { data: bee } = await supabase
      .from('Bee')
      .select('userId')
      .eq('id', beeId)
      .single()

    if (!bee) {
      return NextResponse.json({ error: 'Abeja no encontrada' }, { status: 404 })
    }

    // Eliminar relaciones
    await supabase.from('GiftAction').delete().eq('giverBeeId', beeId)
    await supabase.from('Payment').delete().eq('beeId', beeId)
    await supabase.from('Action').delete().eq('beeId', beeId)
    await supabase.from('BankAccount').delete().eq('beeId', beeId)
    
    // Eliminar la abeja
    await supabase.from('Bee').delete().eq('id', beeId)
    
    // Eliminar el usuario
    await supabase.from('User').delete().eq('id', bee.userId)

    return NextResponse.json({ success: true, message: 'Socio eliminado correctamente' })

  } catch (error) {
    console.error('Error eliminando abeja:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
