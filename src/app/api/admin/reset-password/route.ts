import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const body = await request.json()
    const { email, newPassword, secretKey } = body

    // Clave secreta para autorizar (evitar acceso no autorizado)
    if (secretKey !== 'Colmena2025!') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email y newPassword son requeridos' }, { status: 400 })
    }

    const hashedPassword = simpleHash(newPassword)

    const { data: user, error } = await supabase
      .from('user')
      .update({
        password: hashedPassword,
        updatedat: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, email, name, role')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error actualizando contraseña', details: error }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      user
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
