document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    if (header) {
        const syncHeaderState = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };

        syncHeaderState();
        window.addEventListener("scroll", syncHeaderState, { passive: true });
    }

    const toggles = document.querySelectorAll(".toggle-password");
    toggles.forEach((toggleButton) => {
        toggleButton.addEventListener("click", () => {
            const targetId = toggleButton.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.getAttribute("type") === "password";
            input.setAttribute("type", isPassword ? "text" : "password");
            toggleButton.textContent = isPassword ? "Hide" : "Show";
            toggleButton.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });
    });

    const filterGroups = document.querySelectorAll(".filter-tabs");
    filterGroups.forEach((group) => {
        const tabs = group.querySelectorAll("[data-filter]");
        const cards = document.querySelectorAll(".admin-book-card[data-status]");

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const filter = tab.getAttribute("data-filter") || "all";

                tabs.forEach((item) => {
                    const isActive = item === tab;
                    item.classList.toggle("active", isActive);
                    item.setAttribute("aria-pressed", String(isActive));
                });

                cards.forEach((card) => {
                    const shouldShow = filter === "all" || card.getAttribute("data-status") === filter;
                    card.hidden = !shouldShow;
                });
            });
        });
    });
});
