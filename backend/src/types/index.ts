export type UserRole = 'Admin' | 'Manager' | 'Engineer' | 'End-User';

export type RequestStatus =
  | 'Submitted'
  | 'Feasibility Review'
  | 'Resource Allocation'
  | 'Engineering Review'
  | 'Discussion'
  | 'In Progress'
  | 'Completed'
  | 'Revision Requested'
  | 'Revision Approval'
  | 'Accepted'
  | 'Denied';

export type Priority = 'Low' | 'Medium' | 'High';

export type ProjectStatus = 'Pending' | 'Approved' | 'Archived';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  total_hours: number;
  used_hours: number;
  status: ProjectStatus;
  created_by: string | null;
  created_by_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface SimRequest {
  id: string;
  title: string;
  description: string;
  vendor: string;
  status: RequestStatus;
  priority: Priority;
  created_by: string | null;
  created_by_name: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  estimated_hours: number | null;
  allocated_hours: number | null;
  project_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  request_id: string;
  author_id: string | null;
  author_name: string;
  author_role: UserRole;
  content: string;
  created_at: Date;
}

export interface ActivityLog {
  id: string;
  request_id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: Date;
}
