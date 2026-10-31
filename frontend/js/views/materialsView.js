import { materialsApi } from "../api/index.js";
import { showToast } from "../components/toast.js";
import { openModal, closeModal } from "../components/modal.js";

let currentMaterials = [];
let activeMaterialForHistory = null;

export async function renderMaterialsView(container) {
    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Raw Materials & Historical Pricing</h1>
                    <p class="text-xs text-slate-500 mt-1">Manage domestic and imported raw materials, landed exchange rates, and historical price records</p>
                </div>
                <button id="btn-open-create-material" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    New Raw Material
                </button>
            </div>

            <!-- Filters -->
            <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div class="relative w-full sm:w-80">
                    <input id="material-search-input" type="text" placeholder="Search by material code or name..." class="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select id="material-type-filter" class="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        <option value="ALL">All Sources</option>
                        <option value="DOMESTIC">Domestic</option>
                        <option value="IMPORTED">Imported</option>
                    </select>
                </div>
            </div>

            <!-- Materials Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                                <th class="py-3.5 px-6">Material Code</th>
                                <th class="py-3.5 px-6">Material Name</th>
                                <th class="py-3.5 px-6 text-center">Unit</th>
                                <th class="py-3.5 px-6 text-center">Type</th>
                                <th class="py-3.5 px-6 text-right">Current Price</th>
                                <th class="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="materials-table-body" class="divide-y divide-slate-100 text-sm">
                            <tr>
                                <td colspan="6" class="py-12 text-center text-slate-400">Loading materials...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Add Material Modal -->
            <div id="material-modal" class="fixed inset-0 z-50 hidden">
                <div class="modal-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
                <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
                        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 class="text-lg font-bold text-slate-900">Add Raw Material</h3>
                            <button data-close-modal="material-modal" class="text-slate-400 hover:text-slate-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <form id="material-form" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Material Code <span class="text-rose-500">*</span></label>
                                <input id="mat-code-input" type="text" required placeholder="e.g. MAT-NR-LATEX" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Material Name <span class="text-rose-500">*</span></label>
                                <input id="mat-name-input" type="text" required placeholder="e.g. Natural Rubber Latex 60%" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Unit of Measure <span class="text-rose-500">*</span></label>
                                    <select id="mat-unit-input" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                        <option value="KG">KG (Kilograms)</option>
                                        <option value="LTR">LTR (Litres)</option>
                                        <option value="MTR">MTR (Metres)</option>
                                        <option value="PCS">PCS (Pieces)</option>
                                        <option value="GRAM">GRAM (Grams)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Procurement Type <span class="text-rose-500">*</span></label>
                                    <select id="mat-type-input" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                        <option value="DOMESTIC">DOMESTIC (INR)</option>
                                        <option value="IMPORTED">IMPORTED (Foreign FX)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Initial Unit Price</label>
                                    <input id="mat-price-input" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Currency Code</label>
                                    <select id="mat-currency-input" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button type="button" data-close-modal="material-modal" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-600/20">Save Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Price History Drawer -->
            <div id="price-history-drawer" class="fixed inset-0 z-50 hidden">
                <div class="modal-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
                <div class="fixed inset-y-0 right-0 z-10 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
                    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div>
                            <span class="text-xs uppercase font-bold tracking-wider text-indigo-600">Audit Trail</span>
                            <h3 id="drawer-material-title" class="text-lg font-bold text-slate-900">Price History Timeline</h3>
                            <p id="drawer-material-code" class="text-xs text-slate-500 font-mono"></p>
                        </div>
                        <button data-close-modal="price-history-drawer" class="text-slate-400 hover:text-slate-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div class="p-6 overflow-y-auto flex-1 space-y-6">
                        <!-- Record New Price Form -->
                        <div class="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-2">
                                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                Record New Price Revision
                            </h4>
                            <form id="record-price-form" class="space-y-3">
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Unit Price <span class="text-rose-500">*</span></label>
                                        <input id="rp-price-input" type="number" step="0.0001" min="0" required placeholder="0.0000" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                                        <select id="rp-currency-input" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-mono">
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Exchange Rate</label>
                                        <input id="rp-fx-input" type="number" step="0.0001" min="0" value="1.0000" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Freight (FX)</label>
                                        <input id="rp-freight-input" type="number" step="0.01" min="0" value="0.00" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 mb-1">Duty %</label>
                                        <input id="rp-duty-input" type="number" step="0.1" min="0" max="100" value="0.0" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono bg-white">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
                                    <input id="rp-date-input" type="date" required class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                                </div>
                                <div class="pt-2 flex justify-end">
                                    <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow">Record Price Revision</button>
                                </div>
                            </form>
                        </div>

                        <!-- Historical Timeline -->
                        <div>
                            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Historical Records (Immutable Audits)</h4>
                            <div id="drawer-timeline-container" class="space-y-4">
                                <div class="text-center py-6 text-slate-400 text-sm">No price history available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load materials
    await loadMaterialsTable();

    // Event listeners
    document.getElementById("btn-open-create-material").addEventListener("click", () => {
        document.getElementById("material-form").reset();
        openModal("material-modal");
    });

    document.getElementById("material-search-input").addEventListener("input", filterMaterials);
    document.getElementById("material-type-filter").addEventListener("change", filterMaterials);

    // Create material submission
    document.getElementById("material-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const materialCode = document.getElementById("mat-code-input").value.trim();
        const name = document.getElementById("mat-name-input").value.trim();
        const unitOfMeasure = document.getElementById("mat-unit-input").value;
        const materialType = document.getElementById("mat-type-input").value;
        const currentPrice = Number(document.getElementById("mat-price-input").value || 0);
        const currencyCode = document.getElementById("mat-currency-input").value;

        try {
            await materialsApi.create({ materialCode, name, unitOfMeasure, materialType, currentPrice, currencyCode });
            showToast("Raw material created successfully", "success");
            closeModal("material-modal");
            await loadMaterialsTable();
        } catch (err) {
            showToast(err.message || "Failed to create material", "error");
        }
    });

    // Record new price form submission
    document.getElementById("record-price-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!activeMaterialForHistory) return;

        const unitPrice = Number(document.getElementById("rp-price-input").value);
        const currencyCode = document.getElementById("rp-currency-input").value;
        const exchangeRateUsed = Number(document.getElementById("rp-fx-input").value);
        const freightCost = Number(document.getElementById("rp-freight-input").value);
        const importDutyPercentage = Number(document.getElementById("rp-duty-input").value);
        const effectiveFrom = document.getElementById("rp-date-input").value;

        try {
            await materialsApi.addPrice(activeMaterialForHistory.id, {
                unitPrice,
                currencyCode,
                exchangeRateUsed,
                freightCost,
                importDutyPercentage,
                effectiveFrom
            });
            showToast("New price logged in history", "success");
            await loadPriceHistory(activeMaterialForHistory.id);
            await loadMaterialsTable();
        } catch (err) {
            showToast(err.message || "Failed to log price", "error");
        }
    });
}

