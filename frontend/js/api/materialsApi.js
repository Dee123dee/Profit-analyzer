import { API_CONFIG, request, sleep } from "./client.js";
import { mockRawMaterials, mockPriceHistories, mockProducts, mockBoms } from "../mock/mockData.js";

let materialsState = [...mockRawMaterials];
let priceHistoriesState = { ...mockPriceHistories };

export const materialsApi = {
    async getAll() {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            return { success: true, data: [...materialsState] };
        }
        return request("/raw-materials");
    },

    async create(materialData) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const newMaterial = {
                id: materialsState.length ? Math.max(...materialsState.map(m => m.id)) + 1 : 1,
                ...materialData,
                currentPrice: Number(materialData.currentPrice || 0),
                currencyCode: materialData.currencyCode || "INR",
                exchangeRate: Number(materialData.exchangeRate || 1.0),
                createdAt: new Date().toISOString()
            };
            materialsState.unshift(newMaterial);
            return { success: true, data: newMaterial, message: "Raw material created successfully" };
        }
        return request("/raw-materials", {
            method: "POST",
            body: JSON.stringify(materialData)
        });
    },

    async getPriceHistory(materialId) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const history = priceHistoriesState[materialId] || [];
            return { success: true, data: [...history] };
        }
        return request(`/raw-materials/${materialId}/prices`);
    },

    async addPrice(materialId, priceData) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const newPrice = {
                id: Date.now(),
                ...priceData,
                unitPrice: Number(priceData.unitPrice),
                exchangeRateUsed: Number(priceData.exchangeRateUsed || 1.0),
                freightCost: Number(priceData.freightCost || 0),
                importDutyPercentage: Number(priceData.importDutyPercentage || 0),
                effectiveFrom: priceData.effectiveFrom || new Date().toISOString(),
                effectiveTo: null,
                landedCostINR: Number(priceData.landedCostINR || priceData.unitPrice * (priceData.exchangeRateUsed || 1))
            };
            if (!priceHistoriesState[materialId]) {
                priceHistoriesState[materialId] = [];
            }
            priceHistoriesState[materialId].unshift(newPrice);
            return { success: true, data: newPrice, message: "New price recorded successfully" };
        }
        return request(`/raw-materials/${materialId}/prices`, {
            method: "POST",
            body: JSON.stringify(priceData)
        });
    },

    async getAffectedProducts(materialId) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const affected = [];
            for (const [prodId, items] of Object.entries(mockBoms)) {
                const foundItem = items.find(i => i.rawMaterialId === Number(materialId));
                if (foundItem) {
                    const prod = mockProducts.find(p => p.id === Number(prodId));
                    if (prod) {
                        affected.push({
                            ...prod,
                            requiredQuantity: foundItem.quantity,
                            scrapPercentage: foundItem.scrapPercentage,
                            unit: foundItem.unit
                        });
                    }
                }
            }
            return { success: true, data: affected };
        }
        return request(`/raw-materials/${materialId}/affected-products`);
    }
};

