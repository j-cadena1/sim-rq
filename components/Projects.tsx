import React, { useState, useRef, useEffect } from 'react';
import { useSimFlow } from '../context/SimFlowContext';
import { useProjects, useCreateProject, useUpdateProjectName, useUpdateProjectStatus, useDeleteProject } from '../api/hooks';
import { useModal } from './Modal';
import { useToast } from './Toast';
import { ProjectStatus, UserRole } from '../types';
import { FolderOpen, Plus, CheckCircle, XCircle, Clock, Archive, Edit2, Check, X, MoreVertical, Trash2, RotateCcw } from 'lucide-react';

export const Projects: React.FC = () => {
  const { currentUser } = useSimFlow();
  const { data: projects = [], isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectNameMutation = useUpdateProjectName();
  const updateProjectStatusMutation = useUpdateProjectStatus();
  const deleteProjectMutation = useDeleteProject();
  const { showPrompt, showConfirm } = useModal();
  const { showToast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    totalHours: 100,
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [projectMenuId, setProjectMenuId] = useState<string | null>(null);
  const [archivedMenuId, setArchivedMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const archivedMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProjectMenuId(null);
      }
      if (archivedMenuRef.current && !archivedMenuRef.current.contains(event.target as Node)) {
        setArchivedMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canManageProjects = currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.ADMIN;
  const canCreateProjects = currentUser.role === UserRole.USER || canManageProjects;

  const handleCreateProject = () => {
    if (!newProject.name) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newProject.totalHours < 1) {
      showToast('Total hours must be at least 1', 'error');
      return;
    }

    // Manager creates as Approved, User creates as Pending
    const status = canManageProjects ? ProjectStatus.APPROVED : ProjectStatus.PENDING;

    createProjectMutation.mutate({
      name: newProject.name,
      totalHours: newProject.totalHours,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      status,
    }, {
      onSuccess: () => {
        showToast(`Project created${canManageProjects ? '' : ' (pending approval)'}`, 'success');
        setNewProject({ name: '', totalHours: 100 });
        setShowCreateForm(false);
      },
      onError: (error: any) => {
        showToast(error.response?.data?.error || 'Failed to create project', 'error');
      },
    });
  };

  const handleApproveProject = (id: string, name: string) => {
    showPrompt(
      'Approve Project',
      `Approve project "${name}"?`,
      () => {
        updateProjectStatusMutation.mutate(
          { id, status: ProjectStatus.APPROVED },
          {
            onSuccess: () => showToast('Project approved', 'success'),
            onError: () => showToast('Failed to approve project', 'error'),
          }
        );
      }
    );
  };

  const handleArchiveProject = (id: string, name: string) => {
    showPrompt(
      'Archive Project',
      `Archive project "${name}"? This will hide it from active projects.`,
      () => {
        updateProjectStatusMutation.mutate(
          { id, status: ProjectStatus.ARCHIVED },
          {
            onSuccess: () => showToast('Project archived', 'success'),
            onError: () => showToast('Failed to archive project', 'error'),
          }
        );
      }
    );
  };

  const handleDeleteProject = (id: string, name: string) => {
    showConfirm(
      'Delete Project',
      `Are you sure you want to permanently delete project "${name}"? This action cannot be undone.`,
      () => {
        deleteProjectMutation.mutate(id, {
          onSuccess: () => {
            showToast('Project deleted successfully', 'success');
            setProjectMenuId(null);
            setArchivedMenuId(null);
          },
          onError: (error: any) => {
            showToast(error.response?.data?.error || 'Failed to delete project', 'error');
          },
        });
      }
    );
  };

  const handleRestoreProject = (id: string, name: string) => {
    showConfirm(
      'Restore Project',
      `Restore project "${name}" to active projects?`,
      () => {
        updateProjectStatusMutation.mutate(
          { id, status: ProjectStatus.APPROVED },
          {
            onSuccess: () => {
              showToast('Project restored', 'success');
              setArchivedMenuId(null);
            },
            onError: () => {
              showToast('Failed to restore project', 'error');
            },
          }
        );
      }
    );
  };

  const handleStartEditingName = (id: string, currentName: string) => {
    setEditingProjectId(id);
    setEditingProjectName(currentName);
  };

  const handleCancelEditingName = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleSaveProjectName = (id: string) => {
    if (!editingProjectName.trim()) {
      showToast('Project name cannot be empty', 'error');
      return;
    }

    updateProjectNameMutation.mutate(
      { id, name: editingProjectName },
      {
        onSuccess: () => {
          showToast('Project name updated', 'success');
          setEditingProjectId(null);
          setEditingProjectName('');
        },
        onError: (error: any) => {
          showToast(error.response?.data?.error || 'Failed to update project name', 'error');
        },
      }
    );
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.APPROVED:
        return (
          <span className="flex items-center text-green-400 text-xs">
            <CheckCircle size={14} className="mr-1" /> Approved
          </span>
        );
      case ProjectStatus.PENDING:
        return (
          <span className="flex items-center text-yellow-400 text-xs">
            <Clock size={14} className="mr-1" /> Pending
          </span>
        );
      case ProjectStatus.ARCHIVED:
        return (
          <span className="flex items-center text-slate-500 text-xs">
            <Archive size={14} className="mr-1" /> Archived
          </span>
        );
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  const approvedProjects = projects.filter(p => p.status === ProjectStatus.APPROVED);
  const pendingProjects = projects.filter(p => p.status === ProjectStatus.PENDING);
  const archivedProjects = projects.filter(p => p.status === ProjectStatus.ARCHIVED);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900/30 rounded-xl">
            <FolderOpen className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-slate-400 text-sm">Manage simulation hour buckets</p>
          </div>
        </div>
        {canCreateProjects && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 animate-scale-in">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Kimberly-Clark Flushable Wipes Robot Cell Modernization Revision"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Total Hours</label>
              <input
                type="number"
                value={newProject.totalHours}
                onChange={(e) => setNewProject({ ...newProject, totalHours: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">Project code will be auto-generated (e.g., 100001-2025)</p>
          <div className="flex gap-3">
            <button
              onClick={handleCreateProject}
              disabled={createProjectMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          {!canManageProjects && (
            <p className="text-yellow-400 text-sm mt-3">
              Note: Your project will require manager approval before it can be used.
            </p>
          )}
        </div>
      )}

      {/* Pending Projects (Managers only) */}
      {canManageProjects && pendingProjects.length > 0 && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-yellow-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-yellow-400" />
            Pending Approval ({pendingProjects.length})
          </h2>
          <div className="space-y-3">
            {pendingProjects.map((project) => (
              <div key={project.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{project.name}</h3>
                  <p className="text-slate-400 text-sm">Code: {project.code} • {project.totalHours} hours • Created by {project.createdByName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveProject(project.id, project.name)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleArchiveProject(project.id, project.name)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">Active Projects ({approvedProjects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedProjects.map((project) => {
            const usagePercent = (project.usedHours / project.totalHours) * 100;
            const availableHours = project.totalHours - project.usedHours;

            return (
              <div key={project.id} className="bg-slate-800/50 p-5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {editingProjectId === project.id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveProjectName(project.id);
                            if (e.key === 'Escape') handleCancelEditingName();
                          }}
                        />
                        <button
                          onClick={() => handleSaveProjectName(project.id)}
                          className="p-1 text-green-400 hover:text-green-300"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEditingName}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{project.name}</h3>
                        {canManageProjects && (
                          <button
                            onClick={() => handleStartEditingName(project.id, project.name)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Edit project name"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-slate-400 text-sm">{project.code}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Available:</span>
                    <span className="text-white font-semibold">{availableHours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Used:</span>
                    <span className="text-slate-400">{project.usedHours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-slate-400">{project.totalHours}h</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{usagePercent.toFixed(1)}% used</p>
                  </div>
                </div>

                {canManageProjects && (
                  <div className="mt-4 relative" ref={projectMenuId === project.id ? menuRef : null}>
                    <button
                      onClick={() => setProjectMenuId(projectMenuId === project.id ? null : project.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
                    >
                      <MoreVertical size={16} />
                      Manage
                    </button>
                    {projectMenuId === project.id && (
                      <div className="absolute bottom-full mb-2 right-0 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
                        <button
                          onClick={() => {
                            setProjectMenuId(null);
                            handleArchiveProject(project.id, project.name);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors rounded-t-lg"
                        >
                          <Archive size={16} />
                          Archive Project
                        </button>
                        <button
                          onClick={() => {
                            setProjectMenuId(null);
                            handleDeleteProject(project.id, project.name);
                          }}
                          disabled={deleteProjectMutation.isPending}
                          className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-600/20 transition-colors rounded-b-lg disabled:opacity-50 border-t border-slate-700"
                        >
                          <Trash2 size={16} />
                          {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {approvedProjects.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No active projects. {canCreateProjects && 'Create one to get started!'}
          </div>
        )}
      </div>

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <details className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <summary className="text-lg font-semibold text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
            Archived Projects ({archivedProjects.length})
          </summary>
          <div className="mt-4 space-y-2">
            {archivedProjects.map((project) => (
              <div key={project.id} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-slate-300 font-medium">{project.name}</span>
                    <span className="text-slate-500 text-sm ml-2">({project.code})</span>
                    <div className="text-slate-500 text-sm mt-1">
                      {project.usedHours}/{project.totalHours}h used
                    </div>
                  </div>
                  {canManageProjects && (
                    <div className="relative" ref={archivedMenuId === project.id ? archivedMenuRef : null}>
                      <button
                        onClick={() => setArchivedMenuId(archivedMenuId === project.id ? null : project.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {archivedMenuId === project.id && (
                        <div className="absolute top-full mt-2 right-0 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
                          <button
                            onClick={() => {
                              setArchivedMenuId(null);
                              handleRestoreProject(project.id, project.name);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-green-400 hover:bg-slate-800 transition-colors rounded-t-lg"
                          >
                            <RotateCcw size={16} />
                            Restore Project
                          </button>
                          <button
                            onClick={() => {
                              setArchivedMenuId(null);
                              handleDeleteProject(project.id, project.name);
                            }}
                            disabled={deleteProjectMutation.isPending}
                            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-600/20 transition-colors rounded-b-lg disabled:opacity-50 border-t border-slate-700"
                          >
                            <Trash2 size={16} />
                            {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
