import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createError } from './errorHandler';

export const validate = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate request params
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      // Validate request query
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }

      next();
    } catch (error) {
      next(error); // Will be handled by error handler middleware
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  // Phone validation
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  
  // Date validation
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  // Pagination
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default(() => 1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(() => 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// Auth validation schemas
export const authSchemas = {
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
  
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: commonSchemas.phone,
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
  }),
};

// Member validation schemas
export const memberSchemas = {
  createMember: z.object({
    email: commonSchemas.email.optional(),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: commonSchemas.phone,
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    zipCode: z.string().max(20).optional(),
    cellId: z.string().uuid().optional(),
    membershipStatus: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED']).optional(),
    joinDate: z.string().optional(),
  }),
  
  updateMember: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone,
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    zipCode: z.string().max(20).optional(),
    cellId: z.string().uuid().optional(),
    membershipStatus: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED']).optional(),
  }),
  
  params: z.object({
    id: commonSchemas.uuid,
  }),
  
  query: z.object({
    search: z.string().optional(),
    cellId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED']).optional(),
    ...commonSchemas.pagination.shape,
  }),
};

// Attendance validation schemas
export const attendanceSchemas = {
  scan: z.object({
    token: z.string().min(1, 'QR token is required'),
    sessionId: commonSchemas.uuid,
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }),
  
  manual: z.object({
    memberId: commonSchemas.uuid,
    sessionId: commonSchemas.uuid,
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    notes: z.string().optional(),
  }),

  update: z.object({
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
    notes: z.string().optional(),
  }),
  
  query: z.object({
    sessionId: commonSchemas.uuid.optional(),
    memberId: commonSchemas.uuid.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
    ...commonSchemas.pagination.shape,
  }),
};

// QR Code validation schemas
export const qrSchemas = {
  batchGenerate: z.object({
    memberIds: z.array(commonSchemas.uuid),
    expirationHours: z.number().positive().optional(),
  }),

  validate: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
};

// Session validation schemas
export const sessionSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    sessionType: z.enum([
      'SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING', 
      'BIBLE_STUDY', 'YOUTH_SERVICE', 'CONFERENCE', 
      'WORKSHOP', 'SPECIAL_EVENT', 'OTHER'
    ]),
    startTime: z.string().transform((date: string) => new Date(date)),
    endTime: z.string().transform((date: string) => new Date(date)).optional(),
    location: z.string().max(200).optional(),
    capacity: z.number().positive().optional(),
    cellId: z.number().optional(),
    teamId: z.number().optional(),
  }),
  
  params: z.object({
    id: commonSchemas.uuid,
  }),
  
  query: z.object({
    type: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    upcoming: z.enum(['true', 'false']).optional(),
    ...commonSchemas.pagination.shape,
  }),
};

// Export validation schemas
export const exportSchemas = {
  query: z.object({
    type: z.enum(['attendance', 'members', 'sessions']),
    format: z.enum(['csv', 'excel', 'pdf']).default('csv'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sessionId: commonSchemas.uuid.optional(),
    memberId: commonSchemas.uuid.optional(),
  }),
};
