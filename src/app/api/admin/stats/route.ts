import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    // Contar abejas
    const { count: totalBees } = await supabase
      .from('Bee')
      .select('*', { count: 'exact', head: true })

    const { count: activeBees } = await supabase
      .from('Bee')
      .select('*', { count: 'exact', head: true })
      .eq('isActive', true)

    // Contar usuarios
    const { count: totalUsers } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })

    // Contar pagos pendientes
    const { count: pendingPayments } = await supabase
      .from('Payment')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Obtener últimos 5 usuarios con sus bees
    const { data: recentUsers } = await supabase
      .from('User')
      .select(`
        id,
        email,
        name,
        createdAt,
        Bee (
          affiliationNumber
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(5)

    const recentBees = recentUsers?.map(u => ({
      id: u.id,
      affiliationNumber: u.Bee?.[0]?.affiliationNumber || 'N/A',
      createdAt: u.createdAt,
      user: { name: u.name, email: u.email }
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          totalBees: totalBees || 0,
          activeBees: activeBees || 0,
          totalUsers: totalUsers || 0,
          totalChildren: 0,
          totalRaffles: 0,
          completedRaffles: 0,
          pendingPayments: pendingPayments || 0,
          totalGiftCodes: 0,
          activatedGiftCodes: 0
        },
        financial: {
          totalCollected: 0,
          totalPrizesPaid: 0,
          totalActions: 0
        },
        recent: {
          bees: recentBees,
          raffles: []
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
