import { type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, Users, LogOut, PlusCircle, Calendar, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-100">مدیریت معاملات</h1>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-300 hover:text-red-600 transition"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-around items-center">
          <Link 
            to="/" 
            className={`flex flex-col items-center ${isActive('/') ? 'text-blue-600' : 'text-gray-300 hover:text-blue-600'}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">خانه</span>
          </Link>
          
          <Link 
            to="/calendar" 
            className={`flex flex-col items-center ${isActive('/calendar') ? 'text-blue-600' : 'text-gray-300 hover:text-blue-600'}`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">تقویم</span>
          </Link>
          
          <Link to="/new" className="flex flex-col items-center text-blue-600">
            <div className="bg-blue-600 text-gray-900 rounded-full p-3 -mt-6 shadow-lg">
              <PlusCircle size={24} />
            </div>
            <span className="text-xs mt-1">جدید</span>
          </Link>
          
          <Link 
            to="/balances" 
            className={`flex flex-col items-center ${isActive('/balances') ? 'text-blue-600' : 'text-gray-300 hover:text-blue-600'}`}
          >
            <Wallet size={24} />
            <span className="text-xs mt-1">موجودی</span>
          </Link>
          
          <Link 
            to="/customers" 
            className={`flex flex-col items-center ${isActive('/customers') ? 'text-blue-600' : 'text-gray-300 hover:text-blue-600'}`}
          >
            <Users size={24} />
            <span className="text-xs mt-1">مشتریان</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}