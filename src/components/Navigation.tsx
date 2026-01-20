import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, Home, Briefcase, Users, ArrowLeft } from 'lucide-react';
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
      transition={{ duration: 0.3 }}
      className="border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container max-w-6xl mx-auto px-6">
        <div className="h-14 flex items-center justify-between">
          {/* Left - Logo or Back */}
          <div className="flex items-center gap-4">
            {showBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-foreground/90 hover:text-foreground transition-colors"
              >
                <span className="font-display text-lg font-medium tracking-tight">
                  HumIQ <span className="text-foreground/50">AI</span>
                </span>
                <span 
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'rgba(255, 255, 255, 0.55)',
                  }}
                >
                  Beta
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
              <>
                <NavLink 
                  href="/talent/dashboard" 
                  icon={User} 
                  label="Dashboard"
                  active={location.pathname === '/talent/dashboard'}
                />
                <NavLink 
                  href="/talent/matches" 
                  icon={Briefcase} 
                  label="Job Matches"
                  active={location.pathname === '/talent/matches'}
                />
              </>
            )}
          </nav>

          {/* Right - Switch Account / Home */}
          <div className="flex items-center gap-2">
            {effectiveVariant === 'company' && talentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/talent/dashboard')}
                className="gap-2 text-muted-foreground hover:text-foreground text-xs"
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
                className="gap-2 text-muted-foreground hover:text-foreground text-xs"
              >
                <Building2 className="w-3 h-3" />
                Switch to Company
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 text-muted-foreground hover:text-foreground"
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
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-accent/10 text-accent' 
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
