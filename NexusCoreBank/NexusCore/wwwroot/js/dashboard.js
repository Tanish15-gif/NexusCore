document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('nexus_token');
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const headerName = document.getElementById("dashname-header");
    const aiName = document.getElementById("dashname-ai");

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");
        if (document.body.classList.contains("light-mode")) {
            themeIcon.className = "fa-solid fa-sun";
        }
        else {
            themeIcon.className = "fa-solid fa-moon";
        }

    });
    if (token == null || token == undefined) {
        window.location.href = 'login.html';
        return;
    }
    const mobileSidebar = document.querySelector('.sidebar');
    const activeLink = document.querySelector('.nav-link.active');

    if (window.innerWidth <= 768 && mobileSidebar && activeLink) {
        const sidebarWidth = mobileSidebar.offsetWidth;
        const activeLinkRect = activeLink.getBoundingClientRect();
        const activeLinkCenter = activeLinkRect.left + (activeLinkRect.width / 2);

        const scrollAmount = activeLinkCenter - (sidebarWidth / 2);

        mobileSidebar.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    const emptyState = document.getElementById("empty-state");
    const pendingState = document.getElementById("pending-state");
    const accountsGrid = document.getElementById("accounts-grid");

    const navAccounts = document.getElementById("nav-accounts");
    const navTransactions = document.getElementById("nav-transactions");
    const navAiAdvisor = document.getElementById('nav-ai-advisor');

    const viewAccounts = document.getElementById("view-accounts");
    const viewTransactions = document.getElementById("view-transactions");
    const viewAiAdvisor = document.getElementById('view-ai-advisor');
    const accountCards = document.getElementById("account-cards");

    let accounts = [];

    async function fetchMyAccounts() {
        try {
            const response = await fetch(`http://localhost:5066/Account/my-accounts`, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                }
            });
            if (response.ok) {
                const fetchedAccounts = await response.json();
                if (fetchedAccounts.length > 0) {
                    const name = fetchedAccounts[0].fullName;

                    if (headerName) headerName.innerText = name;
                    if (aiName) aiName.innerText = name;
                }
                accounts = fetchedAccounts;
                updateDashboard();
            }
            else {
                alert('failed to fetch accounts!');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const totalWealth = document.getElementById("total-wealth");

    const accountModal = document.getElementById("account-modal");
    const depositModal = document.getElementById("deposit-modal");
    const transferModal = document.getElementById("transfer-modal");

    const openAccountBtn = document.getElementById("open-account-btn");
    const fabOpenBtn = document.getElementById("fab-open-account");

    const modalClose = document.getElementById("modal-close");
    const depositClose = document.getElementById("deposit-close");
    const transferClose = document.getElementById("transfer-close");

    const withdrawModal = document.getElementById("withdraw-modal");
    const withdrawClose = document.getElementById("withdraw-close");
    const withdrawForm = document.getElementById("withdraw-form");

    const newAccountForm = document.getElementById("new-account-form");
    const depositForm = document.getElementById("deposit-form");
    const transferForm = document.getElementById("transfer-form");

    function updateDashboard() {

        emptyState.classList.add("hidden");
        pendingState.classList.add("hidden");
        accountsGrid.classList.add("hidden");

        if (accounts.length === 0) {

            emptyState.classList.remove("hidden");
            return;

        }

        const hasPending = accounts.some(acc => acc.status === "Pending");

        if (hasPending) {
            pendingState.classList.remove("hidden");
        }

        accountsGrid.classList.remove("hidden");
        renderAccounts();
        calculateWealth();
    }

    function renderAccounts() {
        accountCards.innerHTML = "";
        accounts.forEach(account => {

            const card = document.createElement("div");
            card.className = "account-card";

            card.innerHTML = `
                    <div class="account-header">
                        <span class="account-type">${account.accountType}</span>
                        <span class="account-status ${account.status.toLowerCase()}">
                            ${account.status}
                        </span>
                    </div>

                    <div class="account-number">
                        ${account.accountNumber}
                    </div>

                    <div class="account-balance">
                        <div class="balance-label">Balance</div>
                        <div class="balance-amount">₹${account.balance.toFixed(2)}</div>
                    </div>

                    <div class="account-actions">
                        <button class="btn btn-primary deposit-btn" data-id="${account.accountId}"
                            ${["Pending", "Frozen", "Closed", "Rejected"].includes(account.status) ? "disabled" : ""}>
                            <i class="fa-solid fa-plus"></i> Deposit
                        </button>
                        <button class="btn btn-outline withdraw-btn" data-id="${account.accountId}"
                            ${["Pending", "Frozen", "Closed", "Rejected"].includes(account.status) ? "disabled" : ""} 
                            style="color: #ff4d4d; border-color: #ff4d4d;">
                            <i class="fa-solid fa-minus"></i> Withdraw
                        </button>

                        <button class="btn btn-outline transfer-btn" data-id="${account.accountId}"
                            ${["Pending", "Frozen", "Closed", "Rejected"].includes(account.status) ? "disabled" : ""}>
                        <i class="fa-solid fa-right-left"></i> Transfer
                        </button>
                    </div>
                    `;
            accountCards.appendChild(card);
        });

        attachActionButtons();
    }


    function attachActionButtons() {
        document.querySelectorAll(".deposit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const input = document.getElementById("deposit-account-id");
                if (input) {
                    input.value = btn.dataset.id;
                }
                if (depositModal) {
                    depositModal.classList.remove("hidden");
                }
            });
        });
        document.querySelectorAll(".withdraw-btn").forEach(btn => {

            btn.addEventListener("click", () => {
                document.getElementById("withdraw-account-id").value = btn.dataset.id;
                withdrawModal.classList.remove("hidden");
            });
        });

        document.querySelectorAll(".transfer-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.getElementById("transfer-from-account-id").value = btn.dataset.id;
                transferModal.classList.remove("hidden");
            });
        });
    }

    newAccountForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const type = document.getElementById("account-type").value;
        const deposit = parseFloat(document.getElementById("initial-deposit").value) || 0;

        const openaccount = {
            AccountType: type,
            InitialDeposit: deposit
        };
        try {
            const response = await fetch(`http://localhost:5066/Account/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(openaccount)
            });
            if (response.ok) {
                const msg = await response.json();
                accountModal.classList.add("hidden");
                alert(msg.message);
                fetchMyAccounts();
            }
            else {
                const errormsg = await response.json();
                alert(errormsg.message);
            }
        } catch (error) {
            console.error(error);
        }
    });


    depositForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const id = parseInt(document.getElementById("deposit-account-id").value);
        const amount = parseFloat(document.getElementById("deposit-amount").value);
        const depositData = {
            AccountId: id,
            Amount: amount
        }
        try {
            const response = await fetch(`http://localhost:5066/Account/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(depositData)
            });
            if (response.ok) {
                const msg = await response.json();
                depositModal.classList.add("hidden");
                alert(msg.message);
                fetchMyAccounts();
                fetchTransactions();
            }
        } catch (error) {
            console.error(error);
        }
    });

    withdrawForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const id = parseInt(document.getElementById("withdraw-account-id").value);
        const amount = parseFloat(document.getElementById("withdraw-amount").value);
        const withdrawData = {
            AccountId: id,
            Amount: amount
        }
        try {
            const response = await fetch(`http://localhost:5066/Account/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(withdrawData)
            });
            if (response.ok) {
                const msg = await response.json();
                withdrawModal.classList.add("hidden");
                alert(msg.message);
                fetchMyAccounts();
                fetchTransactions();
            }
            else {
                const errormsg = await response.json();
                alert(errormsg.message);
                fetchMyAccounts();
            }
        } catch (error) {
            console.error(error);
        }
    });


    transferForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const sourceId = parseInt(document.getElementById("transfer-from-account-id").value);
        const targetNum = parseInt(document.getElementById("transfer-to-account").value);
        const amount = parseFloat(document.getElementById("transfer-amount").value);

        const transferData = {
            SourceAccountId: sourceId,
            TargetAccountNumber: targetNum,
            Amount: amount
        }

        try {
            const response = await fetch(`http://localhost:5066/Account/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(transferData)
            });
            if (response.ok) {
                const msg = await response.json();
                alert(msg.message);
                transferModal.classList.add("hidden");
                fetchMyAccounts();
                fetchTransactions();
            }
            else {
                const errormsg = await response.json();
                alert(errormsg.message);
                fetchMyAccounts();
            }
        } catch (error) {
            console.error(error);
        }
        updateDashboard();
    });


    async function fetchTransactions() {
        try {
            const response = await fetch(`http://localhost:5066/Account/transactions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                }
            })
            if (response.ok) {
                const transactions = await response.json()
                renderTransactions(transactions);
            }
        } catch (error) {

        }
    }

    function formatDescription(rawString) {
        if (!rawString) return "System Transaction";

        // Replace underscores with spaces
        let cleanString = rawString.replace(/_/g, ' ');

        // Capitalize first letter of each word (Title Case)
        return cleanString.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function renderTransactions(transactions) {

        const tbody = document.getElementById("transactions-body");
        tbody.innerHTML = "";
        if (!transactions || transactions.length === 0) {

            tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-transactions">
                    No Transactions Yet
                </td>
            </tr>
        `;
            return;
        }

        transactions.forEach(txn => {
            const row = document.createElement("tr");
            const type = txn.transactionType ? txn.transactionType.toLowerCase() : "transfer";

            // Grab the merchant name safely
            const merchant = txn.merchantName ? txn.merchantName.toUpperCase() : "";
            const displayDescription = formatDescription(txn.merchantName)

            let symbol = "";
            let amountColorClass = ""; // New variable to hold our CSS color class

            // The Logic Engine for Colors and Symbols
            if (type === "deposit") {
                symbol = "+";
                amountColorClass = "amount-in";
            }
            else if (type === "withdrawal") {
                symbol = "-";
                amountColorClass = "amount-out";
            }
            else if (type === "transfer") {
                // Read the custom string from your C# Backend!
                if (merchant.includes("TRANSFER_OUT")) {
                    symbol = "-";
                    amountColorClass = "amount-out"; // Red
                }
                else if (merchant.includes("TRANSFER_IN")) {
                    symbol = "+";
                    amountColorClass = "amount-transfer-in"; // Blue
                }
                else {
                    symbol = "→";
                    amountColorClass = "amount-transfer-in"; // Default Blue
                }
            }

            const date = txn.transactionDate ? new Date(txn.transactionDate).toLocaleDateString() : "-";
            const rawStatus = txn.status ?? "Completed";
            let statusClass = "";

            switch (rawStatus.toLowerCase()) {
                case "completed": statusClass = "success"; break;
                case "pending": statusClass = "pending"; break;
                case "failed": statusClass = "failed"; break;
                default: statusClass = "success";
            }

            row.innerHTML = `
        <td>${date}</td>
        <td>${txn.accountId ?? "-"}</td>
        <td class="txn-${type}">${txn.transactionType ?? "-"}</td>
        <td>${displayDescription}</td> <td class="${amountColorClass}">${symbol} ₹${Number(txn.amount).toFixed(2)}</td>
        <td><span class="status-${statusClass}">${rawStatus}</span></td>
    `;

            tbody.appendChild(row);
        });
    }
    document.getElementById('ai-send-btn').addEventListener('click', async function () {
        const inputField = document.getElementById('ai-chat-input');
        const chatHistory = document.getElementById('ai-chat-history');
        const userMessage = inputField.value.trim();

        if (!userMessage) return;

        chatHistory.innerHTML += `
        <div style="align-self: flex-end; background: #3b82f6; color: white; padding: 10px 15px; border-radius: 8px; max-width: 80%;">
            <strong>You:</strong> ${userMessage}
        </div>
    `;

        inputField.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Show a loading state
        const loadingId = "loading-" + Date.now();
        chatHistory.innerHTML += `<div id="${loadingId}" style="color: #9ca3af;"><em>AI is analyzing your ledger...</em></div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            // 2. Fetch the C# AI Endpoint
            // Make sure the port matches your Bank API!
            const response = await fetch('http://localhost:5066/AiChat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ UserMessage: userMessage })
            });

            // Remove loading text
            document.getElementById(loadingId).remove();

            if (response.ok) {
                const data = await response.json();

                const formattedReply = marked.parse(data.reply);

                chatHistory.innerHTML += `
    <div style="align-self: flex-start; background: #374151; color: #e5e7eb; padding: 15px; border-radius: 8px; max-width: 85%; font-size: 0.95rem; line-height: 1.5;">
        <strong style="display: block; margin-bottom: 10px; color: #60a5fa;"><i class="fa-solid fa-robot"></i> NexusAI:</strong> 
        <div class="ai-formatted-content">
            ${formattedReply}
        </div>
    </div>
`;
            } else {
                chatHistory.innerHTML += `<div style="color: #ef4444;"><em>Error: Could not reach the AI servers.</em></div>`;
            }
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            chatHistory.innerHTML += `<div style="color: #ef4444;"><em>Network Error.</em></div>`;
        }

        // Scroll to bottom again
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });

    function calculateWealth() {
        let total = 0;
        accounts.forEach(a => {
            if (a.status === "Active") {
                total += a.balance;
            }
        });
        totalWealth.innerText = "₹" + total.toFixed(2);
    }

    openAccountBtn?.addEventListener("click", () => {
        accountModal.classList.remove("hidden");
    });

    fabOpenBtn.addEventListener("click", () => {
        accountModal.classList.remove("hidden");
    });
    withdrawClose?.addEventListener("click", () => {
        withdrawModal.classList.add("hidden");
    });

    modalClose?.addEventListener("click", () => {
        accountModal.classList.add("hidden");
    });

    depositClose?.addEventListener("click", () => {
        depositModal.classList.add("hidden");
    });

    transferClose?.addEventListener("click", () => {
        transferModal.classList.add("hidden");
    });


    function hideAllViews() {
        viewAccounts.classList.add("hidden");
        viewTransactions.classList.add("hidden");
        viewAiAdvisor.classList.add("hidden");

        navAccounts.classList.remove("active");
        navTransactions.classList.remove("active");
        navAiAdvisor.classList.remove("active");
    }

    navAccounts.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewAccounts.classList.remove("hidden");
        navAccounts.classList.add("active");
    });

    navTransactions.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewTransactions.classList.remove("hidden");
        navTransactions.classList.add("active");
    });

    navAiAdvisor.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewAiAdvisor.classList.remove("hidden");
        navAiAdvisor.classList.add("active");
    });
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("nexus_token");

        localStorage.clear();

        window.location.href = "login.html";
    });

    viewAccounts.classList.remove("hidden");
    viewTransactions.classList.add("hidden");

    updateDashboard();
    fetchMyAccounts();
    fetchTransactions();
});