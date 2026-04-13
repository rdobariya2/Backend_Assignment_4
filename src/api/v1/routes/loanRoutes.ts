import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
const loanController = new LoanController();

// Health check - no auth required
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all loans - requires authentication, officer/manager/admin can access
router.get('/loans', authenticate, authorize({ roles: ['officer', 'manager', 'admin'] }), loanController.getAllLoans);

// Get loan by ID - requires authentication, officer/manager/admin can access
router.get('/loans/:id', authenticate, authorize({ roles: ['officer', 'manager', 'admin'] }), loanController.getLoanById);

// Create loan - requires authentication, manager/admin can access
router.post('/loans', authenticate, authorize({ roles: ['manager', 'admin'] }), loanController.createLoan);

// Update loan - requires authentication, manager/admin can access
router.put('/loans/:id', authenticate, authorize({ roles: ['manager', 'admin'] }), loanController.updateLoan);

// Delete loan - requires authentication, only admin can access
router.delete('/loans/:id', authenticate, authorize({ roles: ['admin'] }), loanController.deleteLoan);

export default router;