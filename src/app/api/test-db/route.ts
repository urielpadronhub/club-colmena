import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase no configurado. Verifica las variables de entorno.'
      })
    }

    // Probar conexión a la base de datos con Supabase
    const { data, error } = await supabase
      .from('User')
      .select('id, email, name, role')

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Conexión a base de datos exitosa con Supabase',
      usersCount: data?.length || 0,
      users: data
    })
  } catch (error) {
    console.error('Error de conexión:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
