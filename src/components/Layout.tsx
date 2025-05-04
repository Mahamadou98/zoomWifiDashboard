import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  History,
  Clock,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import AdminAuthService from '../services/adminAuthService';

export function Layout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav.users'), href: '/users', icon: Users },
    { name: t('nav.partners'), href: '/partners', icon: Store },
    { name: t('nav.transactions'), href: '/transactions', icon: History },
    { name: t('nav.sessions'), href: '/sessions', icon: Clock },
    { name: t('nav.settings'), href: '/settings', icon: SettingsIcon },
  ];

  useEffect(() => {
    // Check token validity
    const checkAuth = () => {
      if (!AdminAuthService.isAuthenticated()) {
        signOut();
      }
    };

    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [signOut]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">
              ZOOM Wi-Fi Admin
            </h1>
            <LanguageSelector />
          </div>
          <nav className="mt-6 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg
                    ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="flex items-center px-4 py-2 mt-8 text-red-600 rounded-lg hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t('nav.signout')}
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
