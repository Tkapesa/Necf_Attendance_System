// Mock data for the Church Attendance System

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipId: string;
  cellId?: string;
  cellName?: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  profilePicture?: string;
  teams?: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  isActive: boolean;
  category: 'WORSHIP' | 'ADMINISTRATION' | 'OUTREACH' | 'TECHNICAL' | 'PASTORAL';
  color: string;
}

export interface Cell {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  capacity?: number;
  location?: string;
  meetingDay?: string;
  meetingTime?: string;
  isActive: boolean;
  recentAttendance: number;
  attendancePercentage: number;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  sessionId: string;
  sessionTitle: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  checkInTime?: string;
  date: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalSessions: number;
  todayAttendance: number;
  weeklyTrend: Array<{
    day: string;
    attendance: number;
    date: string;
  }>;
}

// Mock Members - Expanded realistic NECF membership data
export const mockMembers: Member[] = [
  // Leadership Team
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@necf.org',
    phone: '+90533123456',
    membershipId: 'M001',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    joinDate: '2020-01-15',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    teams: ['ushering', 'prayer-team']
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@necf.org',
    phone: '+90533234567',
    membershipId: 'M002',
    cellId: '2',
    cellName: 'Merit Cell',
    joinDate: '2019-02-20',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    teams: ['treasury', 'secretariat']
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.j@necf.org',
    phone: '+90533345678',
    membershipId: 'M003',
    cellId: '3',
    cellName: 'Yenikent Cell',
    joinDate: '2021-03-10',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    teams: ['technical', 'media']
  },
  
  // Regular Members - Gonyeli Cell
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.w@email.com',
    phone: '+90533456789',
    membershipId: 'M004',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    joinDate: '2022-04-05',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    teams: ['choir', 'evangelism']
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.b@email.com',
    phone: '+90533567890',
    membershipId: 'M005',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    joinDate: '2023-05-12',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    teams: ['followup', 'prayer-team']
  },
  
  // Merit Cell Members
  {
    id: '6',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.d@email.com',
    phone: '+90533678901',
    membershipId: 'M006',
    cellId: '2',
    cellName: 'Merit Cell',
    joinDate: '2023-06-18',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    teams: ['ushering', 'technical']
  },
  {
    id: '7',
    firstName: 'James',
    lastName: 'Thompson',
    email: 'james.t@email.com',
    phone: '+90533789012',
    membershipId: 'M007',
    cellId: '2',
    cellName: 'Merit Cell',
    joinDate: '2023-07-22',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    teams: ['media', 'evangelism']
  },
  {
    id: '8',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@email.com',
    phone: '+90533890123',
    membershipId: 'M008',
    cellId: '2',
    cellName: 'Merit Cell',
    joinDate: '2023-08-10',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    teams: ['choir', 'followup', 'secretariat']
  },
  
  // More Diverse Members
  {
    id: '9',
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'kwame.a@email.com',
    phone: '+90533901234',
    membershipId: 'M009',
    cellId: '3',
    cellName: 'Yenikent Cell',
    joinDate: '2024-01-15',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face',
    teams: ['evangelism', 'ushering']
  },
  {
    id: '10',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@email.com',
    phone: '+90533012345',
    membershipId: 'M010',
    cellId: '4',
    cellName: 'School Cell',
    joinDate: '2024-03-20',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    teams: ['choir', 'youth-ministry']
  },
  {
    id: '11',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.h@email.com',
    phone: '+90533123401',
    membershipId: 'M011',
    cellId: '5',
    cellName: 'Küçük Kaymaklı Cell',
    joinDate: '2023-11-08',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
    teams: ['technical', 'prayer-team']
  },
  {
    id: '12',
    firstName: 'Grace',
    lastName: 'Okonkwo',
    email: 'grace.o@email.com',
    phone: '+90533234512',
    membershipId: 'M012',
    cellId: '6',
    cellName: 'Hamitköy Cell',
    joinDate: '2022-09-14',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    teams: ['children-ministry', 'followup']
  },
  {
    id: '13',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.c@email.com',
    phone: '+90533345623',
    membershipId: 'M013',
    cellId: '7',
    cellName: 'Ortaköy Cell',
    joinDate: '2021-12-03',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    teams: ['media', 'technical']
  },
  {
    id: '14',
    firstName: 'Fatima',
    lastName: 'Al-Hassan',
    email: 'fatima.a@email.com',
    phone: '+90533456734',
    membershipId: 'M014',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    joinDate: '2024-02-18',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=150&h=150&fit=crop&crop=face',
    teams: ['secretariat', 'women-ministry']
  },
  {
    id: '15',
    firstName: 'Emmanuel',
    lastName: 'Kalu',
    email: 'emmanuel.k@email.com',
    phone: '+90533567845',
    membershipId: 'M015',
    cellId: '3',
    cellName: 'Yenikent Cell',
    joinDate: '2023-07-25',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    teams: ['evangelism', 'men-ministry']
  },
  
  // Some inactive/irregular members for realistic data
  {
    id: '16',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.a@email.com',
    phone: '+90533678956',
    membershipId: 'M016',
    cellId: '4',
    cellName: 'School Cell',
    joinDate: '2023-04-12',
    status: 'INACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1488508872907-592763824245?w=150&h=150&fit=crop&crop=face',
    teams: ['choir']
  },
  {
    id: '17',
    firstName: 'Marcus',
    lastName: 'Williams',
    email: 'marcus.w@email.com',
    phone: '+90533789067',
    membershipId: 'M017',
    cellId: '5',
    cellName: 'Küçük Kaymaklı Cell',
    joinDate: '2024-01-09',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    teams: ['youth-ministry', 'sports']
  },
  {
    id: '18',
    firstName: 'Aisha',
    lastName: 'Mohamed',
    email: 'aisha.m@email.com',
    phone: '+90533890178',
    membershipId: 'M018',
    cellId: '6',
    cellName: 'Hamitköy Cell',
    joinDate: '2023-10-15',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1533973427779-4b8c2eb4c3d2?w=150&h=150&fit=crop&crop=face',
    teams: ['women-ministry', 'prayer-team']
  },
  {
    id: '19',
    firstName: 'Stephen',
    lastName: 'Okafor',
    email: 'stephen.o@email.com',
    phone: '+90533901289',
    membershipId: 'M019',
    cellId: '7',
    cellName: 'Ortaköy Cell',
    joinDate: '2022-08-20',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    teams: ['treasury', 'men-ministry']
  },
  {
    id: '20',
    firstName: 'Ruth',
    lastName: 'Nkomo',
    email: 'ruth.n@email.com',
    phone: '+90533012390',
    membershipId: 'M020',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    joinDate: '2024-05-03',
    status: 'ACTIVE',
    profilePicture: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    teams: ['children-ministry', 'ushering']
  }
];

