import { productsApi, materialsApi, bomApi } from "../api/index.js";
import { showToast } from "../components/toast.js";
import { openModal, closeModal } from "../components/modal.js";

let allProducts = [];
let allMaterials = [];
let selectedProductId = null;
let currentBomItems = [];

export async function renderBomView(container) {
    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Bill of Materials (BOM) Engineering</h1>
                    <p class="text-xs text-slate-500 mt-1">Associate raw material inputs with products, set input quantities, and scrap allowances</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="btn-tab-bom" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm">Product BOM</button>
                    <button id="btn-tab-where-used" class="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">Where-Used Lookup</button>
                </div>
            </div>

            <!-- View 1: Product BOM Builder Tab -->
            <div id="section-product-bom" class="space-y-6">
                <!-- Product Selector Card -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="w-full sm:w-1/2">
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Select Finished Product</label>
                        <select id="bom-product-selector" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            <option value="">-- Choose a Product --</option>
                        </select>
                    </div>
                    <div id="selected-product-meta" class="hidden sm:flex items-center gap-6 text-xs text-slate-600 border-l border-slate-100 pl-6">
                        <div>
                            <span class="text-slate-400 block">Selling Price</span>
                            <span id="meta-selling-price" class="font-mono font-bold text-slate-900 text-sm">--</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block">Default Batch</span>
                            <span id="meta-batch-qty" class="font-mono font-bold text-slate-900 text-sm">--</span>
                        </div>
                    </div>
                    <div>
                        <button id="btn-add-bom-item" disabled class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Add Material to BOM
                        </button>
                    </div>
                </div>

                <!-- BOM Items Table -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                                    <th class="py-3.5 px-6">Material Code</th>
                                    <th class="py-3.5 px-6">Material Name</th>
                                    <th class="py-3.5 px-6 text-right">Qty Per Unit</th>
                                    <th class="py-3.5 px-6 text-center">Unit</th>
                                    <th class="py-3.5 px-6 text-right">Scrap %</th>
                                    <th class="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="bom-table-body" class="divide-y divide-slate-100 text-sm">
                                <tr>
                                    <td colspan="6" class="py-12 text-center text-slate-400">Please select a product above to inspect its Bill of Materials.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- View 2: Where-Used Reverse Lookup Tab -->
            <div id="section-where-used" class="hidden space-y-6">
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Select Raw Material for Reverse Lookup</label>
                    <select id="where-used-material-selector" class="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        <option value="">-- Choose a Raw Material --</option>
                    </select>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-100">
                        <h3 class="text-sm font-bold text-slate-900">Finished Products Consuming This Material</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                                    <th class="py-3.5 px-6">Product Code</th>
                                    <th class="py-3.5 px-6">Product Name</th>
                                    <th class="py-3.5 px-6 text-right">Required Qty</th>
                                    <th class="py-3.5 px-6 text-right">Scrap %</th>
                                    <th class="py-3.5 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody id="where-used-table-body" class="divide-y divide-slate-100 text-sm">
                                <tr>
                                    <td colspan="5" class="py-12 text-center text-slate-400">Select a raw material above to display where it is consumed.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Add/Edit BOM Item Modal -->
            <div id="bom-modal" class="fixed inset-0 z-50 hidden">
                <div class="modal-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
                <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all">
                        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 id="bom-modal-title" class="text-lg font-bold text-slate-900">Add Material to BOM</h3>
                            <button data-close-modal="bom-modal" class="text-slate-400 hover:text-slate-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <form id="bom-item-form" class="p-6 space-y-4">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Select Raw Material <span class="text-rose-500">*</span></label>
                                <select id="bom-material-input" required class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                    <option value="">-- Choose Material --</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Quantity Per Finished Unit <span class="text-rose-500">*</span></label>
                                <input id="bom-qty-input" type="number" step="0.0001" min="0.0001" required placeholder="0.0000" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Scrap / Wastage Allowance (%)</label>
                                <input id="bom-scrap-input" type="number" step="0.01" min="0" max="100" value="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                <span class="text-xs text-slate-400 mt-1 block">Accounted for manufacturing yield loss</span>
                            </div>
                            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button type="button" data-close-modal="bom-modal" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-600/20">Save BOM Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load initial products and materials
    const [productsRes, materialsRes] = await Promise.all([
        productsApi.getAll(),
        materialsApi.getAll()
    ]);
    allProducts = productsRes.data;
    allMaterials = materialsRes.data;

    // Populate Product Selector
    const prodSelect = document.getElementById("bom-product-selector");
    prodSelect.innerHTML = `<option value="">-- Choose a Product --</option>` +
        allProducts.map(p => `<option value="${p.id}">${p.productCode} - ${p.name}</option>`).join("");

    // Populate Material Input
    const matInput = document.getElementById("bom-material-input");
    matInput.innerHTML = `<option value="">-- Choose Material --</option>` +
        allMaterials.map(m => `<option value="${m.id}">${m.materialCode} - ${m.name} (${m.unitOfMeasure})</option>`).join("");

    // Populate Where-Used Material Selector
    const whereUsedSelect = document.getElementById("where-used-material-selector");
    whereUsedSelect.innerHTML = `<option value="">-- Choose a Raw Material --</option>` +
        allMaterials.map(m => `<option value="${m.id}">${m.materialCode} - ${m.name}</option>`).join("");

    // Preselect product if passed from another view
    if (window.selectedProductIdForBom) {
        prodSelect.value = window.selectedProductIdForBom;
        window.selectedProductIdForBom = null;
        await onProductSelected(prodSelect.value);
    }

    // Tab toggling
    document.getElementById("btn-tab-bom").addEventListener("click", () => {
        document.getElementById("section-product-bom").classList.remove("hidden");
        document.getElementById("section-where-used").classList.add("hidden");
        document.getElementById("btn-tab-bom").className = "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm";
        document.getElementById("btn-tab-where-used").className = "px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50";
    });

    document.getElementById("btn-tab-where-used").addEventListener("click", () => {
        document.getElementById("section-product-bom").classList.add("hidden");
        document.getElementById("section-where-used").classList.remove("hidden");
        document.getElementById("btn-tab-where-used").className = "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm";
        document.getElementById("btn-tab-bom").className = "px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50";
    });

    // Product selector change
    prodSelect.addEventListener("change", async (e) => {
        await onProductSelected(e.target.value);
    });

    // Add material button
    document.getElementById("btn-add-bom-item").addEventListener("click", () => {
        document.getElementById("bom-modal-title").innerText = "Add Material to BOM";
        document.getElementById("bom-item-form").reset();
        openModal("bom-modal");
    });

    // BOM item form submission
    document.getElementById("bom-item-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!selectedProductId) return;

        const rawMaterialId = Number(document.getElementById("bom-material-input").value);
        const quantity = Number(document.getElementById("bom-qty-input").value);
        const scrapPercentage = Number(document.getElementById("bom-scrap-input").value);

        if (quantity <= 0) {
            showToast("Quantity must be greater than zero", "error");
            return;
        }

        try {
            await bomApi.saveBom(selectedProductId, { rawMaterialId, quantity, scrapPercentage });
            showToast("Bill of Materials updated", "success");
            closeModal("bom-modal");
            await loadBomTable(selectedProductId);
        } catch (err) {
            showToast(err.message || "Failed to update BOM", "error");
        }
    });

    // Where-Used change
    whereUsedSelect.addEventListener("change", async (e) => {
        const matId = e.target.value;
        const tbody = document.getElementById("where-used-table-body");
        if (!matId) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-slate-400">Select a raw material above to display where it is consumed.</td></tr>`;
            return;
        }

        try {
            const res = await materialsApi.getAffectedProducts(matId);
            const prods = res.data;
            if (!prods.length) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-slate-400">No active products currently consume this material.</td></tr>`;
                return;
            }

            tbody.innerHTML = prods.map(p => `
                <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-4 px-6 font-mono font-bold text-slate-900">${p.productCode}</td>
                    <td class="py-4 px-6 font-semibold text-slate-800">${p.name}</td>
                    <td class="py-4 px-6 text-right font-mono font-bold text-slate-900">${p.requiredQuantity} ${p.unit}</td>
                    <td class="py-4 px-6 text-right font-mono text-slate-600">${p.scrapPercentage}%</td>
                    <td class="py-4 px-6 text-center">
                        <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${p.status}</span>
                    </td>
                </tr>
            `).join("");
        } catch (err) {
            showToast("Error querying where-used products", "error");
        }
    });
}

