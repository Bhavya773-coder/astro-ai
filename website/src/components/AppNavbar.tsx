import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Star } from 'lucide-react';

const linkBase = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img
                src="/favicon.png"
                alt="AstroAI"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-white">AstroAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <NavLink to="/dashboard" className={linkClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/numerology" className={linkClassName}>
                Numerology
              </NavLink>
              <NavLink to="/birth-chart" className={linkClassName}>
                Birth Chart
              </NavLink>
              <NavLink to="/ai-chat" className={linkClassName}>
                AI Chat
              </NavLink>
              <NavLink to="/reports" className={linkClassName}>
                Reports
              </NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Get Pro Button - Hidden on mobile */}
            <button
              onClick={() => navigate('/pro')}
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] hover:scale-105 transition-all duration-300"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Get Pro</span>
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-violet-400 text-sm font-medium transition-colors"
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/numerology"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              Numerology
            </Link>
            <Link
              to="/birth-chart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              Birth Chart
            </Link>
            <Link
              to="/ai-chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              AI Chat
            </Link>
            <Link
              to="/reports"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              Reports
            </Link>
            <button
              onClick={() => {
                navigate('/pro');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-violet-300 hover:from-violet-600/30 hover:to-fuchsia-600/30 border border-violet-500/30 transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            >
              <Star className="w-4 h-4" /> Get Pro
            </button>
          </div>
          
          {/* Mobile user section */}
          <div className="px-2 pt-4 pb-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <span className="text-white text-sm">John Doe</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-violet-400 text-sm font-medium transition-colors"
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AppNavbar;
