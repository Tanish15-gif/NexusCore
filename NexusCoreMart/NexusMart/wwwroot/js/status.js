document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const status = urlParams.get('status');

    // 2. Inject the real Order ID
    const orderRefBox = document.getElementById('random-id');
    if (orderId && orderRefBox) {
        orderRefBox.innerText = orderId;
    }


    const iconContainer = document.getElementById('status-icon-container');
    const icon = document.getElementById('status-icon');
    const title = document.getElementById('status-title-text');
    const message = document.getElementById('status-message');

    if (status === 'failed') {
        iconContainer.className = 'icon-circle error-theme';
        icon.className = 'fa-solid fa-xmark';
        title.innerText = 'Payment Failed';
        message.innerText = 'NexusCore Bank declined the transaction. Please check your balance or linked account.';
        document.getElementById('order-ref-box').style.display = 'none';
    } else {
        iconContainer.className = 'icon-circle success-theme';
    }
});