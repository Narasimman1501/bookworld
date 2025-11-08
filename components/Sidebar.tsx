import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isDesktopExpanded: boolean;
  toggleDesktopSidebar: () => void;
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isDesktopExpanded, 
  toggleDesktopSidebar, 
  isMobileOpen, 
  closeMobileSidebar 
}) => {
  const activeLinkClass = 'bg-sky-600 text-white';
  const inactiveLinkClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';

  const NavLinks = () => (
    <nav className="flex-1 px-2 py-4 space-y-2">
       <NavLink
        to="/"
        end
        onClick={closeMobileSidebar}
        className={({ isActive }) =>
          `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? activeLinkClass : inactiveLinkClass} ${!isDesktopExpanded && 'justify-center'}`
        }
        title="Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 shrink-0 ${isDesktopExpanded && 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className={`${!isDesktopExpanded && 'hidden'}`}>Home</span>
      </NavLink>
      <NavLink
        to="/browse"
        onClick={closeMobileSidebar}
        className={({ isActive }) =>
          `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? activeLinkClass : inactiveLinkClass} ${!isDesktopExpanded && 'justify-center'}`
        }
        title="Browse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 shrink-0 ${isDesktopExpanded && 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className={`${!isDesktopExpanded && 'hidden'}`}>Browse</span>
      </NavLink>
      <NavLink
        to="/profile"
        onClick={closeMobileSidebar}
        className={({ isActive }) =>
          `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? activeLinkClass : inactiveLinkClass} ${!isDesktopExpanded && 'justify-center'}`
        }
        title="Profile"
      >
         <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 shrink-0 ${isDesktopExpanded && 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
         </svg>
        <span className={`${!isDesktopExpanded && 'hidden'}`}>Profile</span>
      </NavLink>
    </nav>
  );

  return (
    <div className={`flex flex-col bg-slate-800 border-r border-slate-700 transition-all duration-300 ease-in-out
      fixed md:relative inset-y-0 left-0 z-50
      w-56
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 
      ${isDesktopExpanded ? 'md:w-64' : 'md:w-20'}
    `}>
      <div className="flex items-center justify-center h-16 border-b border-slate-700 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wider overflow-hidden" translate="no">
          {isDesktopExpanded ? '📚 BookWorld' : '📚'}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavLinks />
      </div>
       <div className="p-2 border-t border-slate-700 hidden md:block">
        <button 
          onClick={toggleDesktopSidebar} 
          className="w-full flex items-center justify-center p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
          aria-label={isDesktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
            {isDesktopExpanded ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
