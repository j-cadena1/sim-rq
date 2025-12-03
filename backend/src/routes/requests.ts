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
} from '../controllers/requestsController';
import {
  validate,
  createRequestSchema,
  updateStatusSchema,
  assignEngineerSchema,
  addCommentSchema,
} from '../middleware/validation';

const router = Router();

router.get('/', getAllRequests);
router.get('/title-change-requests/pending', getPendingTitleChangeRequests);
router.get('/:id', getRequestById);
router.get('/:id/title-change-requests', getTitleChangeRequestsForRequest);
router.post('/', validate(createRequestSchema), createRequest);
router.patch('/:id/title', updateRequestTitle);
router.post('/:id/title-change-request', requestTitleChange);
router.patch('/title-change-requests/:id/review', reviewTitleChangeRequest);
router.patch('/:id/status', validate(updateStatusSchema), updateRequestStatus);
router.patch('/:id/assign', validate(assignEngineerSchema), assignEngineer);
router.post('/:id/comments', validate(addCommentSchema), addComment);
router.delete('/:id', deleteRequest);
router.get('/:id/time', getTimeEntries);
router.post('/:id/time', addTimeEntry);

export default router;