async function loadMaterialsTable() {
    try {
        const res = await materialsApi.getAll();
        currentMaterials = res.data;
        renderMaterialRows(currentMaterials);
    } catch (e) {
        showToast("Error loading materials", "error");
    }
}

function filterMaterials() {
    const query = document.getElementById("material-search-input").value.toLowerCase();
    const type = document.getElementById("material-type-filter").value;

    const filtered = currentMaterials.filter(m => {
        const matchesQuery = m.materialCode.toLowerCase().includes(query) || m.name.toLowerCase().includes(query);
        const matchesType = type === "ALL" || m.materialType === type;
        return matchesQuery && matchesType;
    });

    renderMaterialRows(filtered);
}

function renderMaterialRows(materials) {
    const tbody = document.getElementById("materials-table-body");
    if (!tbody) return;

    if (!materials.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400">No raw materials found</td></tr>`;
        return;
    }

    tbody.innerHTML = materials.map(m => `
        <tr class="hover:bg-slate-50/70 transition-colors">
            <td class="py-4 px-6 font-mono font-bold text-slate-900">${m.materialCode}</td>
            <td class="py-4 px-6 font-semibold text-slate-800">${m.name}</td>
            <td class="py-4 px-6 text-center font-mono text-xs font-semibold px-2 py-0.5 rounded text-slate-600">${m.unitOfMeasure}</td>
            <td class="py-4 px-6 text-center">
                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${m.materialType === 'IMPORTED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
                    ${m.materialType}
                </span>
            </td>
            <td class="py-4 px-6 text-right font-mono font-bold text-slate-900">
                ${m.currencyCode !== 'INR' ? `<span class="text-xs text-slate-400 mr-1">${m.currencyCode}</span>` : ''}
                ₹${Number(m.currentPrice).toFixed(2)}
            </td>
            <td class="py-4 px-6 text-right">
                <button onclick="window.viewPriceHistory(${m.id})" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                    Price History &rarr;
                </button>
            </td>
        </tr>
    `).join("");
}

