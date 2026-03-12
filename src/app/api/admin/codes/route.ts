import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: Obtener estado de códigos
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    // Obtener códigos Elite
    const { data: eliteCodes, error: eliteError } = await supabase
      .from('EliteCode')
      .select('*')
      .order('elite_number', { ascending: true })

    if (eliteError) {
      console.error('Error fetching EliteCode:', eliteError)
    }

    // Obtener códigos Fundador
    const { data: founderCodes, error: founderError } = await supabase
      .from('FounderCode')
      .select('*')
      .order('elite_number', { ascending: true })
      .order('founder_number', { ascending: true })

    if (founderError) {
      console.error('Error fetching FounderCode:', founderError)
    }

    // Calcular estadísticas
    const eliteStats = {
      total: eliteCodes?.length || 0,
      available: eliteCodes?.filter(c => c.status === 'available').length || 0,
      assigned: eliteCodes?.filter(c => c.status === 'assigned').length || 0
    }

    const founderStats = {
      total: founderCodes?.length || 0,
      available: founderCodes?.filter(c => c.status === 'available').length || 0,
      assigned: founderCodes?.filter(c => c.status === 'assigned').length || 0,
      byElite: {
        becas: founderCodes?.filter(c => c.elite_number === 0).length || 0,
        becasAvailable: founderCodes?.filter(c => c.elite_number === 0 && c.status === 'available').length || 0,
        comerciales: founderCodes?.filter(c => c.elite_number > 0).length || 0,
        comercialesAvailable: founderCodes?.filter(c => c.elite_number > 0 && c.status === 'available').length || 0
      }
    }

    return NextResponse.json({
      success: true,
      elite: {
        stats: eliteStats,
        codes: eliteCodes || []
      },
      founder: {
        stats: founderStats,
        codes: founderCodes || []
      }
    })

  } catch (error) {
    console.error('Error en codes API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Inicializar o asignar códigos
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const { action, code, assignTo, adminKey, eliteNumber, count } = body

    // Verificar permiso de admin
    if (adminKey !== 'COLMENA2025') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Acción: Inicializar códigos Elite
    if (action === 'init-elite') {
      const eliteCodes = []
      for (let i = 1; i <= 100; i++) {
        const eliteNum = i.toString().padStart(3, '0')
        eliteCodes.push({
          id: `elite-${eliteNum}`,
          code: `ELITE-${eliteNum}`,
          elite_number: i,
          status: 'available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      let insertedCount = 0
      let errors = []

      for (const codeData of eliteCodes) {
        const { error } = await supabase
          .from('EliteCode')
          .upsert(codeData, { onConflict: 'code' })

        if (!error) {
          insertedCount++
        } else {
          if (errors.length < 5) errors.push(error.message)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Códigos Elite inicializados: ${insertedCount}/100`,
        errors: errors.length > 0 ? errors : undefined
      })
    }

    // Acción: Inicializar códigos Fundador
    if (action === 'init-founder') {
      const founderCodes = []

      // Fundadores de BECAS (Elite 000): 200 fundadores
      for (let f = 1; f <= 200; f++) {
        const founderNum = f.toString().padStart(3, '0')
        founderCodes.push({
          id: `founder-000-${founderNum}`,
          code: `FUND-000-${founderNum}`,
          elite_number: 0,
          founder_number: f,
          adn_prefix: `000-${founderNum}`,
          status: 'available',
          actions_granted: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      // Fundadores COMERCIALES: Cada Elite tiene hasta 10 fundadores
      let founderCounter = 201
      for (let elite = 1; elite <= 100; elite++) {
        const eliteNum = elite.toString().padStart(3, '0')
        // Asignar 3 fundadores iniciales por Elite (pueden crecer hasta 10)
        for (let j = 0; j < 3; j++) {
          const founderNum = founderCounter.toString().padStart(3, '0')
          founderCodes.push({
            id: `founder-${eliteNum}-${founderNum}`,
            code: `FUND-${eliteNum}-${founderNum}`,
            elite_number: elite,
            founder_number: founderCounter,
            adn_prefix: `${eliteNum}-${founderNum}`,
            status: 'available',
            actions_granted: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          founderCounter++
        }
      }

      let insertedCount = 0
      let errors = []

      for (const codeData of founderCodes) {
        const { error } = await supabase
          .from('FounderCode')
          .upsert(codeData, { onConflict: 'code' })

        if (!error) {
          insertedCount++
        } else {
          if (errors.length < 5) errors.push(error.message)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Códigos Fundador inicializados: ${insertedCount}/500`,
        details: {
          becas: 200,
          comerciales: 300,
          total: founderCodes.length
        },
        errors: errors.length > 0 ? errors : undefined
      })
    }

    // Acción: Asignar código Elite
    if (action === 'assign-elite') {
      if (!code || !assignTo) {
        return NextResponse.json({ error: 'Faltan datos: código y nombre del asignatario' }, { status: 400 })
      }

      const upperCode = code.toUpperCase()

      // Verificar que el código existe y está disponible
      const { data: eliteCode, error: fetchError } = await supabase
        .from('EliteCode')
        .select('*')
        .eq('code', upperCode)
        .single()

      if (fetchError || !eliteCode) {
        return NextResponse.json({ error: 'Código Elite no encontrado' }, { status: 404 })
      }

      if (eliteCode.status !== 'available') {
        return NextResponse.json({ 
          error: `Código ya asignado a: ${eliteCode.assigned_to_name || 'Otro usuario'}` 
        }, { status: 400 })
      }

      // Asignar el código
      const { error: updateError } = await supabase
        .from('EliteCode')
        .update({
          status: 'assigned',
          assigned_to_name: assignTo,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', eliteCode.id)

      if (updateError) {
        return NextResponse.json({ error: 'Error al asignar código' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Código ${upperCode} asignado a ${assignTo}`,
        code: upperCode,
        eliteNumber: eliteCode.elite_number
      })
    }

    // Acción: Asignar código Fundador
    if (action === 'assign-founder') {
      if (!code || !assignTo) {
        return NextResponse.json({ error: 'Faltan datos: código y nombre del asignatario' }, { status: 400 })
      }

      const upperCode = code.toUpperCase()

      // Verificar que el código existe y está disponible
      const { data: founderCode, error: fetchError } = await supabase
        .from('FounderCode')
        .select('*')
        .eq('code', upperCode)
        .single()

      if (fetchError || !founderCode) {
        return NextResponse.json({ error: 'Código Fundador no encontrado' }, { status: 404 })
      }

      if (founderCode.status !== 'available') {
        return NextResponse.json({ 
          error: `Código ya asignado a: ${founderCode.assigned_to_name || 'Otro usuario'}` 
        }, { status: 400 })
      }

      // Asignar el código
      const { error: updateError } = await supabase
        .from('FounderCode')
        .update({
          status: 'assigned',
          assigned_to_name: assignTo,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', founderCode.id)

      if (updateError) {
        return NextResponse.json({ error: 'Error al asignar código' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Código ${upperCode} asignado a ${assignTo}`,
        code: upperCode,
        eliteNumber: founderCode.elite_number,
        founderNumber: founderCode.founder_number,
        adnPrefix: founderCode.adn_prefix
      })
    }

    // Acción: Generar más códigos Fundador para un Elite
    if (action === 'add-founder-slots') {
      if (!eliteNumber || eliteNumber < 1 || eliteNumber > 100) {
        return NextResponse.json({ error: 'Número de Elite inválido (1-100)' }, { status: 400 })
      }

      const slotsToAdd = count || 1

      // Obtener el máximo founder_number para este Elite
      const { data: existingCodes } = await supabase
        .from('FounderCode')
        .select('founder_number')
        .eq('elite_number', eliteNumber)
        .order('founder_number', { ascending: false })
        .limit(1)

      const maxFounder = existingCodes && existingCodes.length > 0 
        ? existingCodes[0].founder_number 
        : 200 // Empezar desde 201 si no hay códigos

      const eliteNum = eliteNumber.toString().padStart(3, '0')
      const newCodes = []

      for (let i = 1; i <= slotsToAdd; i++) {
        const founderNum = (maxFounder + i).toString().padStart(3, '0')
        newCodes.push({
          id: `founder-${eliteNum}-${founderNum}`,
          code: `FUND-${eliteNum}-${founderNum}`,
          elite_number: eliteNumber,
          founder_number: maxFounder + i,
          adn_prefix: `${eliteNum}-${founderNum}`,
          status: 'available',
          actions_granted: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      let insertedCount = 0
      for (const codeData of newCodes) {
        const { error } = await supabase
          .from('FounderCode')
          .insert(codeData)

        if (!error) insertedCount++
      }

      return NextResponse.json({
        success: true,
        message: `Agregados ${insertedCount} cupos de Fundador para Elite ${eliteNum}`,
        newCodes: newCodes.map(c => c.code)
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error en codes API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
