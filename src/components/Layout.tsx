import { type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Users, LogOut, PlusCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">مدیریت معاملات</h1>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 transition"
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-around items-center">
          <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Home size={24} />
            <span className="text-xs mt-1">خانه</span>
          </Link>
          <Link to="/customers" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Users size={24} />
            <span className="text-xs mt-1">مشتریان</span>
          </Link>
          <Link to="/new" className="flex flex-col items-center text-blue-600">
            <div className="bg-blue-600 text-white rounded-full p-3 -mt-6 shadow-lg">
              <PlusCircle size={24} />
            </div>
            <span className="text-xs mt-1">معامله جدید</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}