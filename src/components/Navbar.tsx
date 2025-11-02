import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, Upload, Shield, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VTU MITRA
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button 
                  variant={location.pathname === '/' ? 'default' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
              </Link>
              
              <Link to="/upload">
                <Button 
                  variant={location.pathname === '/upload' ? 'default' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </Link>

              {isAdmin && (
                <Link to="/admin">
                  <Button 
                    variant={location.pathname === '/admin' ? 'default' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}

              <div className="h-6 w-px bg-border mx-2" />

              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>

              <Button onClick={signOut} variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
