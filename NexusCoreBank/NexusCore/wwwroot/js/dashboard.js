document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('nexus_token');

    if (token == null || token == undefined || token === "") {
        window.location.href = 'login.html';
        return;
    }

    const headerName = document.getElementById("dashname-header");
    const aiName = document.getElementById("dashname-ai");

    const kycModal = document.getElementById("kyc-modal");
    const kycForm = document.getElementById("kyc-form");
    const kycFullNameInput = document.getElementById("kyc-fullname");
    const BaseUrl = window.location.origin;

    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {
            themeIcon.className = "fa-solid fa-sun";
            if (themeText) themeText.innerText = "Light";
        } else {
            themeIcon.className = "fa-solid fa-moon";
            if (themeText) themeText.innerText = "Dark";
        }
    });
    function updateUserProfileUI(fullName, email = "No email provided", phoneNumber = "No phone provided", pictureUrl = null) {
        const headerName = document.getElementById("dashname-header");
        const aiName = document.getElementById("dashname-ai");
        const dropdownName = document.getElementById("dropdown-name");
        const dropdownEmail = document.querySelector(".dropdown-user-email");

        if (headerName) headerName.innerText = fullName;
        if (aiName) aiName.innerText = fullName;
        if (dropdownName) dropdownName.innerText = fullName;
        if (dropdownEmail) dropdownEmail.innerText = email;

        // 2. Manage Account Modal
        const manageName = document.getElementById("manage-name");
        const manageEmail = document.getElementById("manage-email");
        const managePhone = document.getElementById("manage-phone");
        const manageGoogle = document.getElementById("manage-google-email");


        if (manageName) manageName.innerText = fullName;
        if (manageEmail) manageEmail.innerText = email;
        if (managePhone) managePhone.innerText = phoneNumber; // Fixed the variable name!
        if (manageGoogle) manageGoogle.innerText = email;

        // 3. Dynamic Avatars
        const encodedName = encodeURIComponent(fullName);
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodedName}&background=3b82f6&color=fff&bold=true`;

        const finalAvatarUrl = (pictureUrl && pictureUrl !== "null" && pictureUrl.trim() !== "")
            ? pictureUrl
            : fallbackAvatar;


        const headerAvatar = document.getElementById("header-avatar");
        const dropdownAvatar = document.getElementById("dropdown-avatar");
        const manageAvatar = document.getElementById("manage-avatar");

        if (headerAvatar) headerAvatar.src = finalAvatarUrl;
        if (dropdownAvatar) dropdownAvatar.src = finalAvatarUrl;
        if (manageAvatar) manageAvatar.src = finalAvatarUrl;
    }

    async function verifyKycStatus() {
        try {
            const response = await fetch(`${BaseUrl}/Users/check-kyc`, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.needsProfile && kycModal) {
                    kycModal.classList.remove("hidden");

                    const savedGoogleName = localStorage.getItem('nexus_google_name');
                    if (savedGoogleName) {
                        kycFullNameInput.value = decodeURIComponent(savedGoogleName).replace(/%20/g, ' ');
                    }
                }
            }
        } catch (error) {
            console.error("KYC Check failed to connect to server.", error);
        }
    }
    verifyKycStatus();

    kycForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const profileData = {
            FullName: document.getElementById("kyc-fullname").value,
            DateOfBirth: document.getElementById("kyc-dob").value,
            PhoneNumber: document.getElementById("kyc-phone").value,
            Address: document.getElementById("kyc-address").value
        };

        try {
            const response = await fetch(`${BaseUrl}/Users/complete-profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                alert("Profile Completed! Welcome to NexusCore.");
                kycModal.classList.add("hidden");
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            console.error(error);
            alert("Network error while submitting KYC.");
        }
    });

    const nameSpan = document.getElementById('manage-legal-name');
    const dobSpan = document.getElementById('manage-dob');
    const addressSpan = document.getElementById('manage-address');

    const personalInfoView = document.getElementById('settings-view-personal');
    const editButtons = personalInfoView.querySelectorAll('.settings-edit-btn, .settings-add-btn');

    editButtons.forEach(btn => {
        btn.addEventListener('click', enterEditMode);
    });

    function enterEditMode() {
        // 0. Prevent double-clicks from spawning multiple save buttons
        if (document.getElementById('save-personal-container')) return;

        // 1. Grab current values
        const currentName = nameSpan.innerText === "Not provided" ? "" : nameSpan.innerText;
        const currentDob = dobSpan.innerText === "--/--/----" ? "" : dobSpan.innerText;
        const currentAddress = addressSpan.innerText === "No address provided" ? "" : addressSpan.innerText;

        // 2. SAFELY HIDE the original spans and buttons (Do not destroy them!)
        nameSpan.style.display = 'none';
        dobSpan.style.display = 'none';
        addressSpan.style.display = 'none';
        editButtons.forEach(b => b.style.display = 'none');

        nameSpan.parentElement.insertAdjacentHTML('afterbegin', `<input type="text" id="edit-legal-name" class="temp-edit-input" value="${currentName}" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-light); width: 100%;">`);

        dobSpan.parentElement.insertAdjacentHTML('afterbegin', `<input type="date" id="edit-dob" class="temp-edit-input" value="${currentDob}" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-light); width: 100%;">`);

        addressSpan.parentElement.insertAdjacentHTML('afterbegin', `<textarea id="edit-address" class="temp-edit-input" placeholder="Enter the Updated Address" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.875rem; outline: none; transition: all 0.2s; box-sizing: border-box; background: var(--bg-main); color: var(--text-light); resize: vertical; min-height: 80px;">${currentAddress}</textarea>`);

        const saveContainer = document.createElement('div');
        saveContainer.id = "save-personal-container";
        saveContainer.style.cssText = "margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;";

        saveContainer.innerHTML = `
        <button id="cancel-personal-btn" style="padding: 8px 15px; background: transparent; border: 1px solid var(--border-color); color: var(--text-light); border-radius: 6px; cursor: pointer;">Cancel</button>
        <button id="save-personal-btn" style="padding: 8px 15px; background: #3b82f6; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 500;">Save Changes</button>
    `;

        personalInfoView.appendChild(saveContainer);

        // 5. THE FIX: Real Cancel Logic
        document.getElementById('cancel-personal-btn').addEventListener('click', () => {
            // A. Delete all the temporary input boxes
            document.querySelectorAll('.temp-edit-input').forEach(input => input.remove());

            // B. Delete the save/cancel buttons
            saveContainer.remove();

            // C. Bring back the original text and pen icons!
            nameSpan.style.display = '';
            dobSpan.style.display = '';
            addressSpan.style.display = '';
            editButtons.forEach(b => b.style.display = '');
        });

        // 6. Wire up the Save Button to your C# Bulk Endpoint
        document.getElementById('save-personal-btn').addEventListener('click', async () => {
            const newName = document.getElementById('edit-legal-name').value;
            const newDob = document.getElementById('edit-dob').value;
            const newAddress = document.getElementById('edit-address').value;

            const token = localStorage.getItem('nexus_token');
            const saveBtn = document.getElementById('save-personal-btn');
            saveBtn.innerText = "Saving...";
            saveBtn.disabled = true;

            try {
                const response = await fetch(`${BaseUrl}/Users/update-legal-info`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        LegalName: newName,
                        DOB: newDob,
                        Address: newAddress
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Profile successfully updated!");
                    window.location.reload();
                } else {
                    alert("Update failed: " + data.message);
                    saveBtn.innerText = "Save Changes";
                    saveBtn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert("Network error.");
                saveBtn.innerText = "Save Changes";
                saveBtn.disabled = false;
            }
        });
    }

    async function fetchUserProfile() {
        try {
            const response = await fetch(`${BaseUrl}/Users/profile`, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (response.ok) {
                const data = await response.json();
                const savedGooglePicture = localStorage.getItem('nexus_google_picture');
                const cleanPictureUrl = savedGooglePicture ? decodeURIComponent(savedGooglePicture) : null;
                updateUserProfileUI(data.fullName, data.email, data.phoneNumber, cleanPictureUrl);

                document.getElementById('manage-legal-name').innerText = data.fullName || "Not provided";
                document.getElementById('manage-dob').innerText = data.dateofBirth || "--/--/----";
                document.getElementById('manage-address').innerText = data.address || "No address provided";
            }
        } catch (err) {
            console.error(err);

            const savedGoogleName = localStorage.getItem('nexus_google_name');
            if (savedGoogleName) {
                updateUserProfileUI(decodeURIComponent(savedGoogleName));
            }
        }
    }

    const fullscreenBtn = document.getElementById('fullscreen-toggle');
    const fullscreenIcon = document.getElementById('fullscreen-icon');

    fullscreenBtn?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            // Swap the icon to "compress"
            if (fullscreenIcon) fullscreenIcon.classList.replace('fa-expand', 'fa-compress');
        } else {
            document.exitFullscreen();
            // Swap the icon back to "expand"
            if (fullscreenIcon) fullscreenIcon.classList.replace('fa-compress', 'fa-expand');
        }
    });

    const mobileSidebar = document.querySelector('.sidebar');
    const activeLink = document.querySelector('.nav-link.active');

    if (window.innerWidth <= 768 && mobileSidebar && activeLink) {
        const sidebarWidth = mobileSidebar.offsetWidth;
        const activeLinkRect = activeLink.getBoundingClientRect();
        const activeLinkCenter = activeLinkRect.left + (activeLinkRect.width / 2);

        const scrollAmount = activeLinkCenter - (sidebarWidth / 2);

        mobileSidebar.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    const emptyState = document.getElementById("empty-state");
    const pendingState = document.getElementById("pending-state");
    const accountsGrid = document.getElementById("accounts-grid");

    const navAccounts = document.getElementById("nav-accounts");
    const navTransactions = document.getElementById("nav-transactions");
    const navAiAdvisor = document.getElementById('nav-ai-advisor');

    const viewAccounts = document.getElementById("view-accounts");
    const viewTransactions = document.getElementById("view-transactions");
    const viewAiAdvisor = document.getElementById('view-ai-advisor');
    const accountCards = document.getElementById("account-cards");

    let accounts = [];

    async function fetchMyAccounts() {
        try {
            const response = await fetch(`${BaseUrl}/Account/my-accounts`, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                }
            });
            if (response.ok) {
                const fetchedAccounts = await response.json();
                if (fetchedAccounts.length > 0 && fetchedAccounts[0].fullName) {
                    const name = fetchedAccounts[0].fullName;

                    if (headerName) headerName.innerText = name;
                    if (aiName) aiName.innerText = name;
                }
                accounts = fetchedAccounts;
                updateDashboard();
            }
            else {
                alert('failed to fetch accounts!');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const totalWealth = document.getElementById("total-wealth");

    const accountModal = document.getElementById("account-modal");
    const depositModal = document.getElementById("deposit-modal");
    const transferModal = document.getElementById("transfer-modal");

    const openAccountBtn = document.getElementById("open-account-btn");
    const fabOpenBtn = document.getElementById("fab-open-account");

    const modalClose = document.getElementById("modal-close");
    const depositClose = document.getElementById("deposit-close");
    const transferClose = document.getElementById("transfer-close");

    const withdrawModal = document.getElementById("withdraw-modal");
    const withdrawClose = document.getElementById("withdraw-close");
    const withdrawForm = document.getElementById("withdraw-form");

    const newAccountForm = document.getElementById("new-account-form");
    const depositForm = document.getElementById("deposit-form");
    const transferForm = document.getElementById("transfer-form");

    function updateDashboard() {

        emptyState.classList.add("hidden");
        pendingState.classList.add("hidden");
        accountsGrid.classList.add("hidden");

        if (accounts.length === 0) {
            emptyState.classList.remove("hidden");
            return;
        }
        const hasPending = accounts.some(acc => acc.status === "Pending");

        if (hasPending) {
            pendingState.classList.remove("hidden");
        }

        accountsGrid.classList.remove("hidden");
        renderAccounts();
        calculateWealth();
    }

    function renderAccounts() {
        accountCards.innerHTML = "";
        accounts.forEach(account => {

            const card = document.createElement("div");
            card.className = "account-card";

            card.innerHTML = `
        <div class="account-header">
            <span class="account-type">${account.accountType}</span>
            <span class="account-status ${account.status.toLowerCase()}">
                ${account.status}
            </span>
        </div>

        <div class="account-number">
            ${account.accountNumber}
        </div>


        <div class="account-balance" style="margin-top: 10px;">
            <div class="balance-label">Balance</div>
            <div class="balance-amount">₹${account.balance.toFixed(2)}</div>
        </div>

        <div class="account-actions">
            <button class="btn btn-primary deposit-btn" data-id="${account.accountId}"
                ${["Pending", "Frozen", "Closed", "Rejected"].includes(account.status) ? "disabled" : ""}>
                <i class="fa-solid fa-plus"></i> Deposit
            </button>
            <button class="btn btn-outline withdraw-btn" data-id="${account.accountId}"
                ${["Pending", "Frozen", "Closed", "Rejected"].includes(account.status) ? "disabled" : ""} 
                style="color: #ff4d4d; border-color: #ff4d4d;">
                <i class="fa-solid fa-minus"></i> Withdraw
            </button>
            <button class="btn btn-outline transfer-btn" data-id="${account.accountId}"
                ${["Pending", "Frozen", "Closed", "Rejected"].includes(account.status) ? "disabled" : ""}>
            <i class="fa-solid fa-right-left"></i> Transfer
            </button>
        </div>
    `;
            accountCards.appendChild(card);
        });

        attachActionButtons();
    }


    function attachActionButtons() {
        document.querySelectorAll(".deposit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const input = document.getElementById("deposit-account-id");
                if (input) {
                    input.value = btn.dataset.id;
                }
                if (depositModal) {
                    depositModal.classList.remove("hidden");
                }
            });
        });
        document.querySelectorAll(".withdraw-btn").forEach(btn => {

            btn.addEventListener("click", () => {
                document.getElementById("withdraw-account-id").value = btn.dataset.id;
                withdrawModal.classList.remove("hidden");
            });
        });

        document.querySelectorAll(".transfer-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.getElementById("transfer-from-account-id").value = btn.dataset.id;
                transferModal.classList.remove("hidden");
            });
        });
    }
    const fdGroup = document.getElementById('fd-duration-group');
    const fdInput = document.getElementById('fd-duration');
    document.getElementById('account-type').addEventListener('change', function (e) {
        if (e.target.value === 'FixedDeposit' || e.target.value === 'Loan' || e.target.value === 'RecurringDeposit') {
            fdGroup.classList.remove('hidden');
            fdInput.setAttribute('required', 'true');
        } else {
            fdGroup.classList.add('hidden');
            fdInput.removeAttribute('required');
        }
    });

    newAccountForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const type = document.getElementById("account-type").value;
        const deposit = parseFloat(document.getElementById("initial-deposit").value) || 0;
        const sourceoffunds = document.getElementById("source-of-funds").value;
        const nominee = document.getElementById("nominee-name").value;
        const relation = document.getElementById("nominee-relation").value;

        let termduration = null;
        if (!fdGroup.classList.contains("hidden")){
            termduration = parseInt(document.getElementById("fd-duration").value);
        }

            const openaccount = {
                AccountType: type,
                InitialDeposit: deposit,
                SourceofFunds: sourceoffunds,
                NomineeName: nominee,
                NomineeRelationship: relation,
                TermDuration : termduration
            };
        try {
            const response = await fetch(`${BaseUrl}/Account/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(openaccount)
            });
            if (response.ok) {
                const msg = await response.json();
                accountModal.classList.add("hidden");
                alert(msg.message);
                fetchMyAccounts();
            }
            else {
                const errormsg = await response.json();
                alert(errormsg.message);
            }
        } catch (error) {
            console.error(error);
        }
    });


    depositForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const id = parseInt(document.getElementById("deposit-account-id").value);
        const amount = parseFloat(document.getElementById("deposit-amount").value);
        const depositData = {
            AccountId: id,
            Amount: amount
        }
        try {
            const response = await fetch(`${BaseUrl}/Account/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(depositData)
            });
            if (response.ok) {
                const msg = await response.json();
                depositModal.classList.add("hidden");
                alert(msg.message);
                fetchMyAccounts();
                fetchTransactions();
            }
        } catch (error) {
            console.error(error);
        }
    });

    withdrawForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const id = parseInt(document.getElementById("withdraw-account-id").value);
        const amount = parseFloat(document.getElementById("withdraw-amount").value);
        const withdrawData = {
            AccountId: id,
            Amount: amount
        }
        try {
            const response = await fetch(`${BaseUrl}/Account/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(withdrawData)
            });
            if (response.ok) {
                const msg = await response.json();
                withdrawModal.classList.add("hidden");
                alert(msg.message);
                fetchMyAccounts();
                fetchTransactions();
            }
            else {
                const errormsg = await response.json();
                alert(errormsg.message);
                fetchMyAccounts();
            }
        } catch (error) {
            console.error(error);
        }
    });

    // 1. We need this global variable so the OTP modal remembers what we are transferring!
    let pendingTransferPayload = null;

    transferForm?.addEventListener("submit", async e => {
        e.preventDefault();

        // Grab the exact inputs from your HTML
        const sourceId = parseInt(document.getElementById("transfer-from-account-id").value);
        const targetNum = parseInt(document.getElementById("transfer-to-account").value);
        const amount = parseFloat(document.getElementById("transfer-amount").value);

        // Save it to the global variable so Step 2 (OTP) can use it later
        pendingTransferPayload = {
            SourceAccountId: sourceId,
            TargetAccountNumber: targetNum,
            Amount: amount
        };

        // Change the button text so the user knows it's loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${BaseUrl}/Account/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(pendingTransferPayload)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.action === "SHOW_OTP") {
                    transferModal.classList.add("hidden");
                    document.getElementById('otp-modal').classList.remove('hidden');
                    document.querySelectorAll('.otp-box')[0].focus();

                    startOtpTimer();
                }
                else if (data.action === "COMPLETED") {
                    alert(data.message);
                    transferModal.classList.add("hidden");
                    fetchMyAccounts();
                    fetchTransactions();
                    updateDashboard();
                    e.target.reset();
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("System error connecting to the bank.");
        } finally {
            // Reset the button
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
    const otpBoxes = document.querySelectorAll('.otp-box');
    otpBoxes.forEach((box, index) => {
        box.addEventListener('keyup', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                if (index < otpBoxes.length - 1) otpBoxes[index + 1].focus();
            } else if (e.key === 'Backspace') {
                if (index > 0) otpBoxes[index - 1].focus();
            }
        });
    });

    document.getElementById('close-otp').addEventListener('click', () => {
        document.getElementById('otp-modal').classList.add('hidden');
        pendingTransferPayload = null;
        otpBoxes.forEach(box => box.value = "");
        clearInterval(otpInterval);
    });


    async function initiateTransfer(targetAccountNumber, amount) {

        pendingTransferPayload = {
            TargetAccountNumber: parseInt(targetAccountNumber),
            Amount: parseFloat(amount)
        };

        try {
            const response = await fetch(`${BaseUrl}/Account/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(pendingTransferPayload)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.action === "SHOW_OTP") {
                    document.getElementById('otp-modal').classList.remove('hidden');
                    otpBoxes[0].focus();
                }
                else if (data.action === "COMPLETED") {
                    alert("Money Sent Instantly! (Under ₹50,000)");
                }
            } else {
                alert("Transfer Failed: " + data.message);
            }

        } catch (error) {
            console.error("API Error:", error);
            alert("System error connecting to the bank.");
        }
    }


    // --- 4. STEP 2: VERIFY OTP AND EXECUTE ---
    document.getElementById('otp-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        // 1. Lock the button to prevent double-clicking
        const verifyBtn = document.getElementById('verify-btn');
        verifyBtn.innerText = "Verifying...";
        verifyBtn.disabled = true;

        // 2. Gather the 6-digit code
        let fullOtp = "";
        otpBoxes.forEach(box => fullOtp += box.value);

        // 3. Build the payload matching your C# DTO
        const verifyPayload = {
            OtpCode: fullOtp,
            TransferDetails: pendingTransferPayload
        };

        try {
            const response = await fetch(`${BaseUrl}/Account/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                },
                body: JSON.stringify(verifyPayload)
            });

            const data = await response.json();

            if (response.ok && data.action === "COMPLETED") {
                // SUCCESS!
                document.getElementById('otp-modal').classList.add('hidden');
                alert("Verification Successful! The money has been transferred.");

                // Clear the boxes for next time
                otpBoxes.forEach(box => box.value = '');
                pendingTransferPayload = null;

                // Trigger your UI balance update function here!

            } else {
                alert("Verification Failed: " + data.message);
                // Shake the boxes or turn them red here for a cool UX effect!
            }
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            // Unlock the button
            verifyBtn.innerText = "Verify & Transfer";
            verifyBtn.disabled = false;
        }
    });

    let otpInterval; // Global variable so we can reset it

    function startOtpTimer() {
        clearInterval(otpInterval); // Clear any old timers if they try again

        let timeLeft = 300; // 5 minutes (in seconds)
        const display = document.getElementById('otp-countdown');
        const verifyBtn = document.getElementById('verify-btn');

        // Reset the UI in case it was red/locked from a previous attempt
        display.style.color = "var(--accent-color)";
        verifyBtn.disabled = false;
        verifyBtn.innerText = "Verify & Transfer";

        otpInterval = setInterval(() => {
            // Calculate minutes and seconds
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;

            // Format with leading zeros (e.g., 05:09)
            display.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // When time runs out!
            if (timeLeft <= 0) {
                clearInterval(otpInterval);
                display.innerText = "00:00";
                display.style.color = "#ef4444"; // Turn red!
                verifyBtn.disabled = true; // Lock the button so they can't submit
                verifyBtn.innerText = "Code Expired";
            }

            timeLeft--;
        }, 1000); // Ticks every 1000 milliseconds (1 second)
    }
    async function fetchTransactions() {
        try {
            const response = await fetch(`${BaseUrl}/Account/transactions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + token
                }
            })
            if (response.ok) {
                const transactions = await response.json()
                renderTransactions(transactions);
            }
        } catch (error) {

        }
    }

    function formatDescription(rawString) {
        if (!rawString) return "System Transaction";

        let cleanString = rawString.replace(/_/g, ' ');

        return cleanString.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function renderTransactions(transactions) {

        const tbody = document.getElementById("transactions-body");
        tbody.innerHTML = "";
        if (!transactions || transactions.length === 0) {

            tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-transactions">
                    No Transactions Yet
                </td>
            </tr>
        `;
            return;
        }

        transactions.forEach(txn => {
            const row = document.createElement("tr");
            const type = txn.transactionType ? txn.transactionType.toLowerCase() : "transfer";

            // Grab the merchant name safely
            const merchant = txn.merchantName ? txn.merchantName.toUpperCase() : "";
            const displayDescription = formatDescription(txn.merchantName)

            let symbol = "";
            let amountColorClass = "";

            if (type === "deposit") {
                symbol = "+";
                amountColorClass = "amount-in";
            }
            else if (type === "withdrawal") {
                symbol = "-";
                amountColorClass = "amount-out";
            }
            else if (type === "transfer") {
                if (merchant.includes("TRANSFER_OUT")) {
                    symbol = "-";
                    amountColorClass = "amount-out";
                }
                else if (merchant.includes("TRANSFER_IN")) {
                    symbol = "+";
                    amountColorClass = "amount-transfer-in";
                }
                else {
                    symbol = "→";
                    amountColorClass = "amount-transfer-in";
                }
            }

            const date = txn.transactionDate ? new Date(txn.transactionDate).toLocaleDateString() : "-";
            const rawStatus = txn.status ?? "Completed";
            let statusClass = "";

            switch (rawStatus.toLowerCase()) {
                case "completed": statusClass = "success"; break;
                case "pending": statusClass = "pending"; break;
                case "failed": statusClass = "failed"; break;
                default: statusClass = "success";
            }

            row.innerHTML = `
        <td>${date}</td>
        <td>${txn.accountId ?? "-"}</td>
        <td class="txn-${type}">${txn.transactionType ?? "-"}</td>
        <td>${displayDescription}</td> <td class="${amountColorClass}">${symbol} ₹${Number(txn.amount).toFixed(2)}</td>
        <td><span class="status-${statusClass}">${rawStatus}</span></td>
    `;

            tbody.appendChild(row);
        });
    }
    document.getElementById('ai-send-btn').addEventListener('click', async function () {
        const inputField = document.getElementById('ai-chat-input');
        const chatHistory = document.getElementById('ai-chat-history');
        const userMessage = inputField.value.trim();

        if (!userMessage) return;

        chatHistory.innerHTML += `
        <div style="align-self: flex-end; background: #3b82f6; color: white; padding: 10px 15px; border-radius: 8px; max-width: 80%;">
            <strong>You:</strong> ${userMessage}
        </div>
    `;

        inputField.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        const loadingId = "loading-" + Date.now();
        chatHistory.innerHTML += `<div id="${loadingId}" style="color: #9ca3af;"><em>AI is analyzing your ledger...</em></div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            const response = await fetch(`${BaseUrl}/AiChat/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ UserMessage: userMessage })
            });

            document.getElementById(loadingId).remove();

            if (response.ok) {
                const data = await response.json();

                const formattedReply = marked.parse(data.reply);

                chatHistory.innerHTML += `
    <div style="align-self: flex-start; background: #374151; color: #e5e7eb; padding: 15px; border-radius: 8px; max-width: 85%; font-size: 0.95rem; line-height: 1.5;">
        <strong style="display: block; margin-bottom: 10px; color: #60a5fa;"><i class="fa-solid fa-robot"></i> NexusAI:</strong> 
        <div class="ai-formatted-content">
            ${formattedReply}
        </div>
    </div>
`;
            } else {
                chatHistory.innerHTML += `<div style="color: #ef4444;"><em>Error: Could not reach the AI servers.</em></div>`;
            }
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            chatHistory.innerHTML += `<div style="color: #ef4444;"><em>Network Error.</em></div>`;
        }

        // Scroll to bottom again
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });

    function calculateWealth() {
        let total = 0;
        accounts.forEach(a => {
            if (a.status === "Active") {
                total += a.balance;
            }
        });
        totalWealth.innerText = "₹" + total.toFixed(2);

        const userTierElement = document.querySelector('.tier-badge');
        if (userTierElement) {
            if (total >= 1000000) {
                userTierElement.innerHTML = `<i class="fa-solid fa-gem"></i> Nexus Diamond`;
                userTierElement.style.color = '#a855f7';
                userTierElement.style.background = 'rgba(168, 85, 247, 0.2)';
            } else if (total >= 500000) {
                userTierElement.innerHTML = `<i class="fa-solid fa-star"></i> Nexus Gold`;
                userTierElement.style.color = '#fbbf24';
                userTierElement.style.background = 'rgba(251, 191, 36, 0.2)';
            } else {
                userTierElement.innerHTML = `Tier 1: Customer`;
                userTierElement.style.color = '#3b82f6';
                userTierElement.style.background = 'rgba(59, 130, 246, 0.2)';
            }
        }
    }
    if (token) {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5066/notificationHub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveTransferNotification", (amount) => {
            showRealTimeToast(`Incoming Transfer! You just received ₹${amount}.`);
        });

        connection.start()
    }


    function showRealTimeToast(message) {
        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.backgroundColor = "#10b981";
        toast.style.color = "white";
        toast.style.padding = "15px 25px";
        toast.style.borderRadius = "8px";
        toast.style.boxShadow = "0 10px 25px rgba(16, 185, 129, 0.4)";
        toast.style.zIndex = "9999";
        toast.style.fontWeight = "600";
        toast.style.transform = "translateY(100px)";
        toast.style.transition = "transform 0.3s ease";

        toast.innerHTML = `<i class="fa-solid fa-bell"></i> &nbsp; ${message}`;

        document.body.appendChild(toast);

        setTimeout(() => { toast.style.transform = "translateY(0)"; }, 100);

        setTimeout(() => {
            toast.style.transform = "translateY(100px)";
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    openAccountBtn?.addEventListener("click", () => {
        accountModal.classList.remove("hidden");
    });

    fabOpenBtn.addEventListener("click", () => {
        accountModal.classList.remove("hidden");
    });
    withdrawClose?.addEventListener("click", () => {
        withdrawModal.classList.add("hidden");
    });

    modalClose?.addEventListener("click", () => {
        accountModal.classList.add("hidden");
    });

    depositClose?.addEventListener("click", () => {
        depositModal.classList.add("hidden");
    });

    transferClose?.addEventListener("click", () => {
        transferModal.classList.add("hidden");
    });


    function hideAllViews() {
        viewAccounts.classList.add("hidden");
        viewTransactions.classList.add("hidden");
        viewAiAdvisor.classList.add("hidden");

        navAccounts.classList.remove("active");
        navTransactions.classList.remove("active");
        navAiAdvisor.classList.remove("active");
    }

    navAccounts.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewAccounts.classList.remove("hidden");
        navAccounts.classList.add("active");
    });

    navTransactions.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewTransactions.classList.remove("hidden");
        navTransactions.classList.add("active");
    });

    navAiAdvisor.addEventListener("click", (e) => {
        e.preventDefault();
        hideAllViews();
        viewAiAdvisor.classList.remove("hidden");
        navAiAdvisor.classList.add("active");
    });


    viewAccounts.classList.remove("hidden");
    viewTransactions.classList.add("hidden");
    fetchUserProfile();
    updateDashboard();
    fetchMyAccounts();
    fetchTransactions();
    // --- CLERK DROPDOWN LOGIC ---
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const clerkSignoutBtn = document.getElementById('clerk-signout-btn');

    // 1. Toggle dropdown when clicking the avatar
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stops the click from hitting the document
        userDropdown.classList.toggle('hidden');
    });

    // 2. Close dropdown if user clicks anywhere else on the page
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
    clerkSignoutBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to log out?")) {
            alert("Logged out SuccessFully");
            localStorage.removeItem("nexus_token");
            localStorage.removeItem('nexus_google_name');
            localStorage.removeItem('nexus_google_picture');
            window.location.href = "index.html";
        }
    });
    const manageModal = document.getElementById('manage-account-modal');
    const manageBtn = document.getElementById('manage-account-btn'); // The button in your dropdown
    const closeManageBtn = document.getElementById('close-manage-modal');

    // 1. Open Modal from Dropdown
    manageBtn.addEventListener('click', () => {
        manageModal.classList.remove('hidden');
        document.getElementById('user-dropdown').classList.add('hidden');
    });

    // 2. Close Modal
    closeManageBtn.addEventListener('click', () => {
        manageModal.classList.add('hidden');
    });
    const profileNavBtn = document.querySelectorAll('.settings-nav-item')[0];  // Profile
    const personalNavBtn = document.querySelectorAll('.settings-nav-item')[1]; // Personal Info
    const securityNavBtn = document.querySelectorAll('.settings-nav-item')[2]; // Security

    const profileTitle = document.querySelector('.settings-content h2');
    const profileRows = document.querySelectorAll('.settings-row:not(#settings-view-security .settings-row):not(#settings-view-personal .settings-row)');
    const personalView = document.getElementById('settings-view-personal');
    const securityView = document.getElementById('settings-view-security');

    function hideAllManageViews() {
        profileNavBtn.classList.remove('active');
        personalNavBtn.classList.remove('active');
        securityNavBtn.classList.remove('active');

        profileTitle.style.display = 'none';
        profileRows.forEach(row => row.style.display = 'none');
        personalView.classList.add('hidden');
        securityView.classList.add('hidden');
    }

    // 1. Click Profile
    profileNavBtn.addEventListener('click', () => {
        hideAllManageViews();
        profileNavBtn.classList.add('active');

        // Turn Profile back on
        profileTitle.style.display = 'block';
        profileRows.forEach(row => row.style.display = 'flex');
    });

    // 2. Click Personal Info
    personalNavBtn.addEventListener('click', () => {
        hideAllManageViews();
        personalNavBtn.classList.add('active');

        personalView.classList.remove('hidden');
    });

    // 3. Click Security
    securityNavBtn.addEventListener('click', () => {
        hideAllManageViews();
        securityNavBtn.classList.add('active');

        // Turn Security back on
        securityView.classList.remove('hidden');
    });
});
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

const overlay = document.createElement('div');
overlay.className = 'mobile-overlay';
document.body.appendChild(overlay);

function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

mobileMenuBtn?.addEventListener('click', toggleSidebar);

overlay.addEventListener('click', toggleSidebar);

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    });
});
// --- MOBILE SIDEBAR TOGGLE ---
const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
const settingsSidebar = document.querySelector('.settings-sidebar');

// 1. Click hamburger to slide menu in/out
mobileToggleBtn?.addEventListener('click', () => {
    settingsSidebar.classList.toggle('active');
});

// 2. Auto-close the sidebar on mobile when a tab is clicked
document.querySelectorAll('.settings-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        // If the screen is mobile-sized, close the menu
        if (window.innerWidth <= 768) {
            settingsSidebar.classList.remove('active');
        }
    });
});