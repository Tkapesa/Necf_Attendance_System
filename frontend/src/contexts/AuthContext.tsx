import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, AuthContextType, LoginCredentials, ROLE_PERMISSIONS, ROUTE_ACCESS } from '../types/auth';
import { mockUsers } from '../data/mockUsers';

// Auth reducer
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: true, 
        user: action.user, 
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: false, 
        user: null, 
        error: action.error 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        error: null 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('necf_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', user });
      } catch (error) {
        localStorage.removeItem('necf_user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock data
      const user = mockUsers.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase()
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In real implementation, you would verify password hash
      // For now, we'll accept any password for demo purposes
      
      // Update user's last login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('necf_user', JSON.stringify(updatedUser));

      dispatch({ type: 'LOGIN_SUCCESS', user: updatedUser });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('necf_user');
    dispatch({ type: 'LOGOUT' });
  };

  const hasPermission = (action: string, resource: string, data?: any): boolean => {
    if (!state.user) return false;

    const userPermissions = ROLE_PERMISSIONS[state.user.role];
    const permission = `${action}:${resource}`;

    // Check if user has the permission
    const hasBasePermission = userPermissions.includes(permission);
    
    if (!hasBasePermission) return false;

    // Additional checks for cell leaders - they can only access their own cell/team data
    if (state.user.role === 'CELL_LEADER' && data) {
      if (data.cellId && data.cellId !== state.user.cellId) {
        return false;
      }
      if (data.leaderId && data.leaderId !== state.user.id) {
        return false;
      }
    }

    return true;
  };

  const canAccess = (route: string): boolean => {
    if (!state.user) return false;

    const allowedRoles = ROUTE_ACCESS[route];
    if (!allowedRoles) return false;

    return allowedRoles.includes(state.user.role);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
