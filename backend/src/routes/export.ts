import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { ExportController } from '../controllers/ExportController';
import { EnhancedExportController } from '../controllers/EnhancedExportController';

const router = Router();
const exportController = new ExportController();
const enhancedExportController = new EnhancedExportController();

// All export routes require authentication and admin/leader privileges
router.use(authenticate);
router.use(authorize(['ADMIN', 'LEADER']));

// GET /export?from=&to=&format= - Enhanced export with specific columns and metadata
router.get('/',
  asyncHandler(enhancedExportController.exportAttendanceData.bind(enhancedExportController))
);

// GET /export/attendance - Export attendance data
router.get('/attendance',
  asyncHandler(exportController.exportAttendance.bind(exportController))
);

// GET /export/members - Export members data
router.get('/members',
  asyncHandler(exportController.exportMembers.bind(exportController))
);

// GET /export/sessions - Export sessions data
router.get('/sessions',
  asyncHandler(exportController.exportSessions.bind(exportController))
);

// GET /export/report - Generate comprehensive report
router.get('/report',
  asyncHandler(exportController.generateReport.bind(exportController))
);

export default router;
