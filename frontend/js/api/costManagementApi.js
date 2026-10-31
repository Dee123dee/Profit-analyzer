import { API_CONFIG, request, sleep } from "./client.js";
import { mockOverheads } from "../mock/mockData.js";

let overheadsState = { ...mockOverheads };

export const costManagementApi = {
    async getOverheads(productId) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const data = overheadsState[productId] || {
                labourCost: 0,
                machineOperatingCost: 0,
                machineDepreciationCost: 0,
                powerConsumptionCost: 0,
                maintenanceCost: 0,
                allocationType: "PER_UNIT",
                packagingMaterialCost: 0,
                labelsAndPrintingCost: 0,
                additionalPackagingCost: 0,
                processCharge: 0,
                equipmentUsageCharge: 0,
                otherSterilisationExpense: 0,
                otherManufacturingCost: 0,
                effectiveFrom: new Date().toISOString().split("T")[0]
            };
            return { success: true, data };
        }
        return request(`/products/${productId}/overheads`);
    },

    async saveOverheads(productId, data) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            overheadsState[productId] = {
                ...data,
                labourCost: Number(data.labourCost || 0),
                machineOperatingCost: Number(data.machineOperatingCost || 0),
                machineDepreciationCost: Number(data.machineDepreciationCost || 0),
                powerConsumptionCost: Number(data.powerConsumptionCost || 0),
                maintenanceCost: Number(data.maintenanceCost || 0),
                packagingMaterialCost: Number(data.packagingMaterialCost || 0),
                labelsAndPrintingCost: Number(data.labelsAndPrintingCost || 0),
                additionalPackagingCost: Number(data.additionalPackagingCost || 0),
                processCharge: Number(data.processCharge || 0),
                equipmentUsageCharge: Number(data.equipmentUsageCharge || 0),
                otherSterilisationExpense: Number(data.otherSterilisationExpense || 0),
                otherManufacturingCost: Number(data.otherManufacturingCost || 0),
                updatedAt: new Date().toISOString()
            };
            return { success: true, data: overheadsState[productId], message: "Operational overheads saved successfully" };
        }
        return request(`/products/${productId}/overheads`, {
            method: "POST",
            body: JSON.stringify(data)
        });
    }
};

