import { API_CONFIG, request, sleep } from "./client.js";
import { mockProducts } from "../mock/mockData.js";

let productsState = [...mockProducts];

export const productsApi = {
    async getAll() {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            return { success: true, data: [...productsState] };
        }
        return request("/products");
    },

    async getById(id) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const found = productsState.find(p => p.id === Number(id));
            if (!found) throw new Error(`Product not found with id ${id}`);
            return { success: true, data: found };
        }
        return request(`/products/${id}`);
    },

    async create(productData) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const newProduct = {
                id: productsState.length ? Math.max(...productsState.map(p => p.id)) + 1 : 1,
                ...productData,
                sellingPricePerUnit: Number(productData.sellingPricePerUnit),
                defaultBatchQuantity: Number(productData.defaultBatchQuantity || 1),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            productsState.unshift(newProduct);
            return { success: true, data: newProduct, message: "Product created successfully" };
        }
        return request("/products", {
            method: "POST",
            body: JSON.stringify(productData)
        });
    },

    async update(id, productData) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const index = productsState.findIndex(p => p.id === Number(id));
            if (index === -1) throw new Error(`Product not found with id ${id}`);
            productsState[index] = {
                ...productsState[index],
                ...productData,
                sellingPricePerUnit: Number(productData.sellingPricePerUnit),
                defaultBatchQuantity: Number(productData.defaultBatchQuantity),
                updatedAt: new Date().toISOString()
            };
            return { success: true, data: productsState[index], message: "Product updated successfully" };
        }
        return request(`/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(productData)
        });
    },

    async delete(id) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            productsState = productsState.filter(p => p.id !== Number(id));
            return { success: true, message: "Product deleted successfully" };
        }
        return request(`/products/${id}`, { method: "DELETE" });
    }
};

