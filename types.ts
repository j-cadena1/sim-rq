export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager', // Process Owner
  ENGINEER = 'Engineer',
  USER = 'End-User'
}

export enum RequestStatus {
  SUBMITTED = 'Submitted', // Waiting for feasibility
  FEASIBILITY_REVIEW = 'Feasibility Review', // Manager reviewing
  RESOURCE_ALLOCATION = 'Resource Allocation', // Manager approved feasibility, assigning engineer
  ENGINEERING_REVIEW = 'Engineering Review', // Engineer accepting/rejecting assignment
  IN_PROGRESS = 'In Progress', // Engineer working
  COMPLETED = 'Completed', // Work done
  REVISION_REQUESTED = 'Revision Requested', // User wants changes
  ACCEPTED = 'Accepted', // User accepted the completed work
  DENIED = 'Denied'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  timestamp: string;
}

export interface SimRequest {
  id: string;
  title: string;
  description: string;
  vendor: string; // e.g., FANUC, Siemens
  status: RequestStatus;
  priority: 'Low' | 'Medium' | 'High';

  createdBy: string; // User ID
  createdByName: string;
  createdAt: string;

  assignedTo?: string; // Engineer User ID
  assignedToName?: string;

  estimatedHours?: number;

  comments: Comment[];
}

// Mock Data for Initial Load
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice User', role: UserRole.USER, avatar: 'https://picsum.photos/seed/u1/200' },
  { id: 'm1', name: 'Bob Manager', role: UserRole.MANAGER, avatar: 'https://picsum.photos/seed/m1/200' },
  { id: 'e1', name: 'Charlie Engineer', role: UserRole.ENGINEER, avatar: 'https://picsum.photos/seed/e1/200' },
  { id: 'a1', name: 'Dave Admin', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/a1/200' },
];