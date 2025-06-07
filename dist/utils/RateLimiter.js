"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleRateLimiter = void 0;
class SimpleRateLimiter {
    constructor(maxRequests = 100, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }
    canSend() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        return this.requests.length < this.maxRequests;
    }
    recordSend() {
        this.requests.push(Date.now());
    }
}
exports.SimpleRateLimiter = SimpleRateLimiter;
