import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Star,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  BarChart3,
  FileStack,
  LogOut,
  Folder,
  Shield
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navigationItems = [
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('interns'), path: '/interns', icon: Users, roles: ['Admin', 'HR', 'Manager'] },
    { name: t('recruitment'), path: '/recruitment', icon: Briefcase, roles: ['Admin', 'HR'] },
    { name: t('tasks'), path: '/tasks', icon: CheckSquare, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('evaluations'), path: '/evaluations', icon: Star, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('reports'), path: '/reports', icon: ClipboardList, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('documents'), path: '/documents', icon: Folder, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('messages'), path: '/messages', icon: MessageSquare, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('calendar'), path: '/calendar', icon: Calendar, roles: ['Admin', 'HR', 'Manager', 'Intern'] },
    { name: t('analytics'), path: '/analytics', icon: BarChart3, roles: ['Admin', 'HR', 'Manager'] },
    { name: t('auditLogs'), path: '/audit-logs', icon: FileStack, roles: ['Admin'] },
    { name: 'User Management', path: '/admin/users', icon: Shield, roles: ['Admin'] },
    { name: t('settings'), path: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 border-r bg-card flex flex-col h-screen sticky top-0 z-40 hidden md:flex" data-testid="sidebar">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">InternFlow</h1>
        <p className="text-xs text-muted-foreground mt-1">Gestion de stagiaires</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.name.toLowerCase()}`}
              className={
                isActive
                  ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-all'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all'
              }
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3 p-2">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 w-full transition-colors"
        >
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};
