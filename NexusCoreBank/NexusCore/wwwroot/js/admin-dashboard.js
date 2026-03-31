document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("nexus_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    if (localStorage.getItem("nexus_theme") === "light") {
        document.body.classList.add("light-mode");
        themeIcon.classList.replace("fa-moon", "fa-sun");
    }

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {
            themeIcon.classList.replace("fa-moon", "fa-sun");
            localStorage.setItem("nexus_theme", "light");
        } else {
            themeIcon.classList.replace("fa-sun", "fa-moon");
            localStorage.setItem("nexus_theme", "dark");
        }
    });

    const navOverview = document.getElementById("nav-overview");
    const navStaff = document.getElementById("nav-staff");

    const viewOverview = document.getElementById("view-overview");
    const viewStaff = document.getElementById("view-staff");

    const navAudit = document.getElementById("nav-logs");
    const viewAudit = document.getElementById("view-audit");

    function hideAllViews() {
        viewOverview.classList.add("hidden");
        viewStaff.classList.add("hidden");
        navOverview.classList.remove("active");
        navStaff.classList.remove("active");
        viewAudit.classList.add("hidden");
        navAudit.classList.remove("active");
    }

    navOverview.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewOverview.classList.remove("hidden");
        navOverview.classList.add("active");
    });

    navStaff.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewStaff.classList.remove("hidden");
        navStaff.classList.add("active");
    });

    navAudit.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewAudit.classList.remove("hidden");
        navAudit.classList.add("active");
    });

    const registerModal = document.getElementById("register-modal");
    const btnOpenRegister = document.getElementById("btn-open-register");
    const registerClose = document.getElementById("register-close");
    const staffForm = document.getElementById("staff-form");
    const createBtn = document.getElementById("createBtn");

    btnOpenRegister.addEventListener("click", () => {
        registerModal.classList.remove("hidden");
    });

    registerClose.addEventListener("click", () => {
        registerModal.classList.add("hidden");
    });

    staffForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const originalBtnHtml = createBtn.innerHTML;
        createBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
        createBtn.disabled = true;

        const staffData = {
            FullName: document.getElementById("fullname").value,
            Email: document.getElementById("email").value,
            Password: document.getElementById("password").value,
            Department: document.getElementById("department").value,
            Role: document.getElementById("role").value
        };

        try {
            const response = await fetch("http://localhost:5066/Admin/register-staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(staffData)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Success: " + (data.message || "Identity created."));
                staffForm.reset();
                registerModal.classList.add("hidden");
            } else {
                alert("Error: " + (data.message || "Action failed."));
            }

        } catch (error) {
            console.error("API Connection Error:", error);
            alert("Server Error: Unable to reach the API.");
        } finally {
            createBtn.innerHTML = originalBtnHtml;
            createBtn.disabled = false;
        }
    });

    const promoteModal = document.getElementById("promote-modal");
    const promoteClose = document.getElementById("promote-close");
    const promoteForm = document.getElementById("promote-form");
    const userManagementBody = document.getElementById("user-management-body");

    userManagementBody.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-promote");
        if (btn) {
            const userId = btn.getAttribute("data-userid");
            const userName = btn.getAttribute("data-username");

            document.getElementById("promote-user-id").value = userId;
            document.getElementById("promote-user-name").textContent = userName;

            promoteModal.classList.remove("hidden");
        }
    });

    promoteClose.addEventListener("click", () => {
        promoteModal.classList.add("hidden");
    });

    promoteForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("promote-user-id").value;
        const newRole = document.getElementById("new-role-select").value;
        const submitBtn = promoteForm.querySelector('button[type="submit"]');

        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Executing...`;
        submitBtn.disabled = true;

        try {
            const response = await fetch("http://localhost:5066/Admin/promote-staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    newRole: newRole
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Success: " + (data.message || "Staff promoted successfully!"));
                promoteModal.classList.add("hidden");
                promoteForm.reset();

                fetchStaffRoster();
            } else {
                alert("Error: " + (data.message || "Promotion failed."));
            }

        } catch (error) {
            console.error("Promotion API Error:", error);
            alert("Server Error: Unable to reach the API.");
        } finally {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
        }
    });

    async function fetchSystemMetrics() {
        try {
            const response = await fetch("http://localhost:5066/Admin/system-metrics", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('total-users-count').innerText = data.totalUsers;
                document.getElementById('total-liquidity').innerText = '₹' + data.totalLiquidity.toLocaleString('en-IN');
                document.getElementById('frozen-count').innerText = data.totalFrozenAccounts;
            }
        } catch (error) {
            console.error(error);
        }
    }
    async function fetchStaffRoster() {
        try {
            const response = await fetch("http://localhost:5066/Admin/staff-list", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch staff list");
            }

            const staffList = await response.json();
            const tbody = document.getElementById("user-management-body");

            tbody.innerHTML = "";

            if (staffList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No staff accounts found in the system.</td></tr>`;
                return;
            }
            staffList.forEach(user => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--border-dark)";

                let roleColor = user.currentRole === 'Manager' ? 'color: #f59e0b;' : 'color: #3b82f6;';

                tr.innerHTML = `
                    <td style="padding: 1rem; color: var(--text-light);">${user.userId}</td>
                    <td style="padding: 1rem; color: var(--text-light); font-weight: bold;">${user.name}</td>
                    <td style="padding: 1rem; color: var(--text-muted);">${user.email}</td>
                    <td style="padding: 1rem; font-weight: bold; ${roleColor}">${user.currentRole}</td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-outline btn-promote" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; border: 1px solid var(--border-dark); background: transparent; color: var(--text-light); cursor: pointer; border-radius: 4px;" data-userid="${user.userId}" data-username="${user.name}">
                            <i class="fa-solid fa-level-up-alt" style="margin-right: 0.3rem;"></i> Promote
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("Error fetching staff:", error);
            document.getElementById("user-management-body").innerHTML = `
                <tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--danger-red);">
                    <i class="fa-solid fa-triangle-exclamation"></i> Server connection failed.
                </td></tr>
            `;
        }
    }
    async function fetchAuditLogs() {
        try {
            const response = await fetch(`http://localhost:5066/Admin/audit-logs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const tbody = document.getElementById("audit-log-body");
                tbody.innerHTML = "";
                data.forEach(log => {
                    const rows = document.createElement('tr');

                    rows.innerHTML = `
                    <td style="padding: 1rem; color: var(--text-light);">${log.logId}</td>
                    <td style="padding: 1rem; color: var(--text-light); font-weight: bold;">${log.employeeName}</td>
                    <td style="padding:1rem;">${log.actionType}</td>
                    <td style="padding: 1rem; color: var(--text-muted);">${log.actionDetails}</td>
                    <td style="padding:1rem;">${new Date(log.actionDate).toLocaleString()}</td>
                    `;
                    tbody.appendChild(rows);
                })
            } else {
                const tbody = document.getElementById("audit-log-body");
                tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding:2rem;text-align:center;color:red;">
                        Failed to load audit logs
                    </td>
                </tr>
                `;
            }
        } catch (error) {
            console.error("Error fetching AuditLogs:", error);
            document.getElementById("audit-log-body").innerHTML = `
                <tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--danger-red);">
                    <i class="fa-solid fa-triangle-exclamation"></i> Server connection failed.
                </td></tr>
            `;
        }
    }
    fetchSystemMetrics();
    fetchStaffRoster();
    fetchAuditLogs();
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("nexus_token");
        window.location.href = "login.html";
    });
});