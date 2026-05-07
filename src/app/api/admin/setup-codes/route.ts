import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API para gestionar códigos Elite y Fundador
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const { action, adminKey } = body

    // Verificar permiso
    if (adminKey !== 'COLMENA2025') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Acción: Generar códigos Elite
    if (action === 'generate-elite-codes') {
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
      
      for (const code of eliteCodes) {
        const { error } = await supabase
          .from('EliteCode')
          .upsert(code, { onConflict: 'code' })
        
        if (!error) {
          insertedCount++
        } else {
          errors.push(error.message)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Códigos Elite procesados: ${insertedCount}/100`,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined
      })
    }

    // Acción: Generar códigos Fundador
    if (action === 'generate-founder-codes') {
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
      
      // Fundadores COMERCIALES: 300 (asociados a Elites 001-100)
      let founderCounter = 201
      for (let elite = 1; elite <= 100; elite++) {
        const eliteNum = elite.toString().padStart(3, '0')
        for (let j = 1; j <= 3; j++) {
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
      
      for (const code of founderCodes) {
        const { error } = await supabase
          .from('FounderCode')
          .upsert(code, { onConflict: 'code' })
        
        if (!error) {
          insertedCount++
        } else {
          if (errors.length < 5) errors.push(error.message)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Códigos Fundador procesados: ${insertedCount}/500`,
        details: {
          becas: 200,
          comerciales: 300,
          total: founderCodes.length
        },
        errors: errors.length > 0 ? errors : undefined
      })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error en setup-codes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    // Obtener estadísticas de códigos
    const { data: eliteCodes } = await supabase
      .from('EliteCode')
      .select('status')

    const { data: founderCodes } = await supabase
      .from('FounderCode')
      .select('status')

    const eliteStats = {
      total: eliteCodes?.length || 0,
      available: eliteCodes?.filter(c => c.status === 'available').length || 0,
      assigned: eliteCodes?.filter(c => c.status === 'assigned').length || 0
    }

    const founderStats = {
      total: founderCodes?.length || 0,
      available: founderCodes?.filter(c => c.status === 'available').length || 0,
      assigned: founderCodes?.filter(c => c.status === 'assigned').length || 0
    }

    return NextResponse.json({
      success: true,
      elite: eliteStats,
      founder: founderStats
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
