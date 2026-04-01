import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Briefcase, User, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Discover', path: '/discover', icon: Search },
    { name: 'Post', path: '/post-request', icon: PlusCircle },
    { name: 'Feed', path: '/request-feed', icon: Briefcase },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="hidden md:flex items-center gap-2 font-bold text-xl text-orange-600">
          <MapPin className="w-6 h-6" />
          <span>AasPaas</span>
        </Link>
        
        <div className="flex justify-around items-center w-full md:w-auto md:gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 transition-colors",
                  isActive ? "text-orange-600" : "text-gray-500 hover:text-orange-400"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
