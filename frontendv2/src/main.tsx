import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // An edge 429/challenge will not improve with an immediate automatic retry.
      retry: (failureCount, error) => {
        if (error instanceof Error && "status" in error && error.status === 429) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
