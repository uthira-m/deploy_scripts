"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useState } from 'react';
import { LayoutDashboard, CalendarDays,UserCheck, BookOpen, Star, Crown, Users, Building2, Award, User, GraduationCap, Menu, X, Image, LogOut, UserCog, ChevronLeft, ChevronRight,HeartPulse, Drone, Filter, ShieldCheck, FileText, ClipboardList, Database, KeyRound } from 'lucide-react';
import ImageComponent from 'next/image';
import logoImage from '@/assets/logo1.png';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import packageJson from '../../package.json';

// Admin Menu - Full access
const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/leave', label: 'Leave Management', icon: CalendarDays },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/officers', label: 'Officers', icon: Star },
  { href: '/dashboard/admins', label: 'Admins', icon: Crown },
  { href: '/dashboard/personnel-jco', label: 'JCO', icon: UserCog },
  { href: '/dashboard/personnel', label: 'Personnels', icon: Users },
  { href: '/dashboard/profiling', label: 'Profiling', icon: ClipboardList },
  { href: '/dashboard/data-management', label: 'Data Management', icon: Database },
  { href: '/dashboard/parade-state', label: 'Parade State', icon: ClipboardList },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
  // { href: '/dashboard/rank-categories', label: 'Rank Categories', icon: '🏷️' },
  { href: '/dashboard/ranks', label: 'Ranks', icon: Award },
  { href: '/dashboard/lmc-personnel', label: 'LMC Personnel', icon: HeartPulse },
  { href: '/dashboard/drone-pilots', label: 'Drone Pilots', icon: Drone },
  { href: '/dashboard/quick-filters', label: 'Reports/Quick Filters', icon: Filter },
  { href: '/dashboard/image-management', label: 'Docs Management', icon: FileText },
  // { href: '/dashboard/view-report', label: 'View Reports', icon: '📈' },
];

// Commander Menu - Dashboard, Leave Management, My Personnels, My Profile (no Quick Filters, no Parade State)
const commanderLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/leave', label: 'Leave Management', icon: CalendarDays },
   { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/personnel', label: 'My Personnels', icon: Users },
  { href: '/dashboard/my-profile', label: 'My Profile', icon: User },
];

// Personnel Menu - Dashboard + Limited view + My Leaves
const personnelLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/my-leave', label: 'My Leaves', icon: UserCheck },
  // { href: '/dashboard/courses', label: 'Courses', icon: '📚' },
  { href: '/dashboard/my-courses', label: 'My Courses', icon: GraduationCap },
  { href: '/dashboard/my-profile', label: 'My Profile', icon: User },
];