async function onProductSelected(prodId) {
    selectedProductId = prodId ? Number(prodId) : null;
    const btn = document.getElementById("btn-add-bom-item");
    const metaBox = document.getElementById("selected-product-meta");

    if (!selectedProductId) {
        btn.disabled = true;
        metaBox.classList.add("hidden");
        document.getElementById("bom-table-body").innerHTML = `
            <tr><td colspan="6" class="py-12 text-center text-slate-400">Please select a product above to inspect its Bill of Materials.</td></tr>
        `;
        return;
    }

    const prod = allProducts.find(p => p.id === selectedProductId);
    if (prod) {
        btn.disabled = false;
        metaBox.classList.remove("hidden");
        document.getElementById("meta-selling-price").innerText = `₹${Number(prod.sellingPricePerUnit).toFixed(2)}`;
        document.getElementById("meta-batch-qty").innerText = `${Number(prod.defaultBatchQuantity).toLocaleString()} units`;
    }

    await loadBomTable(selectedProductId);
}

async function loadBomTable(productId) {
    const tbody = document.getElementById("bom-table-body");
    try {
        const res = await bomApi.getByProduct(productId);
        currentBomItems = res.data;

        if (!currentBomItems.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-12 text-center text-slate-400">
                        <p class="font-medium text-slate-600">No raw materials configured for this product</p>
                        <p class="text-xs text-slate-400 mt-1">Click "Add Material to BOM" above to assign ingredients</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = currentBomItems.map(item => `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-4 px-6 font-mono font-bold text-slate-900">${item.materialCode}</td>
                <td class="py-4 px-6 font-semibold text-slate-800">${item.name}</td>
                <td class="py-4 px-6 text-right font-mono font-bold text-slate-900">${Number(item.quantity).toFixed(4)}</td>
                <td class="py-4 px-6 text-center font-mono text-xs text-slate-600">${item.unit}</td>
                <td class="py-4 px-6 text-right font-mono text-slate-600">${Number(item.scrapPercentage).toFixed(2)}%</td>
                <td class="py-4 px-6 text-right">
                    <button onclick="window.removeBomItem(${item.rawMaterialId})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Remove Material">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        showToast("Error loading BOM items", "error");
    }
}

window.removeBomItem = async (materialId) => {
    if (!selectedProductId) return;
    try {
        await bomApi.deleteBomItem(selectedProductId, materialId);
        showToast("Item removed from Bill of Materials", "success");
        await loadBomTable(selectedProductId);
    } catch (e) {
        showToast("Failed to remove item", "error");
    }
};
