import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    // Obtener datos del usuario con su Bee
    const { data: user, error: userError } = await supabase
      .from('User')
      .select(`
        id,
        email,
        name,
        role,
        Bee (
          id,
          cedula,
          phone,
          address,
          affiliationNumber,
          memberType,
          eliteNumber,
          founderNumber,
          isActive,
          activationPaid,
          activationDate,
          createdAt
        )
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('Error obteniendo usuario:', userError)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const bee = user.Bee && Array.isArray(user.Bee) && user.Bee.length > 0 ? user.Bee[0] : null

    if (!bee) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          bee: null
        } 
      })
    }

    // Obtener acciones (con manejo de error)
    let actions = []
    try {
      const { data: actionsData, error: actionsError } = await supabase
        .from('Action')
        .select('*')
        .eq('beeId', bee.id)
        .order('createdAt', { ascending: false })
      
      if (!actionsError && actionsData) {
        actions = actionsData
      }
    } catch (e) {
      console.error('Error obteniendo acciones:', e)
    }

    // Obtener pagos (con manejo de error)
    let payments = []
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('Payment')
        .select('*')
        .eq('beeId', bee.id)
        .order('createdAt', { ascending: false })
      
      if (!paymentsError && paymentsData) {
        payments = paymentsData
      }
    } catch (e) {
      console.error('Error obteniendo pagos:', e)
    }

    // Obtener códigos de regalo disponibles (con manejo de error)
    let giftActions = []
    try {
      const { data: giftActionsData, error: giftError } = await supabase
        .from('GiftAction')
        .select('id, giftCode, status')
        .eq('giverBeeId', bee.id)
        .eq('status', 'available')
      
      if (!giftError && giftActionsData) {
        giftActions = giftActionsData
      }
    } catch (e) {
      console.error('Error obteniendo gift actions:', e)
    }

    // Obtener premios ganados (con manejo de error y join correcto)
    let raffleWins = []
    try {
      // Primero obtener los RaffleWinner
      const { data: winnersData, error: winnersError } = await supabase
        .from('RaffleWinner')
        .select('id, prizeAmount, prizePosition, paymentStatus, raffleId')
        .eq('beeId', bee.id)
      
      if (!winnersError && winnersData && winnersData.length > 0) {
        // Luego obtener los datos de los sorteos
        const raffleIds = winnersData.map(w => w.raffleId).filter(Boolean)
        
        if (raffleIds.length > 0) {
          const { data: rafflesData } = await supabase
            .from('Raffle')
            .select('id, name, type')
            .in('id', raffleIds)
          
          // Combinar los datos
          const rafflesMap = new Map((rafflesData || []).map(r => [r.id, r]))
          
          raffleWins = winnersData.map(w => ({
            id: w.id,
            prizeAmount: w.prizeAmount,
            prizePosition: w.prizePosition,
            paymentStatus: w.paymentStatus,
            raffle: rafflesMap.get(w.raffleId) || { name: 'Sorteo', type: 'unknown' }
          }))
        }
      }
    } catch (e) {
      console.error('Error obteniendo raffle wins:', e)
    }

    // Obtener cuenta bancaria (con manejo de error - puede no existir)
    let bankAccount = null
    try {
      const { data: bankData, error: bankError } = await supabase
        .from('BankAccount')
        .select('*')
        .eq('beeId', bee.id)
        .maybeSingle() // Usar maybeSingle() en lugar de single()
      
      if (!bankError && bankData) {
        bankAccount = bankData
      }
    } catch (e) {
      console.error('Error obteniendo cuenta bancaria:', e)
    }

    // Calcular total de acciones
    const totalActions = actions.reduce((sum: number, a: { quantity?: number }) => sum + (a.quantity || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        id: bee.id,
        affiliationNumber: bee.affiliationNumber,
        cedula: bee.cedula,
        phone: bee.phone,
        address: bee.address,
        isActive: bee.isActive,
        activationPaid: bee.activationPaid,
        createdAt: bee.createdAt,
        user: { name: user.name, email: user.email },
        memberType: bee.memberType,
        eliteNumber: bee.eliteNumber,
        founderNumber: bee.founderNumber,
        actions: actions,
        payments: payments,
        raffleWins: raffleWins,
        bankAccount: bankAccount,
        totalActions,
        availableGiftActions: giftActions,
        activeReferrals: 0
      }
    })

  } catch (error) {
    console.error('Error obteniendo datos del bee:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
