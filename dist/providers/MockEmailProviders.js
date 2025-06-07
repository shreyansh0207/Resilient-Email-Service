"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSecondaryProvider = exports.MockPrimaryProvider = void 0;
class MockPrimaryProvider {
    constructor(failureRate = 0.2) {
        this.failureRate = failureRate;
    }
    async sendEmail(options) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Simulate random failures
        if (Math.random() < this.failureRate) {
            throw new Error('Primary provider failed to send email');
        }
        return true;
    }
    getName() {
        return 'PrimaryProvider';
    }
}
exports.MockPrimaryProvider = MockPrimaryProvider;
class MockSecondaryProvider {
    constructor(failureRate = 0.1) {
        this.failureRate = failureRate;
    }
    async sendEmail(options) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 150));
        // Simulate random failures
        if (Math.random() < this.failureRate) {
            throw new Error('Secondary provider failed to send email');
        }
        return true;
    }
    getName() {
        return 'SecondaryProvider';
    }
}
exports.MockSecondaryProvider = MockSecondaryProvider;
