import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useUserRole } from '@hooks/useUserRole';
import { useTheme } from '@contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentCheckIcon,
  PlayIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BeakerIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ServerIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  BoltIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { HelpTooltip } from '../ui/HelpTooltip';

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { userProfile, isAdmin, isReviewer } = useUserRole();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/', icon: HomeIcon },
    { name: t('nav.content'), href: '/content', icon: DocumentTextIcon },
    { name: t('nav.contentPacks'), href: '/content-packs', icon: ArchiveBoxIcon },
    { name: 'Pack Store', href: '/pack-store', icon: ShoppingBagIcon, requiredRole: 'admin' },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCartIcon, requiredRole: 'admin' },
    { name: 'Edge Functions', href: '/edge-functions', icon: BoltIcon, requiredRole: 'admin' },
    { name: '🔧 Fix Logos', href: '/fix-logos', icon: WrenchIcon, requiredRole: 'admin' },
    { name: t('nav.review'), href: '/review', icon: ClipboardDocumentCheckIcon },
    { name: t('nav.sessions'), href: '/sessions', icon: PlayIcon },
    { name: t('nav.deviceAnalytics'), href: '/device-analytics', icon: DevicePhoneMobileIcon },
    { name: t('nav.rounds'), href: '/rounds', icon: BeakerIcon },
    { name: t('nav.campaigns'), href: '/campaigns', icon: MegaphoneIcon },
    { name: t('nav.analytics'), href: '/analytics', icon: ChartBarIcon },
    { name: t('nav.locations'), href: '/locations', icon: MapPinIcon },
    { name: t('nav.retention'), href: '/retention', icon: UserGroupIcon },
    { name: t('nav.exposure'), href: '/exposure', icon: EyeIcon },
    { name: t('nav.users'), href: '/users', icon: UsersIcon, requiredRole: 'admin' },
    { name: t('nav.settings'), href: '/settings', icon: CogIcon },
    { name: t('nav.featureFlags'), href: '/feature-flags', icon: BeakerIcon },
    { name: t('nav.apiTest'), href: '/api-test', icon: ServerIcon, requiredRole: 'admin' },
  ];

  const filteredNavigation = navigation.filter((item) => {
    if (!item.requiredRole) return true;
    if (item.requiredRole === 'admin' && isAdmin) return true;
    if (item.requiredRole === 'reviewer' && isReviewer) return true;
    return false;
  });

  const NavItems = () => (
    <>
      {filteredNavigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          end={item.href === '/content'}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <item.icon className="ltr:mr-3 rtl:ml-3 h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{item.name}</span>
          <HelpTooltip helpKey={`nav.${item.name.toLowerCase().replace(/\s+/g, '')}`} iconSize="sm" />
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out md:hidden shadow-xl ${
          sidebarOpen ? 'ltr:translate-x-0 rtl:-translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-primary">CLIKA</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            <NavItems />
          </nav>

          {/* Language & Theme Switchers */}
          <div className="px-2 py-2 space-y-2">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <span>{mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}</span>
              {mode === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ltr:ml-3 rtl:mr-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.display_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {userProfile?.role || 'reviewer'}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  setSidebarOpen(false);
                }}
                className="ltr:ml-3 rtl:mr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title={t('nav.logout')}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 ltr:rotate-0 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 bg-white dark:bg-gray-800 md:block ltr:border-r rtl:border-l border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-primary">CLIKA</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            <NavItems />
          </nav>

          {/* Language & Theme Switchers */}
          <div className="px-2 py-2 space-y-2">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <span>{mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}</span>
              {mode === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ltr:ml-3 rtl:mr-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.display_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {userProfile?.role || 'reviewer'}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  console.log('Logout button clicked!');
                  try {
                    await signOut();
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                className="ltr:ml-3 rtl:mr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title={t('nav.logout')}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 ltr:rotate-0 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-4 md:hidden border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-primary">CLIKA</h1>
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {mode === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}