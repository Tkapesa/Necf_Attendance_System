import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, memberSchemas } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { MemberController } from '../controllers/MemberController';

const router = Router();
const memberController = new MemberController();

// All member routes require authentication
router.use(authenticate);

// POST /members - Create new member (Admin/Leader only)
router.post('/',
  authorize(['ADMIN', 'LEADER']),
  validate({ body: memberSchemas.createMember }),
  asyncHandler(memberController.createMember.bind(memberController))
);

// GET /members - List all members with filtering and pagination
router.get('/',
  asyncHandler(memberController.getMembers.bind(memberController))
);

// GET /members/:id - Get member by ID
router.get('/:id',
  asyncHandler(memberController.getMemberById.bind(memberController))
);

// PUT /members/:id - Update member (Admin/Leader only)
router.put('/:id',
  authorize(['ADMIN', 'LEADER']),
  validate({ body: memberSchemas.updateMember }),
  asyncHandler(memberController.updateMember.bind(memberController))
);

// DELETE /members/:id - Soft delete member (Admin only)
router.delete('/:id',
  authorize(['ADMIN']),
  asyncHandler(memberController.deleteMember.bind(memberController))
);

export default router;
