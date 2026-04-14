export interface LoanApplication {
  id: string;
  applicant: string;
  amount: number;
  status: 'pending' | 'under_review' | 'flagged' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateLoanApplicationRequest {
  applicant: string;
  amount: number;
  status?: 'pending' | 'under_review' | 'flagged' | 'approved' | 'rejected';
}

export interface UpdateLoanApplicationRequest {
  applicant?: string;
  amount?: number;
  status?: 'pending' | 'under_review' | 'flagged' | 'approved' | 'rejected';
}

export type UserRole = 'admin' | 'manager' | 'officer';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}