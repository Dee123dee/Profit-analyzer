import { API_CONFIG, request, sleep } from "./client.js";
import { mockEstimations, mockProducts } from "../mock/mockData.js";

let estimationsState = [...mockEstimations];

export const estimationApi = {
    async getHistory(productId = null) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            if (productId) {
                return { success: true, data: estimationsState.filter(e => e.productId === Number(productId)) };
            }
            return { success: true, data: [...estimationsState] };
        }
        const query = productId ? `?productId=${productId}` : "";
        return request(`/cost-estimates${query}`);
    },

    async runEstimation(payload) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(500); // simulate calculation latency
            const prod = mockProducts.find(p => p.id === Number(payload.productId));
            const existing = estimationsState.find(e => e.productId === Number(payload.productId));
            
            // Return simulation response placeholder without computing logic on client side
            const result = existing ? {
                ...existing,
                batchQuantity: Number(payload.batchQuantity || existing.batchQuantity),
                createdAt: new Date().toISOString(),
                version: existing.version + 1,
                approvalStatus: "DRAFT"
            } : {
                id: Date.now(),
                productId: Number(payload.productId),
                productCode: prod ? prod.productCode : "PROD-SIM",
                productName: prod ? prod.name : "Simulated Product",
                batchQuantity: Number(payload.batchQuantity || 1000),
                rawMaterialCost: 180000.00,
                manufacturingCost: 45000.00,
                machineCost: 50000.00,
                packagingCost: 20000.00,
                sterilisationCost: 25000.00,
                totalProductionCost: 320000.00,
                costPerUnit: 320.00,
                sellingPricePerUnit: prod ? prod.sellingPricePerUnit : 400.00,
                profitPerUnit: (prod ? prod.sellingPricePerUnit : 400.00) - 320.00,
                totalProfit: ((prod ? prod.sellingPricePerUnit : 400.00) - 320.00) * Number(payload.batchQuantity || 1000),
                profitMarginPercentage: 20.00,
                version: 1,
                status: "ACTIVE",
                approvalStatus: "DRAFT",
                createdAt: new Date().toISOString(),
                calculationBreakdown: {
                    batchSize: Number(payload.batchQuantity || 1000),
                    materialBreakdown: [
                        { material: "Primary Raw Material", quantity: "1,000 units", scrap: "2.0%", landedUnitCostINR: "180.00", totalCostINR: "180,000.00" }
                    ],
                    overheadsSummary: {
                        labour: "₹45,000.00",
                        machines: "₹50,000.00",
                        packaging: "₹20,000.00",
                        sterilisation: "₹25,000.00"
                    }
                }
            };

            estimationsState.unshift(result);
            return { success: true, data: result, message: "Cost estimation calculated successfully" };
        }
        return request("/cost-estimates/calculate", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    async updateStatus(id, approvalStatus) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const item = estimationsState.find(e => e.id === Number(id));
            if (item) {
                item.approvalStatus = approvalStatus;
            }
            return { success: true, data: item, message: `Estimation ${approvalStatus.toLowerCase()} successfully` };
        }
        return request(`/cost-estimates/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ approvalStatus })
        });
    }
};
