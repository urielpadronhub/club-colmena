import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    // Verificar usuarios
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, email, name, role, createdAt')
      .order('createdAt', { ascending: false })
      .limit(10)

    if (usersError) {
      return NextResponse.json({ error: 'Error consultando usuarios', details: usersError }, { status: 500 })
    }

    // Verificar bees
    const { data: bees, error: beesError } = await supabase
      .from('Bee')
      .select('id, cedula, affiliationNumber, memberType, isActive')
      .limit(10)

    if (beesError) {
      return NextResponse.json({ error: 'Error consultando bees', details: beesError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      usersCount: users?.length || 0,
      beesCount: bees?.length || 0,
      users: users || [],
      bees: bees || []
    })

  } catch (error) {
    console.error('Error en debug:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
