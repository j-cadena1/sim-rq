/**
 * Test Utilities for Frontend Unit Tests
 *
 * Provides reusable render helpers and mock setup for React component testing.
 * All components require wrapping in various context providers.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Import providers
import { SimRQProvider } from '../../contexts/SimRQContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { ModalProvider } from '../../components/Modal';
import { ToastProvider } from '../../components/Toast';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Import types for mock configuration
import type { User, SimRequest, Project } from '../../types';
import { UserRole } from '../../types';

// ============================================================================
// Default Mock User
// ============================================================================

export const defaultMockUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.MANAGER,
};

// ============================================================================
// Provider Wrapper Configuration
// ============================================================================

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route for MemoryRouter */
  initialRoute?: string;
  /** Route pattern if component needs URL params */
  routePath?: string;
  /** Mock user for AuthContext - if null, simulates logged out state */
  mockUser?: User | null;
  /** Mock requests for SimRQContext */
  mockRequests?: SimRequest[];
  /** Mock projects for SimRQContext */
  mockProjects?: Project[];
  /** Custom QueryClient (optional - creates new one if not provided) */
  queryClient?: QueryClient;
}

// ============================================================================
// Create Fresh QueryClient for Tests
// ============================================================================

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ============================================================================
// All Providers Wrapper Component
// ============================================================================

interface AllProvidersProps {
  children: ReactNode;
  queryClient: QueryClient;
  initialRoute: string;
  routePath?: string;
}

