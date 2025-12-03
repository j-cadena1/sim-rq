import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { SimRequest, Comment, User, RequestStatus, UserRole, Project, ProjectStatus, TimeEntry, TitleChangeRequest } from '../types';

// Requests API
export const useRequests = () => {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ requests: SimRequest[] }>('/requests');
      return data.requests;
    },
  });
};

export const useRequest = (id: string) => {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ request: SimRequest; comments: Comment[] }>(`/requests/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      vendor: string;
      priority: 'Low' | 'Medium' | 'High';
      projectId: string;
    }) => {
      const response = await apiClient.post<{ request: SimRequest }>('/requests', data);
      return response.data.request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useUpdateRequestTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await apiClient.patch<{ request: SimRequest }>(`/requests/${id}/title`, { title });
      return response.data.request;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', variables.id] });
    },
  });
};

export const useRequestTitleChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, proposedTitle }: { id: string; proposedTitle: string }) => {
      const response = await apiClient.post(`/requests/${id}/title-change-request`, { proposedTitle });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['titleChangeRequests', variables.id] });
    },
  });
};

export const useTitleChangeRequests = (requestId: string) => {
  return useQuery({
    queryKey: ['titleChangeRequests', requestId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ titleChangeRequests: TitleChangeRequest[] }>(`/requests/${requestId}/title-change-requests`);
      return data.titleChangeRequests;
    },
    enabled: !!requestId,
  });
};

export const useReviewTitleChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approved, requestId }: { id: string; approved: boolean; requestId: string }) => {
      const response = await apiClient.patch(`/requests/title-change-requests/${id}/review`, { approved });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['titleChangeRequests', variables.requestId] });
    },
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
      const response = await apiClient.patch<{ request: SimRequest }>(`/requests/${id}/status`, { status });
      return response.data.request;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', variables.id] });
    },
  });
};

export const useAssignEngineer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      engineerId,
      estimatedHours,
    }: {
      id: string;
      engineerId: string;
      estimatedHours: number;
    }) => {
      const response = await apiClient.patch<{ request: SimRequest }>(`/requests/${id}/assign`, {
        engineerId,
        estimatedHours,
      });
      return response.data.request;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', variables.id] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, content }: { requestId: string; content: string }) => {
      const response = await apiClient.post<{ comment: Comment }>(`/requests/${requestId}/comments`, { content });
      return response.data.comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', variables.requestId] });
    },
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string; id: string }>(`/requests/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

// Time Tracking API
export const useTimeEntries = (requestId: string) => {
  return useQuery({
    queryKey: ['timeEntries', requestId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ timeEntries: TimeEntry[] }>(`/requests/${requestId}/time`);
      return data.timeEntries;
    },
    enabled: !!requestId,
  });
};

export const useAddTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, hours, description }: { requestId: string; hours: number; description?: string }) => {
      const response = await apiClient.post<{ timeEntry: TimeEntry }>(`/requests/${requestId}/time`, { hours, description });
      return response.data.timeEntry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', variables.requestId] });
    },
  });
};

// Users API
export const useUsers = (role?: UserRole) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const params = role ? { role } : {};
      const { data } = await apiClient.get<{ users: User[] }>('/users', { params });
      return data.users;
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ user: User }>('/users/me');
      return data.user;
    },
  });
};

// Projects API
export const useProjects = (status?: ProjectStatus) => {
  return useQuery({
    queryKey: ['projects', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await apiClient.get<{ projects: Project[] }>('/projects', { params });
      return data.projects;
    },
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ project: Project }>(`/projects/${id}`);
      return data.project;
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      totalHours: number;
      createdBy: string;
      createdByName: string;
      status?: ProjectStatus;
    }) => {
      const response = await apiClient.post<{ project: Project }>('/projects', data);
      return response.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProjectName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await apiClient.patch<{ project: Project }>(`/projects/${id}/name`, { name });
      return response.data.project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const response = await apiClient.patch<{ project: Project }>(`/projects/${id}/status`, { status });
      return response.data.project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
};

export const useUpdateProjectHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hoursToAdd }: { id: string; hoursToAdd: number }) => {
      const response = await apiClient.patch<{ project: Project }>(`/projects/${id}/hours`, { hoursToAdd });
      return response.data.project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(`/projects/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
