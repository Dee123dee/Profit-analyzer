import { productsApi, costManagementApi } from "../api/index.js";
import { showToast } from "../components/toast.js";

let allProducts = [];
let selectedProductId = null;

export async function renderOverheadsView(container) {
    container.innerHTML = `
        <div class="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <!-- Header Section -->
            <div>
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">Manufacturing & Operational Overheads</h1>
                <p class="text-xs text-slate-500 mt-1">Configure direct labour, machine depreciation/power, sterile processing, and packaging expenses</p>
            </div>

            <!-- Product Selector -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Select Finished Product</label>
                <select id="overheads-product-selector" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="">-- Choose a Product --</option>
                </select>
            </div>

            <!-- Empty State Prompt -->
            <div id="overheads-empty-prompt" class="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h3 class="text-sm font-bold text-slate-800">Select a Product to Configure Overheads</h3>
                <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Different medical devices and goods carry unique machine operating hours, cleanroom sterilisation cycles, and packaging requirements.</p>
            </div>

            <!-- Overheads Configuration Form -->
            <form id="overheads-form" class="hidden space-y-6">
                <!-- Section 1: Manufacturing Labour & General Operational -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900">1. Manufacturing Labour & General Overheads</h3>
                            <p class="text-xs text-slate-400">Direct assembly operators, technicians, and floor supervisors</p>
                        </div>
                        <span class="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">INR (₹)</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Direct Labour Cost</label>
                            <input id="ov-labour" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Other Manufacturing Overheads</label>
                            <input id="ov-other-mfg" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                    </div>
                </div>

                <!-- Section 2: Machine Expenses & Allocation -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900">2. Machine-Related Expenses & Allocation Mode</h3>
                            <p class="text-xs text-slate-400">CNC tooling, moulding equipment, and automated ultrasonic sealers</p>
                        </div>
                        <!-- Allocation Toggle -->
                        <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <label class="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-all" id="lbl-alloc-unit">
                                <input type="radio" name="ov-alloc" value="PER_UNIT" class="sr-only" checked>
                                Per Unit
                            </label>
                            <label class="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-all" id="lbl-alloc-batch">
                                <input type="radio" name="ov-alloc" value="PER_BATCH" class="sr-only">
                                Per Batch
                            </label>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Machine Operating Cost</label>
                            <input id="ov-mach-operating" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Depreciation Cost Allocation</label>
                            <input id="ov-mach-depreciation" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Power / Electricity Consumption</label>
                            <input id="ov-mach-power" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Maintenance & Tooling Wear</label>
                            <input id="ov-mach-maintenance" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                    </div>
                </div>

                <!-- Section 3: Packaging Costs -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3">
                        <h3 class="text-sm font-bold text-slate-900">3. Packaging Costs</h3>
                        <p class="text-xs text-slate-400">Medical tyvek pouches, sterile barrier cartons, barcode labels & leaflets</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Packaging Material</label>
                            <input id="ov-pack-material" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Labels & Printing</label>
                            <input id="ov-pack-labels" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Secondary / Shippers</label>
                            <input id="ov-pack-additional" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                    </div>
                </div>

                <!-- Section 4: Sterilisation Costs -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3">
                        <h3 class="text-sm font-bold text-slate-900">4. Cleanroom & Sterilisation Costs</h3>
                        <p class="text-xs text-slate-400">Ethylene Oxide (EtO), Gamma irradiation, or steam autoclave cycles</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Process Charges</label>
                            <input id="ov-ster-process" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Equipment Chamber Fee</label>
                            <input id="ov-ster-equipment" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Validation & Indicators</label>
                            <input id="ov-ster-other" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        </div>
                    </div>
                </div>

                <!-- Effective Date & Actions -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="w-full sm:w-64">
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Effective Date</label>
                        <input id="ov-effective-date" type="date" required class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                    </div>
                    <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button type="submit" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/20">
                            Save Operational Overheads
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    // Load products into dropdown
    const productsRes = await productsApi.getAll();
    allProducts = productsRes.data;

    const prodSelect = document.getElementById("overheads-product-selector");
    prodSelect.innerHTML = `<option value="">-- Choose a Product --</option>` +
        allProducts.map(p => `<option value="${p.id}">${p.productCode} - ${p.name}</option>`).join("");

    // Toggle styling for allocation radio
    const updateAllocStyling = (val) => {
        const u = document.getElementById("lbl-alloc-unit");
        const b = document.getElementById("lbl-alloc-batch");
        if (val === "PER_UNIT") {
            u.className = "text-xs font-bold px-3 py-1 rounded-lg cursor-pointer bg-white text-indigo-700 shadow-sm";
            b.className = "text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer text-slate-600 hover:text-slate-900";
        } else {
            b.className = "text-xs font-bold px-3 py-1 rounded-lg cursor-pointer bg-white text-indigo-700 shadow-sm";
            u.className = "text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer text-slate-600 hover:text-slate-900";
        }
    };

    document.querySelectorAll("input[name='ov-alloc']").forEach(radio => {
        radio.addEventListener("change", (e) => updateAllocStyling(e.target.value));
    });
    updateAllocStyling("PER_UNIT");

    // Product selection change
    prodSelect.addEventListener("change", async (e) => {
        selectedProductId = e.target.value ? Number(e.target.value) : null;
        const form = document.getElementById("overheads-form");
        const emptyPrompt = document.getElementById("overheads-empty-prompt");

        if (!selectedProductId) {
            form.classList.add("hidden");
            emptyPrompt.classList.remove("hidden");
            return;
        }

        emptyPrompt.classList.add("hidden");
        form.classList.remove("hidden");

        try {
            const res = await costManagementApi.getOverheads(selectedProductId);
            const data = res.data;

            document.getElementById("ov-labour").value = data.labourCost || "";
            document.getElementById("ov-other-mfg").value = data.otherManufacturingCost || "";
            document.getElementById("ov-mach-operating").value = data.machineOperatingCost || "";
            document.getElementById("ov-mach-depreciation").value = data.machineDepreciationCost || "";
            document.getElementById("ov-mach-power").value = data.powerConsumptionCost || "";
            document.getElementById("ov-mach-maintenance").value = data.maintenanceCost || "";
            document.getElementById("ov-pack-material").value = data.packagingMaterialCost || "";
            document.getElementById("ov-pack-labels").value = data.labelsAndPrintingCost || "";
            document.getElementById("ov-pack-additional").value = data.additionalPackagingCost || "";
            document.getElementById("ov-ster-process").value = data.processCharge || "";
            document.getElementById("ov-ster-equipment").value = data.equipmentUsageCharge || "";
            document.getElementById("ov-ster-other").value = data.otherSterilisationExpense || "";
            document.getElementById("ov-effective-date").value = data.effectiveFrom || new Date().toISOString().split("T")[0];

            const alloc = data.allocationType || "PER_UNIT";
            const radio = document.querySelector(`input[name='ov-alloc'][value='${alloc}']`);
            if (radio) {
                radio.checked = true;
                updateAllocStyling(alloc);
            }
        } catch (err) {
            showToast("Error retrieving overheads configuration", "error");
        }
    });

    // Form submit
    document.getElementById("overheads-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!selectedProductId) return;

        const payload = {
            labourCost: Number(document.getElementById("ov-labour").value || 0),
            otherManufacturingCost: Number(document.getElementById("ov-other-mfg").value || 0),
            machineOperatingCost: Number(document.getElementById("ov-mach-operating").value || 0),
            machineDepreciationCost: Number(document.getElementById("ov-mach-depreciation").value || 0),
            powerConsumptionCost: Number(document.getElementById("ov-mach-power").value || 0),
            maintenanceCost: Number(document.getElementById("ov-mach-maintenance").value || 0),
            allocationType: document.querySelector("input[name='ov-alloc']:checked").value,
            packagingMaterialCost: Number(document.getElementById("ov-pack-material").value || 0),
            labelsAndPrintingCost: Number(document.getElementById("ov-pack-labels").value || 0),
            additionalPackagingCost: Number(document.getElementById("ov-pack-additional").value || 0),
            processCharge: Number(document.getElementById("ov-ster-process").value || 0),
            equipmentUsageCharge: Number(document.getElementById("ov-ster-equipment").value || 0),
            otherSterilisationExpense: Number(document.getElementById("ov-ster-other").value || 0),
            effectiveFrom: document.getElementById("ov-effective-date").value
        };

        try {
            await costManagementApi.saveOverheads(selectedProductId, payload);
            showToast("Overheads saved successfully", "success");
        } catch (err) {
            showToast(err.message || "Failed to save overheads", "error");
        }
    });
}

