import { API_CONFIG, request, sleep } from "./client.js";
import { mockImpactSimulation, mockRawMaterials, mockProducts } from "../mock/mockData.js";

export const impactApi = {
    async simulatePriceChange(materialId, proposedPrice) {
        if (API_CONFIG.MOCK_MODE) {
            await sleep(600); // simulate backend analytical recalculation
            const mat = mockRawMaterials.find(m => m.id === Number(materialId));
            const newPrice = Number(proposedPrice);
            const currentPrice = mat ? mat.currentPrice : 150;
            const pctChange = ((newPrice - currentPrice) / (currentPrice || 1)) * 100;

            return {
                success: true,
                data: {
                    simulatedMaterial: {
                        id: Number(materialId),
                        code: mat ? mat.materialCode : "MAT-SIM",
                        name: mat ? mat.name : "Simulated Material",
                        currentPriceINR: currentPrice,
                        proposedPriceINR: newPrice,
                        priceChangePercentage: Number(pctChange.toFixed(2))
                    },
                    affectedProducts: mockImpactSimulation.affectedProducts.map(p => ({
                        ...p,
                        costDelta: Number(((newPrice - currentPrice) * 1.25).toFixed(2)),
                        revisedCostPerUnit: Number((p.previousCostPerUnit + (newPrice - currentPrice) * 1.25).toFixed(2)),
                        revisedMargin: Number((p.previousMargin - ((newPrice - currentPrice) / p.sellingPrice) * 100).toFixed(2)),
                        marginDelta: Number((-((newPrice - currentPrice) / p.sellingPrice) * 100).toFixed(2)),
                        impactSeverity: newPrice > currentPrice ? "CRITICAL_DROP" : "PROFIT_GAIN"
                    }))
                },
                message: "Price change impact simulation completed"
            };
        }
        return request("/cost-estimates/simulate-impact", {
            method: "POST",
            body: JSON.stringify({ materialId: Number(materialId), proposedPrice: Number(proposedPrice) })
        });
    }
};