const otherLinks = [
  { href: '/dashboard/team', label: 'Team' },
  { href: '/dashboard/message', label: 'Message' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { appName, appLogoUrl } = useAppSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-white/10 flex flex-col py-6 select-none overflow-visible shadow-lg transition-all duration-300 z-50 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'w-20 px-2' : 'w-64 px-4'}`}>
        {/* Mobile Close Button */}
        <button
          onClick={closeMobileMenu}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Expand/Collapse Button - Desktop Only */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 p-1.5 rounded-full bg-black backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 z-[100] shadow-lg"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ zIndex: 100 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <div className={`mb-8 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex items-center gap-3 px-2 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
            {appLogoUrl ? (
              <img
                src={appLogoUrl}
                alt={`${appName} Logo`}
                width={36}
                height={36}
                className="rounded-xl shadow-sm object-contain w-9 h-9"
              />
            ) : (
              <ImageComponent
                src={logoImage}
                alt={`${appName} Logo`}
                width={36}
                height={36}
                className="rounded-xl shadow-sm"
              />
            )}
            {!isCollapsed && (
              <span className="text-lg font-extrabold text-white tracking-tight">{appName}</span>
            )}
          </div>
          {/* Role Badge & Version */}
          <div className={`px-2 flex items-center gap-2 flex-wrap ${isCollapsed ? 'justify-center' : ''}`}>
            {user?.role && !isCollapsed && (
              <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                user.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : user.role === 'commander' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {user.role}
              </div>
            )}
            <span className="text-xs text-gray-500" title="App version">v{packageJson.version}</span>
          </div>
        </div>
        
        <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* {!isCollapsed && (
            <div className="mb-2 px-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Menu</div>
          )} */}
          <nav className="flex flex-col gap-1 mb-6">
            {(() => {
              // Determine which menu to show based on user role
              let menuLinks = adminLinks;
              if (user?.role === 'commander') {
                menuLinks = commanderLinks;
              } else if (user?.role === 'personnel') {
                menuLinks = personnelLinks;
              }

              // Admins link: only show if user name is "Super Admin" (check by name, not role)
              const filteredLinks = menuLinks.filter(link =>
                link.href === '/dashboard/admins' ? user?.name === 'Super Admin' : true
              );

              return filteredLinks.map(link => {
                // More specific matching to avoid conflicts between similar paths
                const isActive = 
                  // Exact match for dashboard
                  (link.href === '/dashboard' && pathname === '/dashboard') ||
                  // My Courses - exact match
                  (link.href === '/dashboard/my-courses' && pathname.startsWith('/dashboard/my-courses')) ||
                  // Courses - exact match but NOT my-courses
                  (link.href === '/dashboard/courses' && pathname.startsWith('/dashboard/courses') && !pathname.startsWith('/dashboard/my-courses')) ||
                  // My Leave - exact match
                  (link.href === '/dashboard/my-leave' && pathname.startsWith('/dashboard/my-leave')) ||
                  // Leave Management - exact match but NOT my-leave
                  (link.href === '/dashboard/leave' && pathname.startsWith('/dashboard/leave') && !pathname.startsWith('/dashboard/my-leave')) ||
                  // My Profile - exact match
                  (link.href === '/dashboard/my-profile' && pathname.startsWith('/dashboard/my-profile')) ||
                  // Officers - exact match
                  (link.href === '/dashboard/officers' && pathname.startsWith('/dashboard/officers')) ||
                  // Admins - exact match
                  (link.href === '/dashboard/admins' && pathname.startsWith('/dashboard/admins')) ||
                  // JCO - exact match
                  (link.href === '/dashboard/personnel-jco' && pathname.startsWith('/dashboard/personnel-jco')) ||
                  // Personnel - exact match but NOT my-profile, officers, admins, personnel-jco, or lmc-personnel
                  (link.href === '/dashboard/personnel' && pathname.startsWith('/dashboard/personnel') && !pathname.startsWith('/dashboard/my-profile') && !pathname.startsWith('/dashboard/officers') && !pathname.startsWith('/dashboard/admins') && !pathname.startsWith('/dashboard/personnel-jco') && !pathname.startsWith('/dashboard/lmc-personnel')) ||
                  // Quick Filters
                  (link.href === '/dashboard/quick-filters' && pathname.startsWith('/dashboard/quick-filters')) ||
                  // Companies
                  (link.href === '/dashboard/companies' && pathname.startsWith('/dashboard/companies')) ||
                    // LMC Personnel
                  (link.href === '/dashboard/lmc-personnel' && pathname.startsWith('/dashboard/lmc-personnel')) ||
                    // Rank
                  (link.href === '/dashboard/ranks' && pathname.startsWith('/dashboard/ranks')) ||
                  // Drone Pilots
                  (link.href === '/dashboard/drone-pilots' && pathname.startsWith('/dashboard/drone-pilots')) ||
                  // Docs/File Management
                  (link.href === '/dashboard/image-management' && pathname.startsWith('/dashboard/image-management')) ||
                  // Profiling
                  (link.href === '/dashboard/profiling' && pathname.startsWith('/dashboard/profiling')) ||
                  // Data Management
                  (link.href === '/dashboard/data-management' && pathname.startsWith('/dashboard/data-management')) ||
                  // Parade State
                  (link.href === '/dashboard/parade-state' && pathname.startsWith('/dashboard/parade-state')) ||
                  // View Reports
                  (link.href === '/dashboard/view-report' && pathname.startsWith('/dashboard/view-report'));
                
                // Disable prefetch for personnel list pages to avoid redundant API calls when viewing all-personnel
                const noPrefetchHrefs = ['/dashboard/personnel', '/dashboard/officers', '/dashboard/personnel-jco'];
                const shouldPrefetch = !noPrefetchHrefs.includes(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={shouldPrefetch}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 py-3 rounded-xl font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-2' : 'px-4'
                    }
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    title={isCollapsed ? link.label : undefined}
                  >
                    {link.icon && <link.icon className="w-5 h-5 flex-shrink-0" />}
                    {!isCollapsed && (
                      <span className="truncate">{link.label}</span>
                    )}
                  </Link>
                );
              });
            })()}
          </nav>
          {/* <div className="border-t border-white/10" /> */}
          {/* <div className="mb-2 px-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Other</div> */}
          {/* <nav className="flex flex-col gap-1">
            {otherLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center px-4 py-3 rounded-xl font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-150"
              >
                <span className="truncate">{link.label}</span>
              </Link>
            ))}
          </nav> */}
        </div>
        
        {/* User Profile Section */}
        {user && (
          <div className="border-t border-white/10 pt-4 mt-4">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-400 font-bold text-lg">
                    {user.profile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <Link
                  href="/change-password"
                  onClick={closeMobileMenu}
                  className="p-2 cursor-pointer rounded-lg text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-150 border border-transparent hover:border-blue-500/30"
                  title="Change Password"
                >
                  <KeyRound className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 cursor-pointer rounded-lg text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-150 border border-transparent hover:border-rose-500/30"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-lg">
                      {user.profile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.profile?.name || user?.name ||'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.role || 'User'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <Link
                    href="/change-password"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-150 border border-transparent hover:border-blue-500/30 flex-1 justify-center text-sm font-medium"
                  >
                    <KeyRound className="w-4 h-4 flex-shrink-0" />
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 cursor-pointer rounded-lg text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-150 border border-transparent hover:border-rose-500/30"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
} 