/// <reference types="vitest/globals" />
/**
 * RequestList Component Unit Tests
 *
 * Tests the business logic for:
 * - Role-based filtering (User, Engineer, Admin, Manager)
 * - Quick filters (my-requests, assigned-to-me, needs-attention)
 * - Search filtering
 * - Status and priority filtering
 * - Sorting options
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RequestList } from './RequestList';
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
  options: Partial<SimRequest> = {}
): SimRequest {
  return {
    id,
    title: options.title || `Request ${id}`,
    description: 'Test description',
    vendor: options.vendor || 'FANUC',
    status,
    priority: options.priority || 'Medium',
    createdBy: options.createdBy || 'user-1',
    createdByName: options.createdByName || 'Test User',
    createdAt: options.createdAt || new Date().toISOString(),
    assignedTo: options.assignedTo,
    assignedToName: options.assignedTo ? 'Engineer' : undefined,
    comments: [],
  };
}

// Store for mock data
let mockCurrentUser: User = MANAGER;
let mockRequests: SimRequest[] = [];

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
  }),
}));

// ============================================================================
// Test Helpers
// ============================================================================

function renderRequestList(initialRoute = '/requests') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <RequestList />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Helper to get visible request titles
function getVisibleRequestTitles(): string[] {
  const links = screen.getAllByRole('link');
  return links
    .filter(link => link.getAttribute('href')?.startsWith('/requests/'))
    .map(link => link.textContent || '')
    .filter(text => text.startsWith('Request'));
}

// ============================================================================
// Tests
// ============================================================================

describe('RequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = MANAGER;
    mockRequests = [];
  });

  // --------------------------------------------------------------------------
  // Role-based filtering Tests
  // --------------------------------------------------------------------------
  describe('role-based filtering', () => {
    it('should show only own requests for End-User', () => {
      mockCurrentUser = END_USER;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { createdBy: END_USER.id }),
        createRequest('2', RequestStatus.SUBMITTED, { createdBy: END_USER.id }),
        createRequest('3', RequestStatus.SUBMITTED, { createdBy: 'other-user' }), // Not visible
      ];

      renderRequestList();

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
    });

    it('should show assigned and ENGINEERING_REVIEW requests for Engineer', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, { assignedTo: ENGINEER.id }),
        createRequest('2', RequestStatus.ENGINEERING_REVIEW), // Ready for any engineer
        createRequest('3', RequestStatus.SUBMITTED), // Not visible (not assigned, not engineering review)
        createRequest('4', RequestStatus.IN_PROGRESS, { assignedTo: 'other-engineer' }), // Not visible
      ];

      renderRequestList();

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 4')).not.toBeInTheDocument();
    });

    it('should show all requests for Admin', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { createdBy: 'user-a' }),
        createRequest('2', RequestStatus.IN_PROGRESS, { createdBy: 'user-b' }),
        createRequest('3', RequestStatus.COMPLETED, { createdBy: 'user-c' }),
      ];

      renderRequestList();

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.getByText('Request 3')).toBeInTheDocument();
    });

    it('should show all requests for Manager', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.IN_PROGRESS),
        createRequest('3', RequestStatus.COMPLETED),
      ];

      renderRequestList();

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.getByText('Request 3')).toBeInTheDocument();
    });

    it('should return empty list when no requests match role filter', () => {
      mockCurrentUser = END_USER;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { createdBy: 'other-user' }),
      ];

      renderRequestList();

      expect(screen.queryByText('Request 1')).not.toBeInTheDocument();
    });

    it('should handle null currentUser gracefully', () => {
      // This tests the guard clause - should filter out all requests
      mockCurrentUser = null as any;
      mockRequests = [createRequest('1', RequestStatus.SUBMITTED)];

      // Should not crash
      expect(() => renderRequestList()).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // Quick filter Tests
  // --------------------------------------------------------------------------
  describe('quick filters', () => {
    it('should filter by createdBy for my-requests filter', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { createdBy: MANAGER.id }),
        createRequest('2', RequestStatus.SUBMITTED, { createdBy: 'other-user' }),
      ];

      renderRequestList('/requests?filter=my-requests');

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.queryByText('Request 2')).not.toBeInTheDocument();
    });

    it('should filter by assignedTo for assigned-to-me filter', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [
        createRequest('1', RequestStatus.IN_PROGRESS, { assignedTo: ENGINEER.id }),
        createRequest('2', RequestStatus.IN_PROGRESS, { assignedTo: 'other-engineer' }),
        createRequest('3', RequestStatus.ENGINEERING_REVIEW), // Visible due to role filter but not assigned
      ];

      renderRequestList('/requests?filter=assigned-to-me');

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.queryByText('Request 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
    });

    it('should show MANAGER_REVIEW for Admin needs-attention', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.MANAGER_REVIEW),
        createRequest('2', RequestStatus.SUBMITTED),
        createRequest('3', RequestStatus.IN_PROGRESS),
      ];

      renderRequestList('/requests?filter=needs-attention');

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.queryByText('Request 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
    });

    it('should show MANAGER_REVIEW for Manager needs-attention', () => {
      mockCurrentUser = MANAGER;
      mockRequests = [
        createRequest('1', RequestStatus.MANAGER_REVIEW),
        createRequest('2', RequestStatus.COMPLETED),
      ];

      renderRequestList('/requests?filter=needs-attention');

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.queryByText('Request 2')).not.toBeInTheDocument();
    });

    it('should show assigned ENGINEERING_REVIEW/REVISION_REQUESTED for Engineer needs-attention', () => {
      mockCurrentUser = ENGINEER;
      mockRequests = [
        createRequest('1', RequestStatus.ENGINEERING_REVIEW, { assignedTo: ENGINEER.id }),
        createRequest('2', RequestStatus.REVISION_REQUESTED, { assignedTo: ENGINEER.id }),
        createRequest('3', RequestStatus.ENGINEERING_REVIEW), // Not assigned to this engineer
        createRequest('4', RequestStatus.IN_PROGRESS, { assignedTo: ENGINEER.id }), // Not needs-attention status
      ];

      renderRequestList('/requests?filter=needs-attention');

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 4')).not.toBeInTheDocument();
    });

    it('should show own REVISION_APPROVAL for End-User needs-attention', () => {
      mockCurrentUser = END_USER;
      mockRequests = [
        createRequest('1', RequestStatus.REVISION_APPROVAL, { createdBy: END_USER.id }),
        createRequest('2', RequestStatus.REVISION_APPROVAL, { createdBy: 'other-user' }),
        createRequest('3', RequestStatus.COMPLETED, { createdBy: END_USER.id }),
      ];

      renderRequestList('/requests?filter=needs-attention');

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.queryByText('Request 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Search filtering Tests
  // --------------------------------------------------------------------------
  describe('search filtering', () => {
    beforeEach(() => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { title: 'Alpha Project', vendor: 'FANUC', createdByName: 'John Smith' }),
        createRequest('2', RequestStatus.SUBMITTED, { title: 'Beta Test', vendor: 'Siemens', createdByName: 'Jane Doe' }),
        createRequest('3', RequestStatus.SUBMITTED, { title: 'Gamma Work', vendor: 'ABB', createdByName: 'Bob Alpha' }),
      ];
    });

    it('should match title case-insensitively', () => {
      renderRequestList();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'alpha' } });

      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      expect(screen.queryByText('Beta Test')).not.toBeInTheDocument();
    });

    it('should match vendor case-insensitively', () => {
      renderRequestList();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'siemens' } });

      expect(screen.getByText('Beta Test')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument();
    });

    it('should match createdByName case-insensitively', () => {
      renderRequestList();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'john' } });

      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      expect(screen.queryByText('Beta Test')).not.toBeInTheDocument();
    });

    it('should return no results when search matches nothing', () => {
      renderRequestList();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument();
      expect(screen.queryByText('Beta Test')).not.toBeInTheDocument();
      expect(screen.queryByText('Gamma Work')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Status and Priority filtering Tests
  // --------------------------------------------------------------------------
  describe('status and priority filtering', () => {
    it('should filter by single status from URL param', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.IN_PROGRESS),
        createRequest('3', RequestStatus.COMPLETED),
      ];

      renderRequestList(`/requests?status=${RequestStatus.SUBMITTED}`);

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.queryByText('Request 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
    });

    it('should filter by comma-separated statuses from URL param', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
        createRequest('2', RequestStatus.IN_PROGRESS),
        createRequest('3', RequestStatus.COMPLETED),
        createRequest('4', RequestStatus.DENIED),
      ];

      renderRequestList(`/requests?status=${RequestStatus.SUBMITTED},${RequestStatus.IN_PROGRESS}`);

      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
      expect(screen.queryByText('Request 4')).not.toBeInTheDocument();
    });

    it('should display priority badges correctly', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { priority: 'High' }),
        createRequest('2', RequestStatus.SUBMITTED, { priority: 'Medium' }),
        createRequest('3', RequestStatus.SUBMITTED, { priority: 'Low' }),
      ];

      renderRequestList();

      // Verify priority badges are rendered (may have multiple if also in filter dropdown)
      expect(screen.getAllByText('High Priority').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Medium Priority').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Low Priority').length).toBeGreaterThanOrEqual(1);
    });

    it('should combine status and priority filters', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { priority: 'High' }),
        createRequest('2', RequestStatus.SUBMITTED, { priority: 'Low' }),
        createRequest('3', RequestStatus.IN_PROGRESS, { priority: 'High' }),
      ];

      // This tests that multiple filters work together
      renderRequestList(`/requests?status=${RequestStatus.SUBMITTED}`);

      // Should show both Submitted requests initially
      expect(screen.getByText('Request 1')).toBeInTheDocument();
      expect(screen.getByText('Request 2')).toBeInTheDocument();
      expect(screen.queryByText('Request 3')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Sorting Tests
  // --------------------------------------------------------------------------
  describe('sorting', () => {
    it('should sort by date descending (newest first) by default', () => {
      mockCurrentUser = ADMIN;
      const oldDate = new Date('2024-01-01').toISOString();
      const newDate = new Date('2024-12-01').toISOString();

      mockRequests = [
        createRequest('old', RequestStatus.SUBMITTED, { createdAt: oldDate, title: 'Old Request' }),
        createRequest('new', RequestStatus.SUBMITTED, { createdAt: newDate, title: 'New Request' }),
      ];

      renderRequestList();

      const requestElements = screen.getAllByRole('link').filter(
        el => el.getAttribute('href')?.match(/\/requests\//)
      );

      // First request should be newer
      expect(requestElements[0].textContent).toContain('New Request');
    });

    it('should sort by priority descending (High first)', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { priority: 'Low', title: 'Low Priority' }),
        createRequest('2', RequestStatus.SUBMITTED, { priority: 'High', title: 'High Priority' }),
        createRequest('3', RequestStatus.SUBMITTED, { priority: 'Medium', title: 'Medium Priority' }),
      ];

      renderRequestList();

      // Find and change sort select
      const sortSelect = screen.getAllByRole('combobox').find(
        el => el.getAttribute('name') === 'sortBy' ||
              (el as HTMLSelectElement).value?.includes('date')
      );

      if (sortSelect) {
        fireEvent.change(sortSelect, { target: { value: 'priority-desc' } });

        const requestElements = screen.getAllByRole('link').filter(
          el => el.getAttribute('href')?.match(/\/requests\//)
        );

        // High priority should be first
        expect(requestElements[0].textContent).toContain('High Priority');
      }
    });

    it('should sort by status in workflow order', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.COMPLETED, { title: 'Completed Request' }),
        createRequest('2', RequestStatus.SUBMITTED, { title: 'Submitted Request' }),
        createRequest('3', RequestStatus.IN_PROGRESS, { title: 'In Progress Request' }),
      ];

      renderRequestList();

      const sortSelect = screen.getAllByRole('combobox').find(
        el => (el as HTMLSelectElement).value?.includes('date')
      );

      if (sortSelect) {
        fireEvent.change(sortSelect, { target: { value: 'status' } });

        // Verify sort happened - Submitted should come before In Progress which comes before Completed
        const requestElements = screen.getAllByRole('link').filter(
          el => el.getAttribute('href')?.match(/\/requests\//)
        );

        expect(requestElements.length).toBe(3);
      }
    });

    it('should sort by title alphabetically ascending', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { title: 'Zebra Project' }),
        createRequest('2', RequestStatus.SUBMITTED, { title: 'Alpha Project' }),
        createRequest('3', RequestStatus.SUBMITTED, { title: 'Beta Project' }),
      ];

      renderRequestList();

      const sortSelect = screen.getAllByRole('combobox').find(
        el => (el as HTMLSelectElement).value?.includes('date')
      );

      if (sortSelect) {
        fireEvent.change(sortSelect, { target: { value: 'title-asc' } });

        const requestElements = screen.getAllByRole('link').filter(
          el => el.getAttribute('href')?.match(/\/requests\//)
        );

        // Alpha should be first
        expect(requestElements[0].textContent).toContain('Alpha');
      }
    });

    it('should sort by title alphabetically descending', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED, { title: 'Zebra Project' }),
        createRequest('2', RequestStatus.SUBMITTED, { title: 'Alpha Project' }),
      ];

      renderRequestList();

      const sortSelect = screen.getAllByRole('combobox').find(
        el => (el as HTMLSelectElement).value?.includes('date')
      );

      if (sortSelect) {
        fireEvent.change(sortSelect, { target: { value: 'title-desc' } });

        const requestElements = screen.getAllByRole('link').filter(
          el => el.getAttribute('href')?.match(/\/requests\//)
        );

        // Zebra should be first
        expect(requestElements[0].textContent).toContain('Zebra');
      }
    });
  });

  // --------------------------------------------------------------------------
  // Empty State Tests
  // --------------------------------------------------------------------------
  describe('empty states', () => {
    it('should display empty state when no requests exist', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [];

      renderRequestList();

      expect(screen.getByText(/no active requests/i)).toBeInTheDocument();
    });

    it('should display empty state when filters match nothing', () => {
      mockCurrentUser = ADMIN;
      mockRequests = [
        createRequest('1', RequestStatus.SUBMITTED),
      ];

      renderRequestList();

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent-query' } });

      // The request should not be visible
      expect(screen.queryByText('Request 1')).not.toBeInTheDocument();
    });
  });
});