// Mock Teams - Church Ministry Teams
export const mockTeams: Team[] = [
  {
    id: 'ushering',
    name: 'Ushering Team',
    description: 'Welcome and guide congregation members during services',
    leaderId: '1',
    leaderName: 'John Doe',
    memberCount: 12,
    isActive: true,
    category: 'WORSHIP',
    color: '#3B82F6'
  },
  {
    id: 'treasury',
    name: 'Treasury Team',
    description: 'Manage church finances and accounting',
    leaderId: '2',
    leaderName: 'Jane Smith',
    memberCount: 5,
    isActive: true,
    category: 'ADMINISTRATION',
    color: '#10B981'
  },
  {
    id: 'prayer-team',
    name: 'Prayer Team',
    description: 'Coordinate prayer sessions and intercession ministry',
    leaderId: '5',
    leaderName: 'David Brown',
    memberCount: 15,
    isActive: true,
    category: 'PASTORAL',
    color: '#8B5CF6'
  },
  {
    id: 'evangelism',
    name: 'Evangelism Team',
    description: 'Outreach and soul winning activities',
    leaderId: '4',
    leaderName: 'Sarah Wilson',
    memberCount: 18,
    isActive: true,
    category: 'OUTREACH',
    color: '#F59E0B'
  },
  {
    id: 'followup',
    name: 'Follow-up Team',
    description: 'New member integration and discipleship',
    leaderId: '8',
    leaderName: 'Maria Garcia',
    memberCount: 8,
    isActive: true,
    category: 'PASTORAL',
    color: '#EF4444'
  },
  {
    id: 'secretariat',
    name: 'Secretariat Team',
    description: 'Administrative support and documentation',
    leaderId: '2',
    leaderName: 'Jane Smith',
    memberCount: 6,
    isActive: true,
    category: 'ADMINISTRATION',
    color: '#6366F1'
  },
  {
    id: 'choir',
    name: 'Choir Team',
    description: 'Lead worship through music and songs',
    leaderId: '4',
    leaderName: 'Sarah Wilson',
    memberCount: 25,
    isActive: true,
    category: 'WORSHIP',
    color: '#EC4899'
  },
  {
    id: 'technical',
    name: 'Technical Team',
    description: 'Sound, lighting, and technical equipment management',
    leaderId: '3',
    leaderName: 'Michael Johnson',
    memberCount: 7,
    isActive: true,
    category: 'TECHNICAL',
    color: '#14B8A6'
  },
  {
    id: 'media',
    name: 'Media Team',
    description: 'Photography, videography, and social media management',
    leaderId: '7',
    leaderName: 'James Thompson',
    memberCount: 9,
    isActive: true,
    category: 'TECHNICAL',
    color: '#F97316'
  }
];

