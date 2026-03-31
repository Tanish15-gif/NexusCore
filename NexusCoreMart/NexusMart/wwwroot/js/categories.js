document.addEventListener('DOMContentLoaded', () => {
    const radioButtons = document.querySelectorAll('input[name="cat"]');
    const title = document.getElementById('results-title');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const categoryName = e.target.value;
            title.innerText = `Showing results for "${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}"`;
        });
    });
});