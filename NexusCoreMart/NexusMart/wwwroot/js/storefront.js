document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('customer-product-grid');
    const sortSelect = document.getElementById('sort-select');
    const BACKEND_URL = 'http://localhost:5168';

    let allProducts = [];
    let currentProducts = [];
    LoadStorefrontProducts();

    function sortProducts(products) {
        const sortBy = sortSelect.value;

        return products.slice().sort((a, b) => {
            const nameA = String(a.ProductName || a.productName || '').trim().toLowerCase();
            const nameB = String(b.ProductName || b.productName || '').trim().toLowerCase();
            
            const priceA = parseFloat(a.Price || a.price) || 0;
            const priceB = parseFloat(b.Price || b.price) || 0;

            switch (sortBy) {
                case 'name-asc': return nameA.localeCompare(nameB);
                case 'name-desc': return nameB.localeCompare(nameA);
                case 'price-asc': return priceA - priceB;
                case 'price-desc': return priceB - priceA;
                default: return 0;
            }
        });
    }

    function renderProducts(products) {
        const sortedProducts = sortProducts(products);

        if (sortedProducts.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--text-muted);">
                    <h2><i class="fa-solid fa-box-open"></i></h2>
                    <p>No products found for this category.</p>
                </div>
            `;
            return;
        }

        let gridHtml = '';

        sortedProducts.forEach(product => {
            const dbImage = product.ImageUrl || product.imageUrl;
            let finalImageUrl = '/images/default-product.png';

            if (dbImage && String(dbImage).trim() !== "") {
                finalImageUrl = BACKEND_URL + (dbImage.startsWith('/') ? dbImage : '/' + dbImage);
            }

            const stockQuantity = parseInt(product.StockQuantity || product.stockQuantity) || 0;
            const isOutOfStock = stockQuantity <= 0;
            const buttonClass = isOutOfStock ? 'add-to-cart-btn out-of-stock' : 'add-to-cart-btn';
            const buttonText = isOutOfStock ? '<i class="fa-solid fa-ban"></i> Out of Stock' : '<i class="fa-solid fa-plus"></i> Add to Cart';
            const buttonDisabled = isOutOfStock ? 'disabled' : '';

            const safeName = String(product.ProductName || product.productName || 'Unknown Product').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const safePrice = parseFloat(product.Price || product.price || 0).toFixed(2);
            const safeCategory = String(product.Category || product.category || 'General').trim();
            const productId = product.Productid || product.productid;
            gridHtml += `
            <div class="product-card">
                <a href="product-detail.html?id=${productId}" style="text-decoration:none; color:inherit; display:block; flex-grow:1;">
                    <div class="product-image-container">
                        <img src="${finalImageUrl}" alt="${safeName}" class="product-image">
                    </div>
                    <div class="product-info">
                        <p class="product-category">${safeCategory}</p>
                        <h3 class="product-title">${safeName}</h3>
                        <div class="product-rating">
                            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>
                        </div>
                        <h2 class="product-price">₹ ${safePrice}</h2>
                    </div>
                </a> 
                <div style="padding: 0 1.5rem 1.5rem 1.5rem;">
                    <button class="${buttonClass}" ${buttonDisabled} 
                        onclick="event.stopPropagation(); addToCart(${productId}, '${safeName}', ${safePrice}, '${finalImageUrl}')">
                        ${buttonText}
                    </button>
                </div>
            </div>`;
        });

        productGrid.innerHTML = gridHtml;
    }

    async function LoadStorefrontProducts() {
        try {
            const response = await fetch(`${BACKEND_URL}/Product/all`);
            if (!response.ok) throw new Error("Failed to load store inventory.");

            const products = await response.json();
            allProducts = products;
            currentProducts = products;
            
            const activeBtn = document.querySelector('.category-pill.active');
            if(activeBtn && activeBtn.innerText.trim() !== "All") {
                 const filterKeyword = String(activeBtn.dataset.category).trim().toLowerCase();
                 currentProducts = allProducts.filter(product => {
                     const productCategory = String(product.Category || product.category || '').trim().toLowerCase();
                     return productCategory === filterKeyword;
                 });
            }

            renderProducts(currentProducts);

        } catch (error) {
            console.error("Storefront Error:", error);
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--danger-red); padding: 50px;">
                    <p><i class="fa-solid fa-triangle-exclamation"></i> Could not connect to the NexusMart servers.</p>
                </div>
            `;
        }
    }
    const categoryButtons = document.querySelectorAll('.category-pill');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const categoryText = button.innerText.trim();

            if (categoryText === "All") {
                currentProducts = allProducts;
            } else {
                const filterKeyword = String(button.dataset.category).trim().toLowerCase();

                currentProducts = allProducts.filter(product => {
                    const productCategory = String(product.Category || product.category || '').trim().toLowerCase();
                    
                    return productCategory === filterKeyword;
                });
            }

            renderProducts(currentProducts);
        });
    });

    sortSelect.addEventListener('change', () => {
        renderProducts(currentProducts);
    });
});