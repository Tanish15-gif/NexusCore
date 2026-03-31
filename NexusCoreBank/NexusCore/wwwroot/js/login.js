document.getElementById('login-form').addEventListener('submit', Login);

async function Login(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    const LoginData = {
        Email: email,
        Password: pass
    };

    showInfo('Contacting to Server...');
    loginbtn.disabled = true;


    try {
        const response = await fetch(`http://localhost:5066/Users/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(LoginData)

        });
        console.log(response);

        if (response.ok) {

            const successmsg = await response.json();

            const token = successmsg.token;
            localStorage.setItem('nexus_token', token);

            showSuccess(successmsg.message);
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

            console.log(role);

            setTimeout(() => {

                if (role === "Employee") {
                    window.location.href = "employee-dashboard.html";
                }
                else if (role === "SuperAdmin") {
                    window.location.href = "admin-dashboard.html";
                }
                else if (role === "Manager") {
                    window.location.href = "manager-dashboard.html";
                }
                else {
                    window.location.href = "customer-dashboard.html";
                }

            }, 1500);

        }
        else {
            const errormessage = await response.json();
            showError(errormessage.message);
        }

    } catch (error) {

        showError('Server Error');
        console.error(error);

    } finally {
        loginbtn.disabled = false;
    }
}