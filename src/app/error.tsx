'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">🐝</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-4">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        <p className="text-xs text-gray-400 mb-4">
          {error?.message || 'Error desconocido'}
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={() => reset()}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            Intentar de nuevo
          </Button>
          <Button 
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.href = '/'
            }}
            variant="outline"
            className="flex-1"
          >
            Limpiar y volver al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
