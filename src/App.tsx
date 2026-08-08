import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Cards from './pages/Cards'
import Savings from './pages/Savings'
import AuthGuard from './components/AuthGuard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Signup />} />
        <Route
          path="/app"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/app/tarjetas"
          element={
            <AuthGuard>
              <Cards />
            </AuthGuard>
          }
        />
        <Route
          path="/app/ahorros"
          element={
            <AuthGuard>
              <Savings />
            </AuthGuard>
          }
        />
        <Route
          path="/app/configuracion"
          element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
