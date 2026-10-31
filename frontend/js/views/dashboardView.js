import { productsApi, materialsApi, estimationApi } from "../api/index.js";

export async function renderDashboardView(container) {
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <!-- Header Banner -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
                <div class="relative z-10">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Calculation Engine Online
                    </span>
                    <h1 class="text-3xl font-extrabold tracking-tight">Product Cost Estimation & Profit System</h1>
                    <p class="text-slate-300 mt-2 text-sm max-w-2xl">
                        Comprehensive manufacturing cost tracking, dynamic currency-converted raw material prices, scrap overheads, and real-time margin sensitivity analysis.
                    </p>
                </div>
                <div class="flex items-center gap-3 relative z-10">
                    <button onclick="window.navigateTo('estimations')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        New Estimation
                    </button>
                    <button onclick="window.navigateTo('impact')" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        Price Simulation
                    </button>
                </div>
            </div>

            <!-- Top KPI Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Products</span>
                        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-baseline gap-2">
                        <span id="kpi-products-count" class="text-3xl font-extrabold text-slate-900">--</span>
                        <span class="text-xs text-emerald-600 font-medium font-mono">100% cataloged</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Configured with Bill of Materials</p>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tracked Materials</span>
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-baseline gap-2">
                        <span id="kpi-materials-count" class="text-3xl font-extrabold text-slate-900">--</span>
                        <span class="text-xs text-indigo-600 font-medium">Domestic & Import</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Landed exchange rates updated</p>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Margin</span>
                        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-slate-900">18.6%</span>
                        <span class="text-xs text-emerald-600 font-medium">Healthy</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Across active production batches</p>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Approvals</span>
                        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                    </div>
                    <div class="mt-4 flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-slate-900">1</span>
                        <span class="text-xs text-amber-600 font-medium">Review required</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Revised BOM cost estimate</p>
                </div>
            </div>

            <!-- Recent Estimations & Dynamic Alert -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Recent Estimations Table -->
                <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 class="text-base font-bold text-slate-900">Latest Cost Estimations</h2>
                            <p class="text-xs text-slate-500 mt-0.5">Approved and simulated product cost summaries</p>
                        </div>
                        <button onclick="window.navigateTo('estimations')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All &rarr;</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                                    <th class="py-3.5 px-6">Product</th>
                                    <th class="py-3.5 px-6 text-right">Unit Cost</th>
                                    <th class="py-3.5 px-6 text-right">Selling Price</th>
                                    <th class="py-3.5 px-6 text-right">Margin %</th>
                                    <th class="py-3.5 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody id="dashboard-estimations-table" class="divide-y divide-slate-100 text-sm">
                                <tr>
                                    <td colspan="5" class="py-8 text-center text-slate-400">Loading estimations...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Currency & Sensitivity Card -->
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                        <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            Foreign Exchange Benchmarks
                        </h3>
                        <p class="text-xs text-slate-500 mb-4">Historical rates locked per estimate calculation</p>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">USD</span>
                                    <span class="text-xs font-medium text-slate-600">US Dollar</span>
                                </div>
                                <span class="font-mono text-sm font-semibold text-slate-900">₹83.50</span>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">EUR</span>
                                    <span class="text-xs font-medium text-slate-600">Euro</span>
                                </div>
                                <span class="font-mono text-sm font-semibold text-slate-900">₹90.20</span>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">GBP</span>
                                    <span class="text-xs font-medium text-slate-600">British Pound</span>
                                </div>
                                <span class="font-mono text-sm font-semibold text-slate-900">₹108.40</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 p-6 rounded-2xl">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900">Dynamic Alert</h4>
                                <p class="text-xs text-amber-800 mt-1 leading-relaxed">
                                    Raw material prices updated for <strong>Natural Rubber Latex</strong> (+14.1%). Run an impact simulation to evaluate profit margin adjustments across affected finished products.
                                </p>
                                <button onclick="window.navigateTo('impact')" class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 underline hover:text-amber-950">
                                    Inspect Margin Impact &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Populate data asynchronously from mock API
    try {
        const [productsRes, materialsRes, estimationsRes] = await Promise.all([
            productsApi.getAll(),
            materialsApi.getAll(),
            estimationApi.getHistory()
        ]);

        const prodCountEl = document.getElementById("kpi-products-count");
        const matCountEl = document.getElementById("kpi-materials-count");
        if (prodCountEl) prodCountEl.innerText = productsRes.data.length;
        if (matCountEl) matCountEl.innerText = materialsRes.data.length;

        const tableBody = document.getElementById("dashboard-estimations-table");
        if (tableBody) {
            tableBody.innerHTML = estimationsRes.data.map(est => `
                <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-4 px-6">
                        <div class="font-bold text-slate-900">${est.productName}</div>
                        <div class="text-xs text-slate-400 font-mono">${est.productCode} &bull; v${est.version}</div>
                    </td>
                    <td class="py-4 px-6 text-right font-mono font-medium text-slate-800">₹${est.costPerUnit.toFixed(2)}</td>
                    <td class="py-4 px-6 text-right font-mono font-medium text-slate-800">₹${est.sellingPricePerUnit.toFixed(2)}</td>
                    <td class="py-4 px-6 text-right font-mono font-bold ${est.profitMarginPercentage >= 15 ? 'text-emerald-600' : est.profitMarginPercentage > 0 ? 'text-amber-600' : 'text-rose-600'}">
                        ${est.profitMarginPercentage.toFixed(2)}%
                    </td>
                    <td class="py-4 px-6 text-center">
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${est.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                            ${est.approvalStatus}
                        </span>
                    </td>
                </tr>
            `).join("");
        }
    } catch (e) {
        console.error("Dashboard render error:", e);
    }
}

