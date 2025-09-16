import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export const auditLogger = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip audit logging for certain routes
  const skipRoutes = ['/health', '/api/status'];
  if (skipRoutes.some(route => req.path.includes(route))) {
    return next();
  }

  // Capture request data
  const auditData = {
    userId: req.user?.id || null,
    action: getActionFromMethod(req.method, req.path),
    entityType: getEntityTypeFromPath(req.path),
    entityId: req.params.id || req.params.memberId || null,
    metadata: {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      origin: req.get('Origin'),
      requestId: req.get('X-Request-ID') || generateRequestId(),
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  };

  // Log after response is sent
  res.on('finish', async () => {
    try {
      // Only log successful operations and errors
      if (res.statusCode < 400 || res.statusCode >= 500) {
        await prisma.auditLog.create({
          data: {
            userId: auditData.userId,
            action: auditData.action,
            entity: auditData.entityType, // Use entityType as entity
            entityType: auditData.entityType,
            entityId: auditData.entityId,
            metadata: auditData.metadata,
            ipAddress: auditData.ipAddress,
            userAgent: auditData.userAgent,
            severity: res.statusCode >= 500 ? 'ERROR' : 'INFO',
            // description: `${req.method} ${req.path} - ${res.statusCode}`,
          },
        });
      }
    } catch (error) {
      // Don't fail the request if audit logging fails
      console.error('Audit logging failed:', error);
    }
  });

  next();
};

function getActionFromMethod(method: string, path: string): string {
  if (path.includes('/login')) return 'LOGIN';
  if (path.includes('/logout')) return 'LOGOUT';
  if (path.includes('/scan')) return 'CHECK_IN';
  
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    case 'GET': return 'READ';
    default: return 'UNKNOWN';
  }
}

function getEntityTypeFromPath(path: string): string {
  if (path.includes('/members')) return 'MEMBER';
  if (path.includes('/attendance')) return 'ATTENDANCE';
  if (path.includes('/sessions')) return 'SESSION';
  if (path.includes('/qr')) return 'QR_TOKEN';
  if (path.includes('/auth')) return 'AUTH';
  if (path.includes('/dashboard')) return 'DASHBOARD';
  if (path.includes('/export')) return 'EXPORT';
  return 'UNKNOWN';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
