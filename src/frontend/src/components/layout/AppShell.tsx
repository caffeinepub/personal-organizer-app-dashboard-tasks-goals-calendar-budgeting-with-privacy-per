import { Outlet } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import PrivacyStatusBar from '../common/PrivacyStatusBar';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from '@tanstack/react-router';

export default function AppShell({ children }: { children?: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = !!identity;

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/goals', label: 'Goals' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/budget', label: 'Budget' },
    { to: '/crypto', label: 'Crypto' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PrivacyStatusBar />
      
      <header className="hero-header sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur-md">
        <div className="hero-header-bg" />
        <div className="hero-header-overlay" />
        <div className="container relative z-10">
          <div className="flex h-16 md:h-20 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/assets/generated/organizer-logo.dim_512x512.png"
                  alt="Everything Tracker"
                  className="h-10 w-10 md:h-12 md:w-12"
                />
                <span className="hero-title hidden sm:inline-block">The Everything Tracker</span>
              </Link>

              {isAuthenticated && (
                <nav className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="hero-nav-item"
                      activeProps={{
                        className: 'hero-nav-item-active',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-3">
              <LoginButton />
              {isAuthenticated && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="hero-mobile-menu-btn">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <nav className="flex flex-col gap-2 mt-8">
                      {navLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="settings-nav-item"
                          activeProps={{
                            className: 'settings-nav-item-active',
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 max-w-6xl">
        {children || <Outlet />}
      </main>

      <footer className="border-t border-border py-6 mt-auto bg-muted/30">
        <div className="container px-4 text-center text-sm text-muted-foreground space-y-3">
          <p>
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'unknown-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
