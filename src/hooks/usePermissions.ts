// src/hooks/usePermissions.ts
import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export const usePermissions = () => {
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserRole = () => {
      const user = authApi.getUser()
      if (user && user.role) {
        setUserRole(user.role as Role)
      }
      setLoading(false)
    }

    getUserRole()
  }, [])

  const hasRole = (roles: Role[]): boolean => {
    if (!userRole) return false
    return roles.includes(userRole)
  }

  const isAdmin = (): boolean => {
    return userRole === Role.ADMIN
  }

  // Verifica se o usuário está autenticado (tem qualquer role)
  const isAuthenticated = (): boolean => {
    return !!userRole
  }

  return {
    userRole,
    loading,
    hasRole,
    isAdmin,
    isAuthenticated,
    // Tanto ADMIN quanto USER podem criar, editar e excluir
    canCreate: isAuthenticated,
    canEdit: isAuthenticated,
    canDelete: isAuthenticated,
    canView: isAuthenticated
  }
}

export default usePermissions