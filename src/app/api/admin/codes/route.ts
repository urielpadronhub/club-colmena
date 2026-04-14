import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: Obtener estado de códigos (OPTIMIZADO - solo estadísticas)
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'
    const type = searchParams.get('type') // 'elite' o 'founder'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Si solo queremos estadísticas (más rápido)
    if (!detailed) {
      // Contar Elite con una sola query
      const { count: eliteTotal } = await supabase
        .from('EliteCode')
        .select('*', { count: 'exact', head: true })
      
      const { count: eliteAvailable } = await supabase
        .from('EliteCode')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
      
      const { count: eliteAssigned } = await supabase
        .from('EliteCode')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'assigned')

      // Contar Fundador con una sola query
      const { count: founderTotal } = await supabase
        .from('FounderCode')
        .select('*', { count: 'exact', head: true })
      
      const { count: founderAvailable } = await supabase
        .from('FounderCode')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')
      
      const { count: founderAssigned } = await supabase
        .from('FounderCode')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'assigned')

      // Contadores especiales de Fundador
      const { count: becasTotal } = await supabase
        .from('FounderCode')
        .select('*', { count: 'exact', head: true })
        .eq('elite_number', 0)
      
      const { count: becasAvailable } = await supabase
        .from('FounderCode')
        .select('*', { count: 'exact', head: true })
        .eq('elite_number', 0)
        .eq('status', 'available')

      return NextResponse.json({
        success: true,
        elite: {
          total: eliteTotal || 0,
          available: eliteAvailable || 0,
          assigned: eliteAssigned || 0
        },
        founder: {
          total: founderTotal || 0,
          available: founderAvailable || 0,
          assigned: founderAssigned || 0,
          becas: becasTotal || 0,
          becasAvailable: becasAvailable || 0,
          comerciales: (founderTotal || 0) - (becasTotal || 0),
          comercialesAvailable: (founderAvailable || 0) - (becasAvailable || 0)
        }
      })
    }

    // Si queremos códigos detallados (con paginación)
    const offset = (page - 1) * limit

    if (type === 'elite') {
      const { data: codes, count } = await supabase
        .from('EliteCode')
        .select('*', { count: 'exact' })
        .order('elite_number', { ascending: true })
        .range(offset, offset + limit - 1)

      return NextResponse.json({
        success: true,
        type: 'elite',
        codes: codes || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    if (type === 'founder') {
      const { data: codes, count } = await supabase
        .from('FounderCode')
        .select('*', { count: 'exact' })
        .order('elite_number', { ascending: true })
        .order('founder_number', { ascending: true })
        .range(offset, offset + limit - 1)

      return NextResponse.json({
        success: true,
        type: 'founder',
        codes: codes || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    return NextResponse.json({ error: 'Especifica type=elite o type=founder con detailed=true' }, { status: 400 })

  } catch (error) {
    console.error('Error en codes API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Inicializar o asignar códigos (OPTIMIZADO con batch insert)
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

    // Acción: Inicializar códigos Elite (BATCH INSERT)
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

      // Insertar todos de una vez (batch)
      const { error, count: insertedCount } = await supabase
        .from('EliteCode')
        .upsert(eliteCodes, { onConflict: 'code', count: 'exact' })

      if (error) {
        return NextResponse.json({ error: 'Error insertando códigos Elite', details: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Códigos Elite inicializados: ${insertedCount || 100}/100`
      })
    }

    // Acción: Inicializar códigos Fundador (BATCH INSERT)
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

      // Fundadores COMERCIALES: Cada Elite tiene 3 fundadores iniciales
      let founderCounter = 201
      for (let elite = 1; elite <= 100; elite++) {
        const eliteNum = elite.toString().padStart(3, '0')
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

      // Insertar en lotes de 100 para evitar timeout
      const batchSize = 100
      let totalInserted = 0
      
      for (let i = 0; i < founderCodes.length; i += batchSize) {
        const batch = founderCodes.slice(i, i + batchSize)
        const { error, count } = await supabase
          .from('FounderCode')
          .upsert(batch, { onConflict: 'code', count: 'exact' })
        
        if (!error) {
          totalInserted += count || batch.length
        }
      }

      return NextResponse.json({
        success: true,
        message: `Códigos Fundador inicializados: ${totalInserted}/500`,
        details: {
          becas: 200,
          comerciales: 300,
          total: founderCodes.length
        }
      })
    }

    // Acción: Asignar código Elite
    if (action === 'assign-elite') {
      if (!code || !assignTo) {
        return NextResponse.json({ error: 'Faltan datos: código y nombre del asignatario' }, { status: 400 })
      }

      const upperCode = code.toUpperCase()

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

      const { data: existingCodes } = await supabase
        .from('FounderCode')
        .select('founder_number')
        .eq('elite_number', eliteNumber)
        .order('founder_number', { ascending: false })
        .limit(1)

      const maxFounder = existingCodes && existingCodes.length > 0 
        ? existingCodes[0].founder_number 
        : 200

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

      // Batch insert
      const { error, count: insertedCount } = await supabase
        .from('FounderCode')
        .insert(newCodes, { count: 'exact' })

      if (error) {
        return NextResponse.json({ error: 'Error insertando códigos', details: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Agregados ${insertedCount || newCodes.length} cupos de Fundador para Elite ${eliteNum}`,
        newCodes: newCodes.map(c => c.code)
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error en codes API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
