import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'
import { randomUUID } from 'crypto'

function simpleHash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

// Generar código de regalo único (MIEL)
async function generateGiftCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'MIEL-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Generar número de afiliación
async function generateAffiliationNumber(
  cedula: string, 
  options?: { 
    eliteNumber?: number
    founderNumber?: number
    memberType?: string 
  }
): Promise<string> {
  const cleanCedula = cedula.replace(/^[VE]-?/i, '').replace(/[-\s]/g, '').padStart(8, '0')
  
  // Si es Elite
  if (options?.memberType === 'elite' && options.eliteNumber) {
    const eliteNum = options.eliteNumber.toString().padStart(3, '0')
    return `${eliteNum}-000-${cleanCedula}`
  }
  
  // Si es Fundador
  if (options?.memberType === 'fundador' && options.eliteNumber !== undefined && options.founderNumber) {
    const eliteNum = options.eliteNumber.toString().padStart(3, '0')
    const founderNum = options.founderNumber.toString().padStart(3, '0')
    return `${eliteNum}-${founderNum}-${cleanCedula}`
  }
  
  // Si viene por invitación de Fundador (MIEL con ADN)
  if (options?.eliteNumber !== undefined && options?.founderNumber) {
    const eliteNum = options.eliteNumber.toString().padStart(3, '0')
    const founderNum = options.founderNumber.toString().padStart(3, '0')
    return `${eliteNum}-${founderNum}-${cleanCedula}`
  }
  
  // Formal sin invitación
  return `000-000-${cleanCedula}`
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
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
      giftCode,
      specialCode // Nuevo: código Elite o Fundador
    } = body

    // Validaciones básicas
    if (!name || !email || !password || !cedula || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
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
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }

    // Verificar si la cédula ya existe
    const { data: existingBee } = await supabase
      .from('Bee')
      .select('id')
      .eq('cedula', cedula)
      .single()

    if (existingBee) {
      return NextResponse.json({ error: 'La cédula ya está registrada' }, { status: 400 })
    }

    // Variables para el tipo de socio
    let memberType = 'formal'
    let eliteNumber = null
    let founderNumber = null
    let actionsToCreate = 3 // Por defecto 3 acciones de regalo
    let giftCodesToCreate = 50 // Fundadores reciben 50 códigos MIEL

    // ============================================
    // VERIFICAR CÓDIGO ESPECIAL (Elite o Fundador)
    // ============================================
    
    if (specialCode) {
      const upperCode = specialCode.toUpperCase()
      
      // Verificar si es código ELITE
      if (upperCode.startsWith('ELITE-')) {
        const { data: eliteCode, error } = await supabase
          .from('EliteCode')
          .select('*')
          .eq('code', upperCode)
          .eq('status', 'available')
          .single()
        
        if (eliteCode && !error) {
          memberType = 'elite'
          eliteNumber = eliteCode.elite_number
          actionsToCreate = 1 // Elite recibe 1 acción Elite
          giftCodesToCreate = 0 // Elite no tiene códigos MIEL, sus fundadores sí
          
          // Marcar código como usado
          await supabase
            .from('EliteCode')
            .update({ 
              status: 'assigned', 
              assigned_to_name: name,
              assigned_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', eliteCode.id)
        } else {
          return NextResponse.json({ error: 'Código Elite no válido o ya utilizado' }, { status: 400 })
        }
      }
      
      // Verificar si es código FUNDADOR
      else if (upperCode.startsWith('FUND-')) {
        const { data: founderCode, error } = await supabase
          .from('FounderCode')
          .select('*')
          .eq('code', upperCode)
          .eq('status', 'available')
          .single()
        
        if (founderCode && !error) {
          memberType = 'fundador'
          eliteNumber = founderCode.elite_number
          founderNumber = founderCode.founder_number
          actionsToCreate = 50 // Fundador recibe 50 acciones
          giftCodesToCreate = 50 // Fundador recibe 50 códigos MIEL para invitar
          
          // Marcar código como usado
          await supabase
            .from('FounderCode')
            .update({ 
              status: 'assigned', 
              assigned_to_name: name,
              assigned_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', founderCode.id)
        } else {
          return NextResponse.json({ error: 'Código Fundador no válido o ya utilizado' }, { status: 400 })
        }
      }
      
      else {
        return NextResponse.json({ error: 'Formato de código especial no válido' }, { status: 400 })
      }
    }
    
    // ============================================
    // VERIFICAR CÓDIGO MIEL (Invitación de Fundador)
    // ============================================
    
    let referralData = undefined
    if (giftCode && !specialCode) {
      // Buscar el GiftAction para obtener el ADN del invitador
      const { data: giftAction } = await supabase
        .from('GiftAction')
        .select(`
          id,
          giverBeeId,
          Bee (
            id,
            memberType,
            eliteNumber,
            founderNumber
          )
        `)
        .eq('giftCode', giftCode.toUpperCase())
        .eq('status', 'available')
        .single()
      
      if (giftAction && giftAction.Bee) {
        const giverBee = Array.isArray(giftAction.Bee) ? giftAction.Bee[0] : giftAction.Bee
        if (giverBee.eliteNumber !== undefined && giverBee.founderNumber) {
          referralData = {
            eliteNumber: giverBee.eliteNumber,
            founderNumber: giverBee.founderNumber
          }
          
          // Marcar código como usado
          await supabase
            .from('GiftAction')
            .update({ 
              status: 'used', 
              usedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            .eq('id', giftAction.id)
        }
      }
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
      return NextResponse.json({ error: 'Error al crear usuario: ' + userError.message }, { status: 500 })
    }

    // Generar número de afiliación
    const affiliationNumber = await generateAffiliationNumber(cedula, {
      eliteNumber: referralData?.eliteNumber ?? eliteNumber ?? undefined,
      founderNumber: referralData?.founderNumber ?? founderNumber ?? undefined,
      memberType
    })

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
        memberType,
        eliteNumber,
        founderNumber,
        referredByCode: giftCode || specialCode || null,
        activationPaid: memberType !== 'formal', // Elites y Fundadores ya están activos
        isActive: memberType !== 'formal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

    if (beeError) {
      await supabase.from('User').delete().eq('id', userId)
      return NextResponse.json({ error: 'Error al crear perfil: ' + beeError.message }, { status: 500 })
    }

    // ============================================
    // CREAR ACCIONES
    // ============================================
    
    const createdActions = []
    
    if (memberType === 'elite') {
      // Elite recibe 1 acción Elite
      await supabase
        .from('Action')
        .insert({
          id: randomUUID(),
          beeId: beeId,
          type: 'elite',
          description: `Acción Elite #${eliteNumber}`,
          quantity: 1,
          createdAt: new Date().toISOString()
        })
      createdActions.push({ type: 'elite', quantity: 1 })
    } 
    else if (memberType === 'fundador') {
      // Fundador recibe 50 acciones
      await supabase
        .from('Action')
        .insert({
          id: randomUUID(),
          beeId: beeId,
          type: 'fundador',
          description: `50 Acciones de Fundador - ADN: ${affiliationNumber.split('-').slice(0, 2).join('-')}`,
          quantity: 50,
          createdAt: new Date().toISOString()
        })
      createdActions.push({ type: 'fundador', quantity: 50 })
    }
    else {
      // Formal recibe 1 acción por activación
      await supabase
        .from('Action')
        .insert({
          id: randomUUID(),
          beeId: beeId,
          type: 'activation',
          description: 'Acción por activación inicial',
          quantity: 1,
          createdAt: new Date().toISOString()
        })
      createdActions.push({ type: 'activation', quantity: 1 })
    }

    // ============================================
    // CREAR CÓDIGOS DE REGALO (MIEL)
    // ============================================
    
    const giftCodes = []
    
    // Fundadores reciben 50 códigos MIEL con su ADN
    // Formales reciben 3 códigos MIEL normales
    const numGiftCodes = memberType === 'fundador' ? 50 : (memberType === 'formal' ? 3 : 0)
    
    for (let i = 0; i < numGiftCodes; i++) {
      const code = await generateGiftCode()
      
      await supabase
        .from('GiftAction')
        .insert({
          id: randomUUID(),
          giverBeeId: beeId,
          giftCode: code,
          status: 'available',
          eliteNumber: eliteNumber,
          founderNumber: founderNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      giftCodes.push(code)
    }

    return NextResponse.json({
      success: true,
      message: `Registro exitoso como ${memberType.toUpperCase()}`,
      data: {
        userId: userId,
        beeId: beeId,
        affiliationNumber: affiliationNumber,
        memberType: memberType,
        eliteNumber: eliteNumber,
        founderNumber: founderNumber,
        actions: createdActions,
        giftCodes: giftCodes.length > 0 ? giftCodes.slice(0, 5) : [], // Solo mostrar primeros 5
        totalGiftCodes: giftCodes.length,
        requiresActivation: memberType === 'formal'
      }
    })

  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
