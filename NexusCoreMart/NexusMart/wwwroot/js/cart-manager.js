function addToCart(id, name, price, imageUrl, qty = 1) {
    let currentCart = JSON.parse(localStorage.getItem('nexusmart_cart')) || [];

    const existingItem = currentCart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        currentCart.push({ id, name, price, imageUrl, quantity: qty });
    }

    localStorage.setItem('nexusmart_cart', JSON.stringify(currentCart));
    
    updateCartBadge();

    alert(`Added ${qty} x ${name} to your cart!`);
}

function updateCartBadge() {
    const cartBadge = document.getElementById('cart-count');
    if (!cartBadge) return;

    let currentCart = JSON.parse(localStorage.getItem('nexusmart_cart')) || [];
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
        cartBadge.innerText = totalItems;
        cartBadge.style.display = 'inline-block';
    } else {
        cartBadge.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', updateCartBadge);