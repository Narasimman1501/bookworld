import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center justify-between p-2 md:p-4">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 mr-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <span className="text-slate-200 font-medium hidden sm:inline">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;