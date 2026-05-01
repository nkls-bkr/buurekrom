import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMe } from '../features/auth/api'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe()

  if (isLoading) {
    return null
  }
  if (!data) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
