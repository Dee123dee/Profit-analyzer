import { materialsApi, impactApi } from "../api/index.js";
import { showToast } from "../components/toast.js";

let allMaterials = [];
let currentSimulation = null;

export async function renderImpactView(container) {
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Price Change Sensitivity & Impact Analysis</h1>
                    <p class="text-xs text-slate-500 mt-1">Simulate upstream raw material price shocks and analyze resulting finished product margins</p>
                </div>
            </div>

            <!-- Simulation Trigger Card -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    Raw Material Price Revision Simulator
                </h3>
                <form id="impact-simulation-form" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Target Raw Material <span class="text-rose-500">*</span></label>
                        <select id="sim-material-select" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium">
                            <option value="">-- Choose Raw Material --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">New Proposed Price (INR) <span class="text-rose-500">*</span></label>
                        <input id="sim-proposed-price" type="number" step="0.0001" min="0" required placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                    </div>
                    <div>
                        <button id="btn-run-simulation" type="submit" class="w-full py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            Preview Impact
                        </button>
                    </div>
                </form>
            </div>

            <!-- Simulation Summary Banner -->
            <div id="sim-summary-banner" class="hidden bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span class="text-xs uppercase font-bold tracking-wider text-amber-400">Simulation Outcome</span>
                        <h2 id="sim-material-headline" class="text-xl font-extrabold mt-0.5">Raw Material Name</h2>
                        <p id="sim-price-delta-label" class="text-xs text-slate-300 font-mono mt-1"></p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="text-right">
                            <span class="text-xs text-slate-400 block uppercase">Base Price</span>
                            <span id="sim-base-price" class="text-base font-extrabold font-mono text-slate-200">₹0.00</span>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 block uppercase">Proposed Price</span>
                            <span id="sim-new-price" class="text-base font-extrabold font-mono text-amber-400">₹0.00</span>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 block uppercase">Price Shock</span>
                            <span id="sim-shock-pct" class="text-base font-extrabold font-mono text-rose-400">+0.0%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Comparative Impact Table -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 class="text-base font-bold text-slate-900">Comparative Product Impact Analysis</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Calculated margin contractions and unit cost increases across consuming products</p>
                    </div>
                    <span class="text-xs font-semibold text-slate-400">Conditional Finance Highlighting</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                                <th class="py-3.5 px-6">Product</th>
                                <th class="py-3.5 px-6 text-right">Previous Cost</th>
                                <th class="py-3.5 px-6 text-right">Revised Cost</th>
                                <th class="py-3.5 px-6 text-right">Cost Delta</th>
                                <th class="py-3.5 px-6 text-right">Previous Margin</th>
                                <th class="py-3.5 px-6 text-right">Revised Margin</th>
                                <th class="py-3.5 px-6 text-right">Margin Delta</th>
                                <th class="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="impact-table-body" class="divide-y divide-slate-100 text-sm">
                            <tr>
                                <td colspan="8" class="py-12 text-center text-slate-400">
                                    Select a raw material above and enter a proposed revision price to simulate portfolio sensitivity.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Load materials
    const materialsRes = await materialsApi.getAll();
    allMaterials = materialsRes.data;

    const matSelect = document.getElementById("sim-material-select");
    matSelect.innerHTML = `<option value="">-- Choose Raw Material --</option>` +
        allMaterials.map(m => `<option value="${m.id}">${m.materialCode} - ${m.name} (Current: ₹${m.currentPrice})</option>`).join("");

    matSelect.addEventListener("change", (e) => {
        const mat = allMaterials.find(m => m.id === Number(e.target.value));
        if (mat) {
            document.getElementById("sim-proposed-price").value = (mat.currentPrice * 1.15).toFixed(2); // preset default 15% shock
        }
    });

    // Run simulation
    document.getElementById("impact-simulation-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const materialId = Number(document.getElementById("sim-material-select").value);
        const proposedPrice = Number(document.getElementById("sim-proposed-price").value);

        const btn = document.getElementById("btn-run-simulation");
        btn.disabled = true;
        btn.innerText = "Simulating...";

        try {
            const res = await impactApi.simulatePriceChange(materialId, proposedPrice);
            currentSimulation = res.data;
            showToast("Impact simulation updated", "info");
            displaySimulationResults(currentSimulation);
        } catch (err) {
            showToast("Simulation failed", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Preview Impact`;
        }
    });
}

function displaySimulationResults(sim) {
    const banner = document.getElementById("sim-summary-banner");
    banner.classList.remove("hidden");

    document.getElementById("sim-material-headline").innerText = sim.simulatedMaterial.name;
    document.getElementById("sim-price-delta-label").innerText = `Code: ${sim.simulatedMaterial.code} &bull; Price change from ₹${sim.simulatedMaterial.currentPriceINR.toFixed(2)} to ₹${sim.simulatedMaterial.proposedPriceINR.toFixed(2)}`;

    document.getElementById("sim-base-price").innerText = `₹${sim.simulatedMaterial.currentPriceINR.toFixed(2)}`;
    document.getElementById("sim-new-price").innerText = `₹${sim.simulatedMaterial.proposedPriceINR.toFixed(2)}`;
    
    const shockEl = document.getElementById("sim-shock-pct");
    shockEl.innerText = `${sim.simulatedMaterial.priceChangePercentage > 0 ? '+' : ''}${sim.simulatedMaterial.priceChangePercentage.toFixed(2)}%`;
    shockEl.className = `text-base font-extrabold font-mono ${sim.simulatedMaterial.priceChangePercentage > 0 ? 'text-rose-400' : 'text-emerald-400'}`;

    const tbody = document.getElementById("impact-table-body");
    if (!sim.affectedProducts || !sim.affectedProducts.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="py-12 text-center text-slate-400">No active products are affected by this raw material price change.</td></tr>`;
        return;
    }

    tbody.innerHTML = sim.affectedProducts.map(p => {
        const isDrop = p.marginDelta < 0;
        return `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-4 px-6 font-semibold text-slate-800">
                    <div>${p.productName}</div>
                    <div class="text-xs text-slate-400 font-mono">${p.productCode}</div>
                </td>
                <td class="py-4 px-6 text-right font-mono text-slate-600">₹${p.previousCostPerUnit.toFixed(2)}</td>
                <td class="py-4 px-6 text-right font-mono font-bold text-slate-900">₹${p.revisedCostPerUnit.toFixed(2)}</td>
                <td class="py-4 px-6 text-right font-mono font-bold ${p.costDelta > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                    ${p.costDelta > 0 ? '+' : ''}₹${p.costDelta.toFixed(2)}
                </td>
                <td class="py-4 px-6 text-right font-mono text-slate-600">${p.previousMargin.toFixed(2)}%</td>
                <td class="py-4 px-6 text-right font-mono font-bold ${p.revisedMargin >= 15 ? 'text-emerald-600' : p.revisedMargin > 0 ? 'text-amber-600' : 'text-rose-600'}">
                    ${p.revisedMargin.toFixed(2)}%
                </td>
                <td class="py-4 px-6 text-right font-mono font-bold ${isDrop ? 'text-rose-600 bg-rose-50/50' : 'text-emerald-600 bg-emerald-50/50'}">
                    ${p.marginDelta > 0 ? '+' : ''}${p.marginDelta.toFixed(2)}%
                </td>
                <td class="py-4 px-6 text-right">
                    <button onclick="window.runEstimationForProduct(${p.productId})" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
                        Review & Propose &rarr;
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

