import { Navigate } from 'react-router-dom';
import { useAuth, UserType } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: UserType[];
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Always allow access in demo mode
  return <>{children}</>;
};

// Wrapper for company-only routes
export const CompanyRoute = ({ children }: { children: React.ReactNode }) => {
  const { userType } = useAuth();
  
  // If no user type set, redirect to home to select role
  if (!userType) {
    return <Navigate to="/" replace />;
  }
  
  // If wrong type, redirect to talent dashboard
  if (userType !== 'company') {
    return <Navigate to="/talent/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper for talent-only routes
export const TalentRoute = ({ children }: { children: React.ReactNode }) => {
  const { userType } = useAuth();
  
  // If no user type set, redirect to home to select role
  if (!userType) {
    return <Navigate to="/" replace />;
  }
  
  // If wrong type, redirect to company dashboard
  if (userType !== 'talent') {
    return <Navigate to="/company/dashboard" replace />;
  }
  
  return <>{children}</>;
};
