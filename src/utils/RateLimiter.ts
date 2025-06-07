import { RateLimiter } from '../types';

export class SimpleRateLimiter implements RateLimiter {
  private readonly maxRequests: number;
  private readonly timeWindow: number;
  private requests: number[];

  constructor(maxRequests: number = 100, timeWindow: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canSend(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }

  recordSend(): void {
    this.requests.push(Date.now());
  }
} 