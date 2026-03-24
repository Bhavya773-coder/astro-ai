import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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
    `${linkBase} ${isActive ? 'text-custom-yellow' : 'text-white/70 hover:text-custom-yellow'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur border-b border-white/10">
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
              <NavLink to="/horoscope" className={linkClassName}>
                Horoscope
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
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
            >
              <span>⭐</span>
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
            
            <button className="text-white/70 hover:text-custom-yellow transition-colors" type="button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-custom-yellow rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-custom-yellow text-sm font-medium transition-colors"
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
              to="/horoscope"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              Horoscope
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
              className="w-full text-left px-3 py-2 rounded-md bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 hover:from-yellow-400/30 hover:to-orange-500/30 transition-colors"
            >
              ⭐ Get Pro
            </button>
          </div>
          
          {/* Mobile user section */}
          <div className="px-2 pt-4 pb-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-custom-yellow rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <span className="text-white text-sm">John Doe</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-custom-yellow text-sm font-medium transition-colors"
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
