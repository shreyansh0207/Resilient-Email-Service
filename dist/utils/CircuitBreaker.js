"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCircuitBreaker = void 0;
class SimpleCircuitBreaker {
    constructor(failureThreshold = 5, resetTimeout = 30000) {
        this.failures = 0;
        this.lastFailureTime = 0;
        this.isCircuitOpen = false;
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
    }
    isOpen() {
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
    recordSuccess() {
        this.failures = 0;
        this.isCircuitOpen = false;
    }
    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.isCircuitOpen = true;
        }
    }
}
exports.SimpleCircuitBreaker = SimpleCircuitBreaker;
