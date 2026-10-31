import { productsApi } from "../api/index.js";
import { showToast } from "../components/toast.js";
import { openModal, closeModal } from "../components/modal.js";

let currentProducts = [];

export async function renderProductsView(container) {
    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Product Catalog Management</h1>
                    <p class="text-xs text-slate-500 mt-1">Configure finished goods, standard selling prices, and default production batch sizes</p>
                </div>
                <button id="btn-open-create-product" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Add Product
                </button>
            </div>

            <!-- Search and Filter Bar -->
            <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div class="relative w-full sm:w-80">
                    <input id="product-search-input" type="text" placeholder="Search by code or product name..." class="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select id="product-status-filter" class="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                                <th class="py-3.5 px-6">Product Code</th>
                                <th class="py-3.5 px-6">Product Name</th>
                                <th class="py-3.5 px-6 text-right">Selling Price (₹)</th>
                                <th class="py-3.5 px-6 text-right">Default Batch</th>
                                <th class="py-3.5 px-6 text-center">Status</th>
                                <th class="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="products-table-body" class="divide-y divide-slate-100 text-sm">
                            <tr>
                                <td colspan="6" class="py-12 text-center text-slate-400">Loading products...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Create/Edit Modal -->
            <div id="product-modal" class="fixed inset-0 z-50 hidden">
                <div class="modal-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
                <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
                        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 id="product-modal-title" class="text-lg font-bold text-slate-900">Add New Product</h3>
                            <button data-close-modal="product-modal" class="text-slate-400 hover:text-slate-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <form id="product-form" class="p-6 space-y-4">
                            <input type="hidden" id="product-form-id">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Product Code <span class="text-rose-500">*</span></label>
                                <input id="product-code-input" type="text" required placeholder="e.g. PROD-MED-01" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                <p id="err-product-code" class="text-xs text-rose-500 mt-1 hidden"></p>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Product Name <span class="text-rose-500">*</span></label>
                                <input id="product-name-input" type="text" required placeholder="e.g. Sterile Surgical Gown (L)" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                <p id="err-product-name" class="text-xs text-rose-500 mt-1 hidden"></p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Selling Price (INR) <span class="text-rose-500">*</span></label>
                                    <input id="product-price-input" type="number" step="0.01" min="0" required placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Batch Size <span class="text-rose-500">*</span></label>
                                    <input id="product-batch-input" type="number" step="1" min="1" required placeholder="1000" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Status</label>
                                <select id="product-status-input" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Description</label>
                                <textarea id="product-desc-input" rows="3" placeholder="Technical specifications or use-case notes..." class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"></textarea>
                            </div>
                            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button type="button" data-close-modal="product-modal" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-600/20">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load products
    await loadProductsTable();

    // Event listeners
    document.getElementById("btn-open-create-product").addEventListener("click", () => {
        document.getElementById("product-modal-title").innerText = "Add New Product";
        document.getElementById("product-form").reset();
        document.getElementById("product-form-id").value = "";
        document.getElementById("product-batch-input").value = "1000";
        openModal("product-modal");
    });

    document.getElementById("product-search-input").addEventListener("input", filterProducts);
    document.getElementById("product-status-filter").addEventListener("change", filterProducts);

    // Form submission with client-side validation
    document.getElementById("product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("product-form-id").value;
        const productCode = document.getElementById("product-code-input").value.trim();
        const name = document.getElementById("product-name-input").value.trim();
        const sellingPricePerUnit = Number(document.getElementById("product-price-input").value);
        const defaultBatchQuantity = Number(document.getElementById("product-batch-input").value);
        const status = document.getElementById("product-status-input").value;
        const description = document.getElementById("product-desc-input").value.trim();

        // Validate
        if (!productCode) {
            showToast("Product code is required", "error");
            return;
        }
        if (sellingPricePerUnit < 0) {
            showToast("Selling price cannot be negative", "error");
            return;
        }
        if (defaultBatchQuantity <= 0) {
            showToast("Default batch quantity must be greater than zero", "error");
            return;
        }

        try {
            if (id) {
                await productsApi.update(id, { productCode, name, sellingPricePerUnit, defaultBatchQuantity, status, description });
                showToast("Product updated successfully", "success");
            } else {
                await productsApi.create({ productCode, name, sellingPricePerUnit, defaultBatchQuantity, status, description });
                showToast("Product created successfully", "success");
            }
            closeModal("product-modal");
            await loadProductsTable();
        } catch (err) {
            showToast(err.message || "Failed to save product", "error");
        }
    });
}

async function loadProductsTable() {
    try {
        const res = await productsApi.getAll();
        currentProducts = res.data;
        renderRows(currentProducts);
    } catch (e) {
        showToast("Error loading products", "error");
    }
}

function filterProducts() {
    const query = document.getElementById("product-search-input").value.toLowerCase();
    const status = document.getElementById("product-status-filter").value;

    const filtered = currentProducts.filter(p => {
        const matchesQuery = p.productCode.toLowerCase().includes(query) || p.name.toLowerCase().includes(query);
        const matchesStatus = status === "ALL" || p.status === status;
        return matchesQuery && matchesStatus;
    });

    renderRows(filtered);
}

function renderRows(products) {
    const tbody = document.getElementById("products-table-body");
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="py-12 text-center text-slate-400">
                    <p class="font-medium text-slate-600">No products found</p>
                    <p class="text-xs text-slate-400 mt-1">Try adjusting your search criteria or create a new product</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-slate-50/70 transition-colors">
            <td class="py-4 px-6 font-mono font-bold text-slate-900">${p.productCode}</td>
            <td class="py-4 px-6">
                <div class="font-semibold text-slate-800">${p.name}</div>
                <div class="text-xs text-slate-400 truncate max-w-xs">${p.description || "No description provided"}</div>
            </td>
            <td class="py-4 px-6 text-right font-mono font-semibold text-slate-900">₹${Number(p.sellingPricePerUnit).toFixed(2)}</td>
            <td class="py-4 px-6 text-right font-mono text-slate-600">${Number(p.defaultBatchQuantity).toLocaleString()} units</td>
            <td class="py-4 px-6 text-center">
                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                    ${p.status}
                </span>
            </td>
            <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="window.editProduct(${p.id})" class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit Product">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="window.viewBomForProduct(${p.id})" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors">
                        BOM
                    </button>
                    <button onclick="window.runEstimationForProduct(${p.id})" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                        Costing
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Global action handlers attached to window
window.editProduct = async (id) => {
    try {
        const res = await productsApi.getById(id);
        const p = res.data;
        document.getElementById("product-modal-title").innerText = "Edit Product";
        document.getElementById("product-form-id").value = p.id;
        document.getElementById("product-code-input").value = p.productCode;
        document.getElementById("product-name-input").value = p.name;
        document.getElementById("product-price-input").value = p.sellingPricePerUnit;
        document.getElementById("product-batch-input").value = p.defaultBatchQuantity;
        document.getElementById("product-status-input").value = p.status;
        document.getElementById("product-desc-input").value = p.description || "";
        openModal("product-modal");
    } catch (e) {
        showToast("Error retrieving product details", "error");
    }
};

window.viewBomForProduct = (id) => {
    window.selectedProductIdForBom = id;
    window.navigateTo("bom");
};

window.runEstimationForProduct = (id) => {
    window.selectedProductIdForEstimation = id;
    window.navigateTo("estimations");
};
