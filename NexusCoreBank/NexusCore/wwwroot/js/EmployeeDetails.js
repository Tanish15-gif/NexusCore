document.addEventListener("DOMContentLoaded",async function () {
    const token = localStorage.getItem('nexus_token');
    const userid = localStorage.getItem("userid");
    try {
        const response = await fetch(`http://localhost:5066/Employee/fetchdetails`,{
            method : 'GET',
            headers : {
                "Authorization" : "Bearer " + token
            }
        });
        if(response.ok)
        {
            const data = await response.json();
            document.getElementById('dashname').innerText = data.fullName;
        }else{
            console.log('Failed to fetch details');
        }
    } catch (error) {
        console.error(error);
    }
})