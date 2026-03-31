document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'http://localhost:5168';

    // 1. Extract the ID from the URL (e.g., product-detail.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html'; // Send them back if no ID found
        return;
    }

    let currentQty = 1;
    let productData = null; // To store the real data once fetched

    // 2. Fetch the real data from C#
    try {
        const response = await fetch(`${BACKEND_URL}/Product/${productId}`);
        if (!response.ok) throw new Error("Product not found");

        productData = await response.json();

        // 3. Inject real data into HTML
        document.getElementById('det-title').innerText = productData.productName;
        document.getElementById('det-price').innerText = `₹ ${productData.price.toFixed(2)}`;
        document.getElementById('det-desc').innerText = productData.description;

        const imgPath = productData.imageUrl || productData.ImageUrl;
        document.getElementById('det-img').src = imgPath ? (BACKEND_URL + imgPath) : '/images/default-product.png';

        // Stock handling
        const stockEl = document.getElementById('det-stock');
        if (productData.stockQuantity > 0) {
            stockEl.innerHTML = `<i class="fa-solid fa-check" style="color: var(--success-green);"></i> In Stock (${productData.stockQuantity} available)`;
            document.getElementById('add-multi-btn').disabled = false;
        } else {
            stockEl.innerHTML = `<i class="fa-solid fa-xmark" style="color: var(--danger-red);"></i> Out of Stock`;
        }

    } catch (error) {
        console.error(error);
        document.getElementById('det-title').innerText = "Product Not Found";
    }

    // 4. Quantity Logic
    const qtyDisplay = document.getElementById('qty-display');
    document.getElementById('qty-minus').addEventListener('click', () => {
        if (currentQty > 1) { currentQty--; qtyDisplay.innerText = currentQty; }
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
        // Optional: prevent going higher than actual stock
        if (currentQty < productData.stockQuantity) {
            currentQty++;
            qtyDisplay.innerText = currentQty;
        }
    });

    document.getElementById('add-multi-btn').addEventListener('click', () => {
        if (!productData) return;

        const imgPath = productData.imageUrl || productData.ImageUrl;
        const finalImg = imgPath ? (BACKEND_URL + imgPath) : '/images/default-product.png';

        addToCart(
            productData.productid,
            productData.productName,
            productData.price,
            finalImg,
            currentQty 
        );
    });
});