import { lazy } from 'react'
export const routes = [
  {
    path: '/',
    key: '/',
    redirect: '/use-state',
  },
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