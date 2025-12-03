import { Router } from 'express';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestTitle,
  requestTitleChange,
  getPendingTitleChangeRequests,
  getTitleChangeRequestsForRequest,
  reviewTitleChangeRequest,
  updateRequestStatus,
  assignEngineer,
  addComment,
  deleteRequest,
  getTimeEntries,
  addTimeEntry,
  createDiscussionRequest,
  getDiscussionRequestsForRequest,
  reviewDiscussionRequest,
} from '../controllers/requestsController';
import {
  validate,
  createRequestSchema,
  updateStatusSchema,
  assignEngineerSchema,
  addCommentSchema,
} from '../middleware/validation';
import { requireRole } from '../middleware/authorization';

const router = Router();

// Public routes (all authenticated users)
router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.get('/:id/title-change-requests', getTitleChangeRequestsForRequest);
router.get('/:id/time', getTimeEntries);
router.get('/:id/discussion-requests', getDiscussionRequestsForRequest);
router.post('/:id/comments', validate(addCommentSchema), addComment);

// End-User routes (Admin can also access)
router.post('/', validate(createRequestSchema), createRequest);
router.post('/:id/title-change-request', requestTitleChange);

// Engineer routes (Admin can also access)
router.post('/:id/time', requireRole(['Engineer', 'Admin']), addTimeEntry);
router.post('/:id/discussion-request', requireRole(['Engineer', 'Admin']), createDiscussionRequest);

// Manager/Admin routes
router.get('/title-change-requests/pending', requireRole(['Manager', 'Admin']), getPendingTitleChangeRequests);
router.patch('/:id/title', requireRole(['Manager', 'Admin']), updateRequestTitle);
router.patch('/title-change-requests/:id/review', requireRole(['Manager', 'Admin']), reviewTitleChangeRequest);
router.patch('/:id/status', validate(updateStatusSchema), updateRequestStatus); // Status updates based on workflow
router.patch('/:id/assign', requireRole(['Manager', 'Admin']), validate(assignEngineerSchema), assignEngineer);
router.patch('/discussion-requests/:id/review', requireRole(['Manager', 'Admin']), reviewDiscussionRequest);

// Admin/Manager only routes
router.delete('/:id', requireRole(['Admin', 'Manager']), deleteRequest);

export default router;
