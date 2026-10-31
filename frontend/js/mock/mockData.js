/**
 * Realistic mock data set for Product Cost Estimation and Profit Analysis System.
 * Used for presentation and standalone UI testing prior to live backend integration.
 */

export const mockProducts = [
    {
        id: 1,
        productCode: "PROD-GLV-01",
        name: "Surgical Latex Gloves (Box of 100)",
        description: "Powder-free, micro-textured sterile surgical gloves manufactured from natural rubber latex.",
        sellingPricePerUnit: 450.00,
        defaultBatchQuantity: 1000.00,
        status: "ACTIVE",
        createdAt: "2026-09-15T10:00:00",
        updatedAt: "2026-10-20T14:30:00"
    },
    {
        id: 2,
        productCode: "PROD-GWN-02",
        name: "Reinforced Sterile Surgical Gown (L)",
        description: "AAMI Level 3 fluid-resistant non-woven surgical gown with ultrasonic seam sealing.",
        sellingPricePerUnit: 680.00,
        defaultBatchQuantity: 500.00,
        status: "ACTIVE",
        createdAt: "2026-08-10T11:20:00",
        updatedAt: "2026-10-18T09:15:00"
    },
    {
        id: 3,
        productCode: "PROD-SCR-03",
        name: "Cannulated Titanium Bone Screw 4.5mm",
        description: "Implant grade Ti-6Al-4V ELI orthopedic fixation screw with self-tapping flutes.",
        sellingPricePerUnit: 2400.00,
        defaultBatchQuantity: 200.00,
        status: "ACTIVE",
        createdAt: "2026-07-01T08:00:00",
        updatedAt: "2026-10-25T16:45:00"
    },
    {
        id: 4,
        productCode: "PROD-INF-04",
        name: "Infusion Set with Precision Flow Controller",
        description: "DEHP-free IV infusion set equipped with 0.2 micron sterilizing filter.",
        sellingPricePerUnit: 185.00,
        defaultBatchQuantity: 2500.00,
        status: "ACTIVE",
        createdAt: "2026-10-01T12:00:00",
        updatedAt: "2026-10-28T11:10:00"
    },
    {
        id: 5,
        productCode: "PROD-MSK-05",
        name: "N95 Surgical Respirator (Pack of 50)",
        description: "Particulate surgical respirator with multi-layer meltblown electrostatic filtration.",
        sellingPricePerUnit: 850.00,
        defaultBatchQuantity: 1500.00,
        status: "INACTIVE",
        createdAt: "2026-05-12T09:30:00",
        updatedAt: "2026-09-01T10:00:00"
    }
];

export const mockRawMaterials = [
    {
        id: 1,
        materialCode: "MAT-NR-LATEX",
        name: "Centrifuged Natural Rubber Latex (60% DRC)",
        unitOfMeasure: "LTR",
        materialType: "IMPORTED",
        currentPrice: 165.50,
        currencyCode: "USD",
        exchangeRate: 83.50,
        createdAt: "2026-08-01T10:00:00"
    },
    {
        id: 2,
        materialCode: "MAT-PP-SPUN",
        name: "Polypropylene Spunbond Non-Woven Fabric 45 GSM",
        unitOfMeasure: "MTR",
        materialType: "DOMESTIC",
        currentPrice: 38.00,
        currencyCode: "INR",
        exchangeRate: 1.00,
        createdAt: "2026-08-10T14:00:00"
    },
    {
        id: 3,
        materialCode: "MAT-TI-BAR",
        name: "Titanium Alloy Rod Ti-6Al-4V ELI (Dia 8mm)",
        unitOfMeasure: "KG",
        materialType: "IMPORTED",
        currentPrice: 3850.00,
        currencyCode: "EUR",
        exchangeRate: 90.20,
        createdAt: "2026-07-05T09:00:00"
    },
    {
        id: 4,
        materialCode: "MAT-PVC-RESIN",
        name: "Medical Grade Plasticized PVC Compound",
        unitOfMeasure: "KG",
        materialType: "DOMESTIC",
        currentPrice: 142.00,
        currencyCode: "INR",
        exchangeRate: 1.00,
        createdAt: "2026-09-01T11:30:00"
    },
    {
        id: 5,
        materialCode: "MAT-MELTBLOWN",
        name: "Electret Meltblown Polypropylene Filter Media",
        unitOfMeasure: "MTR",
        materialType: "IMPORTED",
        currentPrice: 75.00,
        currencyCode: "USD",
        exchangeRate: 83.50,
        createdAt: "2026-06-15T15:00:00"
    },
    {
        id: 6,
        materialCode: "MAT-CORN-STARCH",
        name: "USP Grade Absorbable Dusting Powder",
        unitOfMeasure: "KG",
        materialType: "DOMESTIC",
        currentPrice: 62.50,
        currencyCode: "INR",
        exchangeRate: 1.00,
        createdAt: "2026-08-20T16:00:00"
    }
];

