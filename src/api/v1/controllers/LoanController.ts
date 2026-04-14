import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { LoanRepository } from '../repositories/LoanRepository';
import { sendSuccessResponse, sendErrorResponse, handleError } from '../utils';
import { ValidationError, NotFoundError } from '../errors';
import { CreateLoanApplicationRequest, UpdateLoanApplicationRequest } from '../types';

const createLoanSchema = Joi.object({
  applicant: Joi.string().required(),
  amount: Joi.number().positive().required(),
  status: Joi.string().valid('pending', 'under_review', 'flagged', 'approved', 'rejected').optional(),
});

const updateLoanSchema = Joi.object({
  applicant: Joi.string().optional(),
  amount: Joi.number().positive().optional(),
  status: Joi.string().valid('pending', 'under_review', 'flagged', 'approved', 'rejected').optional(),
});

export class LoanController {
  private loanRepository = new LoanRepository();

  async getAllLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loans = await this.loanRepository.findAll();
      sendSuccessResponse(res, loans);
    } catch (error) {
      const appError = handleError(error);
      sendErrorResponse(res, appError);
    }
  }

  async getLoanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const loan = await this.loanRepository.findById(id as string);

      if (!loan) {
        throw new NotFoundError('Loan application not found');
      }

      sendSuccessResponse(res, loan);
    } catch (error) {
      const appError = handleError(error);
      sendErrorResponse(res, appError);
    }
  }

  async createLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = createLoanSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const loanData: CreateLoanApplicationRequest = value;
      const loan = await this.loanRepository.create(loanData);
      sendSuccessResponse(res, loan, 201);
    } catch (error) {
      const appError = handleError(error);
      sendErrorResponse(res, appError);
    }
  }

  async updateLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateLoanSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      const updateData: UpdateLoanApplicationRequest = value;
      const loan = await this.loanRepository.update(id as string, updateData);
      sendSuccessResponse(res, loan);
    } catch (error) {
      const appError = handleError(error);
      sendErrorResponse(res, appError);
    }
  }

  async deleteLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.loanRepository.delete(id as string);
      sendSuccessResponse(res, { message: 'Loan application deleted successfully' });
    } catch (error) {
      const appError = handleError(error);
      sendErrorResponse(res, appError);
    }
  }
}