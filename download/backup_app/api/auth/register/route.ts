import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

// Función simple para hash de contraseñas
function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

// Generar número de afiliación único
async function generateAffiliationNumber(): Promise<string> {
  const year = new Date().getFullYear()
  let number: string
  let exists = true
  
  while (exists) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    number = `ABEJA-${random}-${year}`
    
    const existing = await db.bee.findUnique({
      where: { affiliationNumber: number }
    })
    exists = !!existing
  }
  
  return number!
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      cedula, 
      phone, 
      address, 
      birthDate,
      giftCode,
      // Datos del comprobante de pago
      referenceNumber,
      payerName,
      paymentProofImage,
      bcvRate,
      amountVes
    } = body

    // Validaciones básicas
    if (!name || !email || !password || !cedula || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombre, email, contraseña, cédula y teléfono son requeridos' },
        { status: 400 }
      )
    }

    // Validar que venga el comprobante de pago
    if (!referenceNumber || !payerName || !paymentProofImage) {
      return NextResponse.json(
        { error: 'Debes adjuntar el comprobante de pago con número de referencia, nombre e imagen' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar si la cédula ya existe
    const existingBee = await db.bee.findUnique({
      where: { cedula }
    })

    if (existingBee) {
      return NextResponse.json(
        { error: 'La cédula ya está registrada' },
        { status: 400 }
      )
    }

    // Crear el usuario
    const user = await db.user.create({
      data: {
        name,
        email,
        password: simpleHash(password),
        role: 'bee'
      }
    })

    // Generar número de afiliación
    const affiliationNumber = await generateAffiliationNumber()

    // Variables para el referido
    let referredByBeeId: string | null = null

    // Si viene con código de regalo, verificarlo
    if (giftCode) {
      const giftAction = await db.giftAction.findUnique({
        where: { giftCode },
        include: { giverBee: true }
      })

      if (giftAction && giftAction.status === 'available') {
        referredByBeeId = giftAction.giverBeeId
      }
    }

    // Crear la abeja (PENDIENTE de activación - NO activa aún)
    const bee = await db.bee.create({
      data: {
        userId: user.id,
        cedula,
        phone,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        affiliationNumber,
        referredByCode: giftCode || null,
        referredByBeeId,
        activationPaid: false,
        isActive: false // IMPORTANTE: No está activo hasta que el admin apruebe el pago
      }
    })

    // Crear el pago de activación con el comprobante
    const payment = await db.payment.create({
      data: {
        beeId: bee.id,
        type: 'activation',
        amount: 2.0,
        status: 'pending', // Pendiente de aprobación por el admin
        referenceNumber,
        payerName,
        paymentProofImage, // Imagen en base64
        bcvRate: bcvRate ? parseFloat(bcvRate) : null,
        amountVes: amountVes ? parseFloat(amountVes) : null,
        dueDate: new Date() // Fecha actual como referencia
      }
    })

    // Si vino referido, marcar el código como usado (pero NO dar bonificación aún)
    // La bonificación se dará cuando el admin apruebe el pago
    if (giftCode && referredByBeeId) {
      await db.giftAction.update({
        where: { giftCode },
        data: {
          status: 'pending', // Pendiente hasta aprobación
          receiverBeeId: bee.id
        }
      })
    }

    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: JSON.stringify({
          affiliationNumber: bee.affiliationNumber,
          hasGiftCode: !!giftCode,
          paymentId: payment.id
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: '¡Registro exitoso! Tu pago está siendo verificado.',
      data: {
        userId: user.id,
        beeId: bee.id,
        affiliationNumber: bee.affiliationNumber,
        paymentId: payment.id,
        status: 'pending_activation',
        // IMPORTANTE: No se generan códigos de regalo hasta que el admin apruebe el pago
        giftCodes: []
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
