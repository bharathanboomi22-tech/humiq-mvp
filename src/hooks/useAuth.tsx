import { useState, useCallback, createContext, useContext } from 'react';

export type UserType = 'company' | 'talent' | null;

interface AuthState {
  user: null;
  session: null;
  userType: UserType;
  companyId: string | null;
  talentId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
}

interface UseAuthReturn extends AuthState {
  setUserType: (type: UserType) => void;
  setCompanyId: (id: string | null) => void;
  setTalentId: (id: string | null) => void;
}

const COMPANY_KEY = 'humiq_company_id';
const TALENT_KEY = 'humiq_talent_id';
const USER_TYPE_KEY = 'humiq_user_type';

export function useAuth(): UseAuthReturn {
  const [userType, setUserTypeState] = useState<UserType>(() => {
    return localStorage.getItem(USER_TYPE_KEY) as UserType;
  });
  
  const [companyId, setCompanyIdState] = useState<string | null>(() => {
    return localStorage.getItem(COMPANY_KEY);
  });
  
  const [talentId, setTalentIdState] = useState<string | null>(() => {
    return localStorage.getItem(TALENT_KEY);
  });

  const setUserType = useCallback((type: UserType) => {
    setUserTypeState(type);
    if (type) {
      localStorage.setItem(USER_TYPE_KEY, type);
    } else {
      localStorage.removeItem(USER_TYPE_KEY);
    }
  }, []);

  const setCompanyId = useCallback((id: string | null) => {
    setCompanyIdState(id);
    if (id) {
      localStorage.setItem(COMPANY_KEY, id);
    } else {
      localStorage.removeItem(COMPANY_KEY);
    }
  }, []);

  const setTalentId = useCallback((id: string | null) => {
    setTalentIdState(id);
    if (id) {
      localStorage.setItem(TALENT_KEY, id);
    } else {
      localStorage.removeItem(TALENT_KEY);
    }
  }, []);

  return {
    user: null,
    session: null,
    userType,
    companyId,
    talentId,
    isLoading: false,
    isAuthenticated: false,
    isDemo: true, // Always demo mode
    setUserType,
    setCompanyId,
    setTalentId,
  };
}

// Auth Context for provider pattern
interface AuthContextType extends UseAuthReturn {}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
