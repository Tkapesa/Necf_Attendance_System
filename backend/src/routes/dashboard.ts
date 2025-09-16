import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authenticate);

// GET /dashboard/summary - Get dashboard summary statistics
router.get('/summary',
  asyncHandler(dashboardController.getDashboardSummary.bind(dashboardController))
);

// GET /dashboard/analytics - Get detailed analytics (Admin/Leader only)
router.get('/analytics',
  authorize(['ADMIN', 'LEADER']),
  asyncHandler(dashboardController.getAnalytics.bind(dashboardController))
);

// GET /dashboard/member/:memberId - Get member-specific dashboard
router.get('/member/:memberId',
  asyncHandler(dashboardController.getMemberDashboard.bind(dashboardController))
);

export default router;
