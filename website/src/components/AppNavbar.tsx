import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkBase = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? 'text-custom-yellow' : 'text-white/70 hover:text-custom-yellow'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center">
            <img 
              src="/favicon.png" 
              alt="AstroAI" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="ml-3 text-xl font-bold text-white font-display">AstroAI</span>
          </button>

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
            {/* Get Pro Button */}
            <button
              onClick={() => navigate('/pro')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
            >
              <span>⭐</span>
              <span>Get Pro</span>
            </button>
            
            <button className="text-white/70 hover:text-custom-yellow transition-colors" type="button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
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
    </nav>
  );
};

export default AppNavbar;
