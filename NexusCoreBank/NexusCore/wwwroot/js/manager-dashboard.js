document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("nexus_token");
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    let currentReviewAccountNumber = null;
    let currentReviewAccountId = null;

    if (!token) {
        window.location.href = "login.html";
        return;
    }
    fetchGlobalLedger();
    fetchAuditLogs();
    const navPending = document.getElementById('nav-pending');
    const viewPending = document.getElementById('view-pending');

    const navLedger = document.getElementById("nav-ledger");
    const navSecurity = document.getElementById("nav-security");

    const viewLedger = document.getElementById("view-ledger");
    const viewSecurity = document.getElementById("view-security");

    viewLedger.classList.add("hidden");
    viewSecurity.classList.add("hidden");
    viewPending.classList.remove("hidden");

    navPending.classList.add("active");
    navLedger.classList.remove("active");
    navSecurity.classList.remove("active");

    loadPendingDeposits();

    navPending.addEventListener('click', (e) => {
        e.preventDefault();

        viewLedger.classList.add('hidden');
        viewSecurity.classList.add('hidden');
        viewPending.classList.remove('hidden');
        navPending.classList.add("active");
        navLedger.classList.remove("active");
        navSecurity.classList.remove("active");

        fetchAuditLogs();
        loadPendingDeposits();
    });

    navLedger.addEventListener("click", (e) => {
        e.preventDefault();

        viewLedger.classList.remove("hidden");
        viewSecurity.classList.add("hidden");

        navLedger.classList.add("active");
        navSecurity.classList.remove("active");
    });

    navSecurity.addEventListener("click", (e) => {
        e.preventDefault();

        viewSecurity.classList.remove("hidden");
        viewLedger.classList.add("hidden");

        navSecurity.classList.add("active");
        navLedger.classList.remove("active");
    });



    async function loadPendingDeposits() {
        const tbody = document.getElementById('pending-deposits-body');

        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> Accessing secure vault...</td></tr>';

        try {
            const token = localStorage.getItem('nexus_token');
            const response = await fetch('http://localhost:5066/Manager/Pending-Deposit', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Unauthorized or Server Error');
            }

            const deposits = await response.json();

            if (deposits.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">The pending queue is currently empty.</td></tr>';
                return;
            }

            tbody.innerHTML = '';

            deposits.forEach(dep => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid var(--border-dark)';

                const dateObj = new Date(dep.transactionDate);
                const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();

                row.innerHTML = `
                    <td style="padding: 1rem;">${dep.transactionId}</td>
                    <td style="padding: 1rem; font-weight: bold; color: var(--text-light);">${dep.fullName}</td>
                    <td style="padding: 1rem;">${dep.accountNumber}</td>
                    <td style="padding: 1rem; color: #10b981; font-weight: bold;">₹${dep.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 1rem; color: var(--text-muted); font-size: 0.9rem;">${formattedDate}</td>
                    <td style="padding: 1rem; text-align: center;">
                        <button class="btn btn-primary approve-btn" data-id="${dep.transactionId}" style="background-color: #10b981; margin-right: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem;"><i class="fa-solid fa-check"></i></button>
                        <button class="btn btn-primary reject-btn" data-id="${dep.transactionId}" style="background-color: var(--danger-red); padding: 0.4rem 0.8rem; font-size: 0.85rem;"><i class="fa-solid fa-xmark"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            attachActionButtons();

        } catch (error) {
            console.error("Radar Error:", error);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--danger-red);">Error loading data. Verify connection and token.</td></tr>';
        }
    }

    function attachActionButtons() {
        const approveBtns = document.querySelectorAll('.approve-btn');
        const rejectBtns = document.querySelectorAll('.reject-btn');

        approveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const txId = e.currentTarget.getAttribute('data-id');
                executeTransaction(txId, 'approve');
            });
        });

        rejectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const txId = e.currentTarget.getAttribute('data-id');
                executeTransaction(txId, 'reject');
            });
        });
    }

    async function executeTransaction(txId, action) {
        let targetUrl = '';
        if(action === 'approve'){
            targetUrl = `http://localhost:5066/Manager/approve/${txId}`
        }
        else if(action === 'reject'){
            targetUrl = `http://localhost:5066/Manager/reject/${txId}`
        }
        try {
            const response = await fetch(targetUrl,{
                method : 'PUT',
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}` 
                }
            });
            const data = await response.json();
            if(response.ok)
            {
                alert(data.message);
                loadPendingDeposits();
            }
            else{
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }


    document.getElementById("ledger-body").addEventListener("click", (event) => {
        const reviewBtn = event.target.closest(".btn-table-action");
        if (!reviewBtn) return;

        currentReviewAccountNumber = reviewBtn.dataset.accnum;
        const accountId = reviewBtn.dataset.id;
        const email = reviewBtn.dataset.email;
        const modal = document.getElementById("review-modal");
        const modalAccountId = document.getElementById("modal-account-id");
        const modalAccountEmail = document.getElementById("modal-account-Email");

        currentReviewAccountId = accountId;
        modalAccountId.innerText = accountId;
        modalAccountEmail.innerText = email;
        modal.classList.remove("hidden");
    });
    document.getElementById("close-modal").addEventListener("click", () => {
        document.getElementById("review-modal").classList.add("hidden");
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        if (document.body.classList.contains("light-mode")) {
            themeIcon.className = "fa-solid fa-sun";
        } else {
            themeIcon.className = "fa-solid fa-moon";
        }
    });

    const freezeBtn = document.getElementById("btn-modal-freeze");
    freezeBtn.addEventListener("click", async () => {
        if (!currentReviewAccountNumber) {
            alert("Enter an account number.");
            return;
        }
        const confirmFreeze = confirm(
            `Are you sure you want to completely freeze Account ${currentReviewAccountNumber}? This will immediately block all transactions.`
        );
        if (!confirmFreeze) return;
        try {
            const response = await fetch(`http://localhost:5066/Manager/freeze/${currentReviewAccountNumber}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                document.getElementById("review-modal").classList.add("hidden");
                fetchGlobalLedger();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Freeze operation failed.");
        }
    });
    const UnfreezeBtn = document.getElementById("btn-modal-unfreeze");
    UnfreezeBtn.addEventListener("click", async () => {
        if (!currentReviewAccountNumber) {
            alert("Enter an account number.");
            return;
        }
        const confirmRestore = confirm(
            `Are you sure you want to Restore Account ${currentReviewAccountNumber}? This Account Will be Active`
        );
        if (!confirmRestore) return;
        try {
            const response = await fetch(`http://localhost:5066/Manager/unfreeze/${currentReviewAccountNumber}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                document.getElementById("review-modal").classList.add("hidden");
                fetchGlobalLedger();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Restoration failed.");
        }
    });
    const UpdateEmail = document.getElementById("btn-update-email");

    UpdateEmail.addEventListener("click", async () => {
        const newEmail = document.getElementById("edit-email-input").value.trim();
        if (!currentReviewAccountId) {
            alert("Enter an account Id.");
            return;
        }
        if (!newEmail) {
            alert("Please enter a new email address.");
            return;
        }
        const confirmUpdateEmail = confirm("Are you sure you want to override the registered email for this user?");
        if (!confirmUpdateEmail) return;
        try {
            const response = await fetch(`http://localhost:5066/Manager/update-email/${currentReviewAccountId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ newEmail: newEmail })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                document.getElementById("edit-email-input").value = "";
                document.getElementById("review-modal").classList.add("hidden");
                fetchGlobalLedger();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Update failed.");
        }
    });
    async function fetchGlobalLedger() {
        try {
            const response = await fetch(`http://localhost:5066/Manager/global-ledger`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });
            if (response.ok) {
                const data = await response.json();
                const ledgerBody = document.getElementById("ledger-body");
                ledgerBody.innerHTML = "";
                data.forEach(customer => {
                    const row = document.createElement("tr");
                    let statusClass = "";
                    if (customer.accountStatus === "Active") {
                        statusClass = "status-active";
                    }
                    else if (customer.accountStatus === "Frozen") {
                        statusClass = "status-frozen";
                    }
                    else if (customer.accountStatus === "Closed") {
                        statusClass = "status-closed";
                    }
                    else if (customer.accountStatus === "Rejected") {
                        statusClass = "status-rejected";
                    }
                    row.innerHTML = `
                        <td>${customer.accountId}</td>
                        <td>${customer.accountNumber}</td>
                        <td>${customer.fullName}</td>
                        <td>${customer.accountType}</td>
                        <td>₹ ${customer.balance}</td>
                        <td>
                            <span class="status-badge ${statusClass}">
                                ${customer.accountStatus}
                            </span>
                        </td>
                        <td>
                            <button class="btn-table-action"
                                data-id="${customer.accountId}"
                                data-accnum="${customer.accountNumber}"
                                data-email="${customer.email}">
                                <i class="fa-solid fa-magnifying-glass"></i> Review
                            </button>
                        </td>
                    `;
                    ledgerBody.appendChild(row);
                });
            } else {
                console.error("Failed to fetch ledger:", response.status);
            }
        } catch (error) {
            console.error("Error loading ledger:", error);
        }
    }
    async function fetchAuditLogs() {
        try {
            const response = await fetch(`http://localhost:5066/Manager/audit-logs`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });

            const auditBody = document.getElementById("audit-logs-body");

            if (response.ok) {
                const logs = await response.json();

                auditBody.innerHTML = "";

                logs.forEach(log => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                    <td style="padding:1rem;">${log.logId}</td>
                    <td style="padding:1rem;">${new Date(log.actionDate).toLocaleString()}</td>
                    <td style="padding:1rem;">${log.employeeName}</td>
                    <td style="padding:1rem;">${log.actionType}</td>
                    <td style="padding:1rem;">${log.actionDetails}</td>
                    `;

                    auditBody.appendChild(row);
                });

            } else {
                auditBody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding:2rem;text-align:center;color:red;">
                        Failed to load audit logs
                    </td>
                </tr>
            `;
            }

        } catch (error) {
            console.error(error);
        }
    }
    document.getElementById("logout-btn")
        .addEventListener("click", () => {
            alert("logged out");
            localStorage.removeItem("nexus_token");
            window.location.href = "login.html";
        });
});