function AllProviders({
  children,
  queryClient,
  initialRoute,
  routePath,
}: AllProvidersProps): ReactElement {
  const content = routePath ? (
    <Routes>
      <Route path={routePath} element={children} />
    </Routes>
  ) : (
    children
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SimRQProvider>
          <NotificationProvider>
            <ModalProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={[initialRoute]}>
                  {content}
                </MemoryRouter>
              </ToastProvider>
            </ModalProvider>
          </NotificationProvider>
        </SimRQProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ============================================================================
// Main Render Helper
// ============================================================================

/**
 * Render a component with all required providers wrapped.
 *
 * @example
 * // Simple render
 * const { getByText } = renderWithProviders(<Dashboard />);
 *
 * @example
 * // With route params
 * renderWithProviders(<RequestDetail />, {
 *   initialRoute: '/requests/req-123',
 *   routePath: '/requests/:id',
 * });
 *
 * @example
 * // With custom mock user
 * renderWithProviders(<Dashboard />, {
 *   mockUser: { id: 'admin-1', name: 'Admin', role: UserRole.ADMIN },
 * });
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const {
    initialRoute = '/',
    routePath,
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders
      queryClient={queryClient}
      initialRoute={initialRoute}
      routePath={routePath}
    >
      {children}
    </AllProviders>
  );

  const result = render(ui, { wrapper, ...renderOptions });

  return {
    ...result,
    queryClient,
  };
}

// ============================================================================
// Axios Mock Factory
// ============================================================================

/**
 * Creates a mock axios instance for use with vi.mock('axios').
 * Must be called with vi.hoisted() before vi.mock().
 *
 * @example
 * const { mockAxiosInstance, mockGet, mockPost } = vi.hoisted(() => createMockAxios());
 *
 * vi.mock('axios', () => ({
 *   default: {
 *     create: vi.fn(() => mockAxiosInstance),
 *   },
 * }));
 */
export function createMockAxios() {
  const mockGet = vi.fn().mockResolvedValue({ data: {} });
  const mockPost = vi.fn().mockResolvedValue({ data: {} });
  const mockPatch = vi.fn().mockResolvedValue({ data: {} });
  const mockDelete = vi.fn().mockResolvedValue({ data: {} });

  const mockAxiosInstance = {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    mockAxiosInstance,
    mockGet,
    mockPost,
    mockPatch,
    mockDelete,
  };
}

// ============================================================================
// API Hooks Mock Factory
// ============================================================================

/**
 * Creates mock implementations for common API hooks.
 * Use with vi.mock('../lib/api/hooks', ...).
 *
 * @example
 * vi.mock('../lib/api/hooks', () => createMockApiHooks({
 *   requests: [mockRequest1, mockRequest2],
 *   users: [mockUser1, mockUser2],
 * }));
 */
export function createMockApiHooks(config: {
  requests?: SimRequest[];
  users?: User[];
  projects?: Project[];
} = {}) {
  const { requests = [], users = [], projects = [] } = config;

  return {
    // Request hooks
    useRequests: () => ({
      data: { data: requests },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
    useRequest: (id: string) => ({
      data: {
        request: requests.find((r) => r.id === id),
        comments: [],
      },
      isLoading: false,
      isError: false,
    }),
    useCreateRequest: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
    useUpdateRequestStatus: () => ({ mutate: vi.fn(), isPending: false }),
    useDeleteRequest: () => ({ mutate: vi.fn(), isPending: false }),
    useAssignEngineer: () => ({ mutate: vi.fn(), isPending: false }),
    useAddComment: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateRequestDescription: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateRequestTitle: () => ({ mutate: vi.fn(), isPending: false }),

    // User hooks
    useUsers: () => ({
      data: users,
      isLoading: false,
      isError: false,
    }),

    // Project hooks
    useProjects: () => ({
      data: projects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
    useProject: (id: string) => ({
      data: projects.find((p) => p.id === id) || null,
      isLoading: false,
      isError: false,
    }),
    useProjectsWithMetrics: () => ({
      data: projects.map((p) => ({
        ...p,
        utilizationPercentage: (p.usedHours / p.totalHours) * 100,
      })),
      isLoading: false,
      isError: false,
    }),
    useProjectsNearDeadline: () => ({
      data: [],
      isLoading: false,
      isError: false,
    }),
    useCreateProject: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
    useUpdateProject: () => ({ mutate: vi.fn(), isPending: false }),
    useDeleteProject: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateProjectStatus: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateProjectHours: () => ({ mutate: vi.fn(), isPending: false }),

    // Time tracking hooks
    useTimeEntries: () => ({ data: { timeEntries: [] }, isLoading: false, isError: false }),
    useAddTimeEntry: () => ({ mutate: vi.fn(), isPending: false }),

    // Title change hooks
    useTitleChangeRequests: () => ({ data: [], isLoading: false }),
    useRequestTitleChange: () => ({ mutate: vi.fn(), isPending: false }),
    useReviewTitleChangeRequest: () => ({ mutate: vi.fn(), isPending: false }),

    // Discussion hooks
    useDiscussionRequests: () => ({ data: { discussionRequests: [] }, isLoading: false }),
    useCreateDiscussionRequest: () => ({ mutate: vi.fn(), isPending: false }),
    useReviewDiscussionRequest: () => ({ mutate: vi.fn(), isPending: false }),

    // Analytics hooks
    useDashboardStats: () => ({
      data: null,
      isLoading: false,
      isError: false,
    }),
  };
}

// ============================================================================
// Auth Context Mock Factory
// ============================================================================

/**
 * Creates a mock AuthContext value for use with vi.mock.
 *
 * @example
 * vi.mock('../contexts/AuthContext', async () => ({
 *   ...await vi.importActual('../contexts/AuthContext'),
 *   useAuth: () => createMockAuthContext({ user: MOCK_ADMIN }),
 * }));
 */
export function createMockAuthContext(config: {
  user?: User | null;
  isLoading?: boolean;
  error?: string | null;
} = {}) {
  const { user = defaultMockUser, isLoading = false, error = null } = config;

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
  };
}

// ============================================================================
// Wait Utilities
// ============================================================================

/**
 * Wait for a condition to be true, useful for async state updates.
 */
export async function waitFor(
  condition: () => boolean,
  { timeout = 1000, interval = 50 } = {}
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout exceeded');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { screen, fireEvent, waitFor as rtlWaitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
