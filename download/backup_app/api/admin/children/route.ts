import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Obtener niños becados
export async function GET(request: NextRequest) {
  try {
    const children = await db.child.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: children
    })

  } catch (error) {
    console.error('Error obteniendo niños:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Crear niño becado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      cedula, 
      birthDate, 
      grade, 
      school,
      representativeName,
      representativePhone,
      representativeEmail,
      monthlyBenefit 
    } = body

    if (!name || !representativeName || !representativePhone) {
      return NextResponse.json(
        { error: 'Nombre del niño, nombre del representante y teléfono son requeridos' },
        { status: 400 }
      )
    }

    const child = await db.child.create({
      data: {
        name,
        cedula: cedula || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        grade: grade || null,
        school: school || null,
        representativeName,
        representativePhone,
        representativeEmail: representativeEmail || null,
        monthlyBenefit: monthlyBenefit ? parseFloat(monthlyBenefit) : null,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Niño becado registrado exitosamente',
      data: child
    })

  } catch (error) {
    console.error('Error creando niño:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
