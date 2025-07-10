import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { IConsultation, Customer, Expert } from '../api';

// Consultation hooks
export function useConsultations() {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: () => api.getConsultations(),
  });
}

export function useConsultation(id: number) {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: () => api.getConsultationById(id),
    enabled: !!id,
  });
}

export function useConsultationsByCustomer(customerId: number) {
  return useQuery({
    queryKey: ['consultations', 'customer', customerId],
    queryFn: () => api.getConsultationsByCustomer(customerId),
    enabled: !!customerId,
  });
}

export function useConsultationsByExpert(expertId: number) {
  return useQuery({
    queryKey: ['consultations', 'expert', expertId],
    queryFn: () => api.getConsultationsByExpert(expertId),
    enabled: !!expertId,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (consultation: Partial<IConsultation>) => api.createConsultation(consultation),
    onSuccess: () => {
      // Invalidate and refetch consultations queries
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteConsultation(id),
    onSuccess: () => {
      // Invalidate and refetch consultations queries
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

// Customer hooks
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customer: Customer) => api.createCustomer(customer),
    onSuccess: () => {
      // Invalidate and refetch customers queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteCustomer(id),
    onSuccess: () => {
      // Invalidate and refetch customers queries
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Expert hooks
export function useExperts() {
  return useQuery({
    queryKey: ['experts'],
    queryFn: () => api.getExperts(),
  });
}

export function useExpert(id: number) {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: () => api.getExpertById(id),
    enabled: !!id,
  });
}

export function useCreateExpert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (expert: Expert) => api.createExpert(expert),
    onSuccess: () => {
      // Invalidate and refetch experts queries
      queryClient.invalidateQueries({ queryKey: ['experts'] });
    },
  });
}

export function useDeleteExpert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteExpert(id),
    onSuccess: () => {
      // Invalidate and refetch experts queries
      queryClient.invalidateQueries({ queryKey: ['experts'] });
    },
  });
}
