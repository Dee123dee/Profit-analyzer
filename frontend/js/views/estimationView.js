import { productsApi, estimationApi } from "../api/index.js";
import { showToast } from "../components/toast.js";

let allProducts = [];
let currentEstimation = null;
let allEstimationsHistory = [];

export async function renderEstimationView(container) {
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Cost Estimation & Profit Calculation Engine</h1>
                    <p class="text-xs text-slate-500 mt-1">Generate comprehensive production cost sheets, unit margins, and manage engineering approval workflows</p>
                </div>
            </div>

            <!-- Simulation Parameters Card -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Cost Engine Calculation Parameters
                </h3>
                <form id="estimation-params-form" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Target Finished Product <span class="text-rose-500">*</span></label>
                        <select id="est-product-select" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium">
                            <option value="">-- Choose Product to Estimate --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Batch Production Size <span class="text-rose-500">*</span></label>
                        <input id="est-batch-size" type="number" step="1" min="1" required placeholder="1000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    </div>
                    <div>
                        <button id="btn-run-estimation" type="submit" class="w-full py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Run Estimation
                        </button>
                    </div>
                </form>
            </div>

            <!-- Calculation Results Panel (Display Only, Delegated to Backend) -->
            <div id="estimation-results-panel" class="hidden space-y-6">
                <!-- Status & Action Banner -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <span id="est-status-badge" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                            DRAFT ESTIMATE
                        </span>
                        <div>
                            <h2 id="est-product-title" class="text-lg font-bold text-slate-900">Product Name</h2>
                            <p id="est-version-label" class="text-xs text-slate-400 font-mono">Version 1 &bull; Calculated Just Now</p>
                        </div>
                    </div>
                    <!-- Approval Action Bar -->
                    <div class="flex items-center gap-3">
                        <button id="btn-approve-est" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Approve Estimation
                        </button>
                        <button id="btn-reject-est" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            Reject
                        </button>
                    </div>
                </div>

                <!-- KPI Metric Summary Cards -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <span class="text-xs font-semibold text-slate-400 block uppercase">Material Cost</span>
                        <span id="kpi-mat-cost" class="text-base font-extrabold font-mono text-slate-900 block mt-1">₹0.00</span>
                        <span class="text-2xs text-slate-400">Total batch input</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <span class="text-xs font-semibold text-slate-400 block uppercase">Mfg Overheads</span>
                        <span id="kpi-mfg-cost" class="text-base font-extrabold font-mono text-slate-900 block mt-1">₹0.00</span>
                        <span class="text-2xs text-slate-400">Labour + Machines</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <span class="text-xs font-semibold text-slate-400 block uppercase">Total Cost / Unit</span>
                        <span id="kpi-unit-cost" class="text-base font-extrabold font-mono text-indigo-700 block mt-1">₹0.00</span>
                        <span class="text-2xs text-slate-400">Landed production</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <span class="text-xs font-semibold text-slate-400 block uppercase">Selling Price</span>
                        <span id="kpi-selling-price" class="text-base font-extrabold font-mono text-slate-900 block mt-1">₹0.00</span>
                        <span class="text-2xs text-slate-400">Configured target</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <span class="text-xs font-semibold text-slate-400 block uppercase">Profit / Unit</span>
                        <span id="kpi-profit-unit" class="text-base font-extrabold font-mono text-emerald-600 block mt-1">₹0.00</span>
                        <span class="text-2xs text-slate-400">Net contribution</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <span class="text-xs font-semibold text-slate-400 block uppercase">Profit Margin</span>
                        <span id="kpi-margin-pct" class="text-base font-extrabold font-mono text-emerald-600 block mt-1">0.00%</span>
                        <span class="text-2xs text-slate-400">On selling price</span>
                    </div>
                </div>

                <!-- Calculation Breakdown Accordion -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Detailed Calculation Breakdown</h4>
                        <span class="text-xs text-slate-400">Ingested from calculation engine</span>
                    </div>
                    <div class="p-6 space-y-6">
                        <!-- Cost Distribution Summary -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                            <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span class="text-slate-400 block">Machine Expenses:</span>
                                <span id="dt-machine-cost" class="font-bold text-slate-800 text-sm">₹0.00</span>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span class="text-slate-400 block">Packaging Expenses:</span>
                                <span id="dt-packaging-cost" class="font-bold text-slate-800 text-sm">₹0.00</span>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span class="text-slate-400 block">Sterilisation Cycles:</span>
                                <span id="dt-sterilisation-cost" class="font-bold text-slate-800 text-sm">₹0.00</span>
                            </div>
                            <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <span class="text-indigo-400 block">Total Production Cost:</span>
                                <span id="dt-total-prod-cost" class="font-bold text-indigo-700 text-sm">₹0.00</span>
                            </div>
                        </div>

                        <!-- Structured Breakdown View -->
                        <div>
                            <h5 class="text-xs font-semibold text-slate-700 mb-2">Engine Snapshot Payload:</h5>
                            <pre id="dt-json-breakdown" class="p-4 bg-slate-900 text-indigo-300 text-xs font-mono rounded-xl overflow-x-auto"></pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historical Estimations Log -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100">
                    <h3 class="text-base font-bold text-slate-900">Historical Cost Estimations & Version Audit</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Prior runs, version numbers, and previous cost benchmarks</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                                <th class="py-3.5 px-6">Product</th>
                                <th class="py-3.5 px-6 text-center">Version</th>
                                <th class="py-3.5 px-6 text-right">Batch Size</th>
                                <th class="py-3.5 px-6 text-right">Unit Cost</th>
                                <th class="py-3.5 px-6 text-right">Margin %</th>
                                <th class="py-3.5 px-6 text-center">Workflow</th>
                                <th class="py-3.5 px-6 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody id="estimations-history-table" class="divide-y divide-slate-100 text-sm">
                            <tr>
                                <td colspan="7" class="py-12 text-center text-slate-400">Loading historical estimations...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Load products
    const productsRes = await productsApi.getAll();
    allProducts = productsRes.data;

    const prodSelect = document.getElementById("est-product-select");
    prodSelect.innerHTML = `<option value="">-- Choose Product to Estimate --</option>` +
        allProducts.map(p => `<option value="${p.id}">${p.productCode} - ${p.name}</option>`).join("");

    // Set default batch size when product changes
    prodSelect.addEventListener("change", (e) => {
        const prod = allProducts.find(p => p.id === Number(e.target.value));
        if (prod) {
            document.getElementById("est-batch-size").value = prod.defaultBatchQuantity;
        }
    });

    // Check pre-selection
    if (window.selectedProductIdForEstimation) {
        prodSelect.value = window.selectedProductIdForEstimation;
        window.selectedProductIdForEstimation = null;
        const prod = allProducts.find(p => p.id === Number(prodSelect.value));
        if (prod) document.getElementById("est-batch-size").value = prod.defaultBatchQuantity;
    }

    // Load history table
    await loadHistoryTable();

    // Trigger calculation
    document.getElementById("estimation-params-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const productId = Number(document.getElementById("est-product-select").value);
        const batchQuantity = Number(document.getElementById("est-batch-size").value);

        const btn = document.getElementById("btn-run-estimation");
        btn.disabled = true;
        btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Running Engine...`;

        try {
            const res = await estimationApi.runEstimation({ productId, batchQuantity });
            currentEstimation = res.data;
            showToast("Calculation completed successfully", "success");
            displayEstimationResults(currentEstimation);
            await loadHistoryTable();
        } catch (err) {
            showToast(err.message || "Failed to calculate cost", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Run Estimation`;
        }
    });

    // Approval workflow actions
    document.getElementById("btn-approve-est").addEventListener("click", async () => {
        if (!currentEstimation) return;
        try {
            await estimationApi.updateStatus(currentEstimation.id, "APPROVED");
            currentEstimation.approvalStatus = "APPROVED";
            updateApprovalBadge("APPROVED");
            showToast("Cost estimate approved by Finance/Engineering", "success");
            await loadHistoryTable();
        } catch (e) {
            showToast("Approval failed", "error");
        }
    });

    document.getElementById("btn-reject-est").addEventListener("click", async () => {
        if (!currentEstimation) return;
        try {
            await estimationApi.updateStatus(currentEstimation.id, "REJECTED");
            currentEstimation.approvalStatus = "REJECTED";
            updateApprovalBadge("REJECTED");
            showToast("Cost estimate rejected", "warning");
            await loadHistoryTable();
        } catch (e) {
            showToast("Rejection failed", "error");
        }
    });
}

