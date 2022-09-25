import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

export const routes = [
  {
    path: '/use-state',
    key: '/use-state',
    component: lazy(() => import('@/pages/use-state'))
  },
  {
    path: '/use-effect',
    key: '/use-effect',
    component: lazy(() => import('@/pages/use-effect'))
  },
  {
    path: '/use-context',
    key: '/use-context',
    component: lazy(() => import('@/pages/use-context'))
  }
]