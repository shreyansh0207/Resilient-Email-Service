import { v4 as uuidv4 } from 'uuid';
import { EmailOptions, EmailProvider, EmailStatus } from '../types';
import { SimpleRateLimiter } from '../utils/RateLimiter';
import { SimpleCircuitBreaker } from '../utils/CircuitBreaker';

export class EmailService {
  private readonly primaryProvider: EmailProvider;
  private readonly secondaryProvider: EmailProvider;
  private readonly rateLimiter: SimpleRateLimiter;
  private readonly primaryCircuitBreaker: SimpleCircuitBreaker;
  private readonly secondaryCircuitBreaker: SimpleCircuitBreaker;
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly sentEmails: Map<string, EmailStatus>;

  constructor(
    primaryProvider: EmailProvider,
    secondaryProvider: EmailProvider,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) {
    this.primaryProvider = primaryProvider;
    this.secondaryProvider = secondaryProvider;
    this.rateLimiter = new SimpleRateLimiter();
    this.primaryCircuitBreaker = new SimpleCircuitBreaker();
    this.secondaryCircuitBreaker = new SimpleCircuitBreaker();
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.sentEmails = new Map();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff(
    operation: () => Promise<boolean>,
    attempt: number
  ): Promise<boolean> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }
      const delay = this.baseDelay * Math.pow(2, attempt);
      await this.sleep(delay);
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  private async sendWithProvider(
    provider: EmailProvider,
    options: EmailOptions,
    circuitBreaker: SimpleCircuitBreaker
  ): Promise<boolean> {
    if (circuitBreaker.isOpen()) {
      throw new Error(`Circuit breaker is open for ${provider.getName()}`);
    }

    try {
      const result = await provider.sendEmail(options);
      circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      circuitBreaker.recordFailure();
      throw error;
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailStatus> {
    const id = options.idempotencyKey || uuidv4();
    
    // Check for duplicate email
    if (this.sentEmails.has(id)) {
      return this.sentEmails.get(id)!;
    }

    if (!this.rateLimiter.canSend()) {
      throw new Error('Rate limit exceeded');
    }

    const status: EmailStatus = {
      id,
      status: 'pending',
      provider: '',
      attempts: 0,
      lastAttempt: new Date()
    };

    this.sentEmails.set(id, status);

    try {
      this.rateLimiter.recordSend();
      
      // Try primary provider first
      try {
        status.provider = this.primaryProvider.getName();
        await this.retryWithBackoff(
          () => this.sendWithProvider(this.primaryProvider, options, this.primaryCircuitBreaker),
          0
        );
        status.status = 'sent';
        return status;
      } catch (primaryError: unknown) {
        const errorMessage = primaryError instanceof Error ? primaryError.message : 'Unknown error';
        console.log(`Primary provider failed: ${errorMessage}`);
        
        // Try secondary provider
        try {
          status.provider = this.secondaryProvider.getName();
          await this.retryWithBackoff(
            () => this.sendWithProvider(this.secondaryProvider, options, this.secondaryCircuitBreaker),
            0
          );
          status.status = 'sent';
          return status;
        } catch (secondaryError: unknown) {
          const errorMessage = secondaryError instanceof Error ? secondaryError.message : 'Unknown error';
          console.log(`Secondary provider failed: ${errorMessage}`);
          throw secondaryError;
        }
      }
    } catch (error: unknown) {
      status.status = 'failed';
      status.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      status.attempts++;
      status.lastAttempt = new Date();
      this.sentEmails.set(id, status);
    }
  }

  getEmailStatus(id: string): EmailStatus | undefined {
    return this.sentEmails.get(id);
  }
} 