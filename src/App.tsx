import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { PrivacyProvider } from './context/PrivacyContext'
import AuthGuard from './components/AuthGuard'
import { DashboardSkeleton, CardsSkeleton } from './components/Skeleton'

// Code splitting: cada ruta se descarga sola, no todas juntas en un bundle gigante.
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Cards = lazy(() => import('./pages/Cards'))
const Savings = lazy(() => import('./pages/Savings'))

export default function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                  <Landing />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/registro"
              element={
                <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                  <Signup />
                </Suspense>
              }
            />
            <Route
              path="/app"
              element={
                <AuthGuard>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Dashboard />
                  </Suspense>
                </AuthGuard>
              }
            />
            <Route
              path="/app/tarjetas"
              element={
                <AuthGuard>
                  <Suspense fallback={<CardsSkeleton />}>
                    <Cards />
                  </Suspense>
                </AuthGuard>
              }
            />
            <Route
              path="/app/ahorros"
              element={
                <AuthGuard>
                  <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                    <Savings />
                  </Suspense>
                </AuthGuard>
              }
            />
            <Route
              path="/app/configuracion"
              element={
                <AuthGuard>
                  <Suspense fallback={<div className="min-h-screen bg-bg" />}>
                    <Settings />
                  </Suspense>
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </PrivacyProvider>
    </AuthProvider>
  )
}