function displayEstimationResults(est) {
    const panel = document.getElementById("estimation-results-panel");
    panel.classList.remove("hidden");

    document.getElementById("est-product-title").innerText = est.productName || "Product Costing";
    document.getElementById("est-version-label").innerText = `Version ${est.version} &bull; Batch Size: ${Number(est.batchQuantity).toLocaleString()} units &bull; ${new Date(est.createdAt).toLocaleDateString()}`;

    updateApprovalBadge(est.approvalStatus || "DRAFT");

    document.getElementById("kpi-mat-cost").innerText = `₹${Number(est.rawMaterialCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById("kpi-mfg-cost").innerText = `₹${Number(est.manufacturingCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById("kpi-unit-cost").innerText = `₹${Number(est.costPerUnit).toFixed(2)}`;
    document.getElementById("kpi-selling-price").innerText = `₹${Number(est.sellingPricePerUnit).toFixed(2)}`;
    document.getElementById("kpi-profit-unit").innerText = `₹${Number(est.profitPerUnit).toFixed(2)}`;
    
    const marginEl = document.getElementById("kpi-margin-pct");
    marginEl.innerText = `${Number(est.profitMarginPercentage).toFixed(2)}%`;
    marginEl.className = `text-base font-extrabold font-mono block mt-1 ${est.profitMarginPercentage >= 15 ? 'text-emerald-600' : est.profitMarginPercentage > 0 ? 'text-amber-600' : 'text-rose-600'}`;

    document.getElementById("dt-machine-cost").innerText = `₹${Number(est.machineCost).toLocaleString()}`;
    document.getElementById("dt-packaging-cost").innerText = `₹${Number(est.packagingCost).toLocaleString()}`;
    document.getElementById("dt-sterilisation-cost").innerText = `₹${Number(est.sterilisationCost).toLocaleString()}`;
    document.getElementById("dt-total-prod-cost").innerText = `₹${Number(est.totalProductionCost).toLocaleString()}`;

    document.getElementById("dt-json-breakdown").innerText = JSON.stringify(est.calculationBreakdown, null, 2);
}

function updateApprovalBadge(status) {
    const badge = document.getElementById("est-status-badge");
    badge.innerText = status;
    if (status === "APPROVED") {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200";
    } else if (status === "REJECTED") {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200";
    } else {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200";
    }
}

async function loadHistoryTable() {
    const tbody = document.getElementById("estimations-history-table");
    try {
        const res = await estimationApi.getHistory();
        allEstimationsHistory = res.data;

        if (!allEstimationsHistory.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-slate-400">No estimation records logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = allEstimationsHistory.map(h => `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-4 px-6 font-semibold text-slate-800">
                    <div>${h.productName}</div>
                    <div class="text-xs text-slate-400 font-mono">${h.productCode}</div>
                </td>
                <td class="py-4 px-6 text-center font-mono font-bold text-slate-700">v${h.version}</td>
                <td class="py-4 px-6 text-right font-mono text-slate-600">${Number(h.batchQuantity).toLocaleString()}</td>
                <td class="py-4 px-6 text-right font-mono font-bold text-slate-900">₹${Number(h.costPerUnit).toFixed(2)}</td>
                <td class="py-4 px-6 text-right font-mono font-bold ${h.profitMarginPercentage >= 15 ? 'text-emerald-600' : h.profitMarginPercentage > 0 ? 'text-amber-600' : 'text-rose-600'}">
                    ${Number(h.profitMarginPercentage).toFixed(2)}%
                </td>
                <td class="py-4 px-6 text-center">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${h.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : h.approvalStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}">
                        ${h.approvalStatus || 'DRAFT'}
                    </span>
                </td>
                <td class="py-4 px-6 text-right font-mono text-xs text-slate-400">${new Date(h.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join("");
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-rose-500 text-xs">Error loading history</td></tr>`;
    }
}