// Mock Cells - Updated with realistic member counts based on expanded data
export const mockCells: Cell[] = [
  {
    id: '1',
    name: 'Gonyeli Cell',
    description: 'Cell group meeting in Gonyeli area - Growing multicultural community',
    leaderId: '1',
    leaderName: 'John Doe',
    memberCount: 24,
    capacity: 30,
    location: 'Gonyeli Community Center',
    meetingDay: 'Wednesday',
    meetingTime: '7:00 PM',
    isActive: true,
    recentAttendance: 22,
    attendancePercentage: 92
  },
  {
    id: '2',
    name: 'Merit Cell',
    description: 'Cell group meeting in Merit area - Strong in discipleship and leadership',
    leaderId: '2',
    leaderName: 'Jane Smith',
    memberCount: 28,
    capacity: 35,
    location: 'Merit Fellowship Hall',
    meetingDay: 'Tuesday',
    meetingTime: '7:30 PM',
    isActive: true,
    recentAttendance: 25,
    attendancePercentage: 89
  },
  {
    id: '3',
    name: 'Yenikent Cell',
    description: 'Cell group meeting in Yenikent area - Focus on young families',
    leaderId: '3',
    leaderName: 'Michael Johnson',
    memberCount: 22,
    capacity: 25,
    location: 'Yenikent Community Hall',
    meetingDay: 'Thursday',
    meetingTime: '7:00 PM',
    isActive: true,
    recentAttendance: 18,
    attendancePercentage: 82
  },
  {
    id: '4',
    name: 'School Cell',
    description: 'Cell group for school community members - Youth and student focused',
    leaderId: '4',
    leaderName: 'Sarah Wilson',
    memberCount: 19,
    capacity: 25,
    location: 'School Multipurpose Room',
    meetingDay: 'Friday',
    meetingTime: '6:30 PM',
    isActive: true,
    recentAttendance: 16,
    attendancePercentage: 84
  },
  {
    id: '5',
    name: 'Küçük Kaymaklı Cell',
    description: 'Cell group meeting in Küçük Kaymaklı area - Diverse international community',
    leaderId: '5',
    leaderName: 'David Brown',
    memberCount: 21,
    capacity: 25,
    location: 'Küçük Kaymaklı Community Center',
    meetingDay: 'Wednesday',
    meetingTime: '7:30 PM',
    isActive: true,
    recentAttendance: 19,
    attendancePercentage: 90
  },
  {
    id: '6',
    name: 'Hamitköy Cell',
    description: 'Cell group meeting in Hamitköy area - Women\'s ministry focus',
    leaderId: '12',
    leaderName: 'Grace Okonkwo',
    memberCount: 18,
    capacity: 22,
    location: 'Hamitköy Fellowship Center',
    meetingDay: 'Thursday',
    meetingTime: '7:00 PM',
    isActive: true,
    recentAttendance: 16,
    attendancePercentage: 89
  },
  {
    id: '7',
    name: 'Ortaköy Cell',
    description: 'Cell group meeting in Ortaköy area - Professional and business focus',
    leaderId: '7',
    leaderName: 'James Thompson',
    memberCount: 20,
    capacity: 25,
    location: 'Ortaköy Meeting Hall',
    meetingDay: 'Tuesday',
    meetingTime: '7:30 PM',
    isActive: true,
    recentAttendance: 17,
    attendancePercentage: 85
  }
];

