'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function FixPage() {
  const [status, setStatus] = useState('Verificando...')
  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    try {
      // Verificar localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const parsed = JSON.parse(userData)
          if (!parsed || !parsed.id) {
            setStatus('Datos de sesión corruptos encontrados')
          } else {
            setStatus('Sesión encontrada: ' + (parsed.email || parsed.name || 'Sin nombre'))
          }
        } catch {
          setStatus('Datos de sesión corruptos (JSON inválido)')
        }
      } else {
        setStatus('No hay sesión guardada')
      }
    } catch (error) {
      setStatus('Error accediendo a localStorage: ' + String(error))
    }
  }, [])

  const clearSession = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      setFixed(true)
      setStatus('Sesión limpiada correctamente')
    } catch (error) {
      setStatus('Error limpiando: ' + String(error))
    }
  }

  const goToHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">🐝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Reparar Sesión
          </h2>
          
          <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-left">
            <strong>Estado:</strong> {status}
          </div>

          {!fixed ? (
            <>
              <p className="text-gray-600 mb-4">
                Si tienes problemas para entrar, intenta limpiar la sesión y volver a iniciar.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={clearSession}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Limpiar Sesión
                </Button>
                <Button 
                  onClick={goToHome}
                  variant="outline"
                  className="flex-1"
                >
                  Ir al Inicio
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-green-600 mb-4">
                ✓ Sesión limpiada. Ahora puedes ir al inicio y volver a entrar.
              </p>
              <Button 
                onClick={goToHome}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                Ir al Inicio
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
