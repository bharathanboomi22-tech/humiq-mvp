import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, Home, Briefcase, Users, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoredCompanyId } from '@/lib/company';
import { getStoredTalentId } from '@/lib/talent';

interface NavigationProps {
  variant?: 'company' | 'talent' | 'default';
  showBack?: boolean;
}

export function Navigation({ variant = 'default', showBack = false }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const companyId = getStoredCompanyId();
  const talentId = getStoredTalentId();

  const isCompanyRoute = location.pathname.startsWith('/company');
  const isTalentRoute = location.pathname.startsWith('/talent');

  // Determine which nav items to show based on variant or route
  const effectiveVariant = variant !== 'default' ? variant : 
    isCompanyRoute ? 'company' : 
    isTalentRoute ? 'talent' : 'default';

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-background/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container max-w-6xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Left - Logo or Back */}
          <div className="flex items-center gap-4">
            {showBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity duration-400"
              >
                <span className="font-display text-xl font-bold tracking-tight">
                  HumIQ
                </span>
              </button>
            )}
          </div>

          {/* Center - Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {effectiveVariant === 'company' && (
              <>
                <NavLink 
                  href="/company/dashboard" 
                  icon={Building2} 
                  label="Dashboard"
                  active={location.pathname === '/company/dashboard'}
                />
                <NavLink 
                  href="/company/jobs/new" 
                  icon={Briefcase} 
                  label="Post Job"
                  active={location.pathname === '/company/jobs/new'}
                />
                <NavLink 
                  href="/company/matches" 
                  icon={Users} 
                  label="Matches"
                  active={location.pathname === '/company/matches'}
                />
              </>
            )}
            {effectiveVariant === 'talent' && (
              <NavLink 
                href="/talent/dashboard" 
                icon={User} 
                label="Dashboard"
                active={location.pathname === '/talent/dashboard'}
              />
            )}
          </nav>

          {/* Right - Switch Account / Home */}
          <div className="flex items-center gap-2">
            {effectiveVariant === 'company' && talentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/talent/dashboard')}
                className="gap-2 text-muted-foreground hover:text-foreground text-xs rounded-full"
              >
                <User className="w-3 h-3" />
                Switch to Talent
              </Button>
            )}
            {effectiveVariant === 'talent' && companyId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/company/dashboard')}
                className="gap-2 text-muted-foreground hover:text-foreground text-xs rounded-full"
              >
                <Building2 className="w-3 h-3" />
                Switch to Company
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-400
        ${active 
          ? 'bg-foreground text-background' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}