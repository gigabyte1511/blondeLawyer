// API Types

// User types
export interface User {
  id?: number;
  name?: string;
  telegramId?: number;
  telegramLink?: string;
  role?: string;
}

// Customer types
export interface Customer extends User {
}

// Expert types
export interface Expert extends User {
}

// Consultation status type
export type ConsultationStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Consultation types
export interface IConsultation {
  id?: number;
  expertId: number;
  customerId: number;
  type: string;
  message?: string;
  status: ConsultationStatus | string;
  scheduledFor: Date | string;
  customer?: Customer;
  expert?: Expert;
  comment?: string;
}

// API Response types
interface ApiResponse<T> {
  message: string;
  [key: string]: any;
}

interface ConsultationResponse extends ApiResponse<IConsultation> {
  consultation: IConsultation;
}

interface ConsultationsResponse extends ApiResponse<IConsultation[]> {
  consultations: IConsultation[];
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

interface UserResponse extends ApiResponse<User> {
  user: User;
}

interface UsersResponse extends ApiResponse<User[]> {
  users: User[];
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

// User role response type
interface UserRoleResponse extends ApiResponse<{ role: string }> {
  role: 'expert' | 'customer' | 'unknown';
  user?: Expert | Customer;
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

  // User methods
  async getUsers(): Promise<UsersResponse> {
    return this.request<UsersResponse>('/users');
  }

  async getUserById(id: number): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`);
  }

  async getUserByTelegramId(telegramId: number | string): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/byTelegramId/${telegramId}`);
  }

  async getConsultationsByCustomer(customerId: number): Promise<ConsultationsResponse> {
    return this.request<ConsultationsResponse>(`/consultations/customer/${customerId}`);
  }

  async getConsultationsByExpert(expertId: number): Promise<ConsultationsResponse> {
    return this.request<ConsultationsResponse>(`/consultations/expert/${expertId}`);
  }

  async getConsultationByUserId(id: number): Promise<ConsultationResponse> {
    return this.request<ConsultationResponse>(`/consultations/user/${id}`);
  }
  
  async getConsultationById(id: number): Promise<ConsultationResponse> {
    return this.request<ConsultationResponse>(`/consultations/${id}`);
  }
  
  // Create new consultation
  async createConsultation(data: Partial<IConsultation>): Promise<ConsultationResponse> {
    return this.request<ConsultationResponse>('/consultations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  // Update consultation status
  async updateConsultation(id: number, data: Partial<IConsultation>): Promise<ConsultationResponse> {
    return this.request<ConsultationResponse>(`/consultations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

// Create and export a default API instance
const api = new Api();
export default api;