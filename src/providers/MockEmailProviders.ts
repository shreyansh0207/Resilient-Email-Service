import { EmailProvider, EmailOptions } from '../types';

export class MockPrimaryProvider implements EmailProvider {
  private failureRate: number;

  constructor(failureRate: number = 0.2) {
    this.failureRate = failureRate;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate random failures
    if (Math.random() < this.failureRate) {
      throw new Error('Primary provider failed to send email');
    }
    
    return true;
  }

  getName(): string {
    return 'PrimaryProvider';
  }
}

export class MockSecondaryProvider implements EmailProvider {
  private failureRate: number;

  constructor(failureRate: number = 0.1) {
    this.failureRate = failureRate;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Simulate random failures
    if (Math.random() < this.failureRate) {
      throw new Error('Secondary provider failed to send email');
    }
    
    return true;
  }

  getName(): string {
    return 'SecondaryProvider';
  }
} 