// Mock Dashboard Stats - Enhanced with more realistic NECF data
export const mockDashboardStats: DashboardStats = {
  totalMembers: 847,
  activeMembers: 723,
  totalSessions: 156,
  todayAttendance: 412,
  weeklyTrend: [
    { day: 'Mon', attendance: 89, date: '2025-09-10' },
    { day: 'Tue', attendance: 156, date: '2025-09-11' },
    { day: 'Wed', attendance: 234, date: '2025-09-12' },
    { day: 'Thu', attendance: 187, date: '2025-09-13' },
    { day: 'Fri', attendance: 98, date: '2025-09-14' },
    { day: 'Sat', attendance: 145, date: '2025-09-15' },
    { day: 'Sun', attendance: 567, date: '2025-09-16' }
  ]
};

// Additional Mock Data for Pastor Dashboard
export interface PastoralCareAlert {
  id: string;
  memberId: string;
  memberName: string;
  type: 'ATTENDANCE_DROP' | 'LONG_ABSENCE' | 'FAMILY_CRISIS' | 'HEALTH_ISSUE' | 'FINANCIAL_NEED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  lastContact?: string;
  assignedTo?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdDate: string;
  dueDate?: string;
}

export interface LeadershipMetric {
  id: string;
  leaderId: string;
  leaderName: string;
  role: string;
  cellId?: string;
  cellName?: string;
  performanceScore: number;
  membersLed: number;
  attendanceRate: number;
  growthRate: number;
  lastTraining?: string;
  needsSupport: boolean;
  strengths: string[];
  developmentAreas: string[];
}

export interface MinistryProgram {
  id: string;
  name: string;
  type: 'CELL_GROUP' | 'YOUTH' | 'CHILDREN' | 'EVANGELISM' | 'WORSHIP' | 'PRAYER' | 'TRAINING';
  leaderId: string;
  leaderName: string;
  participants: number;
  averageAttendance: number;
  growthRate: number;
  budget: number;
  effectiveness: number;
  lastReview: string;
  status: 'ACTIVE' | 'PLANNING' | 'ON_HOLD' | 'COMPLETED';
}

export interface VisitorTracking {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  firstVisit: string;
  totalVisits: number;
  lastVisit: string;
  source: 'WALK_IN' | 'INVITATION' | 'ONLINE' | 'EVENT' | 'CELL_GROUP';
  followUpStatus: 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'INTEGRATED' | 'NO_RESPONSE';
  assignedTo?: string;
  interests: string[];
  notes: string;
}