export const mockPriceHistories = {
    1: [
        {
            id: 101,
            unitPrice: 1.95,
            currencyCode: "USD",
            exchangeRateUsed: 83.50,
            freightCost: 0.15,
            importDutyPercentage: 7.50,
            effectiveFrom: "2026-10-01T00:00:00",
            effectiveTo: null,
            landedCostINR: 188.45
        },
        {
            id: 100,
            unitPrice: 1.80,
            currencyCode: "USD",
            exchangeRateUsed: 82.90,
            freightCost: 0.12,
            importDutyPercentage: 7.50,
            effectiveFrom: "2026-05-01T00:00:00",
            effectiveTo: "2026-09-30T23:59:59",
            landedCostINR: 171.12
        }
    ],
    3: [
        {
            id: 301,
            unitPrice: 42.00,
            currencyCode: "EUR",
            exchangeRateUsed: 90.20,
            freightCost: 2.50,
            importDutyPercentage: 10.00,
            effectiveFrom: "2026-09-01T00:00:00",
            effectiveTo: null,
            landedCostINR: 4390.94
        }
    ]
};

export const mockBoms = {
    1: [
        { id: 1, rawMaterialId: 1, materialCode: "MAT-NR-LATEX", name: "Centrifuged Natural Rubber Latex", quantity: 1.25, unit: "LTR", scrapPercentage: 4.50 },
        { id: 2, rawMaterialId: 6, materialCode: "MAT-CORN-STARCH", name: "USP Grade Absorbable Dusting Powder", quantity: 0.15, unit: "KG", scrapPercentage: 1.00 }
    ],
    2: [
        { id: 3, rawMaterialId: 2, materialCode: "MAT-PP-SPUN", name: "Polypropylene Spunbond Non-Woven", quantity: 4.80, unit: "MTR", scrapPercentage: 5.00 }
    ],
    3: [
        { id: 4, rawMaterialId: 3, materialCode: "MAT-TI-BAR", name: "Titanium Alloy Rod Ti-6Al-4V", quantity: 0.085, unit: "KG", scrapPercentage: 12.00 }
    ],
    4: [
        { id: 5, rawMaterialId: 4, materialCode: "MAT-PVC-RESIN", name: "Medical Grade Plasticized PVC", quantity: 0.22, unit: "KG", scrapPercentage: 3.00 }
    ]
};

