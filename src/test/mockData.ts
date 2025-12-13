/**
 * Mock Data Factories for Frontend Unit Tests
 *
 * Provides type-safe mock data creation for testing components.
 * All factories return valid objects conforming to types.ts interfaces.
 */

import {
  User,
  UserRole,
  SimRequest,
  RequestStatus,
  Project,
  ProjectStatus,
  ProjectPriority,
  Comment,
  Notification,
  NotificationType,
} from '../../types';

// ============================================================================
// User Mocks
// ============================================================================

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

export const MOCK_MANAGER: User = {
  id: 'manager-1',
  name: 'Test Manager',
  email: 'manager@test.com',
  role: UserRole.MANAGER,
};

export const MOCK_ENGINEER: User = {
  id: 'engineer-1',
  name: 'Test Engineer',
  email: 'engineer@test.com',
  role: UserRole.ENGINEER,
};

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'user@test.com',
  role: UserRole.USER,
};

export const ALL_MOCK_USERS: User[] = [
  MOCK_ADMIN,
  MOCK_MANAGER,
  MOCK_ENGINEER,
  MOCK_USER,
];

export function createMockUser(role: UserRole, overrides?: Partial<User>): User {
  const base: Record<UserRole, User> = {
    [UserRole.ADMIN]: MOCK_ADMIN,
    [UserRole.MANAGER]: MOCK_MANAGER,
    [UserRole.ENGINEER]: MOCK_ENGINEER,
    [UserRole.USER]: MOCK_USER,
  };

  return {
    ...base[role],
    id: `${role.toLowerCase()}-${Date.now()}`,
    ...overrides,
  };
}

// ============================================================================
// Request Mocks
// ============================================================================

let requestIdCounter = 1;

export function createMockRequest(
  status: RequestStatus,
  overrides?: Partial<SimRequest>
): SimRequest {
  const id = `req-${requestIdCounter++}`;
  return {
    id,
    title: `Test Request ${id}`,
    description: `Description for ${id}`,
    vendor: 'FANUC',
    status,
    priority: 'Medium',
    createdBy: MOCK_USER.id,
    createdByName: MOCK_USER.name,
    createdAt: new Date().toISOString(),
    comments: [],
    ...overrides,
  };
}

export function createMockRequestsForAllStatuses(): SimRequest[] {
  return Object.values(RequestStatus).map((status) =>
    createMockRequest(status)
  );
}

// Pre-built request sets for common test scenarios
export const MOCK_REQUESTS = {
  submitted: createMockRequest(RequestStatus.SUBMITTED, { id: 'req-submitted' }),
  managerReview: createMockRequest(RequestStatus.MANAGER_REVIEW, { id: 'req-manager-review' }),
  engineeringReview: createMockRequest(RequestStatus.ENGINEERING_REVIEW, {
    id: 'req-engineering-review',
    assignedTo: MOCK_ENGINEER.id,
    assignedToName: MOCK_ENGINEER.name,
  }),
  inProgress: createMockRequest(RequestStatus.IN_PROGRESS, {
    id: 'req-in-progress',
    assignedTo: MOCK_ENGINEER.id,
    assignedToName: MOCK_ENGINEER.name,
  }),
  completed: createMockRequest(RequestStatus.COMPLETED, {
    id: 'req-completed',
    assignedTo: MOCK_ENGINEER.id,
    assignedToName: MOCK_ENGINEER.name,
  }),
  revisionRequested: createMockRequest(RequestStatus.REVISION_REQUESTED, {
    id: 'req-revision-requested',
    assignedTo: MOCK_ENGINEER.id,
    assignedToName: MOCK_ENGINEER.name,
  }),
  revisionApproval: createMockRequest(RequestStatus.REVISION_APPROVAL, {
    id: 'req-revision-approval',
    createdBy: MOCK_USER.id,
    createdByName: MOCK_USER.name,
  }),
  accepted: createMockRequest(RequestStatus.ACCEPTED, { id: 'req-accepted' }),
  denied: createMockRequest(RequestStatus.DENIED, { id: 'req-denied' }),
  discussion: createMockRequest(RequestStatus.DISCUSSION, {
    id: 'req-discussion',
    assignedTo: MOCK_ENGINEER.id,
    assignedToName: MOCK_ENGINEER.name,
  }),
};

// ============================================================================
// Project Mocks
// ============================================================================

let projectIdCounter = 1;

export function createMockProject(
  status: ProjectStatus,
  overrides?: Partial<Project>
): Project {
  const id = `proj-${projectIdCounter++}`;
  return {
    id,
    name: `Test Project ${id}`,
    code: `${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    status,
    totalHours: 100,
    usedHours: 25,
    createdBy: MOCK_MANAGER.id,
    createdByName: MOCK_MANAGER.name,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export const MOCK_PROJECTS = {
  pending: createMockProject(ProjectStatus.PENDING, { id: 'proj-pending' }),
  active: createMockProject(ProjectStatus.ACTIVE, { id: 'proj-active' }),
  onHold: createMockProject(ProjectStatus.ON_HOLD, { id: 'proj-on-hold' }),
  suspended: createMockProject(ProjectStatus.SUSPENDED, { id: 'proj-suspended' }),
  completed: createMockProject(ProjectStatus.COMPLETED, { id: 'proj-completed' }),
  cancelled: createMockProject(ProjectStatus.CANCELLED, { id: 'proj-cancelled' }),
  expired: createMockProject(ProjectStatus.EXPIRED, { id: 'proj-expired' }),
  archived: createMockProject(ProjectStatus.ARCHIVED, { id: 'proj-archived' }),
};

// ============================================================================
// Project Metrics Mocks (for Dashboard)
// ============================================================================

export interface ProjectMetrics {
  id: string;
  name: string;
  code: string;
  status: string;
  totalHours: number;
  usedHours: number;
  utilizationPercentage: number;
}

export function createMockProjectMetrics(
  status: string,
  overrides?: Partial<ProjectMetrics>
): ProjectMetrics {
  return {
    id: `proj-${Date.now()}`,
    name: 'Test Project',
    code: '123456-1234',
    status,
    totalHours: 100,
    usedHours: 25,
    utilizationPercentage: 25,
    ...overrides,
  };
}

// ============================================================================
// Comment Mocks
// ============================================================================

let commentIdCounter = 1;

export function createMockComment(overrides?: Partial<Comment>): Comment {
  const id = `comment-${commentIdCounter++}`;
  return {
    id,
    authorId: MOCK_USER.id,
    authorName: MOCK_USER.name,
    authorRole: UserRole.USER,
    content: `Test comment ${id}`,
    createdAt: new Date().toISOString(),
    visibleToRequester: true,
    ...overrides,
  };
}

// ============================================================================
// Notification Mocks
// ============================================================================

let notificationIdCounter = 1;

export function createMockNotification(
  overrides?: Partial<Notification>
): Notification {
  const id = `notif-${notificationIdCounter++}`;
  return {
    id,
    userId: MOCK_USER.id,
    type: NotificationType.REQUEST_COMMENT_ADDED,
    title: 'New Comment',
    message: `You have a new comment on your request`,
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// Reset Counters (call in beforeEach to ensure consistent IDs)
// ============================================================================

export function resetMockCounters(): void {
  requestIdCounter = 1;
  projectIdCounter = 1;
  commentIdCounter = 1;
  notificationIdCounter = 1;
}
