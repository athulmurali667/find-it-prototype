const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// 1. Update initial state
appJs = appJs.replace(
    /let profile = \{ username: "arivera", name: "Anna Rivera", isAdmin: false, avatar: "" \};/,
    'let profile = getStoredData("findit_current_user", null);'
);
appJs = appJs.replace(
    /let isAuthenticated = true;/,
    'let isAuthenticated = !!profile;'
);
appJs = appJs.replace(
    /let isAdmin = false;/,
    'let isAdmin = profile ? (profile.isAdmin === 1 || profile.isAdmin === true) : false;'
);

// 2. Update init()
appJs = appJs.replace(
    /const userRes = await fetch\('\/api\/users\/arivera'\);\s*if \(userRes\.ok\) \{\s*profile = await userRes\.json\(\);\s*isAdmin = profile\.isAdmin === 1 \|\| profile\.isAdmin === true;\s*\}/,
    `if (profile) {
                const userRes = await fetch('/api/users/' + profile.username);
                if (userRes.ok) {
                    profile = await userRes.json();
                    setStoredData("findit_current_user", profile);
                    isAdmin = profile.isAdmin === 1 || profile.isAdmin === true;
                } else {
                    profile = null;
                    isAuthenticated = false;
                    isAdmin = false;
                    setStoredData("findit_current_user", null);
                }
            }`
);

// Update init() initial navigation
appJs = appJs.replace(
    /\/\/ Initial route sync\s*navigateTo\("home"\);/,
    `// Initial route sync
        if (isAuthenticated) {
            navigateTo("home");
        } else {
            navigateTo("login");
        }`
);

// 3. Update setupAuth()
const newSetupAuth = `function setupAuth() {
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = document.getElementById("login-email").value;
                const password = document.getElementById("login-password").value;
                
                try {
                    const res = await fetch('/api/users/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.success) {
                        profile = data.user;
                        isAuthenticated = true;
                        isAdmin = profile.isAdmin === 1 || profile.isAdmin === true;
                        setStoredData("findit_current_user", profile);
                        
                        updateAuthUI();
                        
                        // Update UI with new user data
                        renderProfileView();
                        if (isAdmin) renderAdminView();
                        
                        navigateTo("home");
                        showToast("Welcome back, " + profile.name + "!");
                    } else {
                        showToast(data.error || "Login failed");
                    }
                } catch (e) {
                    console.error(e);
                    showToast("Network error during login");
                }
            });
        }

        const createAccountView = document.getElementById("view-create-account");
        if (createAccountView) {
            const registerForm = createAccountView.querySelector("form");
            if (registerForm) {
                registerForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    
                    const name = document.getElementById("name").value;
                    const email = document.getElementById("email").value;
                    const password = document.getElementById("password").value;
                    
                    try {
                        const res = await fetch('/api/users/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email, password })
                        });
                        const data = await res.json();
                        
                        if (res.ok && data.success) {
                            profile = data.user;
                            isAuthenticated = true;
                            isAdmin = profile.isAdmin === 1 || profile.isAdmin === true;
                            setStoredData("findit_current_user", profile);
                            
                            updateAuthUI();
                            
                            // Update UI with new user data
                            renderProfileView();
                            if (isAdmin) renderAdminView();
                            
                            navigateTo("home");
                            showToast("Account created successfully!");
                        } else {
                            showToast(data.error || "Registration failed");
                        }
                    } catch (e) {
                        console.error(e);
                        showToast("Network error during registration");
                    }
                });
            }
        }
    }`;

appJs = appJs.replace(
    /function setupAuth\(\) \{[\s\S]*?navigateTo\("home"\);\s*\}\);\s*\}\s*\}/,
    newSetupAuth
);

// 4. Update logout logic in navigateTo
appJs = appJs.replace(
    /if \(viewName === "logout"\) \{\s*isAuthenticated = false;\s*updateAuthUI\(\);\s*navigateTo\("home"\);\s*return;\s*\}/,
    `if (viewName === "logout") {
            isAuthenticated = false;
            profile = null;
            isAdmin = false;
            setStoredData("findit_current_user", null);
            updateAuthUI();
            navigateTo("login");
            showToast("You have been logged out.");
            return;
        }`
);

fs.writeFileSync('js/app.js', appJs);
console.log("Successfully updated app.js");
