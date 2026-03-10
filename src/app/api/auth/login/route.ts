import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Base de datos no configurada' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario en Supabase
    const { data: user, error } = await supabase
      .from('User')
      .select(`
        id,
        email,
        password,
        name,
        role,
        Bee (
          id,
          cedula,
          phone,
          affiliationNumber,
          memberType,
          isActive,
          activationPaid,
          activationDate
        )
      `)
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    if (user.password !== simpleHash(password)) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Devolver datos del usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        bee: user.Bee && Array.isArray(user.Bee) && user.Bee.length > 0 ? user.Bee[0] : null
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
