import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'
import { randomUUID } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

// Generar código de regalo único
async function generateGiftCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'MIEL-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generar número de afiliación único
async function generateAffiliationNumber(): Promise<string> {
  if (!supabase) return `000-000-${Date.now().toString().slice(-8)}`
  
  const { count } = await supabase
    .from('Bee')
    .select('*', { count: 'exact', head: true })
  
  const num = ((count || 0) + 1).toString().padStart(3, '0')
  return `${num}-000-${Date.now().toString().slice(-8)}`
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
    const { 
      name, 
      email, 
      password, 
      cedula, 
      phone, 
      address, 
      birthDate,
      giftCode
    } = body

    // Validaciones básicas
    if (!name || !email || !password || !cedula || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombre, email, contraseña, cédula y teléfono son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar si la cédula ya existe
    const { data: existingBee } = await supabase
      .from('Bee')
      .select('id')
      .eq('cedula', cedula)
      .single()

    if (existingBee) {
      return NextResponse.json(
        { error: 'La cédula ya está registrada' },
        { status: 400 }
      )
    }

    // Generar IDs
    const userId = randomUUID()
    const beeId = randomUUID()

    // Crear el usuario
    const { error: userError } = await supabase
      .from('User')
      .insert({
        id: userId,
        name,
        email,
        password: simpleHash(password),
        role: 'bee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

    if (userError) {
      return NextResponse.json(
        { error: 'Error al crear usuario: ' + userError.message },
        { status: 500 }
      )
    }

    // Generar número de afiliación
    const affiliationNumber = await generateAffiliationNumber()

    // Crear la abeja
    const { error: beeError } = await supabase
      .from('Bee')
      .insert({
        id: beeId,
        userId: userId,
        cedula,
        phone,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        affiliationNumber,
        memberType: 'formal',
        referredByCode: giftCode || null,
        activationPaid: false,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

    if (beeError) {
      // Si falla, eliminar el usuario creado
      await supabase.from('User').delete().eq('id', userId)
      return NextResponse.json(
        { error: 'Error al crear perfil de abeja: ' + beeError.message },
        { status: 500 }
      )
    }

    // Crear los 3 códigos de regalo para el nuevo socio
    const giftCodes = []
    for (let i = 0; i < 3; i++) {
      const code = await generateGiftCode()
      await supabase
        .from('GiftAction')
        .insert({
          id: randomUUID(),
          giverBeeId: beeId,
          giftCode: code,
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      giftCodes.push(code)
    }

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso',
      data: {
        userId: userId,
        beeId: beeId,
        affiliationNumber: affiliationNumber,
        memberType: 'formal',
        giftCodes,
        requiresActivation: true
      }
    })

  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
