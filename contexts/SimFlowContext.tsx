import React, { createContext, useContext, ReactNode } from 'react';
import { User, UserRole, RequestStatus, SimRequest } from '../types';
import { useAuth } from './AuthContext';
import {
  useRequests,
  useCreateRequest,
  useUpdateRequestStatus,
  useAssignEngineer,
  useAddComment,
  useUsers,
} from '../lib/api/hooks';

interface SimFlowContextType {
  currentUser: User;
  requests: SimRequest[];
  isLoadingRequests: boolean;
  addRequest: (title: string, description: string, vendor: string, priority: 'Low' | 'Medium' | 'High', projectId: string) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  assignEngineer: (id: string, engineerId: string, hours: number) => void;
  addComment: (requestId: string, content: string) => void;
  getUsersByRole: (role: UserRole) => User[];
}

const SimFlowContext = createContext<SimFlowContextType | undefined>(undefined);

export const useSimFlow = () => {
  const context = useContext(SimFlowContext);
  if (!context) throw new Error('useSimFlow must be used within a SimFlowProvider');
  return context;
};

export const SimFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();

  // API hooks
  const { data: requests = [], isLoading: isLoadingRequests } = useRequests();
  const createRequestMutation = useCreateRequest();
  const updateStatusMutation = useUpdateRequestStatus();
  const assignEngineerMutation = useAssignEngineer();
  const addCommentMutation = useAddComment();
  const { data: users = [] } = useUsers();

  // Use authenticated user as current user
  const currentUser = authUser as User;

  const addRequest = (
    title: string,
    description: string,
    vendor: string,
    priority: 'Low' | 'Medium' | 'High',
    projectId: string
  ) => {
    createRequestMutation.mutate({ title, description, vendor, priority, projectId });
  };

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const assignEngineer = (id: string, engineerId: string, hours: number) => {
    assignEngineerMutation.mutate({
      id,
      engineerId,
      estimatedHours: hours,
    });
  };

  const addComment = (requestId: string, content: string) => {
    addCommentMutation.mutate({ requestId, content });
  };

  const getUsersByRole = (role: UserRole) => {
    // Use API users if available, otherwise fall back to mock users
    if (users && users.length > 0) {
      return users.filter(u => u.role === role);
    }
    return MOCK_USERS.filter(u => u.role === role);
  };

  return (
    <SimFlowContext.Provider
      value={{
        currentUser,
        requests,
        isLoadingRequests,
        addRequest,
        updateRequestStatus,
        assignEngineer,
        addComment,
        getUsersByRole,
      }}
    >
      {children}
    </SimFlowContext.Provider>
  );
};
