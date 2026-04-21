document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            body.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');

            if (body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (navLinks) navLinks.classList.toggle('active');
            if (navActions) navActions.classList.toggle('active');
        });
    }

    const selectionCards = document.querySelectorAll('.selection-card');

    selectionCards.forEach(card => {
        card.addEventListener('click', function () {
            document.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));

            this.classList.add('selected');

            const button = this.querySelector('.selection-btn');
            if (button && button.getAttribute('href')) {
                setTimeout(() => {
                    window.location.href = button.getAttribute('href');
                }, 500);
            }
        });
    });
});

function showMessage(msg, type = 'error') {
    const error = document.getElementById("error-message");
    if (!error) return;

    if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
    }

    error.classList.remove('error', 'success', 'warning', 'info');
    error.classList.add(type);

    error.innerText = String(msg);
    error.style.display = "block";

    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    const error = document.getElementById("error-message");
    if (error) {
        error.style.display = "none";
        error.classList.remove('error', 'success', 'warning', 'info');
    }
}
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
const sections = document.querySelectorAll(".legal-section");
const sidebarLinks  = document.querySelectorAll(".sidebar-link");

if (sections.length > 0 && sidebarLinks .length > 0) {

    const observerOptions = {
        root: null,
        rootMargin: "-150px 0px -60% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sidebarLinks .forEach(link => link.classList.remove("active"));

                const currentId = entry.target.getAttribute("id");

                const activeLink = document.querySelector(`.sidebar-link[href="#${currentId}"]`);
                if (activeLink) {
                    activeLink.classList.add("active");
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    }); 
}


function showError(msg) { showMessage(String(msg), 'error'); }
function showSuccess(msg) { showMessage(String(msg), 'success'); }
function showWarning(msg) { showMessage(String(msg), 'warning'); }
function showInfo(msg) { showMessage(String(msg), 'info'); }

const googleBtn = document.getElementById('google-auth-link');

if (googleBtn) {
    googleBtn.addEventListener('click', function(e) {
        const icon = document.getElementById('g-icon');
        const spinner = document.getElementById('g-spinner');
        const text = document.getElementById('g-btn-text');

        googleBtn.classList.add('is-loading');

        icon?.classList.add('hidden');
        spinner?.classList.remove('hidden');
        if (text) text.innerText = "Connecting...";
    });
}