window.viewPriceHistory = async (materialId) => {
    const mat = currentMaterials.find(m => m.id === Number(materialId));
    if (!mat) return;
    activeMaterialForHistory = mat;

    document.getElementById("drawer-material-title").innerText = mat.name;
    document.getElementById("drawer-material-code").innerText = `${mat.materialCode} &bull; ${mat.unitOfMeasure} &bull; ${mat.materialType}`;
    document.getElementById("rp-currency-input").value = mat.currencyCode || "INR";
    document.getElementById("rp-fx-input").value = mat.exchangeRate || 1.0;
    document.getElementById("rp-date-input").value = new Date().toISOString().split("T")[0];

    await loadPriceHistory(materialId);
    openModal("price-history-drawer");
};

async function loadPriceHistory(materialId) {
    const container = document.getElementById("drawer-timeline-container");
    try {
        const res = await materialsApi.getPriceHistory(materialId);
        const history = res.data;

        if (!history.length) {
            container.innerHTML = `<div class="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">No previous price records found.</div>`;
            return;
        }

        container.innerHTML = history.map((h, i) => `
            <div class="p-4 rounded-xl border ${i === 0 ? 'bg-indigo-50/40 border-indigo-200' : 'bg-white border-slate-200'} relative">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold font-mono ${i === 0 ? 'text-indigo-700' : 'text-slate-500'}">
                        ${i === 0 ? 'ACTIVE PRICE' : 'HISTORICAL RECORD'}
                    </span>
                    <span class="text-xs text-slate-400 font-mono">Effective: ${new Date(h.effectiveFrom).toLocaleDateString()}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span class="text-slate-400">Base Unit Price:</span>
                        <span class="font-mono font-semibold text-slate-800 ml-1">${h.currencyCode} ${Number(h.unitPrice).toFixed(4)}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Exchange Rate:</span>
                        <span class="font-mono font-semibold text-slate-800 ml-1">₹${Number(h.exchangeRateUsed).toFixed(4)}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Freight Cost:</span>
                        <span class="font-mono text-slate-700 ml-1">${h.currencyCode} ${Number(h.freightCost).toFixed(2)}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">Import Duty:</span>
                        <span class="font-mono text-slate-700 ml-1">${Number(h.importDutyPercentage).toFixed(2)}%</span>
                    </div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-600">Calculated Landed Cost:</span>
                    <span class="text-sm font-extrabold font-mono text-indigo-700">₹${Number(h.landedCostINR || (h.unitPrice * h.exchangeRateUsed)).toFixed(2)}</span>
                </div>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = `<div class="text-rose-500 text-xs">Failed to load price history</div>`;
    }
}

