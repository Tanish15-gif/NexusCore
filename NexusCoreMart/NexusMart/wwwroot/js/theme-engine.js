document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    if (!themeToggle || !themeIcon) return;

    // Load saved theme
    const savedTheme = localStorage.getItem("nexusmart_theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeIcon.className = "fa-solid fa-sun";
    }

    // Toggle event
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        
        if (document.body.classList.contains("dark-mode")) {
            themeIcon.className = "fa-solid fa-sun";
            localStorage.setItem("nexusmart_theme", "dark");
        } else {
            themeIcon.className = "fa-solid fa-moon";
            localStorage.setItem("nexusmart_theme", "light");
        }
    });
});
function showMessage(boxId, msg, type = 'error') {
    const box = document.getElementById(boxId);
    if (!box) return console.error(`Message box not found: ${boxId}`);

    if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
    }

    box.classList.remove('error', 'success', 'warning', 'info');
    box.classList.add(type);

    box.innerText = String(msg);
    box.style.display = "block";

    if (type === 'success') {
        setTimeout(() => hideMessage(boxId), 5000);
    }
}

function hideMessage(boxId) {
    const box = document.getElementById(boxId);
    if (!box) return;

    box.style.display = "none";
    box.classList.remove('error', 'success', 'warning', 'info');
}

// Shortcuts
function showError(boxId, msg) {
    showMessage(boxId, msg, 'error');
}

function showSuccess(boxId, msg) {
    showMessage(boxId, msg, 'success');
}

function showWarning(boxId, msg) {
    showMessage(boxId, msg, 'warning');
}

function showInfo(boxId, msg) {
    showMessage(boxId, msg, 'info');
}