import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, authSchemas } from '../middleware/validation';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// POST /auth/login
router.post('/login', 
  validate({ body: authSchemas.login }),
  asyncHandler(authController.login.bind(authController))
);

// POST /auth/register (Admin only)
router.post('/register',
  validate({ body: authSchemas.register }),
  asyncHandler(authController.register.bind(authController))
);

// POST /auth/logout
router.post('/logout',
  asyncHandler(authController.logout.bind(authController))
);

// POST /auth/refresh
router.post('/refresh',
  asyncHandler(authController.refreshToken.bind(authController))
);

// GET /auth/profile (requires authentication)
router.get('/profile',
  asyncHandler(authController.getProfile.bind(authController))
);

// PUT /auth/profile (requires authentication)
router.put('/profile',
  asyncHandler(authController.updateProfile.bind(authController))
);

// POST /auth/change-password (requires authentication)
router.post('/change-password',
  validate({ body: authSchemas.changePassword }),
  asyncHandler(authController.changePassword.bind(authController))
);

export default router;
