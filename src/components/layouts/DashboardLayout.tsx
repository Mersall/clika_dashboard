import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Content', href: '/content', icon: DocumentTextIcon },
  { name: 'Campaigns', href: '/campaigns', icon: MegaphoneIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UsersIcon, requiredRole: 'admin' },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function DashboardLayout() {
  const { user, signOut, isAdmin } = useAuth();

  const filteredNavigation = navigation.filter(
    (item) => !item.requiredRole || (item.requiredRole === 'admin' && isAdmin)
  );

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="hidden w-64 bg-gray-900 md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <h1 className="text-2xl font-bold text-primary-500">CLIKA</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-gray-800 p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.user_metadata?.role || 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-3 text-gray-400 hover:text-white"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}