// Mock Pastoral Care Alerts
export const mockPastoralAlerts: PastoralCareAlert[] = [
  {
    id: 'PC001',
    memberId: '15',
    memberName: 'Robert Chen',
    type: 'ATTENDANCE_DROP',
    priority: 'MEDIUM',
    description: 'Attendance dropped from 90% to 45% over the last month',
    lastContact: '2025-09-10',
    assignedTo: 'Pastor David',
    status: 'NEW',
    createdDate: '2025-09-15',
    dueDate: '2025-09-20'
  },
  {
    id: 'PC002',
    memberId: '23',
    memberName: 'Grace Okonkwo',
    type: 'FAMILY_CRISIS',
    priority: 'HIGH',
    description: 'Recently divorced, struggling with custody issues',
    lastContact: '2025-09-12',
    assignedTo: 'Pastor Sarah',
    status: 'IN_PROGRESS',
    createdDate: '2025-09-08',
    dueDate: '2025-09-18'
  },
  {
    id: 'PC003',
    memberId: '31',
    memberName: 'Emmanuel Kalu',
    type: 'HEALTH_ISSUE',
    priority: 'URGENT',
    description: 'Hospitalized with serious illness, family needs prayer support',
    lastContact: '2025-09-14',
    assignedTo: 'Pastor John',
    status: 'IN_PROGRESS',
    createdDate: '2025-09-13',
    dueDate: '2025-09-17'
  },
  {
    id: 'PC004',
    memberId: '19',
    memberName: 'Fatima Al-Hassan',
    type: 'LONG_ABSENCE',
    priority: 'MEDIUM',
    description: 'Hasn\'t attended any service in the last 3 weeks',
    lastContact: '2025-08-28',
    assignedTo: 'Cell Leader Mary',
    status: 'NEW',
    createdDate: '2025-09-16',
    dueDate: '2025-09-22'
  },
  {
    id: 'PC005',
    memberId: '42',
    memberName: 'Ahmed Yusuf',
    type: 'FINANCIAL_NEED',
    priority: 'HIGH',
    description: 'Lost job, struggling to pay rent and feed family',
    lastContact: '2025-09-11',
    assignedTo: 'Benevolence Team',
    status: 'IN_PROGRESS',
    createdDate: '2025-09-09',
    dueDate: '2025-09-19'
  }
];

// Mock Leadership Metrics
export const mockLeadershipMetrics: LeadershipMetric[] = [
  {
    id: 'L001',
    leaderId: '1',
    leaderName: 'John Doe',
    role: 'Cell Leader',
    cellId: '1',
    cellName: 'Gonyeli Cell',
    performanceScore: 85,
    membersLed: 18,
    attendanceRate: 83,
    growthRate: 12,
    lastTraining: '2025-08-15',
    needsSupport: false,
    strengths: ['Teaching', 'Pastoral Care', 'Leadership'],
    developmentAreas: ['Evangelism', 'Time Management']
  },
  {
    id: 'L002',
    leaderId: '2',
    leaderName: 'Jane Smith',
    role: 'Cell Leader',
    cellId: '2',
    cellName: 'Merit Cell',
    performanceScore: 92,
    membersLed: 22,
    attendanceRate: 86,
    growthRate: 18,
    lastTraining: '2025-08-15',
    needsSupport: false,
    strengths: ['Organization', 'Discipleship', 'Communication'],
    developmentAreas: ['Conflict Resolution']
  },
  {
    id: 'L003',
    leaderId: '8',
    leaderName: 'Maria Garcia',
    role: 'Youth Leader',
    cellId: undefined,
    cellName: undefined,
    performanceScore: 78,
    membersLed: 35,
    attendanceRate: 74,
    growthRate: 8,
    lastTraining: '2025-07-20',
    needsSupport: true,
    strengths: ['Creativity', 'Energy', 'Relatability'],
    developmentAreas: ['Structure', 'Discipline', 'Leadership Training']
  },
  {
    id: 'L004',
    leaderId: '5',
    leaderName: 'David Brown',
    role: 'Prayer Coordinator',
    cellId: undefined,
    cellName: undefined,
    performanceScore: 88,
    membersLed: 15,
    attendanceRate: 91,
    growthRate: 15,
    lastTraining: '2025-08-01',
    needsSupport: false,
    strengths: ['Spiritual Maturity', 'Intercession', 'Mentoring'],
    developmentAreas: ['Technology', 'Administration']
  }
];

