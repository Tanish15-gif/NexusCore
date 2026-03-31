document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        title.innerText = "Create Identity";
        subtitle.innerText = "Set up your NexusMart account.";
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        title.innerText = "Welcome Back";
        subtitle.innerText = "Enter your details to access your account.";
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('reg-name').value;
        const emailInput = document.getElementById('reg-email').value;
        const passwordInput = document.getElementById('reg-password').value;

        const payload = {
            Name: nameInput,
            Email: emailInput,
            Password: passwordInput
        };

        showInfo("SignUp-message", "Contacting to Server");

        try {
            const response = await fetch('http://localhost:5168/Users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess("SignUp-message", data.message);
                document.getElementById('show-login').click();
            } else if (response.status === 409) {
                showError("SignUp-message", data.message);
            } else {
                showError("SignUp-message", data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError("SignUp-message", "Server Error");
        }
    });
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('login-email').value;
        const passwordInput = document.getElementById('login-password').value;

        const payload = {
            Email: emailInput,
            Password: passwordInput
        };
        showInfo("Login-message", "Contacting to Server");

        try {
            const response = await fetch('http://localhost:5168/Users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const token = data.token;
                localStorage.setItem('nexusmart_token', token);
                showSuccess("Login-message", data.message);
                const payloadObject = JSON.parse(atob(token.split('.')[1]));

                const userId =
                    payloadObject.UserId ||
                    payloadObject.userid ||
                    payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                localStorage.setItem("userid", userId);

                const role =
                    payloadObject.role ||
                    payloadObject.Role ||
                    payloadObject["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                setTimeout(() => {

                    if (role === "Admin") {
                        window.location.href = "admin.html";
                    }
                    else {
                        window.location.href = "profile.html";
                    }

                }, 1500);
            } else {
                showError("Login-message", data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError("Login-message", "Server Error");
        }
    });
    
});