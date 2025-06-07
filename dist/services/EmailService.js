"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const uuid_1 = require("uuid");
const RateLimiter_1 = require("../utils/RateLimiter");
const CircuitBreaker_1 = require("../utils/CircuitBreaker");
class EmailService {
    constructor(primaryProvider, secondaryProvider, maxRetries = 3, baseDelay = 1000) {
        this.primaryProvider = primaryProvider;
        this.secondaryProvider = secondaryProvider;
        this.rateLimiter = new RateLimiter_1.SimpleRateLimiter();
        this.primaryCircuitBreaker = new CircuitBreaker_1.SimpleCircuitBreaker();
        this.secondaryCircuitBreaker = new CircuitBreaker_1.SimpleCircuitBreaker();
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.sentEmails = new Map();
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async retryWithBackoff(operation, attempt) {
        try {
            return await operation();
        }
        catch (error) {
            if (attempt >= this.maxRetries) {
                throw error;
            }
            const delay = this.baseDelay * Math.pow(2, attempt);
            await this.sleep(delay);
            return this.retryWithBackoff(operation, attempt + 1);
        }
    }
    async sendWithProvider(provider, options, circuitBreaker) {
        if (circuitBreaker.isOpen()) {
            throw new Error(`Circuit breaker is open for ${provider.getName()}`);
        }
        try {
            const result = await provider.sendEmail(options);
            circuitBreaker.recordSuccess();
            return result;
        }
        catch (error) {
            circuitBreaker.recordFailure();
            throw error;
        }
    }
    async sendEmail(options) {
        const id = options.idempotencyKey || (0, uuid_1.v4)();
        // Check for duplicate email
        if (this.sentEmails.has(id)) {
            return this.sentEmails.get(id);
        }
        if (!this.rateLimiter.canSend()) {
            throw new Error('Rate limit exceeded');
        }
        const status = {
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
                await this.retryWithBackoff(() => this.sendWithProvider(this.primaryProvider, options, this.primaryCircuitBreaker), 0);
                status.status = 'sent';
                return status;
            }
            catch (primaryError) {
                const errorMessage = primaryError instanceof Error ? primaryError.message : 'Unknown error';
                console.log(`Primary provider failed: ${errorMessage}`);
                // Try secondary provider
                try {
                    status.provider = this.secondaryProvider.getName();
                    await this.retryWithBackoff(() => this.sendWithProvider(this.secondaryProvider, options, this.secondaryCircuitBreaker), 0);
                    status.status = 'sent';
                    return status;
                }
                catch (secondaryError) {
                    const errorMessage = secondaryError instanceof Error ? secondaryError.message : 'Unknown error';
                    console.log(`Secondary provider failed: ${errorMessage}`);
                    throw secondaryError;
                }
            }
        }
        catch (error) {
            status.status = 'failed';
            status.error = error instanceof Error ? error.message : 'Unknown error';
            throw error;
        }
        finally {
            status.attempts++;
            status.lastAttempt = new Date();
            this.sentEmails.set(id, status);
        }
    }
    getEmailStatus(id) {
        return this.sentEmails.get(id);
    }
}
exports.EmailService = EmailService;
