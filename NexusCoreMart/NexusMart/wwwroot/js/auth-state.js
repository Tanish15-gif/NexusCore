
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('nexusmart_token');
    
    const loginLink = document.getElementById('nav-login-link');
    const dashboardLink = document.getElementById('nav-dashboard-link');
    const logoutBtn = document.getElementById('nav-logout-btn');

    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'inline-block';
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('nexusmart_token');
                localStorage.removeItem('nexusmart_cart'); 
                window.location.href = 'index.html';
            });
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});