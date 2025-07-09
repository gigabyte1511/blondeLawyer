// API Types

// Customer types
export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  telegram_id?: string;
}

// Expert types
export interface Expert {
  id?: number;
  name: string;
  specialization: string;
  email: string;
  phone?: string;
  telegram_id?: string;
}

// Consultation types
export interface Consultation {
  id?: number;
  expert_id: number;
  customer_id: number;
  type: string;
  message?: string;
  scheduled_for: string | Date; // ISO date string or Date object
  expert?: Expert;
  customer?: Customer;
}

// API Response types
interface ApiResponse<T> {
  message: string;
  [key: string]: any;
}

interface ConsultationResponse extends ApiResponse<Consultation> {
  consultation: Consultation;
}

interface ConsultationsResponse extends ApiResponse<Consultation[]> {
  consultations: Consultation[];
}

interface CustomerResponse extends ApiResponse<Customer> {
  customer: Customer;
}

interface CustomersResponse extends ApiResponse<Customer[]> {
  customers: Customer[];
}

interface ExpertResponse extends ApiResponse<Expert> {
  expert: Expert;
}

interface ExpertsResponse extends ApiResponse<Expert[]> {
  experts: Expert[];
}

// Error handling
class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Main API class
export class Api {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Helper method for API requests
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'An error occurred while fetching data', 
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        500
      );
    }
  }

  // Consultation methods
  async getConsultations(): Promise<ConsultationsResponse> {
    return this.request<ConsultationsResponse>('/consultations');
  }

  async getConsultationById(id: number): Promise<ConsultationResponse> {
    return this.request<ConsultationResponse>(`/consultations/${id}`);
  }

  async getConsultationsByCustomer(customerId: number): Promise<ConsultationsResponse> {
    return this.request<ConsultationsResponse>(`/consultations/customer/${customerId}`);
  }

  async getConsultationsByExpert(expertId: number): Promise<ConsultationsResponse> {
    return this.request<ConsultationsResponse>(`/consultations/expert/${expertId}`);
  }

  async createConsultation(consultation: Consultation): Promise<ConsultationResponse> {
    // Convert Date object to ISO string if needed
    const payload = {
      ...consultation,
      scheduled_for: consultation.scheduled_for instanceof Date 
        ? consultation.scheduled_for.toISOString() 
        : consultation.scheduled_for
    };

    return this.request<ConsultationResponse>('/consultations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteConsultation(id: number): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/consultations/${id}`, {
      method: 'DELETE',
    });
  }

  // Customer methods
  async getCustomers(): Promise<CustomersResponse> {
    return this.request<CustomersResponse>('/customers');
  }

  async getCustomerById(id: number): Promise<CustomerResponse> {
    return this.request<CustomerResponse>(`/customers/${id}`);
  }

  async createCustomer(customer: Customer): Promise<CustomerResponse> {
    return this.request<CustomerResponse>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: number): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Expert methods
  async getExperts(): Promise<ExpertsResponse> {
    return this.request<ExpertsResponse>('/experts');
  }

  async getExpertById(id: number): Promise<ExpertResponse> {
    return this.request<ExpertResponse>(`/experts/${id}`);
  }

  async createExpert(expert: Expert): Promise<ExpertResponse> {
    return this.request<ExpertResponse>('/experts', {
      method: 'POST',
      body: JSON.stringify(expert),
    });
  }

  async deleteExpert(id: number): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/experts/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a default API instance
const api = new Api();
export default api;