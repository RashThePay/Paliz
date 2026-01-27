import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { TransactionDetail } from './pages/TransactionDetail'
import { Customers } from './pages/Customers'
import { TransactionForm } from './components/TransactionForm'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user)
  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  const setUser = useStore((state) => state.setUser)

  useEffect(() => {
    // بررسی session فعلی
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // گوش دادن به تغییرات auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction/:id"
          element={
            <PrivateRoute>
              <TransactionDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/new"
          element={
            <PrivateRoute>
              <TransactionForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App