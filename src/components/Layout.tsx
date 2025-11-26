import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar, Home, PlusCircle, CheckSquare, Shield, LogOut, Users } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut, hasRole } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['staff', 'admin', 'approver'] },
    { path: '/apply', icon: PlusCircle, label: 'Apply Leave', roles: ['staff', 'admin', 'approver'] },
    { path: '/calendar', icon: Calendar, label: 'Calendar', roles: ['staff', 'admin', 'approver'] },
    { path: '/approvals', icon: CheckSquare, label: 'Approvals', roles: ['approver', 'admin'] },
    { path: '/block-periods', icon: Shield, label: 'Block Periods', roles: ['admin', 'approver'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['admin'] }
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🌈</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Leave Manager
              </span>
            </Link>
            
            <Button variant="ghost" onClick={signOut} className="btn-joy">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            Made with 💝 for happy teams • Where work-life balance meets joy! ✨
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;