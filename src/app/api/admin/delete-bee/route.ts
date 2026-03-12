import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// DELETE - Eliminar un socio completo (solo admin o presidenta)
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const { beeId, requestUserId } = body

    if (!beeId) {
      return NextResponse.json({ error: 'beeId es requerido' }, { status: 400 })
    }

    // Verificar permisos del usuario que hace la petición
    if (requestUserId) {
      const { data: requestUser } = await supabase
        .from('User')
        .select(`
          id,
          role,
          Bee (memberType)
        `)
        .eq('id', requestUserId)
        .single()

      if (!requestUser) {
        return NextResponse.json({ error: 'Usuario no autorizado' }, { status: 403 })
      }

      const isAdmin = requestUser.role === 'admin'
      const bee = Array.isArray(requestUser.Bee) ? requestUser.Bee[0] : requestUser.Bee
      const isPresidenta = bee?.memberType === 'presidente'

      if (!isAdmin && !isPresidenta) {
        return NextResponse.json({ error: 'Solo el administrador o la presidenta pueden eliminar socios' }, { status: 403 })
      }
    }

    // Obtener el userId del bee a eliminar
    const { data: beeToDelete } = await supabase
      .from('Bee')
      .select('id, userId')
      .eq('id', beeId)
      .single()

    if (!beeToDelete) {
      return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 })
    }

    // No permitir eliminar al admin ni a la presidenta
    const { data: userToDelete } = await supabase
      .from('User')
      .select('email, role')
      .eq('id', beeToDelete.userId)
      .single()

    if (userToDelete?.role === 'admin') {
      return NextResponse.json({ error: 'No se puede eliminar al administrador' }, { status: 403 })
    }

    // Verificar si es presidenta
    const { data: beeData } = await supabase
      .from('Bee')
      .select('memberType')
      .eq('id', beeId)
      .single()

    if (beeData?.memberType === 'presidente') {
      return NextResponse.json({ error: 'No se puede eliminar a la presidenta' }, { status: 403 })
    }

    // Eliminar en orden (por las foreign keys)
    
    // 1. Eliminar GiftActions dados por este bee
    await supabase.from('GiftAction').delete().eq('giverBeeId', beeId)
    
    // 2. Eliminar GiftActions recibidos (donde este bee usó un código)
    // Buscar donde este bee usó un código
    const { data: usedCodes } = await supabase
      .from('GiftAction')
      .select('id')
      .eq('receiverBeeId', beeId)
    if (usedCodes && usedCodes.length > 0) {
      await supabase.from('GiftAction').update({ receiverBeeId: null }).eq('receiverBeeId', beeId)
    }
    
    // 3. Eliminar Actions
    await supabase.from('Action').delete().eq('beeId', beeId)
    
    // 4. Eliminar Payments
    await supabase.from('Payment').delete().eq('beeId', beeId)
    
    // 5. Eliminar BankAccount
    await supabase.from('BankAccount').delete().eq('beeId', beeId)
    
    // 6. Eliminar RaffleTickets
    await supabase.from('RaffleTicket').delete().eq('beeId', beeId)
    
    // 7. Eliminar RaffleWinners
    await supabase.from('RaffleWinner').delete().eq('beeId', beeId)
    
    // 8. Eliminar Bee
    const { error: beeError } = await supabase.from('Bee').delete().eq('id', beeId)
    if (beeError) {
      return NextResponse.json({ error: 'Error al eliminar socio: ' + beeError.message }, { status: 500 })
    }
    
    // 9. Eliminar User
    const { error: userError } = await supabase.from('User').delete().eq('id', beeToDelete.userId)
    if (userError) {
      return NextResponse.json({ error: 'Error al eliminar usuario: ' + userError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Socio eliminado correctamente' 
    })

  } catch (error) {
    console.error('Error eliminando socio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
