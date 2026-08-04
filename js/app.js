/* Main Application Logic for Find It */

document.addEventListener("DOMContentLoaded", () => {
    // App State
    let posts = getStoredData("findit_posts", INITIAL_POSTS);
    let profile = getStoredData("findit_profile", INITIAL_PROFILE);
    let conversations = getStoredData("findit_conversations_v2", INITIAL_CONVERSATIONS);
    let currentView = "home";
    let activeCategoryFilter = "all";
    let activeStatusFilter = "all";
    let activeConversationId = conversations[0] ? conversations[0].id : null;
    let selectedImageBase64 = null;
    let isAuthenticated = true; // Set to true by default for prototyping so auth guard doesn't block navigation
    let isAdmin = profile.isAdmin || false;

    // DOM Elements
    const views = {
        login: document.getElementById("view-login"),
        home: document.getElementById("view-home"),
        search: document.getElementById("view-search"),
        create: document.getElementById("view-create"),
        messages: document.getElementById("view-messages"),
        profile: document.getElementById("view-profile"),
        admin: document.getElementById("view-admin")
    };

    const navLinks = document.querySelectorAll("[data-nav]");
    const itemModal = document.getElementById("item-modal");
    const editProfileModal = document.getElementById("edit-profile-modal");

    // Initialize App
    function init() {
        setupNavigation();
        renderFeedView();
        renderSearchView();
        renderProfileView();
        renderMessagesView();
        setupCreateForm();
        setupEditProfileForm();
        setupNewsletterForm();
        setupAuth();
        if (isAdmin) renderAdminView();
        
        // Initial route sync
        navigateTo("home");
    }

    /* ----------------------------------------------------
       ROUTING & NAVIGATION
    ---------------------------------------------------- */
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetView = link.getAttribute("data-nav");
                if (targetView) {
                    navigateTo(targetView);
                }
            });
        });
    }

    function navigateTo(viewName) {
        // Handle Logout Route
        if (viewName === "logout") {
            isAuthenticated = false;
            updateAuthUI();
            navigateTo("home");
            return;
        }

        // Auth Guard for protected routes
        const protectedRoutes = ["create", "messages", "profile", "admin"];
        if (protectedRoutes.includes(viewName) && !isAuthenticated) {
            navigateTo("login");
            return;
        }

        // Admin Guard
        if (viewName === "admin" && !isAdmin) {
            showToast("Access Denied: Admin privileges required.");
            navigateTo("home");
            return;
        }

        if (!views[viewName]) return;
        currentView = viewName;

        // Hide all views
        Object.keys(views).forEach(name => {
            if (views[name]) {
                views[name].classList.remove("active");
                views[name].classList.add("hidden");
                views[name].style.display = ""; // clear any old inline styles
            }
        });

        // Show target view
        views[viewName].classList.remove("hidden");
        setTimeout(() => views[viewName].classList.add("active"), 10);

        // Update Nav UI Active States
        navLinks.forEach(link => {
            const isCurrent = link.getAttribute("data-nav") === viewName;
            if (isCurrent) {
                link.classList.add("text-primary", "font-bold");
                link.classList.remove("text-on-surface-variant");
                const icon = link.querySelector(".material-symbols-outlined");
                if (icon) icon.setAttribute("data-weight", "fill");
            } else {
                link.classList.remove("text-primary", "font-bold");
                link.classList.add("text-on-surface-variant");
                const icon = link.querySelector(".material-symbols-outlined");
                if (icon) icon.removeAttribute("data-weight");
            }
        });

        // Toggle layout elements for login and admin pages
        const mobileHeader = document.getElementById("mobile-header");
        const mobileBottomNav = document.getElementById("mobile-bottom-nav");
        const desktopSidebar = document.getElementById("desktop-sidebar");
        const mainContent = document.getElementById("main-content");
        
        if (viewName === "login" || viewName === "admin") {
            if (mobileHeader) mobileHeader.style.display = "none";
            if (mobileBottomNav) mobileBottomNav.style.display = "none";
            if (desktopSidebar) desktopSidebar.style.display = "none";
            if (mainContent) mainContent.classList.remove("md:pl-64");
        } else {
            if (mobileHeader) mobileHeader.style.display = "";
            if (mobileBottomNav) mobileBottomNav.style.display = "";
            if (desktopSidebar) desktopSidebar.style.display = "";
            if (mainContent) mainContent.classList.add("md:pl-64");
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Specific re-renders on view switch
        if (viewName === "home") renderFeedView();
        if (viewName === "search") renderSearchView();
        if (viewName === "profile") renderProfileView();
        if (viewName === "messages") renderMessagesView();
        if (viewName === "admin") renderAdminView();
    }

    window.navigateTo = navigateTo;

    /* ----------------------------------------------------
       AUTHENTICATION LOGIC
    ---------------------------------------------------- */
    function setupAuth() {
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                isAuthenticated = true;
                updateAuthUI();
                navigateTo("home");
            });
        }
    }

    function updateAuthUI() {
        const authLink = document.querySelector('[data-nav="login"], [data-nav="logout"]');
        if (authLink) {
            if (isAuthenticated) {
                authLink.setAttribute("data-nav", "logout");
                authLink.innerHTML = `
                    <span class="material-symbols-outlined">logout</span>
                    <span class="font-body-lg text-body-lg">Log Out</span>
                `;
            } else {
                authLink.setAttribute("data-nav", "login");
                authLink.innerHTML = `
                    <span class="material-symbols-outlined">login</span>
                    <span class="font-body-lg text-body-lg">Log In</span>
                `;
            }
        }

        const adminLinks = document.querySelectorAll('[data-nav="admin"]');
        adminLinks.forEach(link => {
            link.style.display = isAdmin ? 'flex' : 'none';
        });
    }

    /* ----------------------------------------------------
       FEED VIEW
    ---------------------------------------------------- */
    function renderFeedView() {
        const feedContainer = document.getElementById("feed-container");
        if (!feedContainer) return;

        feedContainer.innerHTML = "";

        // Sort posts by date (newest first)
        const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedPosts.length === 0) {
            feedContainer.innerHTML = `<div class="text-center text-on-surface-variant py-xl font-body-lg">No activity yet. Be the first to post!</div>`;
            return;
        }

        sortedPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "bg-surface-container-low border border-surface-container rounded-xl overflow-hidden shadow-sm flex flex-col";
            
            // Dynamic check for current user's profile
            const isOwnPost = post.reporterUsername === profile.username;
            const displayAvatar = isOwnPost ? profile.avatar : (post.reporterAvatar || 'https://via.placeholder.com/40');
            const displayName = isOwnPost ? profile.name : post.reporterName;

            // Header
            const header = `
                <div class="flex items-center gap-sm p-sm border-b border-surface-container">
                    <img src="${displayAvatar}" alt="${displayName}" class="w-10 h-10 rounded-full object-cover">
                    <div class="flex flex-col">
                        <span class="font-body-md font-bold text-on-surface">${escapeHtml(displayName)}</span>
                        <span class="font-label-sm text-on-surface-variant">${formatRelativeTime(post.date)}</span>
                    </div>
                </div>
            `;

            // Image container
            const isLost = post.type.toLowerCase() === "lost";
            const badgeBg = isLost ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container";
            
            const imageSection = `
                <div class="relative w-full aspect-square md:aspect-[4/5] bg-surface-container overflow-hidden cursor-pointer" onclick="openItemModal('${post.id}')">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
                    <div class="absolute top-sm left-sm px-sm py-xs rounded-full font-label-sm uppercase font-bold tracking-wider ${badgeBg} shadow-sm backdrop-blur-md bg-opacity-90">
                        ${post.type}
                    </div>
                    <div class="absolute top-sm right-sm px-sm py-xs rounded-full font-label-sm uppercase font-bold tracking-wider bg-surface/80 text-on-surface backdrop-blur-md">
                        ${post.category}
                    </div>
                </div>
            `;

            // Content
            const contentSection = `
                <div class="p-md flex flex-col gap-xs">
                    <h3 class="font-headline-md text-on-surface">${post.title}</h3>
                    <div class="flex items-center gap-xs text-on-surface-variant font-body-md mb-xs">
                        <span class="material-symbols-outlined text-[16px]">location_on</span>
                        <span>${post.location}</span>
                    </div>
                    <p class="font-body-md text-on-surface-variant line-clamp-3">${post.description}</p>
                </div>
            `;

            // Footer / Actions
            const messageAction = isOwnPost ? '' : `
                    <button class="flex-1 flex items-center justify-center gap-xs py-sm rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant font-body-md font-bold" onclick="startMessage('${post.id}')">
                        <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
                        Message
                    </button>
            `;

            const footerSection = `
                <div class="p-sm pt-0 flex gap-sm border-t border-surface-container mt-auto">
                    <button class="flex-1 flex items-center justify-center gap-xs py-sm rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant font-body-md font-bold" onclick="openItemModal('${post.id}')">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                        View Details
                    </button>
                    ${messageAction}
                </div>
            `;

            card.innerHTML = header + imageSection + contentSection + footerSection;
            feedContainer.appendChild(card);
        });
    }

    // Helper: format date to relative time for feed
    function formatRelativeTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /* ----------------------------------------------------
       SEARCH / BROWSE VIEW
    ---------------------------------------------------- */
    function renderSearchView() {
        const searchInput = document.getElementById("search-query-input");
        const feedContainer = document.getElementById("search-feed-grid");
        const resultsCounter = document.getElementById("search-results-count");
        if (!feedContainer) return;

        const dateFilter = document.getElementById("filter-date") ? document.getElementById("filter-date").value : "all";
        const catFilter = document.getElementById("filter-category") ? document.getElementById("filter-category").value : "all";
        const statusFilter = document.getElementById("filter-status") ? document.getElementById("filter-status").value : "all";

        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

        // Filter items
        const filtered = posts.filter(post => {
            const matchesQuery = !query || 
                post.title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query) ||
                post.location.toLowerCase().includes(query);
            
            const matchesCategory = catFilter === "all" || post.category.toLowerCase() === catFilter.toLowerCase();
            const matchesStatus = statusFilter === "all" || post.type.toLowerCase() === statusFilter.toLowerCase();

            let matchesDate = true;
            if (dateFilter !== "all") {
                const postDate = new Date(post.date);
                const now = new Date();
                const diffTime = Math.abs(now - postDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                matchesDate = diffDays <= parseInt(dateFilter);
            }

            return matchesQuery && matchesCategory && matchesStatus && matchesDate;
        });

        if (resultsCounter) {
            resultsCounter.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'} found`;
        }

        if (filtered.length === 0) {
            feedContainer.innerHTML = `
                <div class="col-span-full py-xl text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-5xl mb-sm">search_off</span>
                    <h3 class="font-headline-md text-headline-md text-on-background mb-xs">No items match your search</h3>
                    <p class="font-body-md text-body-md">Try clearing filters or searching for different keywords.</p>
                </div>
            `;
            return;
        }

        feedContainer.innerHTML = filtered.map(post => {
            const isLost = post.type === "lost";
            const badgeClass = isLost ? 
                "bg-error-container/90 text-on-error-container border-error-container/50" : 
                "bg-surface/90 text-on-surface border-outline-variant/50";
            const typeLabel = isLost ? "Lost" : "Found";

            return `
                <div onclick="openItemModal('${post.id}')" class="bg-surface rounded-xl overflow-hidden border border-surface-container hover:border-outline-variant transition-all hover:shadow-lg cursor-pointer flex flex-col group">
                    <div class="aspect-square relative overflow-hidden bg-surface-container-low">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${post.image}" alt="${escapeHtml(post.title)}" />
                        <div class="absolute top-2 right-2 backdrop-blur-sm px-2 py-1 rounded text-xs font-label-sm text-label-sm border ${badgeClass}">
                            ${typeLabel}
                        </div>
                    </div>
                    <div class="p-md flex flex-col flex-1">
                        <h3 class="font-headline-md text-headline-md text-on-background group-hover:text-primary transition-colors line-clamp-1 mb-xs">${escapeHtml(post.title)}</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-md text-xs flex-1">${escapeHtml(post.description)}</p>
                        <div class="flex items-center justify-between pt-sm border-t border-surface-variant text-xs text-on-surface-variant">
                            <span class="flex items-center gap-xs truncate">
                                <span class="material-symbols-outlined text-sm">location_on</span>
                                <span class="truncate">${escapeHtml(post.location)}</span>
                            </span>
                            <span class="shrink-0 ml-2">${post.timeAgo}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Export for HTML onchange event
    window.applyFilters = renderSearchView;

    const searchInput = document.getElementById("search-query-input");
    if (searchInput) {
        searchInput.addEventListener("input", renderSearchView);
    }

    /* ----------------------------------------------------
       CREATE LISTING FORM & IMAGE UPLOAD
    ---------------------------------------------------- */
    function setupCreateForm() {
        const dropZone = document.getElementById("image-drop-zone");
        const fileInput = document.getElementById("item-image-input");
        const imagePreviewContainer = document.getElementById("image-preview-container");
        const createFormBtn = document.getElementById("submit-create-post");

        if (dropZone && fileInput) {
            dropZone.addEventListener("click", () => fileInput.click());

            dropZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropZone.classList.add("border-primary", "bg-surface-container");
            });

            dropZone.addEventListener("dragleave", () => {
                dropZone.classList.remove("border-primary", "bg-surface-container");
            });

            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropZone.classList.remove("border-primary", "bg-surface-container");
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelection(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener("change", (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                }
            });
        }

        function handleFileSelection(file) {
            if (!file.type.startsWith("image/")) {
                showToast("Please select a valid image file.");
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 1080;
                    const MAX_HEIGHT = 1350;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress image to JPEG at 70% quality
                    selectedImageBase64 = canvas.toDataURL("image/jpeg", 0.7);
                    
                    if (imagePreviewContainer) {
                        imagePreviewContainer.innerHTML = `
                            <div class="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-outline-variant">
                                <img src="${selectedImageBase64}" class="w-full h-full object-cover" alt="Selected upload" />
                                <button type="button" onclick="clearSelectedImage(event)" class="absolute top-3 right-3 bg-background/80 hover:bg-background text-on-background p-2 rounded-full backdrop-blur-sm transition-colors">
                                    <span class="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        `;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        window.clearSelectedImage = function(e) {
            e.stopPropagation();
            selectedImageBase64 = null;
            if (imagePreviewContainer) {
                imagePreviewContainer.innerHTML = `
                    <div class="flex flex-col items-center text-center p-lg z-10">
                        <span class="material-symbols-outlined text-4xl text-outline mb-sm group-hover:text-primary transition-colors" data-icon="add_photo_alternate">add_photo_alternate</span>
                        <p class="font-body-md text-body-md font-semibold text-on-surface">Drag and drop images here</p>
                        <p class="font-label-sm text-label-sm text-outline mt-xs">or click to browse from your device</p>
                        <p class="font-label-sm text-label-sm text-outline mt-xs">Max 4 photos (1:1 or 4:5 recommended)</p>
                    </div>
                `;
            }
        };

        if (createFormBtn) {
            createFormBtn.addEventListener("click", () => {
                const titleInput = document.getElementById("item_name");
                const locationInput = document.getElementById("location");
                const descriptionInput = document.getElementById("description");
                const postType = document.querySelector('input[name="post_type"]:checked')?.value || "lost";
                const category = document.querySelector('input[name="category"]:checked')?.value || "other";

                const title = titleInput ? titleInput.value.trim() : "";
                const location = locationInput ? locationInput.value.trim() : "";
                const description = descriptionInput ? descriptionInput.value.trim() : "";

                if (!title) {
                    showToast("Please enter an item name.");
                    return;
                }
                if (!location) {
                    showToast("Please enter the location.");
                    return;
                }
                if (!description) {
                    showToast("Please provide a brief description.");
                    return;
                }

                // Default placeholder image if no upload
                const defaultImg = postType === "lost" ? 
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBrTD0IuYVs0k_1iKP9yp4x6BblocW5XMuMqnSseAK0qLiCiXR2Jrj9dQxHZ1BPLpiVIJ3tQ_EDSJYmLCLA6GygnQEVOpAFhXzu35VrJ7lLbylgampRaF9q4z2V84RngPO1VKh0_TpcMsEOX2ZXwTl7VW2xQs39RtsQ7A8k15aY18zFUmHygJ7dFXKLOmq89kobnseTYe4T9GEQOKqfqyR1ziSRD5V8W3j7T0OZcRAQSMZT-6bYu9dX" :
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhgRjImZoXBTGU2gsDollJqiJATKSDEpIVYQ1-nuQphHfL-Rke7ICVUtx1vA-GPMTNhszusAOcj3dJVUOY-iaEH7U75JdXg-5u_XRUuDSsChHkUGBnPBHGHAc5BXBXdpd2ruQWussQLYflVCHsmxSnV4vn7ahuwGDSCD44vXlWntx_V3pUAzvfGgKZAtAaOrmrDL5lGNihs_Ug8E71epgqutb4FbnUVb12m_ZLQnewQGof_zp38des";

                const newPost = {
                    id: "post-" + Date.now(),
                    title: title,
                    type: postType,
                    category: category,
                    location: location,
                    timeAgo: "Just now",
                    date: new Date().toISOString().split("T")[0],
                    image: selectedImageBase64 || defaultImg,
                    description: description,
                    reporterName: profile.name,
                    reporterUsername: profile.username,
                    reporterAvatar: profile.avatar,
                    status: "Active"
                };

                posts.unshift(newPost);
                setStoredData("findit_posts", posts);

                // Reset form
                if (titleInput) titleInput.value = "";
                if (locationInput) locationInput.value = "";
                if (descriptionInput) descriptionInput.value = "";
                selectedImageBase64 = null;
                if (imagePreviewContainer) {
                    clearSelectedImage(new Event("click"));
                }

                showToast("Post created successfully!");
                navigateTo("feed");
            });
        }
    }

    /* ----------------------------------------------------
       PROFILE VIEW & EDIT PROFILE
    ---------------------------------------------------- */
    function renderProfileView() {
        const nameEl = document.getElementById("profile-name");
        const bioEl = document.getElementById("profile-bio");
        const avatarEl = document.getElementById("profile-avatar");
        const headerAvatarEl = document.getElementById("header-profile-avatar");
        const countEl = document.getElementById("profile-posts-count");
        const gridEl = document.getElementById("profile-posts-grid");

        if (nameEl) nameEl.textContent = profile.name;
        if (bioEl) bioEl.textContent = profile.bio;
        if (avatarEl) avatarEl.src = profile.avatar;
        if (headerAvatarEl) headerAvatarEl.src = profile.avatar;

        // Filter profile user posts
        const userPosts = posts.filter(p => p.reporterUsername === profile.username);
        if (countEl) countEl.textContent = userPosts.length;

        if (gridEl) {
            if (userPosts.length === 0) {
                gridEl.innerHTML = `
                    <div class="col-span-full py-xl text-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-4xl mb-xs">post_add</span>
                        <p class="font-body-md text-body-md">You haven't posted any items yet.</p>
                    </div>
                `;
            } else {
                gridEl.innerHTML = userPosts.map(post => {
                    const isLost = post.type === "lost";
                    const badgeClass = isLost ? 
                        "bg-error-container/90 text-on-error-container border-error-container/50" : 
                        "bg-surface/90 text-on-surface border-outline-variant/50";
                    const typeLabel = isLost ? "Lost" : "Found";

                    return `
                        <div onclick="openItemModal('${post.id}')" class="aspect-square relative group overflow-hidden bg-surface-container-low rounded-lg cursor-pointer">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${post.image}" alt="${escapeHtml(post.title)}" />
                            <div class="absolute top-2 right-2 backdrop-blur-sm px-2 py-1 rounded text-xs font-label-sm text-label-sm border ${badgeClass}">
                                ${typeLabel}
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }
    }

    function setupEditProfileForm() {
        const editBtnDesktop = document.getElementById("btn-edit-profile-desktop");
        const editBtnMobile = document.getElementById("btn-edit-profile-mobile");
        const cancelBtn = document.getElementById("cancel-edit-profile");
        const saveBtn = document.getElementById("save-edit-profile");
        const avatarInput = document.getElementById("edit-profile-avatar-input");
        const avatarPreview = document.getElementById("edit-profile-avatar-preview");
        
        let tempAvatarBase64 = null;

        if (avatarInput) {
            avatarInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(event) {
                    tempAvatarBase64 = event.target.result;
                    if (avatarPreview) avatarPreview.src = tempAvatarBase64;
                };
                reader.readAsDataURL(file);
            });
        }

        function openModal() {
            const nameField = document.getElementById("edit-profile-name-input");
            const bioField = document.getElementById("edit-profile-bio-input");
            const adminCheckbox = document.getElementById("edit-profile-admin-checkbox");
            
            tempAvatarBase64 = null;
            if (nameField) nameField.value = profile.name;
            if (bioField) bioField.value = profile.bio;
            if (avatarPreview) avatarPreview.src = profile.avatar;
            if (adminCheckbox) adminCheckbox.checked = !!profile.isAdmin;
            
            if (editProfileModal) editProfileModal.classList.remove("hidden");
        }

        if (editBtnDesktop) editBtnDesktop.addEventListener("click", openModal);
        if (editBtnMobile) editBtnMobile.addEventListener("click", openModal);

        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                if (editProfileModal) editProfileModal.classList.add("hidden");
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                const nameField = document.getElementById("edit-profile-name-input");
                const bioField = document.getElementById("edit-profile-bio-input");
                const adminCheckbox = document.getElementById("edit-profile-admin-checkbox");
                if (nameField && nameField.value.trim()) profile.name = nameField.value.trim();
                if (bioField && bioField.value.trim()) profile.bio = bioField.value.trim();
                if (tempAvatarBase64) profile.avatar = tempAvatarBase64;
                if (adminCheckbox) {
                    profile.isAdmin = adminCheckbox.checked;
                    isAdmin = profile.isAdmin;
                }

                setStoredData("findit_profile", profile);
                updateAuthUI();

                // Update user's name and avatar in all their posts
                let postsUpdated = false;
                posts.forEach(p => {
                    if (p.reporterUsername === profile.username) {
                        p.reporterName = profile.name;
                        p.reporterAvatar = profile.avatar;
                        postsUpdated = true;
                    }
                });
                if (postsUpdated) {
                    setStoredData("findit_posts", posts);
                    renderFeedView();
                }

                // Update in conversations where sender is 'me'
                let convUpdated = false;
                conversations.forEach(c => {
                    c.messages.forEach(m => {
                        if (m.senderType === 'me') {
                            m.sender = profile.name;
                            convUpdated = true;
                        }
                    });
                });
                if (convUpdated) {
                    setStoredData("findit_conversations_v2", conversations);
                    if (currentView === "messages") renderMessagesView();
                }

                renderProfileView();
                if (editProfileModal) editProfileModal.classList.add("hidden");
                showToast("Profile updated!");
            });
        }
    }

    /* ----------------------------------------------------
       ADMIN VIEW
    ---------------------------------------------------- */
    function renderAdminView() {
        if (!isAdmin) return;
        
        const activeCountEl = document.getElementById("admin-stat-active");
        const reconnectedCountEl = document.getElementById("admin-stat-reconnected");
        const usersCountEl = document.getElementById("admin-stat-users");
        const tbody = document.getElementById("admin-reports-tbody");
        
        if (activeCountEl) {
            activeCountEl.textContent = posts.length; // Total active listings
        }
        
        if (reconnectedCountEl) {
            // Mock reconnected items
            reconnectedCountEl.textContent = Math.floor(posts.length * 0.4) + 12; 
        }
        
        if (usersCountEl) {
            // Mock reported users
            usersCountEl.textContent = "2"; 
        }
        
        if (tbody) {
            // Take up to 10 most recent posts
            const recentPosts = [...posts].reverse().slice(0, 10);
            tbody.innerHTML = recentPosts.map(post => {
                const isLost = post.type === "lost";
                const badgeClass = isLost ? 
                    "bg-surface-container-high text-on-surface border border-outline-variant" : 
                    "bg-primary-container text-on-primary-container border border-primary-container";
                const statusLabel = isLost ? "Pending" : "Resolved";
                const category = (post.category || "General").charAt(0).toUpperCase() + (post.category || "General").slice(1);
                
                return `
<tr class="hover:bg-surface-container-highest/30 transition-colors">
<td class="px-6 py-4 font-medium flex items-center gap-3">
<div class="w-10 h-10 rounded bg-surface-container-high overflow-hidden">
<img class="w-full h-full object-cover" src="${post.image}" alt="Item image">
</div>
${escapeHtml(post.title)}
</td>
<td class="px-6 py-4 text-on-surface-variant">${escapeHtml(category)}</td>
<td class="px-6 py-4">
<span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${badgeClass}">${statusLabel}</span>
</td>
<td class="px-6 py-4 text-on-surface-variant">${post.timeAgo}</td>
<td class="px-6 py-4 text-right">
<button onclick="alert('Admin Action: Manage Post ID ${post.id}')" class="text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">more_vert</span></button>
</td>
</tr>
                `;
            }).join("");
        }
    }

    /* ----------------------------------------------------
       MESSAGES VIEW
    ---------------------------------------------------- */
    function renderMessagesView() {
        const listContainer = document.getElementById("conversations-list");
        const threadHeaderContainer = document.getElementById("chat-thread-header");
        const messagesHistoryContainer = document.getElementById("chat-messages-history");
        const messageInput = document.getElementById("chat-input");
        const sendBtn = document.getElementById("chat-send-btn");

        if (!listContainer) return;

        // Render Conversation List
        listContainer.innerHTML = conversations.map(conv => {
            const isActive = conv.id === activeConversationId;
            const bgClass = isActive ? "bg-surface-container-low" : "hover:bg-surface-container-low";
            const unreadBadge = conv.unread ? `<div class="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>` : "";

            return `
                <div onclick="selectConversation('${conv.id}')" class="p-md ${bgClass} rounded-xl cursor-pointer transition-colors flex items-center gap-md border border-transparent">
                    <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container-high">
                        <img src="${conv.participantAvatar}" class="w-full h-full object-cover" alt="${escapeHtml(conv.participantName)}" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-label-sm text-label-sm text-on-background truncate">${escapeHtml(conv.participantName)}</h4>
                            <span class="font-body-md text-body-md text-on-surface-variant text-[11px]">${conv.timeAgo}</span>
                        </div>
                        <p class="font-body-md text-body-md text-on-surface-variant text-xs truncate mb-1">${escapeHtml(conv.itemTitle)}</p>
                        <p class="font-body-md text-body-md text-on-surface-variant text-xs truncate">${escapeHtml(conv.lastMessage)}</p>
                    </div>
                    ${unreadBadge}
                </div>
            `;
        }).join("");

        // Active conversation object
        const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
        if (!activeConv) {
            if (threadHeaderContainer) threadHeaderContainer.innerHTML = "";
            if (messagesHistoryContainer) {
                messagesHistoryContainer.innerHTML = `
                    <div class="h-full flex flex-col items-center justify-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-4xl mb-sm opacity-50">forum</span>
                        <p class="font-body-md text-body-md">No conversations yet.</p>
                    </div>
                `;
            }
            return;
        }

        // Render Thread Header
        if (threadHeaderContainer) {
            threadHeaderContainer.innerHTML = `
                <div class="flex items-center gap-md">
                    <div class="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                        <img src="${activeConv.participantAvatar}" class="w-full h-full object-cover" alt="${escapeHtml(activeConv.participantName)}" />
                    </div>
                    <div>
                        <h3 class="font-headline-md text-headline-md text-on-background text-base">${escapeHtml(activeConv.participantName)}</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant text-xs">Regarding: ${escapeHtml(activeConv.itemTitle)}</p>
                    </div>
                </div>
            `;
        }

        // Render Messages History
        if (messagesHistoryContainer) {
            messagesHistoryContainer.innerHTML = activeConv.messages.map(msg => {
                const isMe = msg.senderType === "me";
                const bubbleBg = isMe ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-on-surface";
                const alignClass = isMe ? "justify-end" : "justify-start";

                return `
                    <div class="flex ${alignClass} mb-md">
                        <div class="max-w-[75%] ${bubbleBg} p-md rounded-2xl">
                            <p class="font-body-md text-body-md leading-relaxed">${escapeHtml(msg.text)}</p>
                            <span class="block text-[10px] text-right mt-1 opacity-70">${msg.time}</span>
                        </div>
                    </div>
                `;
            }).join("");

            // Auto-scroll messages history
            messagesHistoryContainer.scrollTop = messagesHistoryContainer.scrollHeight;
        }

        window.sendQuickReply = function(text) {
            if (messageInput) {
                messageInput.value = text;
                sendMessage();
            }
        };

        // Setup Send Action
        if (sendBtn && messageInput) {
            sendBtn.onclick = sendMessage;
            messageInput.onkeypress = (e) => {
                if (e.key === "Enter") sendMessage();
            };
        }

        function sendMessage() {
            if (!messageInput) return;
            const text = messageInput.value.trim();
            if (!text) return;

            const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const newMsg = {
                id: "m-" + Date.now(),
                sender: profile.name,
                senderType: "me",
                text: text,
                time: timeNow
            };

            activeConv.messages.push(newMsg);
            activeConv.lastMessage = text;
            activeConv.timeAgo = "Just now";
            activeConv.unread = false;

            setStoredData("findit_conversations_v2", conversations);
            messageInput.value = "";
            renderMessagesView();

            // Simulate quick reply after 1.5s
            setTimeout(() => {
                const autoReplies = [
                    "Thanks for reaching out! Is there a convenient place we can meet?",
                    "Got it! Let me double check and get back to you shortly.",
                    "Appreciate your message! Can you send a quick confirmation photo?"
                ];
                const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
                activeConv.messages.push({
                    id: "m-auto-" + Date.now(),
                    sender: activeConv.participantName,
                    senderType: "them",
                    text: replyText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                activeConv.lastMessage = replyText;
                activeConv.timeAgo = "Just now";
                setStoredData("findit_conversations_v2", conversations);
                if (currentView === "messages") renderMessagesView();
            }, 1500);
        }
    }

    window.selectConversation = function(convId) {
        activeConversationId = convId;
        const conv = conversations.find(c => c.id === convId);
        if (conv) conv.unread = false;
        setStoredData("findit_conversations_v2", conversations);
        renderMessagesView();
    };

    window.clearAllMessages = function() {
        if (confirm("Are you sure you want to delete all your messages?")) {
            conversations = [];
            setStoredData("findit_conversations_v2", conversations);
            activeConversationId = null;
            renderMessagesView();
            showToast("All messages have been cleared.");
        }
    };

    window.startMessage = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        if (post.reporterUsername === profile.username) {
            showToast("You cannot message yourself.");
            return;
        }
        startConversationWithReporter(post.reporterName, post.reporterUsername, post.reporterAvatar, post.title);
    };

    window.startConversationWithReporter = function(reporterName, reporterUsername, reporterAvatar, itemTitle) {
        let existing = conversations.find(c => c.participantUsername === reporterUsername && c.itemTitle === itemTitle);
        if (!existing) {
            existing = {
                id: "conv-" + Date.now(),
                participantName: reporterName,
                participantUsername: reporterUsername,
                participantAvatar: reporterAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                itemTitle: itemTitle,
                lastMessage: `Interested in: ${itemTitle}`,
                timeAgo: "Just now",
                unread: false,
                messages: [
                    {
                        id: "m-start",
                        sender: profile.name,
                        senderType: "me",
                        text: `Hi ${reporterName}, I am contacting you regarding your post "${itemTitle}".`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]
            };
            conversations.unshift(existing);
            setStoredData("findit_conversations_v2", conversations);
        }
        activeConversationId = existing.id;
        closeItemModal();
        navigateTo("messages");
    };

    /* ----------------------------------------------------
       ITEM DETAIL MODAL
    ---------------------------------------------------- */
    window.openItemModal = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post || !itemModal) return;

        const container = document.getElementById("item-modal-content");
        if (!container) return;

        const isLost = post.type === "lost";
        const isOwnPost = post.reporterUsername === profile.username;
        const badgeClass = isLost ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container";

        const displayAvatar = isOwnPost ? profile.avatar : post.reporterAvatar;
        const displayName = isOwnPost ? profile.name : post.reporterName;
        // In the modal, if it's their own post, don't show the username below it, or show profile.username
        const displayUsername = isOwnPost ? "" : `<p class="font-body-md text-body-md text-on-surface-variant text-xs">@${post.reporterUsername}</p>`;

        container.innerHTML = `
            <div class="relative flex flex-col lg:flex-row max-w-3xl w-full bg-surface border border-surface-variant rounded-2xl overflow-hidden shadow-2xl">
                <button onclick="closeItemModal()" class="absolute top-4 right-4 z-20 bg-background/80 hover:bg-background text-on-background p-2 rounded-full backdrop-blur-sm transition-colors">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
                
                <div class="w-full lg:w-1/2 aspect-square lg:aspect-auto bg-surface-container-low relative">
                    <img src="${post.image}" class="w-full h-full object-cover" alt="${escapeHtml(post.title)}" />
                    <span class="absolute top-4 left-4 px-3 py-1 rounded-full font-label-sm text-label-sm ${badgeClass}">
                        ${isLost ? 'Lost Item' : 'Found Item'}
                    </span>
                </div>

                <div class="w-full lg:w-1/2 p-lg flex flex-col justify-between">
                    <div>
                        <h2 class="font-headline-md text-headline-md text-on-background mb-xs">${escapeHtml(post.title)}</h2>
                        <p class="font-body-md text-body-md text-on-surface-variant text-xs mb-md flex items-center gap-xs">
                            <span class="material-symbols-outlined text-sm">location_on</span>
                            ${escapeHtml(post.location)} • ${post.timeAgo}
                        </p>

                        <div class="mb-md">
                            <h4 class="font-label-sm text-label-sm text-on-surface mb-xs">Description</h4>
                            <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed text-sm">${escapeHtml(post.description)}</p>
                        </div>

                        <div class="p-md bg-surface-container-low rounded-xl flex items-center gap-md mb-lg">
                            <img src="${displayAvatar}" class="w-10 h-10 rounded-full object-cover shrink-0" alt="${escapeHtml(displayName)}" />
                            <div class="overflow-hidden">
                                <h4 class="font-label-sm text-label-sm text-on-background truncate">${escapeHtml(displayName)}</h4>
                                ${displayUsername}
                            </div>
                        </div>
                    </div>

                    ${isOwnPost ? `
                    <div class="flex items-center gap-md pt-md border-t border-surface-variant">
                        <button onclick="togglePostTag('${post.id}')" class="w-full bg-surface-container-high text-on-surface font-body-md text-body-md font-bold px-lg py-sm rounded-lg hover:bg-surface-container-highest active:scale-95 transition-all shadow-sm flex items-center justify-center gap-xs border border-outline-variant">
                            <span class="material-symbols-outlined text-sm">swap_horiz</span>
                            Change Tag to ${isLost ? 'Found' : 'Lost'}
                        </button>
                    </div>
                    ` : `
                    <div class="flex items-center gap-md pt-md border-t border-surface-variant">
                        <button onclick="startConversationWithReporter('${escapeHtml(post.reporterName)}', '${post.reporterUsername}', '${post.reporterAvatar}', '${escapeHtml(post.title)}')" class="w-full bg-primary-container text-on-primary-container font-body-md text-body-md font-bold px-lg py-sm rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-xs">
                            <span class="material-symbols-outlined text-sm">mail</span>
                            Message ${isLost ? 'Owner' : 'Finder'}
                        </button>
                    </div>
                    `}
                </div>
            </div>
        `;

        itemModal.classList.remove("hidden");
    };

    window.closeItemModal = function() {
        if (itemModal) itemModal.classList.add("hidden");
    };

    window.togglePostTag = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        post.type = post.type === 'lost' ? 'found' : 'lost';
        setStoredData("findit_posts", posts);
        
        // Refresh views to show the new tag
        renderFeedView();
        renderProfileView();
        openItemModal(postId);
        
        showToast(`Post tag changed to ${post.type === 'lost' ? 'Lost' : 'Found'}`);
    };

    /* ----------------------------------------------------
       NEWSLETTER & TOAST UTILITY
    ---------------------------------------------------- */
    function setupNewsletterForm() {
        const newsletterForms = document.querySelectorAll("form");
        newsletterForms.forEach(form => {
            if (form.querySelector('input[type="email"]')) {
                form.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const emailInput = form.querySelector('input[type="email"]');
                    if (emailInput && emailInput.value) {
                        showToast("Thank you for subscribing to Find It!");
                        emailInput.value = "";
                    }
                });
            }
        });
    }

    function showToast(message) {
        let toast = document.getElementById("global-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "global-toast";
            toast.className = "fixed bottom-20 md:bottom-8 right-4 z-50 bg-primary-container text-on-primary-container px-md py-sm rounded-xl shadow-xl font-body-md text-body-md flex items-center gap-xs toast-animate";
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span class="material-symbols-outlined text-base">info</span> ${escapeHtml(message)}`;
        toast.style.display = "flex";
        setTimeout(() => {
            toast.style.display = "none";
        }, 3500);
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    init();
});
