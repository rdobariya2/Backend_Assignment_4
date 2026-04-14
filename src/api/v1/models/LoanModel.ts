import { db } from '../../../config/firebaseConfig';
import { LoanApplication, CreateLoanApplicationRequest, UpdateLoanApplicationRequest } from '../types';
import { NotFoundError } from '../errors';

export class LoanModel {
  private collection = db.collection('loans');

  async create(loanData: CreateLoanApplicationRequest): Promise<LoanApplication> {
    const now = new Date();
    const loan: Omit<LoanApplication, 'id'> = {
      ...loanData,
      status: loanData.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.collection.add(loan);
    return {
      id: docRef.id,
      ...loan,
    };
  }

  async findAll(): Promise<LoanApplication[]> {
    const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as LoanApplication[];
  }

  async findById(id: string): Promise<LoanApplication | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as LoanApplication;
  }

  async update(id: string, updateData: UpdateLoanApplicationRequest): Promise<LoanApplication> {
    const loan = await this.findById(id);
    if (!loan) {
      throw new NotFoundError('Loan application not found');
    }

    const updatedLoan = {
      ...loan,
      ...updateData,
      updatedAt: new Date(),
    };

    await this.collection.doc(id).update({
      ...updateData,
      updatedAt: new Date(),
    });

    return updatedLoan;
  }

  async delete(id: string): Promise<void> {
    const loan = await this.findById(id);
    if (!loan) {
      throw new NotFoundError('Loan application not found');
    }

    await this.collection.doc(id).delete();
  }
}