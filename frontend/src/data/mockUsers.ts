import { User, ROLE_PERMISSIONS } from '../types/auth';

// Mock users with different roles for testing
export const mockUsers: User[] = [
  // Pastor accounts
  {
    id: 'pastor_1',
    firstName: 'Pastor',
    lastName: 'David',
    email: 'pastor@necf.org',
    phone: '+90533111000',
    role: 'PASTOR',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    permissions: ROLE_PERMISSIONS.PASTOR.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2020-01-01T00:00:00Z'
  },
  {
    id: 'pastor_2',
    firstName: 'Pastor',
    lastName: 'Sarah',
    email: 'sarah.pastor@necf.org',
    phone: '+90533111001',
    role: 'PASTOR',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    permissions: ROLE_PERMISSIONS.PASTOR.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2020-01-01T00:00:00Z'
  },

  // Cell Leader accounts
  {
    id: '1', // John Doe - Gonyeli Cell Leader
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@necf.org',
    phone: '+90533123456',
    role: 'CELL_LEADER',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    teamIds: ['ushering', 'prayer-team'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2020-01-15T00:00:00Z'
  },
  {
    id: '2', // Jane Smith - Merit Cell Leader
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@necf.org',
    phone: '+90533234567',
    role: 'CELL_LEADER',
    cellId: '2',
    cellName: 'Merit Cell',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    teamIds: ['treasury', 'secretariat'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2019-02-20T00:00:00Z'
  },
  {
    id: '3', // Michael Johnson - Yenikent Cell Leader
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.j@necf.org',
    phone: '+90533345678',
    role: 'CELL_LEADER',
    cellId: '3',
    cellName: 'Yenikent Cell',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    teamIds: ['technical', 'media'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2021-03-10T00:00:00Z'
  },
  {
    id: '4', // Sarah Wilson - School Cell Leader
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.w@necf.org',
    phone: '+90533456789',
    role: 'CELL_LEADER',
    cellId: '4',
    cellName: 'School Cell',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    teamIds: ['choir', 'evangelism'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2022-04-05T00:00:00Z'
  },
  {
    id: '5', // David Brown - Küçük Kaymaklı Cell Leader
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.b@necf.org',
    phone: '+90533567890',
    role: 'CELL_LEADER',
    cellId: '5',
    cellName: 'Küçük Kaymaklı Cell',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    teamIds: ['followup', 'prayer-team'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2023-05-12T00:00:00Z'
  },
  {
    id: '12', // Grace Okonkwo - Hamitköy Cell Leader
    firstName: 'Grace',
    lastName: 'Okonkwo',
    email: 'grace.o@necf.org',
    phone: '+90533234512',
    role: 'CELL_LEADER',
    cellId: '6',
    cellName: 'Hamitköy Cell',
    profilePicture: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    teamIds: ['children-ministry', 'followup'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2022-09-14T00:00:00Z'
  },
  {
    id: '7', // James Thompson - Ortaköy Cell Leader
    firstName: 'James',
    lastName: 'Thompson',
    email: 'james.t@necf.org',
    phone: '+90533789012',
    role: 'CELL_LEADER',
    cellId: '7',
    cellName: 'Ortaköy Cell',
    profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    teamIds: ['media', 'evangelism'],
    permissions: ROLE_PERMISSIONS.CELL_LEADER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2023-07-22T00:00:00Z'
  },

  // Regular Member accounts (selected few for testing)
  {
    id: '8', // Maria Garcia - Regular Member
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@email.com',
    phone: '+90533890123',
    role: 'MEMBER',
    cellId: '2',
    cellName: 'Merit Cell',
    profilePicture: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    teamIds: ['choir', 'followup', 'secretariat'],
    permissions: ROLE_PERMISSIONS.MEMBER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2023-08-10T00:00:00Z'
  },
  {
    id: '9', // Kwame Asante - Regular Member
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'kwame.a@email.com',
    phone: '+90533901234',
    role: 'MEMBER',
    cellId: '3',
    cellName: 'Yenikent Cell',
    profilePicture: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face',
    teamIds: ['evangelism', 'ushering'],
    permissions: ROLE_PERMISSIONS.MEMBER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '10', // Priya Sharma - Regular Member
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@email.com',
    phone: '+90533012345',
    role: 'MEMBER',
    cellId: '4',
    cellName: 'School Cell',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    teamIds: ['choir', 'youth-ministry'],
    permissions: ROLE_PERMISSIONS.MEMBER.map(p => ({ action: p.split(':')[0], resource: p.split(':')[1] })),
    createdAt: '2024-03-20T00:00:00Z'
  }
];

// Helper function to get user by email (for login)
export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to get users by role
export const getUsersByRole = (role: User['role']): User[] => {
  return mockUsers.filter(user => user.role === role);
};

// Helper function to get cell leaders
export const getCellLeaders = (): User[] => {
  return getUsersByRole('CELL_LEADER');
};

// Helper function to get pastors
export const getPastors = (): User[] => {
  return getUsersByRole('PASTOR');
};
