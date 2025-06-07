export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  idempotencyKey?: string;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<boolean>;
  getName(): string;
}

export interface EmailStatus {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  provider: string;
  attempts: number;
  lastAttempt: Date;
  error?: string;
}

export interface RateLimiter {
  canSend(): boolean;
  recordSend(): void;
}

export interface CircuitBreaker {
  isOpen(): boolean;
  recordSuccess(): void;
  recordFailure(): void;
} 