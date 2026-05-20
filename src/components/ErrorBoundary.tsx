'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="text-6xl mb-4">🐝</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                ¡Ups! Algo salió mal
              </h2>
              <p className="text-gray-600 mb-4">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {this.state.error?.message || 'Error desconocido'}
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Recargar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
