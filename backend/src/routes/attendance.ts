import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, attendanceSchemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { AttendanceController } from '../controllers/AttendanceController';

const router = Router();
const attendanceController = new AttendanceController();

// All attendance routes require authentication
router.use(authenticate);

// POST /scan - Record attendance via QR code scan
router.post('/scan',
  validate({ body: attendanceSchemas.scan }),
  asyncHandler(attendanceController.scanQRCode.bind(attendanceController))
);

// POST /attendance/manual - Record manual attendance (Admin/Leader only)
router.post('/manual',
  authorize(['ADMIN', 'LEADER']),
  validate({ body: attendanceSchemas.manual }),
  asyncHandler(attendanceController.recordManualAttendance.bind(attendanceController))
);

// GET /attendance - Get attendance records with filtering
router.get('/',
  asyncHandler(attendanceController.getAttendanceRecords.bind(attendanceController))
);

// GET /attendance/session/:sessionId - Get attendance for specific session
router.get('/session/:sessionId',
  asyncHandler(attendanceController.getSessionAttendance.bind(attendanceController))
);

// PUT /attendance/:id - Update attendance record (Admin/Leader only)
router.put('/:id',
  authorize(['ADMIN', 'LEADER']),
  validate({ body: attendanceSchemas.update }),
  asyncHandler(attendanceController.updateAttendance.bind(attendanceController))
);

// DELETE /attendance/:id - Delete attendance record (Admin only)
router.delete('/:id',
  authorize(['ADMIN']),
  asyncHandler(attendanceController.deleteAttendance.bind(attendanceController))
);

export default router;
