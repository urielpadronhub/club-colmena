import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'

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
  const { count } = await supabase!
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

    // Crear el usuario
    const { data: user, error: userError } = await supabase
      .from('User')
      .insert({
        name,
        email,
        password: simpleHash(password),
        role: 'bee'
      })
      .select()
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Error al crear usuario: ' + (userError?.message || 'Error desconocido') },
        { status: 500 }
      )
    }

    // Generar número de afiliación
    const affiliationNumber = await generateAffiliationNumber()

    // Crear la abeja
    const { data: bee, error: beeError } = await supabase
      .from('Bee')
      .insert({
        userId: user.id,
        cedula,
        phone,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        affiliationNumber,
        memberType: 'formal',
        referredByCode: giftCode || null,
        activationPaid: false,
        isActive: false
      })
      .select()
      .single()

    if (beeError || !bee) {
      // Si falla, eliminar el usuario creado
      await supabase.from('User').delete().eq('id', user.id)
      return NextResponse.json(
        { error: 'Error al crear perfil de abeja: ' + (beeError?.message || 'Error desconocido') },
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
          giverBeeId: bee.id,
          giftCode: code,
          status: 'available'
        })
      giftCodes.push(code)
    }

    // Crear el pago de activación pendiente
    await supabase
      .from('Payment')
      .insert({
        beeId: bee.id,
        type: 'activation',
        amount: 2.0,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso',
      data: {
        userId: user.id,
        beeId: bee.id,
        affiliationNumber: bee.affiliationNumber,
        memberType: bee.memberType,
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
