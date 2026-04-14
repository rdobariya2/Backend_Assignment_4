import { LoanModel } from '../models/LoanModel';
import { LoanApplication, CreateLoanApplicationRequest, UpdateLoanApplicationRequest } from '../types';

export class LoanRepository {
  private loanModel = new LoanModel();

  async create(loanData: CreateLoanApplicationRequest): Promise<LoanApplication> {
    return this.loanModel.create(loanData);
  }

  async findAll(): Promise<LoanApplication[]> {
    return this.loanModel.findAll();
  }

  async findById(id: string): Promise<LoanApplication | null> {
    return this.loanModel.findById(id);
  }

  async update(id: string, updateData: UpdateLoanApplicationRequest): Promise<LoanApplication> {
    return this.loanModel.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    return this.loanModel.delete(id);
  }
}