// Authentication and user role types

export type UserRole = 'PASTOR' | 'CELL_LEADER' | 'MEMBER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profilePicture?: string;
  // Role-specific data
  cellId?: string; // For cell leaders and members
  cellName?: string;
  teamIds?: string[]; // Teams they lead or belong to
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string, resource: string, data?: any) => boolean;
  canAccess: (route: string) => boolean;
}

// Permission constants
export const PERMISSIONS = {
  // Dashboard access
  VIEW_PASTOR_DASHBOARD: 'view:pastor_dashboard',
  VIEW_CELL_DASHBOARD: 'view:cell_dashboard',
  VIEW_MEMBER_DASHBOARD: 'view:member_dashboard',
  
  // Member management
  CREATE_MEMBER: 'create:member',
  VIEW_ALL_MEMBERS: 'view:all_members',
  VIEW_OWN_CELL_MEMBERS: 'view:own_cell_members',
  UPDATE_MEMBER: 'update:member',
  DELETE_MEMBER: 'delete:member',
  
  // Cell management
  VIEW_ALL_CELLS: 'view:all_cells',
  VIEW_OWN_CELL: 'view:own_cell',
  MANAGE_OWN_CELL: 'manage:own_cell',
  
  // QR Code generation
  GENERATE_QR_CODE: 'generate:qr_code',
  
  // Financial data
  VIEW_FINANCIAL_DATA: 'view:financial_data',
  
  // Analytics
  VIEW_CHURCH_ANALYTICS: 'view:church_analytics',
  VIEW_CELL_ANALYTICS: 'view:cell_analytics',
  
  // Administrative
  MANAGE_USERS: 'manage:users',
  SYSTEM_ADMIN: 'admin:system'
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  PASTOR: [
    PERMISSIONS.VIEW_PASTOR_DASHBOARD,
    PERMISSIONS.VIEW_ALL_MEMBERS,
    PERMISSIONS.CREATE_MEMBER,
    PERMISSIONS.UPDATE_MEMBER,
    PERMISSIONS.DELETE_MEMBER,
    PERMISSIONS.VIEW_ALL_CELLS,
    PERMISSIONS.GENERATE_QR_CODE,
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.VIEW_CHURCH_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_ADMIN
  ],
  CELL_LEADER: [
    PERMISSIONS.VIEW_CELL_DASHBOARD,
    PERMISSIONS.VIEW_OWN_CELL_MEMBERS,
    PERMISSIONS.CREATE_MEMBER,
    PERMISSIONS.UPDATE_MEMBER,
    PERMISSIONS.VIEW_OWN_CELL,
    PERMISSIONS.MANAGE_OWN_CELL,
    PERMISSIONS.GENERATE_QR_CODE,
    PERMISSIONS.VIEW_CELL_ANALYTICS
  ],
  MEMBER: [
    PERMISSIONS.VIEW_MEMBER_DASHBOARD,
    PERMISSIONS.VIEW_OWN_CELL
  ]
};

// Route access mapping
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/': ['PASTOR', 'CELL_LEADER', 'MEMBER'],
  '/dashboard': ['PASTOR'],
  '/cell-dashboard': ['CELL_LEADER'],
  '/member-dashboard': ['MEMBER'],
  '/members': ['PASTOR'],
  '/cells': ['PASTOR'],
  '/teams': ['PASTOR'],
  '/attendance': ['PASTOR', 'CELL_LEADER'],
  '/reports': ['PASTOR'],
  '/settings': ['PASTOR']
};
