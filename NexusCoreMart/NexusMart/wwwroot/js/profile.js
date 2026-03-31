document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('nexusmart_token');

    if (token == null || token == undefined) {
        window.location.href = 'login.html';
        return;
    }

    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(section => section.classList.add('hidden'));

            item.classList.add('active');
            document.getElementById(item.dataset.target).classList.remove('hidden');
        });
    });

    const modal = document.getElementById('bank-modal');
    const openBtn = document.getElementById('open-link-modal-secondary');
    const closeBtn = document.getElementById('close-modal');
    const linkForm = document.getElementById('link-bank-form');
    const unlinkedView = document.getElementById('unlinked-bank-view');
    const linkedView = document.getElementById('linked-bank-view');
    const cardsContainer = document.getElementById('linked-banks-container');

    try {
        const response = await fetch('http://localhost:5168/Users/me', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (response.ok) {
            const data = await response.json();

            document.getElementById('sidebar-user-name').innerText = data.name;
            document.getElementById('overview-greeting').innerText = `Welcome back, ${data.name.split(' ')[0]}!`;
            document.getElementById('settings-name').value = data.name;
            document.getElementById('settings-email').value = data.email;
        }
    } catch (error) {
        console.error(error);
    }

    async function fetchBankStatus() {
        try {
            const response = await fetch('http://localhost:5168/Bank/Get-Bank', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                const bankList = await response.json();

                if (Array.isArray(bankList) && bankList.length > 0) {
                    unlinkedView.classList.add('hidden');
                    linkedView.classList.remove('hidden');
                    cardsContainer.innerHTML = '';

                    bankList.forEach(bank => {
                        const accStr = String(bank.accountNumber);
                        const lastFour = accStr.slice(-4);

                        const cardHTML = `
                                    <div class="bank-card">
                                        <div class="bank-info-wrapper">
                                            <div class="bank-icon"><i class="fa-solid fa-building-columns"></i></div>
                                                <div class="bank-details">
                                                    <p class="bank-name">${bank.fullName}</p>
                                                    <p class="bank-acc">****${lastFour}</p>
                                                </div>
                                            </div>
                                            <button class="btn-danger disconnect-btn" data-account="${bank.accountNumber}">
                                                Disconnect
                                            </button>
                                        </div>
                                    `;
                        cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
                    });
                } else {
                    showUnlinked();
                }
            } else {
                showUnlinked();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showUnlinked();
        }
    }

    function showUnlinked() {
        linkedView.classList.add('hidden');
        unlinkedView.classList.remove('hidden');
    }

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        linkForm.reset();
    });

    linkForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const accNum = document.getElementById('bank-acc-num').value;
        const accName = document.getElementById('bank-acc-name').value;

        const payload = {
            AccountNumber: accNum,
            FullName: accName
        };

        showInfo("BankVerify-message", "Contacting to server...");

        try {
            const response = await fetch('http://localhost:5168/Bank/link-bank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('BankVerify-message', data.message);
                modal.classList.add('hidden');
                linkForm.reset();
                fetchBankStatus();
            } else {
                showError("BankVerify-message", data.message);
            }

        } catch (error) {
            console.error('Network Error:', error);
            showError("BankVerify-message", "Server connection failed.");
        }
    });

    cardsContainer.addEventListener('click', async (e) => {
        const disconnectBtn = e.target.closest(".disconnect-btn");
        if (disconnectBtn) {
            const accountToDisconnect = disconnectBtn.getAttribute('data-account');
            const isConfirmed = confirm(`Are you sure you want to disconnect the account ending in ****${accountToDisconnect.slice(-4)}?`);
            if (!isConfirmed) return;

            try {
                const response = await fetch(`http://localhost:5168/Bank/disconnect-bank?accountnumber=${accountToDisconnect}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    fetchBankStatus();
                } else {
                    alert('Failed ' + data.message);
                }
            } catch (error) {
                console.error('Network Error:', error);
                alert('Could not connect to the server to disconnect the account.');
            }
        }
    });

    async function fetchMyOrders() {
        const orderContainer = document.getElementById('order-list-container');

        try {
            const response = await fetch('http://localhost:5168/Order/my-orders', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                const orders = await response.json();

                const activeOrdersStat = document.getElementById('stat-active-orders');
                if (activeOrdersStat) {
                    activeOrdersStat.innerText = `${orders.length} Total`;
                }

                if (orders.length === 0) {
                    orderContainer.innerHTML = '<p style="color: var(--text-muted);">No orders found. Time to go shopping!</p>';
                    return;
                }

                orderContainer.innerHTML = '';

                orders.forEach(order => {
                    const date = new Date(order.orderDate).toLocaleDateString();

                    let statusColor = "var(--text-muted)";
                    if (order.status === "Delivered") statusColor = "#10b981"; // Green
                    if (order.status === "Pending" || order.status === "Processing") statusColor = "#6366f1"; // Indigo

                    const orderHTML = `
                        <div class="order-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; cursor: pointer;">
                            
                            <div class="order-header" onclick="toggleOrderDetails(${order.orderId})" style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="margin-bottom: 5px; color: var(--text-main);">Order #${order.orderId}</h4>
                                    <p style="font-size: 0.85rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${date}</p>
                                </div>
                                <div style="text-align: right;">
                                    <h3 style="color: var(--text-main); margin-bottom: 5px;">₹ ${order.totalAmount.toFixed(2)}</h3>
                                    <span style="font-size: 0.85rem; font-weight: bold; color: ${statusColor};">${order.status || 'Processing'} <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i></span>
                                </div>
                            </div>
                            
                            <div class="order-details-drawer" id="drawer-${order.orderId}"></div>
                        
                        </div>
                    `;
                    orderContainer.insertAdjacentHTML('beforeend', orderHTML);
                });
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
            orderContainer.innerHTML = '<p style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Could not connect to order database.</p>';
        }
    }
    window.toggleOrderDetails = async function (orderId) {
        const drawer = document.getElementById(`drawer-${orderId}`);
        const token = localStorage.getItem('nexusmart_token');

        if (drawer.style.display === 'block') {
            drawer.style.display = 'none';
            return;
        }

        drawer.style.display = 'block';
        drawer.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading receipt...</div>';

        try {
            const response = await fetch(`http://localhost:5168/Order/my-orders/orders/${orderId}/details`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (response.ok) {
                const items = await response.json();
                let html = '';

                items.forEach(item => {
                    const imageToUse = item.imageUrl || '/images/default-product.png';
                    html += `
                    <div class="receipt-item">
                        <img src="${imageToUse}" class="receipt-img" alt="${item.productName}">
                        <div class="receipt-info">
                            <div style="font-weight: 600; color: var(--text-main);">${item.productName}</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem;">Qty: ${item.quantity}  x  ₹${item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div style="font-weight: bold; color: var(--text-main);">₹${item.subtotal.toFixed(2)}</div>
                    </div>
                `;
                });

                drawer.innerHTML = html;
            } else {
                drawer.innerHTML = '<div style="color: #ff4757;">Failed to load order details.</div>';
            }
        } catch (error) {
            drawer.innerHTML = '<div style="color: #ff4757;">Server connection error.</div>';
        }
    };
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("nexusmart_token");
        alert("Logged out!");
        window.location.href = "index.html";
    });

    fetchBankStatus();
    fetchMyOrders();
}); 