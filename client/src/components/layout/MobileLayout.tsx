import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';

interface MobileLayoutProps {
  children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  
  // Pages where we don't show the bottom navigation (login, register, etc.)
  const hideBottomNav = ['/login', '/register'].includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${!hideBottomNav ? 'pb-20' : 'pb-4'}`}>
        <div className="px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation - Only show when user is logged in */}
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};