document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('nexus_token');
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");
        if (document.body.classList.contains("light-mode")) {
            themeIcon.className = "fa-solid fa-sun";
        }
        else {
            themeIcon.className = "fa-solid fa-moon";
        }

    });

    if (!token) {
        window.location.href = "login.html";
        return;
    }
    const emptyState = document.getElementById("empty-state");
    const accountsGrid = document.getElementById("accounts-grid");
    const accountCards = document.getElementById("account-cards");

    const logoutBtn = document.getElementById("logout-btn");
    const navPending = document.getElementById("nav-pending");
    const navLookup = document.getElementById("nav-lookup");

    const viewPending = document.getElementById("view-pending");
    const viewLookup = document.getElementById("view-lookup");

    // Pending view
    navPending.addEventListener("click", (e) => {
        e.preventDefault();

        viewPending.classList.remove("hidden");
        viewLookup.classList.add("hidden");

        navPending.classList.add("active");
        navLookup.classList.remove("active");
    });

    // Lookup view
    navLookup.addEventListener("click", (e) => {
        e.preventDefault();

        viewLookup.classList.remove("hidden");
        viewPending.classList.add("hidden");

        navLookup.classList.add("active");
        navPending.classList.remove("active");
    });

    let pendingAccounts = [];
    async function fetchPendingAccounts() {

        try {
            const response = await fetch("http://localhost:5066/Employee/pending-accounts", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            if (response.status === 401) {
                localStorage.removeItem("nexus_token");
                window.location.href = "login.html";
                return;
            }
            if (response.ok) {
                const data = await response.json();
                pendingAccounts = data;
                renderAccounts();
            } else {
                alert("Failed to fetch pending accounts.");
            }
        } catch (error) {

            console.error("Fetch error:", error);
        }
    }
    function renderAccounts() {

        accountCards.innerHTML = "";

        emptyState.classList.add("hidden");
        accountsGrid.classList.add("hidden");


        if (pendingAccounts.length === 0) {

            emptyState.classList.remove("hidden");
            return;

        }

        accountsGrid.classList.remove("hidden");
        pendingAccounts.forEach(account => {

            const card = document.createElement("div");
            card.className = "account-card";

            card.innerHTML = `
                <div class="account-header">
                    <span class="account-type">${account.accountType}</span>
                    <span class="account-status pending">Pending</span>
                </div>

                <div class="account-number">
                    ${account.accountNumber}
                </div>

                <div class="account-balance">
                    <div class="balance-label">Initial Deposit</div>
                    <div class="balance-amount">₹${account.balance.toFixed(2)}</div>
                </div>

                <div class="account-actions">
                    <button class="btn btn-primary approve-btn"
                        data-id="${account.accountId}">
                        <i class="fa-solid fa-check"></i> Approve Account
                    </button>
                    <button class="btn btn-danger reject-btn"
                        data-id="${account.accountId}">
                        <i class="fa-solid fa-xmark"></i> Reject
                    </button>
                </div>
            `;
            accountCards.appendChild(card);
        });
        attachApproveEvents();
    }
    function attachApproveEvents() {

        document.querySelectorAll(".approve-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const accountId = btn.dataset.id;
                const confirmApprove = confirm("Approve this account?");
                if (!confirmApprove) return;
                try {
                    const response = await fetch("http://localhost:5066/Employee/approve", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            AccountId: parseInt(accountId)
                        })
                    });
                    if (response.ok) {
                        const result = await response.json();
                        alert(result.message || "Account approved successfully!");
                        fetchPendingAccounts();
                    }
                    else {
                        const err = await response.json();
                        alert(err.message || "Approval failed.");
                    }
                } catch (error) {
                    console.error("Approve error:", error);
                }
            });
        });
        document.querySelectorAll(".reject-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const accountId = btn.dataset.id;
                const confirmReject = confirm("Reject this account?");
                if (!confirmReject) return;
                try {
                    const response = await fetch("http://localhost:5066/Employee/reject", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            AccountId: parseInt(accountId)
                        })
                    });
                    if (response.ok) {
                        const result = await response.json();
                        alert(result.message || "Account Rejected successfully!");
                        fetchPendingAccounts();
                    }
                    else {
                        const err = await response.json();
                        alert(err.message || "Rejection failed.");
                    }
                } catch (error) {
                    console.error("Rejection error:", error);
                }
            });
        });
    }
    document.getElementById("btn-search").addEventListener("click", async () => {

        const accountNumber = document.getElementById("search-input").value.trim();

        if (accountNumber === "") {
            alert("Please enter an account number");
            return;
        }
        const resultCard = document.getElementById("search-result-card");
        resultCard.innerHTML = "Searching account...";
        resultCard.classList.remove("hidden");

        try {

            const response = await fetch(`http://localhost:5066/Employee/search/${accountNumber}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
            if (!response.ok) {
                throw new Error("Account not found");
            }
            const data = await response.json();
            let statusClass = "status-active";

            if (data.status === "Frozen") statusClass = "status-frozen";
            if (data.status === "Closed") statusClass = "status-closed";
            if (data.status === "Rejected") statusClass = "status-rejected";
            if (data.status === "Pending") statusClass = "status-pending";
            resultCard.innerHTML = `
        <div class="profile-header">
            <div>
                <h3 class="profile-name">${data.fullName}</h3>
                <p class="profile-email">${data.email}</p>
            </div>
            <div style="text-align: right;">
                <span class="status-badge ${statusClass}">${data.status}</span>
            </div>
        </div>

        <div class="profile-details">
            <div class="detail-group">
                <p>Account Number</p>
                <p>${data.accountNumber}</p>
            </div>

            <div class="detail-group">
                <p>Account Type</p>
                <p>${data.accountType}</p>
            </div>

            <div class="detail-group balance-display">
                <p>Available Balance</p>
                <p>₹ ${data.balance}</p>
            </div>
        </div>
        `;

            resultCard.classList.remove("hidden");

        }
        catch (error) {
            resultCard.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }

    });
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("nexus_token");
        alert("Logged out");
        window.location.href = "login.html";
    });
    fetchPendingAccounts();
});