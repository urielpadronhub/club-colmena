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

    // Obtener acciones
    const { data: actions } = await supabase
      .from('Action')
      .select('*')
      .eq('beeId', bee.id)
      .order('createdAt', { ascending: false })

    // Obtener pagos
    const { data: payments } = await supabase
      .from('Payment')
      .select('*')
      .eq('beeId', bee.id)
      .order('createdAt', { ascending: false })

    // Obtener códigos de regalo disponibles
    const { data: giftActions } = await supabase
      .from('GiftAction')
      .select('id, giftCode, status')
      .eq('giverBeeId', bee.id)
      .eq('status', 'available')

    // Obtener premios ganados
    const { data: raffleWins } = await supabase
      .from('RaffleWinner')
      .select(`
        id,
        prizeAmount,
        prizePosition,
        paymentStatus,
        Raffle (name, type)
      `)
      .eq('beeId', bee.id)

    // Obtener cuenta bancaria
    const { data: bankAccount } = await supabase
      .from('BankAccount')
      .select('*')
      .eq('beeId', bee.id)
      .single()

    // Calcular total de acciones
    const totalActions = actions?.reduce((sum, a) => sum + (a.quantity || 0), 0) || 0

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
        actions: actions || [],
        payments: payments || [],
        raffleWins: raffleWins || [],
        bankAccount: bankAccount || null,
        totalActions,
        availableGiftActions: giftActions || [],
        activeReferrals: 0
      }
    })

  } catch (error) {
    console.error('Error obteniendo datos del bee:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
