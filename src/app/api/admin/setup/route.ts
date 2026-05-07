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
    const { email, password, name, secretKey } = body

    // Clave secreta para autorizar la creación (evitar acceso no autorizado)
    if (secretKey !== 'Colmena2025!') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password y name son requeridos' }, { status: 400 })
    }

    // Verificar si ya existe
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'El usuario ya existe', userId: existingUser.id }, { status: 400 })
    }

    // Crear usuario admin con UUID generado
    const hashedPassword = simpleHash(password)
    const { randomUUID } = await import('crypto')
    const userId = randomUUID()
    
    const { data: newUser, error } = await supabase
      .from('User')
      .insert({
        id: userId,
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('id, email, name, role')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Error creando usuario', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario admin creado exitosamente',
      user: newUser
    })

  } catch (error) {
    console.error('Error en setup:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Endpoint GET para verificar estado
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    const { data: users, error } = await supabase
      .from('User')
      .select('id, email, name, role')
      .limit(5)

    if (error) {
      return NextResponse.json({ error: 'Error consultando', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      usersCount: users?.length || 0,
      users: users || []
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
