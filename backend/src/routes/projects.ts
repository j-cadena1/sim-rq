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

const router = express.Router();

// GET /api/projects - Get all projects (optionally filtered by status)
router.get('/', getAllProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', getProjectById);

// POST /api/projects - Create new project
router.post('/', createProject);

// PATCH /api/projects/:id/name - Update project name (managers/admins only)
router.patch('/:id/name', updateProjectName);

// PATCH /api/projects/:id/status - Update project status (approve/archive)
router.patch('/:id/status', updateProjectStatus);

// PATCH /api/projects/:id/hours - Update project hours (allocate/deallocate)
router.patch('/:id/hours', updateProjectHours);

// DELETE /api/projects/:id - Archive project
router.delete('/:id', deleteProject);

export default router;