export const mockOverheads = {
    1: {
        labourCost: 45.00,
        machineOperatingCost: 35.00,
        machineDepreciationCost: 15.00,
        powerConsumptionCost: 12.00,
        maintenanceCost: 8.00,
        allocationType: "PER_UNIT",
        packagingMaterialCost: 22.00,
        labelsAndPrintingCost: 6.50,
        additionalPackagingCost: 4.00,
        processCharge: 18.00,
        equipmentUsageCharge: 10.00,
        otherSterilisationExpense: 5.00,
        otherManufacturingCost: 14.50,
        effectiveFrom: "2026-10-01"
    },
    2: {
        labourCost: 85.00,
        machineOperatingCost: 55.00,
        machineDepreciationCost: 25.00,
        powerConsumptionCost: 18.00,
        maintenanceCost: 12.00,
        allocationType: "PER_UNIT",
        packagingMaterialCost: 32.00,
        labelsAndPrintingCost: 8.00,
        additionalPackagingCost: 5.00,
        processCharge: 35.00,
        equipmentUsageCharge: 15.00,
        otherSterilisationExpense: 8.00,
        otherManufacturingCost: 20.00,
        effectiveFrom: "2026-10-01"
    }
};

export const mockEstimations = [
    {
        id: 501,
        productId: 1,
        productCode: "PROD-GLV-01",
        productName: "Surgical Latex Gloves (Box of 100)",
        batchQuantity: 1000.00,
        rawMaterialCost: 245000.00,
        manufacturingCost: 59500.00,
        machineCost: 70000.00,
        packagingCost: 32500.00,
        sterilisationCost: 33000.00,
        totalProductionCost: 440000.00,
        costPerUnit: 440.00,
        sellingPricePerUnit: 450.00,
        profitPerUnit: 10.00,
        totalProfit: 10000.00,
        profitMarginPercentage: 2.22,
        version: 3,
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        createdAt: "2026-10-20T14:30:00",
        calculationBreakdown: {
            batchSize: 1000,
            materialBreakdown: [
                { material: "Natural Rubber Latex", quantity: "1,250 LTR", scrap: "4.5%", landedUnitCostINR: "188.45", totalCostINR: "235,562.50" },
                { material: "Absorbable Dusting Powder", quantity: "150 KG", scrap: "1.0%", landedUnitCostINR: "62.50", totalCostINR: "9,437.50" }
            ],
            overheadsSummary: {
                labour: "₹45,000.00",
                machines: "₹70,000.00 (PER_UNIT)",
                packaging: "₹32,500.00",
                sterilisation: "₹33,000.00 (EtO Cycle)",
                otherOperational: "₹14,500.00"
            }
        }
    },
    {
        id: 502,
        productId: 2,
        productCode: "PROD-GWN-02",
        productName: "Reinforced Sterile Surgical Gown (L)",
        batchQuantity: 500.00,
        rawMaterialCost: 95760.00,
        manufacturingCost: 52500.00,
        machineCost: 55000.00,
        packagingCost: 22500.00,
        sterilisationCost: 29000.00,
        totalProductionCost: 254760.00,
        costPerUnit: 509.52,
        sellingPricePerUnit: 680.00,
        profitPerUnit: 170.48,
        totalProfit: 85240.00,
        profitMarginPercentage: 25.07,
        version: 2,
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        createdAt: "2026-10-18T09:15:00",
        calculationBreakdown: {
            batchSize: 500,
            materialBreakdown: [
                { material: "PP Spunbond Fabric 45 GSM", quantity: "2,400 MTR", scrap: "5.0%", landedUnitCostINR: "38.00", totalCostINR: "95,760.00" }
            ]
        }
    }
];

export const mockImpactSimulation = {
    simulatedMaterial: {
        id: 1,
        code: "MAT-NR-LATEX",
        name: "Centrifuged Natural Rubber Latex (60% DRC)",
        currentPriceINR: 188.45,
        proposedPriceINR: 215.00,
        priceChangePercentage: 14.09
    },
    affectedProducts: [
        {
            productId: 1,
            productCode: "PROD-GLV-01",
            productName: "Surgical Latex Gloves (Box of 100)",
            previousCostPerUnit: 440.00,
            revisedCostPerUnit: 474.75,
            costDelta: 34.75,
            previousMargin: 2.22,
            revisedMargin: -5.50,
            marginDelta: -7.72,
            impactSeverity: "CRITICAL_DROP",
            sellingPrice: 450.00
        }
    ]
};

