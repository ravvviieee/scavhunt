import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="text-xl font-bold text-primary cursor-pointer"
            onClick={() => setLocation('/')}
          >
            Scavenger Hunt
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <span className="mr-1">{user.username}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 8.5L2 4.5H10L6 8.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setLocation('/hunt')}>
                  Play Hunt
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setLocation('/my-submissions')}>
                  My Submissions
                </DropdownMenuItem>
                
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/admin/submissions')}>
                      Admin: Review Submissions
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setLocation('/login')}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}