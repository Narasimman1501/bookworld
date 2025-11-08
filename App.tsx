import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Browse from './pages/Browse';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { BookListProvider } from './context/BookListContext';

const App: React.FC = () => {
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarExpanded(prev => !prev);
  };

  return (
    <AuthProvider>
      <BookListProvider>
        <div className="flex h-screen bg-slate-900 text-slate-200">
           {isMobileSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-hidden="true"
            ></div>
          )}
          <Sidebar 
            isDesktopExpanded={isDesktopSidebarExpanded} 
            toggleDesktopSidebar={toggleDesktopSidebar}
            isMobileOpen={isMobileSidebarOpen}
            closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-800">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/book/:workId" element={<BookDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </div>
      </BookListProvider>
    </AuthProvider>
  );
};

export default App;