import { API_CONFIG, request, sleep } from "./client.js";
import { mockBoms, mockRawMaterials } from "../mock/mockData.js";

let bomsState = { ...mockBoms };

export const bomApi = {
    async getByProduct(productId) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            const items = bomsState[productId] || [];
            return { success: true, data: [...items] };
        }
        return request(`/products/${productId}/bom`);
    },

    async saveBom(productId, itemData) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            if (!bomsState[productId]) bomsState[productId] = [];

            const mat = mockRawMaterials.find(m => m.id === Number(itemData.rawMaterialId));
            const existingIndex = bomsState[productId].findIndex(i => i.rawMaterialId === Number(itemData.rawMaterialId));

            const record = {
                id: existingIndex >= 0 ? bomsState[productId][existingIndex].id : Date.now(),
                rawMaterialId: Number(itemData.rawMaterialId),
                materialCode: mat ? mat.materialCode : "MAT-UNK",
                name: mat ? mat.name : "Material",
                quantity: Number(itemData.quantity),
                unit: mat ? mat.unitOfMeasure : "UNIT",
                scrapPercentage: Number(itemData.scrapPercentage || 0)
            };

            if (existingIndex >= 0) {
                bomsState[productId][existingIndex] = record;
            } else {
                bomsState[productId].push(record);
            }

            return { success: true, data: bomsState[productId], message: "BOM updated successfully" };
        }
        return request(`/products/${productId}/bom`, {
            method: "POST",
            body: JSON.stringify(itemData)
        });
    },

    async deleteBomItem(productId, materialId) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(API_CONFIG.MOCK_DELAY_MS);
            if (bomsState[productId]) {
                bomsState[productId] = bomsState[productId].filter(i => i.rawMaterialId !== Number(materialId));
            }
            return { success: true, message: "Material removed from BOM" };
        }
        return request(`/products/${productId}/bom/${materialId}`, { method: "DELETE" });
    }
};
