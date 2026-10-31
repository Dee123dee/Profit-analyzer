/**
 * Base API Client with Mock Mode toggle.
 * When MOCK_MODE is true, functions return simulated asynchronous promises with realistic mock datasets.
 * When MOCK_MODE is false, functions invoke the real Spring Boot REST backend endpoints.
 */

export const API_CONFIG = {
    BASE_URL: "/api/v1",
    MOCK_MODE: true, // Default to true for presentation and visual layout testing
    MOCK_DELAY_MS: 300
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: Request failed`);
        }
        return data;
    } catch (err) {
        console.error(`API Error [${options.method || 'GET'} ${url}]:`, err);
        throw err;
    }
}

