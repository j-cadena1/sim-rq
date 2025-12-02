import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SimRequest, User, UserRole, MOCK_USERS, RequestStatus, Comment } from '../types';

interface SimFlowContextType {
  currentUser: User;
  switchUser: (role: UserRole) => void;
  requests: SimRequest[];
  addRequest: (title: string, description: string, vendor: string, priority: 'Low' | 'Medium' | 'High') => void;
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
  // Simulating Auth
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  // Simulating Database
  const [requests, setRequests] = useState<SimRequest[]>(() => {
    const saved = localStorage.getItem('sim-flow-requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sim-flow-requests', JSON.stringify(requests));
  }, [requests]);

  const switchUser = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const addRequest = (title: string, description: string, vendor: string, priority: 'Low' | 'Medium' | 'High') => {
    const newRequest: SimRequest = {
      id: crypto.randomUUID(),
      title,
      description,
      vendor,
      priority,
      status: RequestStatus.SUBMITTED,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString(),
      comments: []
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  const assignEngineer = (id: string, engineerId: string, hours: number) => {
    const engineer = MOCK_USERS.find(u => u.id === engineerId);
    setRequests(prev => prev.map(req => 
      req.id === id ? { 
        ...req, 
        assignedTo: engineerId, 
        assignedToName: engineer?.name, 
        estimatedHours: hours,
        status: RequestStatus.ENGINEERING_REVIEW 
      } : req
    ));
  };

  const addComment = (requestId: string, content: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: new Date().toISOString()
    };
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, comments: [...req.comments, newComment] } : req
    ));
  };

  const getUsersByRole = (role: UserRole) => MOCK_USERS.filter(u => u.role === role);

  return (
    <SimFlowContext.Provider value={{
      currentUser,
      switchUser,
      requests,
      addRequest,
      updateRequestStatus,
      assignEngineer,
      addComment,
      getUsersByRole
    }}>
      {children}
    </SimFlowContext.Provider>
  );
};