// Mock Ministry Programs
export const mockMinistryPrograms: MinistryProgram[] = [
  {
    id: 'MP001',
    name: 'Adult Sunday School',
    type: 'TRAINING',
    leaderId: '12',
    leaderName: 'Pastor Michael',
    participants: 89,
    averageAttendance: 76,
    growthRate: 15,
    budget: 2500,
    effectiveness: 88,
    lastReview: '2025-09-01',
    status: 'ACTIVE'
  },
  {
    id: 'MP002',
    name: 'Youth Ministry',
    type: 'YOUTH',
    leaderId: '8',
    leaderName: 'Maria Garcia',
    participants: 45,
    averageAttendance: 33,
    growthRate: 8,
    budget: 1800,
    effectiveness: 72,
    lastReview: '2025-08-25',
    status: 'ACTIVE'
  },
  {
    id: 'MP003',
    name: 'Children Church',
    type: 'CHILDREN',
    leaderId: '18',
    leaderName: 'Sister Grace',
    participants: 67,
    averageAttendance: 59,
    growthRate: 22,
    budget: 1200,
    effectiveness: 95,
    lastReview: '2025-09-08',
    status: 'ACTIVE'
  },
  {
    id: 'MP004',
    name: 'Street Evangelism',
    type: 'EVANGELISM',
    leaderId: '4',
    leaderName: 'Sarah Wilson',
    participants: 28,
    averageAttendance: 24,
    growthRate: -5,
    budget: 800,
    effectiveness: 65,
    lastReview: '2025-08-30',
    status: 'ACTIVE'
  },
  {
    id: 'MP005',
    name: 'Prayer Mountain',
    type: 'PRAYER',
    leaderId: '5',
    leaderName: 'David Brown',
    participants: 42,
    averageAttendance: 38,
    growthRate: 18,
    budget: 500,
    effectiveness: 92,
    lastReview: '2025-09-05',
    status: 'ACTIVE'
  }
];

// Mock Visitor Tracking
export const mockVisitors: VisitorTracking[] = [
  {
    id: 'V001',
    firstName: 'Kwame',
    lastName: 'Asante',
    phone: '+90533123789',
    email: 'kwame.asante@email.com',
    firstVisit: '2025-09-08',
    totalVisits: 3,
    lastVisit: '2025-09-15',
    source: 'INVITATION',
    followUpStatus: 'CONTACTED',
    assignedTo: 'John Doe',
    interests: ['Bible Study', 'Cell Group'],
    notes: 'Very interested in joining cell group. Showed up early for service.'
  },
  {
    id: 'V002',
    firstName: 'Priya',
    lastName: 'Sharma',
    phone: '+90533234890',
    email: 'priya.s@email.com',
    firstVisit: '2025-09-01',
    totalVisits: 2,
    lastVisit: '2025-09-15',
    source: 'ONLINE',
    followUpStatus: 'SCHEDULED',
    assignedTo: 'Jane Smith',
    interests: ['Youth Ministry', 'Worship Team'],
    notes: 'Young professional, interested in serving. Has musical background.'
  },
  {
    id: 'V003',
    firstName: 'Marcus',
    lastName: 'Johnson',
    phone: '+90533345901',
    firstVisit: '2025-09-15',
    totalVisits: 1,
    lastVisit: '2025-09-15',
    source: 'WALK_IN',
    followUpStatus: 'PENDING',
    interests: ['General Information'],
    notes: 'First time visitor, seemed interested but left quickly after service.'
  },
  {
    id: 'V004',
    firstName: 'Aisha',
    lastName: 'Mohamed',
    phone: '+90533456012',
    email: 'aisha.m@email.com',
    firstVisit: '2025-08-25',
    totalVisits: 4,
    lastVisit: '2025-09-15',
    source: 'CELL_GROUP',
    followUpStatus: 'INTEGRATED',
    assignedTo: 'Maria Garcia',
    interests: ['Women\'s Ministry', 'Prayer Team'],
    notes: 'Regular attendee now, considering membership. Very engaged in activities.'
  },
  {
    id: 'V005',
    firstName: 'James',
    lastName: 'Okafor',
    phone: '+90533567123',
    firstVisit: '2025-09-12',
    totalVisits: 1,
    lastVisit: '2025-09-12',
    source: 'EVENT',
    followUpStatus: 'NO_RESPONSE',
    assignedTo: 'David Brown',
    interests: ['Men\'s Fellowship'],
    notes: 'Attended special event, hasn\'t responded to follow-up calls.'
  }
];

