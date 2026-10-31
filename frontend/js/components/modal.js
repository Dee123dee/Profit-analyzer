/**
 * Modal & Drawer Controller Component.
 */

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}

export function setupModalListeners() {
    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", (e) => {
            const targetId = button.getAttribute("data-close-modal");
            closeModal(targetId);
        });
    });

    // Close on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) {
                backdrop.parentElement.classList.add("hidden");
                document.body.classList.remove("overflow-hidden");
            }
        });
    });
}

