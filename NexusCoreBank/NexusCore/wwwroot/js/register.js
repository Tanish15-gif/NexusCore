document.getElementById('register-form').addEventListener('submit',RegisterForm);

async function RegisterForm(event){
    event.preventDefault();
    const name = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const DOB = document.getElementById('dob').value;
    const Phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('password').value;
    
    const registerData = {
        FullName : name ,
        Email : email,
        Password : password,
        PhoneNumber : Phone,
        Address : address,
        DateofBirth : DOB
    }
    showInfo('Sending to Server');
    Registerbtn.disabled =  true;
    try {
        const response = await fetch(`http://localhost:5066/Users/register`, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(registerData)
        });
        if(response.ok){
            const data = await response.json();
            showSuccess(data.message);

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
        else{
            const errorMessage = await response.json();
            showError(errorMessage.message);
        }
    } catch (error) {
        showError('Server Error');
        console.error(error);
    } finally{
        Registerbtn.disabled = false;
    }
}
