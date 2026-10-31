import { API_CONFIG } from "./js/api/client.js";
import { setupModalListeners } from "./js/components/modal.js";
import { showToast } from "./js/components/toast.js";

import { renderDashboardView } from "./js/views/dashboardView.js";
import { renderProductsView } from "./js/views/productsView.js";
import { renderMaterialsView } from "./js/views/materialsView.js";
import { renderBomView } from "./js/views/bomView.js";
import { renderOverheadsView } from "./js/views/overheadsView.js";
import { renderEstimationView } from "./js/views/estimationView.js";
import { renderImpactView } from "./js/views/impactView.js";

const routes = {
    dashboard: { title: "Executive Dashboard", render: renderDashboardView },
    products: { title: "Product Catalog", render: renderProductsView },
    materials: { title: "Raw Materials & Landed Rates", render: renderMaterialsView },
    bom: { title: "Bill of Materials (BOM)", render: renderBomView },
    overheads: { title: "Manufacturing Overheads", render: renderOverheadsView },
    estimations: { title: "Cost Estimation & Approvals", render: renderEstimationView },
    impact: { title: "Price Sensitivity & Impact Analysis", render: renderImpactView }
};

let currentRoute = "dashboard";

export async function navigateTo(routeKey) {
    if (!routes[routeKey]) routeKey = "dashboard";
    currentRoute = routeKey;

    // Update active nav styling
    document.querySelectorAll(".nav-link").forEach(link => {
        const linkTarget = link.getAttribute("data-route");
        if (linkTarget === routeKey) {
            link.classList.add("bg-indigo-600", "text-white", "shadow-sm");
            link.classList.remove("text-slate-400", "hover:bg-slate-800", "hover:text-slate-200");
        } else {
            link.classList.remove("bg-indigo-600", "text-white", "shadow-sm");
            link.classList.add("text-slate-400", "hover:bg-slate-800", "hover:text-slate-200");
        }
    });

    // Update breadcrumb
    const breadcrumb = document.getElementById("header-breadcrumb");
    if (breadcrumb) {
        breadcrumb.innerText = routes[routeKey].title;
    }

    // Render View
    const mainContainer = document.getElementById("main-viewport");
    if (mainContainer) {
        mainContainer.innerHTML = `
            <div class="flex items-center justify-center py-24 text-slate-400">
                <svg class="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            </div>
        `;
        try {
            await routes[routeKey].render(mainContainer);
        } catch (err) {
            console.error("View rendering failed:", err);
            mainContainer.innerHTML = `
                <div class="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
                    <p class="font-bold">Failed to load view</p>
                    <p class="text-xs text-rose-500 mt-1">${err.message}</p>
                </div>
            `;
        }
    }
}

// Global hook for cross-page navigation
window.navigateTo = navigateTo;

document.addEventListener("DOMContentLoaded", () => {
    // Nav link click listeners
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const route = link.getAttribute("data-route");
            navigateTo(route);
        });
    });

    // Mock mode toggle
    const toggle = document.getElementById("toggle-mock-mode");
    if (toggle) {
        toggle.checked = API_CONFIG.MOCK_MODE;
        toggle.addEventListener("change", (e) => {
            API_CONFIG.MOCK_MODE = e.target.checked;
            showToast(`Switched to ${API_CONFIG.MOCK_MODE ? "Mock Presentation Mode" : "Live Backend Mode"}`, "info");
            navigateTo(currentRoute);
        });
    }

    // Initialize modals
    setupModalListeners();

    // Initial navigation
    navigateTo("dashboard");
});
