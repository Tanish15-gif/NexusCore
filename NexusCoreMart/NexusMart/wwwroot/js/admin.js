document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('nexusmart_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const modal = document.getElementById('add-modal');
    const form = document.getElementById('add-product-form');
    const msgBox = document.getElementById('admin-message');
    const submitBtn = document.getElementById('submit-btn');
    const tableBody = document.getElementById('product-table-body');

    document.getElementById('open-modal-btn').addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Updates the text for the Add Product file upload
    document.getElementById('prod-img').addEventListener('change', function (e) {
        const fileNameDisplay = document.getElementById('add-file-name-display');
        if (e.target.files.length > 0) {
            fileNameDisplay.innerText = e.target.files[0].name;
            fileNameDisplay.style.color = "#6366f1"; // Highlight blue
        } else {
            fileNameDisplay.innerText = "Select an image...";
            fileNameDisplay.style.color = "var(--file-upload-text)"; // Reset to slate
        }
    });
    // Updates the text for the EDIT Product file upload
    document.getElementById('edit-prod-img').addEventListener('change', function (e) {
        const fileNameDisplay = document.getElementById('edit-file-name-display');
        if (e.target.files.length > 0) {
            fileNameDisplay.innerText = e.target.files[0].name;
            fileNameDisplay.style.color = "#6366f1"; // Highlight blue
        } else {
            fileNameDisplay.innerText = "Select a new image...";
            fileNameDisplay.style.color = "var(--file-upload-text)"; // Reset to slate
        }
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
        msgBox.innerText = '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        msgBox.innerText = "Uploading Image...";
        msgBox.style.color = "white";

        try {
            const file = document.getElementById('prod-img').files[0];
            const formdata = new FormData();
            formdata.append('file', file);

            const imageRes = await fetch('http://localhost:5168/Product/upload-image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formdata
            });

            if (!imageRes.ok) throw new Error("Image upload failed");

            const imageData = await imageRes.json();
            const serverImageUrl = imageData.url || imageData.imageUrl;
            if (!serverImageUrl) throw new Error("Server did not return image URL");

            msgBox.innerText = "Saving Product...";

            const productPayload = {
                ProductName: document.getElementById('prod-name').value,
                Category: document.getElementById('prod-cat').value,
                Price: parseFloat(document.getElementById('prod-price').value),
                StockQuantity: parseInt(document.getElementById('prod-stock').value),
                Description: document.getElementById('prod-desc').value,
                ImageUrl: serverImageUrl
            };

            const productRes = await fetch('http://localhost:5168/Product/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productPayload)
            });

            const productData = await productRes.json();

            if (productRes.ok) {
                msgBox.innerText = productData.message;
                msgBox.style.color = "#10b981";
                setTimeout(() => {
                    modal.style.display = 'none';
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Save to DB';
                    msgBox.innerText = '';
                    LoadInventory();
                }, 1500);
            } else {
                msgBox.innerText = productData.message;
                msgBox.style.color = "#ff4d4d";
                submitBtn.disabled = false;
            }

        } catch (error) {
            console.error(error);
            msgBox.innerText = error.message;
            msgBox.style.color = "#ff4d4d";
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save to DB';
        }
    });

    async function LoadInventory() {
        try {
            const response = await fetch('http://localhost:5168/Product/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error("Server rejected the inventory request.");
                return;
            }

            const showProducts = await response.json();
            tableBody.innerHTML = '';

            if (showProducts.length === 0) {
                tableBody.innerHTML =
                    "<tr><td colspan='6' style='text-align:center;color:var(--text-muted);padding:20px;'>No Products found.</td></tr>";
                return;
            }

            showProducts.forEach(product => {
                const stockStyle = product.stockQuantity > 5
                    ? 'color: var(--success-green); font-weight: bold;'
                    : 'color: #ff4d4d; font-weight: bold;';

                tableBody.innerHTML += `
                    <tr>
                        <td>${product.productid}</td>
                        <td style="font-weight:bold;">${product.productName}</td>
                        <td>${product.category}</td>
                        <td>₹ ${product.price.toFixed(2)}</td>
                        <td style="${stockStyle}">${product.stockQuantity}</td>
                        <td>
                            <button class="btn-pill-primary edit-btn" 
                                data-id="${product.productid}"
                                style="padding:5px 15px;background:#3b82f6;border:none;color:white;border-radius:4px;cursor:pointer;">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                        </td>
                    </tr>
                `;
            });

        } catch (error) {
            console.error("Network Error:", error);
        }
    }

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-product-form');
    let currentImageUrl = "";

    tableBody.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (!editBtn) return;

        const productId = editBtn.getAttribute('data-id');
        document.getElementById('edit-prod-id').value = productId;

        const originalHtml = editBtn.innerHTML;
        editBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        editBtn.disabled = true;

        try {
            const response = await fetch(`http://localhost:5168/Product/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Could not fetch product details.");
            const product = await response.json();

            document.getElementById('edit-prod-name').value = product.productName;
            document.getElementById('edit-prod-cat').value = product.category;
            document.getElementById('edit-prod-price').value = product.price;
            document.getElementById('edit-prod-stock').value = product.stockQuantity;
            document.getElementById('edit-prod-desc').value = product.description;

            currentImageUrl = product.imageUrl || product.ImageUrl;

            editModal.style.display = 'flex';

        } catch (error) {
            console.error(error);
            alert("Error loading product: " + error.message);
        } finally {
            editBtn.innerHTML = originalHtml;
            editBtn.disabled = false;
        }
    });

    document.getElementById('close-edit-modal-btn').addEventListener('click', () => {
        editModal.style.display = 'none';
        editForm.reset();
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('save-edit-btn');
        const msgBox = document.getElementById('edit-admin-message');

        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving Changes...';

        try {
            let finalImageUrl = currentImageUrl;

            const imageInput = document.getElementById('edit-prod-img');
            if (imageInput.files.length > 0) {
                msgBox.innerText = "Uploading new image...";

                const file = imageInput.files[0];
                const formData = new FormData();
                formData.append('file', file);

                const imageRes = await fetch('http://localhost:5168/Product/upload-image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!imageRes.ok) throw new Error('New image upload failed');

                const imageData = await imageRes.json();
                finalImageUrl = imageData.url || imageData.imageUrl;
            }

            msgBox.innerText = "Updating database...";

            const updatePayload = {
                ProductId: parseInt(document.getElementById('edit-prod-id').value),
                ProductName: document.getElementById('edit-prod-name').value,
                Category: document.getElementById('edit-prod-cat').value,
                Price: parseFloat(document.getElementById('edit-prod-price').value),
                StockQuantity: parseInt(document.getElementById('edit-prod-stock').value),
                Description: document.getElementById('edit-prod-desc').value,
                ImageUrl: finalImageUrl
            };

            const updateRes = await fetch('http://localhost:5168/Product/update-product', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload)
            });

            const updateData = await updateRes.json();

            if (!updateRes.ok) throw new Error(updateData.message || "Update failed");

            submitBtn.innerText = 'Updated!';
            submitBtn.style.background = '#10b981';

            setTimeout(() => {
                editModal.style.display = 'none';
                editForm.reset();
                msgBox.innerText = '';
                submitBtn.disabled = false;
                submitBtn.innerText = 'Save Changes';
                submitBtn.style.background = '';
                LoadInventory();
            }, 1000);

        } catch (error) {
            console.error(error);
            msgBox.innerText = error.message;
            msgBox.style.color = '#ff4d4d';
            submitBtn.disabled = false;
            submitBtn.innerText = 'Save Changes';
        }
    });
    document.getElementById('delete-product-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const productId = parseInt(document.getElementById('edit-prod-id').value);

        DeleteProduct(productId);
    });
    async function DeleteProduct(productid) {
        if (!confirm(`Are you sure you want to delete id:${productid} Product`)) {
            return;
        }
        if (!productid || isNaN(productid)) {
            alert("ID not Found");
            return;
        }
        try {
            const response = await fetch(`http://localhost:5168/Product/remove/${productid}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const data = await response.json();
            if (response.ok) {
                editModal.style.display = 'none';
                editForm.reset();
                alert(data.message);
                LoadInventory();
            }
            else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    }

    LoadInventory();
});