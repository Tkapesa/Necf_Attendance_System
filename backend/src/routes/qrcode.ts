import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, qrSchemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { QRController } from '../controllers/QRController';

const router = Router();
const qrController = new QRController();

// All QR routes require authentication
router.use(authenticate);

// GET /qrcode/:memberId - Generate QR code for member (Admin/Leader only)
router.get('/:memberId',
  authorize(['ADMIN', 'LEADER']),
  asyncHandler(qrController.generateQRCode.bind(qrController))
);

// POST /qrcode/batch - Generate QR codes for multiple members (Admin/Leader only)
router.post('/batch',
  authorize(['ADMIN', 'LEADER']),
  validate({ body: qrSchemas.batchGenerate }),
  asyncHandler(qrController.generateBatchQRCodes.bind(qrController))
);

// GET /qrcode/member/:memberId/active - Get active QR codes for member
router.get('/member/:memberId/active',
  asyncHandler(qrController.getActiveQRCodes.bind(qrController))
);

// POST /qrcode/validate - Validate QR code token
router.post('/validate',
  validate({ body: qrSchemas.validate }),
  asyncHandler(qrController.validateQRCode.bind(qrController))
);

// DELETE /qrcode/:tokenId - Revoke QR code (Admin/Leader only)
router.delete('/:tokenId',
  authorize(['ADMIN', 'LEADER']),
  asyncHandler(qrController.revokeQRCode.bind(qrController))
);

// GET /qrcode/stats - Get QR code statistics (Admin/Leader only)
router.get('/stats',
  authorize(['ADMIN', 'LEADER']),
  asyncHandler(qrController.getQRCodeStats.bind(qrController))
);

export default router;
