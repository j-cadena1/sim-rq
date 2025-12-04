import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SimFlowProvider } from '../contexts/SimFlowContext';
import { ModalProvider } from './Modal';
import { ToastProvider } from './Toast';
import { RequestDetail } from './RequestDetail';
import { MOCK_USERS, MOCK_REQUESTS } from '../types';
import { vi } from 'vitest';

vi.mock('../api/hooks', () => ({
  ...vi.importActual('../api/hooks'),
  useRequest: (id: string) => ({
    data: {
      request: MOCK_REQUESTS.find(r => r.id === id),
      comments: [],
    },
    isLoading: false,
    isError: false,
  }),
  useRequests: () => ({
    data: MOCK_REQUESTS,
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

const queryClient = new QueryClient();

const renderComponent = (id: string) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <SimFlowProvider>
        <ModalProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={[`/requests/${id}`]}>
              <Routes>
                <Route path="/requests/:id" element={<RequestDetail />} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </ModalProvider>
      </SimFlowProvider>
    </QueryClientProvider>
  );
};

describe('RequestDetail', () => {
  it('should render request not found if request does not exist', async () => {
    renderComponent('invalid-id');
    expect(await screen.findByText('Request not found')).toBeInTheDocument();
  });

  it('should render request details correctly', async () => {
    const request = MOCK_REQUESTS[0];
    renderComponent(request.id);

    expect(await screen.findByText(request.title)).toBeInTheDocument();
    expect(screen.getByText(request.description)).toBeInTheDocument();
    expect(screen.getByText(request.vendor)).toBeInTheDocument();
  });
});
