'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './button';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-full px-6 flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              MERN Playlist
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <NavLink href="/" active={isActive('/')}>Home</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink href="/playlists" active={isActive('/playlists')}>My Playlists</NavLink>
                  <NavLink href="/songs" active={isActive('/songs')}>Songs</NavLink>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {user?.firstName}
                </Link>
                <Button variant="danger" size="sm" onClick={logout} className="rounded-full px-6">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="glass" size="sm" className="rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="glow" size="sm" className="rounded-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
          ? 'bg-white/10 text-white shadow-lg shadow-violet-500/10'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      {children}
    </Link>
  );
}
