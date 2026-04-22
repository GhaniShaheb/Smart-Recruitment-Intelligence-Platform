
import { Link, useLocation } from 'react-router'
import { BarChart3, Users, TrendingUp, Award, Mail } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/compare', label: 'Compare', icon: Users },
    { path: '/predict', label: 'Predict', icon: TrendingUp },
    { path: '/recruiter-performance', label: 'Recruiters', icon: Award },
    { path: '/emails', label: 'Emails', icon: Mail },
  ]

  return (
    <header className="bg-base-300 border-b border-base-content/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <BarChart3 size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary font-mono tracking-tighter">
              Recruit AI
            </h1>
          </Link>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-base-content hover:bg-base-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar

