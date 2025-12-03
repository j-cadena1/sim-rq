import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectName,
  updateProjectStatus,
  updateProjectHours,
  deleteProject
} from '../controllers/projectsController';
import { requireRole } from '../middleware/authorization';

const router = express.Router();

// Public routes (all authenticated users can view)
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Manager/Admin only routes
router.post('/', requireRole(['Manager', 'Admin']), createProject);
router.patch('/:id/name', requireRole(['Manager', 'Admin']), updateProjectName);
router.patch('/:id/status', requireRole(['Manager', 'Admin']), updateProjectStatus);
router.patch('/:id/hours', requireRole(['Manager', 'Admin']), updateProjectHours);
router.delete('/:id', requireRole(['Admin', 'Manager']), deleteProject);

export default router;
