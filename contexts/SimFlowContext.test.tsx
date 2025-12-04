import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SimFlowProvider, useSimFlow } from './SimFlowContext';
import { UserRole, MOCK_USERS } from '../types';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API hooks
vi.mock('../api/hooks', () => ({
  useRequests: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useCreateRequest: () => ({
    mutate: vi.fn(),
  }),
  useUpdateRequestStatus: () => ({
    mutate: vi.fn(),
  }),
  useAssignEngineer: () => ({
    mutate: vi.fn(),
  }),
  useAddComment: () => ({
    mutate: vi.fn(),
  }),
  useUsers: () => ({
    data: MOCK_USERS,
    isLoading: false,
    isError: false,
  }),
}));

describe('SimFlowContext', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SimFlowProvider>{children}</SimFlowProvider>
    </QueryClientProvider>
  );

  describe('useSimFlow hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useSimFlow());
      }).toThrow('useSimFlow must be used within a SimFlowProvider');
    });

    it('should provide context when used within provider', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.currentUser).toBeDefined();
      expect(result.current.requests).toEqual([]);
    });
  });

  describe('currentUser and switchUser', () => {
    it('should start with first user', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });
      expect(result.current.currentUser.role).toBe(UserRole.USER);
    });

    it('should switch user by role', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });

      act(() => {
        result.current.switchUser(UserRole.MANAGER);
      });

      expect(result.current.currentUser.role).toBe(UserRole.MANAGER);
    });
  });

  describe('API integration methods', () => {
    it('should have addRequest method', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });
      expect(typeof result.current.addRequest).toBe('function');
    });

    it('should have updateRequestStatus method', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });
      expect(typeof result.current.updateRequestStatus).toBe('function');
    });

    it('should have assignEngineer method', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });
      expect(typeof result.current.assignEngineer).toBe('function');
    });

    it('should have addComment method', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });
      expect(typeof result.current.addComment).toBe('function');
    });
  });

  describe('getUsersByRole', () => {
    it('should filter users by role', () => {
      const { result } = renderHook(() => useSimFlow(), { wrapper });

      const engineers = result.current.getUsersByRole(UserRole.ENGINEER);
      expect(engineers.every(u => u.role === UserRole.ENGINEER)).toBe(true);

      const managers = result.current.getUsersByRole(UserRole.MANAGER);
      expect(managers.every(u => u.role === UserRole.MANAGER)).toBe(true);
    });
  });
});
