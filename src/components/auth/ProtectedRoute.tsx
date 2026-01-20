import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserType } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: UserType[];
  requireAuth?: boolean; // If false, allows demo mode
}

export const ProtectedRoute = ({
  children,
  allowedTypes,
  requireAuth = false,
}: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, isDemo, userType } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ambient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Check if user has access
  const hasAccess = isAuthenticated || isDemo;

  // If auth is required and user is only in demo mode, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If no access at all, redirect to login
  if (!hasAccess) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user type is restricted and doesn't match
  if (allowedTypes && allowedTypes.length > 0 && userType && !allowedTypes.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    if (userType === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    } else if (userType === 'talent') {
      return <Navigate to="/talent/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Wrapper for company-only routes
export const CompanyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedTypes={['company']}>{children}</ProtectedRoute>
);

// Wrapper for talent-only routes
export const TalentRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedTypes={['talent']}>{children}</ProtectedRoute>
);