// Mock Financial Data (for correlation with attendance)
export interface FinancialMetric {
  id: string;
  date: string;
  offerings: number;
  tithe: number;
  specialOffering: number;
  attendance: number;
  perPersonGiving: number;
}

export const mockFinancialMetrics: FinancialMetric[] = [
  {
    id: 'F001',
    date: '2025-09-01',
    offerings: 45000,
    tithe: 125000,
    specialOffering: 15000,
    attendance: 456,
    perPersonGiving: 405.26
  },
  {
    id: 'F002',
    date: '2025-09-08',
    offerings: 38000,
    tithe: 118000,
    specialOffering: 8000,
    attendance: 423,
    perPersonGiving: 387.47
  },
  {
    id: 'F003',
    date: '2025-09-15',
    offerings: 52000,
    tithe: 135000,
    specialOffering: 22000,
    attendance: 478,
    perPersonGiving: 437.24
  }
];

// Generate random realistic data for charts
export const generateWeeklyTrendData = (weeks: number = 12) => {
  const data = [];
  const today = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));
    
    // Generate realistic attendance with seasonal variations
    const baseAttendance = 450;
    const seasonalVariation = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 50;
    const randomVariation = (Math.random() - 0.5) * 100;
    const attendance = Math.round(baseAttendance + seasonalVariation + randomVariation);
    
    data.push({
      week: `Week ${weeks - i}`,
      date: date.toISOString().split('T')[0],
      attendance: Math.max(250, attendance), // Minimum 250 attendance
      offerings: Math.round(attendance * (350 + Math.random() * 100)), // 350-450 per person
      newVisitors: Math.round(Math.random() * 15 + 5) // 5-20 new visitors per week
    });
  }
  
  return data;
};

export const mockTrendData = generateWeeklyTrendData();

// Mock Attendance Records
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    memberId: '1',
    memberName: 'John Doe',
    sessionId: 'S001',
    sessionTitle: 'Sunday Service',
    status: 'PRESENT',
    checkInTime: '2024-01-14T09:15:00Z',
    date: '2024-01-14'
  },
  {
    id: '2',
    memberId: '2',
    memberName: 'Jane Smith',
    sessionId: 'S001',
    sessionTitle: 'Sunday Service',
    status: 'PRESENT',
    checkInTime: '2024-01-14T09:20:00Z',
    date: '2024-01-14'
  },
  {
    id: '3',
    memberId: '3',
    memberName: 'Michael Johnson',
    sessionId: 'S001',
    sessionTitle: 'Sunday Service',
    status: 'LATE',
    checkInTime: '2024-01-14T09:45:00Z',
    date: '2024-01-14'
  }
];

// QR Token validation function
export const validateQRToken = async (token: string): Promise<{
  valid: boolean;
  member?: Member;
  error?: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation logic
  const member = mockMembers.find(m => m.membershipId === token.split('-')[0]);
  
  if (member) {
    return { valid: true, member };
  } else {
    return { valid: false, error: 'Invalid QR code or member not found' };
  }
};

// Generate QR data for member
export const generateMemberQRData = (member: Member): string => {
  return `${member.membershipId}-${member.firstName}-${member.lastName}-${Date.now()}`;
};
