import { CircuitBreaker } from '../types';

export class SimpleCircuitBreaker implements CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private isCircuitOpen: boolean = false;

  constructor(failureThreshold: number = 5, resetTimeout: number = 30000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  isOpen(): boolean {
    if (this.isCircuitOpen) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeout) {
        this.isCircuitOpen = false;
        this.failures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.isCircuitOpen = false;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.isCircuitOpen = true;
    }
  }
} 