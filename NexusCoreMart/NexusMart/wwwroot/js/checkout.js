document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('checkout-cart-container');
    const subtotalEl = document.getElementById('subtotal');
    const taxesEl = document.getElementById('taxes');
    const grandTotalEl = document.getElementById('grand-total');

    renderCheckoutCart();

    const token = localStorage.getItem('nexusmart_token');
    const bankDropdown = document.getElementById('payment-bank');
    const payBtn = document.getElementById('btn-process-payment');

    const paymentSection = document.querySelector('.payment-section-container');

    if (!token) {
        if (paymentSection) {
            paymentSection.innerHTML = `
        <br><div style="text-align:center; padding: 40px 30px; background: var(--bg-main, #1a1a24); border: 1px solid rgba(255, 71, 87, 0.3); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
        
        <div style="width: 70px; height: 70px; background: rgba(255, 71, 87, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 1px solid rgba(255, 71, 87, 0.2);">
            <i class="fa-solid fa-lock fa-2x" style="color: #ff4757;"></i>
        </div>
        
        <h3 style="color: var(--text-main); margin-bottom: 10px; font-size: 1.5rem; letter-spacing: 0.5px;">Authentication Required</h3>
        
        <p style="color: var(--text-muted, #9ca3af); margin-bottom: 30px; font-size: 1rem; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
            You must be signed in to access NexusCore Bank and securely complete your transaction.
        </p>
        
        <a href="login.html" style="display: inline-block; background-color: #ff4757; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3); transition: transform 0.2s ease;">
            Log In or Register
        </a>
        
        </div>
        `;
        }
    } else {
        loadPaymentOptions();
    }

    async function loadPaymentOptions() {
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5168/Bank/Get-Bank', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (response.ok) {
                const banks = await response.json();
                bankDropdown.innerHTML = '';

                if (banks.length === 0) {
                    bankDropdown.innerHTML = '<option value="">No banks linked. Please visit dashboard.</option>';
                    payBtn.disabled = true;
                    payBtn.style.opacity = '0.5';
                    return;
                }

                banks.forEach(bank => {
                    const option = document.createElement('option');
                    option.value = bank.linkId;
                    option.innerText = `${bank.fullName} (****${String(bank.accountNumber).slice(-4)})`;
                    bankDropdown.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Failed to load banks:", error);
            bankDropdown.innerHTML = '<option value="">Error loading payment methods</option>';
        }
    }


    loadPaymentOptions();

    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            if (!token) {
                alert("Please log in to complete purchase.");
                window.location.href = 'login.html';
                return;
            }

            const selectedBank = bankDropdown.value;
            if (!selectedBank) {
                alert("Please select a valid payment method.");
                return;
            }

            let cart = JSON.parse(localStorage.getItem('nexusmart_cart')) || [];
            if (cart.length === 0) return;

            payBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            payBtn.disabled = true;

            const orderPayload = {
                linkId: parseInt(selectedBank),
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            try {
                const response = await fetch('http://localhost:5168/Order/place-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(orderPayload)
                });

                if (response.ok) {
                    const data = await response.json();

                    localStorage.removeItem('nexusmart_cart');

                    window.location.href = `status.html?orderId=${data.orderid}&status=success`;
                } else {
                    const err = await response.json();
                    console.log("🚨 SERVER REJECTION:", err);
                    alert("Payment Failed: " + err.message);
                    payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Pay via NexusCore';
                    payBtn.disabled = false;
                }
            } catch (error) {
                alert("Server error. Try again.");
                payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Pay via NexusCore';
                payBtn.disabled = false;
            }
        });
    }

    function renderCheckoutCart() {
        let cart = JSON.parse(localStorage.getItem('nexusmart_cart')) || [];

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div style="text-align:center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-cart-shopping fa-3x" style="margin-bottom:15px; opacity:0.5;"></i>
                    <h3>Your cart is completely empty.</h3>
                    <a href="index.html" style="color: var(--primary-accent); text-decoration: none; display:block; margin-top:10px;">Return to Store</a>
                </div>
            `;
            updateMath(0);
            return;
        }

        cartContainer.innerHTML = '';
        let currentSubtotal = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            currentSubtotal += itemTotal;

            const imageToUse = item.imageUrl || '/images/default-product.png';

            cartContainer.innerHTML += `
                <div class="cart-item-row">
                    <img src="${imageToUse}" alt="${item.name}" class="cart-item-img">
                    
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">₹ ${item.price.toFixed(2)}  x  ${item.quantity}</div>
                    </div>
                    
                    <div class="cart-item-total">₹ ${itemTotal.toFixed(2)}</div>
                    
                    <button class="btn-remove" onclick="removeCheckoutItem(${index})" title="Remove Item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });

        updateMath(currentSubtotal);
    }

    function updateMath(subtotal) {
        const gstTaxRate = 0.18;
        const taxes = subtotal * gstTaxRate;
        const grandTotal = subtotal + taxes;

        subtotalEl.innerText = `₹ ${subtotal.toFixed(2)}`;
        taxesEl.innerText = `₹ ${taxes.toFixed(2)}`;
        grandTotalEl.innerText = `₹ ${grandTotal.toFixed(2)}`;
    }

    window.removeCheckoutItem = function (index) {
        let cart = JSON.parse(localStorage.getItem('nexusmart_cart')) || [];

        cart.splice(index, 1);

        localStorage.setItem('nexusmart_cart', JSON.stringify(cart));

        renderCheckoutCart();

        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    };
});