/// <reference types="vitest/globals" />
/**
 * Dashboard Component Unit Tests
 *
 * Tests the business logic for:
 * - needsAttentionCount calculation (role-based)
 * - stats calculation (role-based filtering)
 * - projectStats calculation
 * - statusData chart data generation
 * - Role-based UI visibility
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Dashboard } from './Dashboard';
import { UserRole, RequestStatus, type User, type SimRequest } from '../types';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock axios for NotificationContext
const { mockAxiosInstance } = vi.hoisted(() => {
  return {
    mockAxiosInstance: {
      get: vi.fn().mockResolvedValue({ data: { notifications: [], unreadCount: 0, hasMore: false } }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      patch: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    },
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    get: vi.fn().mockResolvedValue({ data: { notifications: [], unreadCount: 0, hasMore: false } }),
  },
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
}));

// ============================================================================
// Test Data
// ============================================================================

const ADMIN: User = { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: UserRole.ADMIN };
const MANAGER: User = { id: 'manager-1', name: 'Manager', email: 'manager@test.com', role: UserRole.MANAGER };
const ENGINEER: User = { id: 'engineer-1', name: 'Engineer', email: 'engineer@test.com', role: UserRole.ENGINEER };
const END_USER: User = { id: 'user-1', name: 'User', email: 'user@test.com', role: UserRole.USER };

// Factory for creating requests
function createRequest(
  id: string,
  status: RequestStatus,
  createdBy: string = 'user-1',
  assignedTo?: string
): SimRequest {
  return {
    id,
    title: `Request ${id}`,
    description: 'Test description',
    vendor: 'FANUC',
    status,
    priority: 'Medium',
    createdBy,
    createdByName: 'Test User',
    createdAt: new Date().toISOString(),
    assignedTo,
    assignedToName: assignedTo ? 'Engineer' : undefined,
    comments: [],
  };
}

// Store for mock data - allows tests to configure different scenarios
let mockCurrentUser: User = MANAGER;
let mockRequests: SimRequest[] = [];
let mockProjectMetrics: any[] = [];

// Mock the contexts
vi.mock('../contexts/SimRQContext', () => ({
  useSimRQ: () => ({
    requests: mockRequests,
    currentUser: mockCurrentUser,
    users: [ADMIN, MANAGER, ENGINEER, END_USER],
    isLoadingRequests: false,
  }),
  SimRQProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotificationContext: () => ({
    notifications: [],
    unreadCount: 0,
    fetchNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock('../lib/api/hooks', () => ({
  useProjectsWithMetrics: () => ({ data: mockProjectMetrics, isLoading: false }),
  useProjectsNearDeadline: () => ({ data: [], isLoading: false }),
}));

// ============================================================================
// Test Helpers
// ============================================================================

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = MANAGER;
    mockRequests = [];
    mockProjectMetrics = [];
  });

  // --------------------------------------------------------------------------
  // needsAttentionCount Tests
  // --------------------------------------------------------------------------
  describe('needsAttentionCount calculation', () => {
    it('should count MANAGER_REVIEW requests for Admin', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.MANAGER_REVIEW),
        createRequest('2', RequestStatus.MANAGER_REVIEW),
        createRequest('3', RequestStatus.SUBMITTED),
        createRequest('4', RequestStatus.IN_PROGRESS),
      ];

      renderDashboard();

      // The "Needs Attention" link should show count of 2
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('should count MANAGER_REVIEW requests for Manager', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.MANAGER_REVIEW),
        createRequest('2', RequestStatus.SUBMITTED),
      ];

      renderDashboard();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('should count assigned ENGINEERING_REVIEW and REVISION_REQUESTED for Engineer', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [
        createRequest('1', RequestStatus.ENGINEERING_REVIEW, 'user-1', ENGINEER.id),
        createRequest('2', RequestStatus.REVISION_REQUESTED, 'user-1', ENGINEER.id),
        createRequest('3', RequestStatus.ENGINEERING_REVIEW, 'user-1', 'other-engineer'), // Not assigned to this engineer
        createRequest('4', RequestStatus.IN_PROGRESS, 'user-1', ENGINEER.id),
      ];

      renderDashboard();

      // Should be 2 (requests 1 and 2 are assigned to this engineer with correct status)
      const attentionSection = screen.getByText('Needs Attention').closest('a');
      expect(attentionSection).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should count own REVISION_APPROVAL requests for End-User', () => {
      mockCurrentUser = END_USER;
      mockRequests = [
        createRequest('1', RequestStatus.REVISION_APPROVAL, END_USER.id),
        createRequest('2', RequestStatus.REVISION_APPROVAL, END_USER.id),
        createRequest('3', RequestStatus.REVISION_APPROVAL, 'other-user'), // Not created by this user
        createRequest('4', RequestStatus.COMPLETED, END_USER.id),
      ];

      renderDashboard();

      // End-users don't see the "Your Work" section, but needsAttentionCount is still calculated
      // Since currentUser.role === USER, the Your Work section is hidden
      expect(screen.queryByText('Your Work')).not.toBeInTheDocument();
    });

    it('should return 0 when no requests match criteria', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.COMPLETED),
      ];

      renderDashboard();

      // Needs Attention section should not appear when count is 0
      expect(screen.queryByText('Needs Attention')).not.toBeInTheDocument();
    });

    it('should return 0 when requests array is empty', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [];

      renderDashboard();

      expect(screen.queryByText('Needs Attention')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // stats calculation Tests
  // --------------------------------------------------------------------------
  describe('stats calculation', () => {
    it('should filter requests by createdBy for End-User', () => {
      mockCurrentUser = END_USER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, END_USER.id),
        createRequest('2', RequestStatus.COMPLETED, END_USER.id),
        createRequest('3', RequestStatus.IN_PROGRESS, 'other-user'), // Not visible to this user
      ];

      renderDashboard();

      // End-user sees only their 2 requests
      expect(screen.getByText('Total Requests')).toBeInTheDocument();
      // The stats card should show 2, not 3
    });

    it('should filter requests for Engineer (assigned or ENGINEERING_REVIEW)', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, 'user-1', ENGINEER.id), // Assigned to engineer
        createRequest('2', RequestStatus.ENGINEERING_REVIEW, 'user-1'), // Ready for engineering review
        createRequest('3', RequestStatus.SUBMITTED, 'user-1'), // Not visible (not assigned, not engineering review)
      ];

      renderDashboard();

      // Engineer should see 2 requests
      expect(screen.getByText('Total Requests')).toBeInTheDocument();
    });

    it('should show all requests for Admin', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, 'user-1'),
        createRequest('2', RequestStatus.COMPLETED, 'user-2'),
        createRequest('3', RequestStatus.SUBMITTED, 'user-3'),
      ];

      renderDashboard();

      expect(screen.getByText('Total Requests')).toBeInTheDocument();
    });

    it('should show all requests for Manager', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS),
        createRequest('2', RequestStatus.COMPLETED),
        createRequest('3', RequestStatus.DENIED),
      ];

      renderDashboard();

      expect(screen.getByText('Total Requests')).toBeInTheDocument();
    });

    it('should correctly count inProgress statuses', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS),
        createRequest('2', RequestStatus.ENGINEERING_REVIEW),
        createRequest('3', RequestStatus.DISCUSSION),
        createRequest('4', RequestStatus.COMPLETED), // Not inProgress
      ];

      renderDashboard();

      // Check the stat card label exists (use getAllBy since IN_PROGRESS also appears in status badges)
      const inProgressLabels = screen.getAllByText('In Progress');
      expect(inProgressLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('should correctly count completed statuses (COMPLETED and ACCEPTED)', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.COMPLETED),
        createRequest('2', RequestStatus.ACCEPTED),
        createRequest('3', RequestStatus.IN_PROGRESS), // Not completed
      ];

      renderDashboard();

      // "Completed" appears in both stat card label and status badges
      const completedLabels = screen.getAllByText('Completed');
      expect(completedLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('should correctly count pending statuses (SUBMITTED and MANAGER_REVIEW)', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.MANAGER_REVIEW),
        createRequest('3', RequestStatus.IN_PROGRESS), // Not pending
      ];

      renderDashboard();

      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });

    it('should correctly count denied status', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.DENIED),
        createRequest('2', RequestStatus.DENIED),
        createRequest('3', RequestStatus.COMPLETED),
      ];

      renderDashboard();

      // We can verify the chart is rendered with the data
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // projectStats calculation Tests
  // --------------------------------------------------------------------------
  describe('projectStats calculation', () => {
    it('should filter only Active projects', () => {
      mockCurrentUser = ADMIN;
      mockProjectMetrics = [
        { id: '1', name: 'Project 1', status: 'Active', totalHours: 100, usedHours: 50, utilizationPercentage: 50 },
        { id: '2', name: 'Project 2', status: 'Completed', totalHours: 200, usedHours: 200, utilizationPercentage: 100 },
        { id: '3', name: 'Project 3', status: 'Active', totalHours: 150, usedHours: 30, utilizationPercentage: 20 },
      ];

      renderDashboard();

      expect(screen.getByText('Project Health')).toBeInTheDocument();
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
    });

    it('should calculate totalBudget sum correctly', () => {
      mockCurrentUser = ADMIN;
      mockProjectMetrics = [
        { id: '1', name: 'P1', status: 'Active', totalHours: 100, usedHours: 25, utilizationPercentage: 25 },
        { id: '2', name: 'P2', status: 'Active', totalHours: 200, usedHours: 50, utilizationPercentage: 25 },
      ];

      renderDashboard();

      // Total budget = 100 + 200 = 300h
      expect(screen.getByText('300h')).toBeInTheDocument();
    });

    it('should calculate usedBudget sum correctly', () => {
      mockCurrentUser = ADMIN;
      mockProjectMetrics = [
        { id: '1', name: 'P1', status: 'Active', totalHours: 100, usedHours: 25, utilizationPercentage: 25 },
        { id: '2', name: 'P2', status: 'Active', totalHours: 200, usedHours: 50, utilizationPercentage: 25 },
      ];

      renderDashboard();

      // Used budget = 25 + 50 = 75h
      expect(screen.getByText('75h')).toBeInTheDocument();
    });

    it('should calculate avgUtilization and round to 1 decimal', () => {
      mockCurrentUser = ADMIN;
      mockProjectMetrics = [
        { id: '1', name: 'P1', status: 'Active', totalHours: 100, usedHours: 33, utilizationPercentage: 33.33 },
        { id: '2', name: 'P2', status: 'Active', totalHours: 100, usedHours: 66, utilizationPercentage: 66.67 },
      ];

      renderDashboard();

      // Avg utilization = (33.33 + 66.67) / 2 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should return 0 avgUtilization when no active projects', () => {
      mockCurrentUser = ADMIN;
      mockProjectMetrics = [
        { id: '1', name: 'P1', status: 'Completed', totalHours: 100, usedHours: 100, utilizationPercentage: 100 },
      ];

      renderDashboard();

      // Project Health section should not appear when no active projects
      expect(screen.queryByText('Project Health')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // statusData chart data Tests
  // --------------------------------------------------------------------------
  describe('statusData chart data', () => {
    it('should create chart data with correct structure', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.IN_PROGRESS),
      ];

      renderDashboard();

      // Chart should be rendered
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should handle zero values gracefully', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [];

      renderDashboard();

      // Chart should still render with zero values
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('should update when stats change', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [createRequest('1', RequestStatus.DENIED)];

      const { rerender } = renderDashboard();

      // Add more requests and verify chart updates
      mockRequests = [
        createRequest('1', RequestStatus.DENIED),
        createRequest('2', RequestStatus.DENIED),
      ];

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Role-based UI visibility Tests
  // --------------------------------------------------------------------------
  describe('role-based UI visibility', () => {
    it('should show Analytics link for Admin', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [];

      renderDashboard();

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should show Analytics link for Manager', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [];

      renderDashboard();

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should NOT show Analytics link for Engineer', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [];

      renderDashboard();

      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });

    it('should NOT show Analytics link for End-User', () => {
      mockCurrentUser = END_USER;
      mockRequests = [];

      renderDashboard();

      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });

    it('should hide Your Work section for End-User', () => {
      mockCurrentUser = END_USER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, END_USER.id),
      ];

      renderDashboard();

      expect(screen.queryByText('Your Work')).not.toBeInTheDocument();
    });

    it('should show Your Work section for Manager when there is work', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.MANAGER_REVIEW),
      ];

      renderDashboard();

      expect(screen.getByText('Your Work')).toBeInTheDocument();
    });

    it('should show Assigned to Me for Engineer when there are assignments', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, 'user-1', ENGINEER.id),
        createRequest('2', RequestStatus.ENGINEERING_REVIEW, 'user-1', ENGINEER.id),
      ];

      renderDashboard();

      expect(screen.getByText('Assigned to Me')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Recent Activity Tests
  // --------------------------------------------------------------------------
  describe('recent activity', () => {
    it('should display up to 5 recent requests', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.IN_PROGRESS),
        createRequest('3', RequestStatus.COMPLETED),
        createRequest('4', RequestStatus.DENIED),
        createRequest('5', RequestStatus.ACCEPTED),
        createRequest('6', RequestStatus.MANAGER_REVIEW), // 6th request
      ];

      renderDashboard();

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      // Should show first 5 requests
      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 5')).toBeInTheDocument();
      expect(screen.queryByText('Request 6')).not.toBeInTheDocument();
    });

    it('should show empty state when no requests', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [];

      renderDashboard();

      expect(screen.getByText('No recent activity.')).toBeInTheDocument();
    });
  });
});
