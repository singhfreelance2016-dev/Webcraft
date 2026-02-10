// Dashboard Main Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for authentication
    window.addEventListener('dashboardLogin', initializeDashboard);
    
    // Initialize if already logged in
    if (window.auth && window.auth.isAuthenticated()) {
        initializeDashboard();
    }
});

function initializeDashboard() {
    // Initialize all dashboard components
    setupNavigation();
    setupDashboardData();
    setupEventListeners();
    setupModals();
    loadRequests();
    updateDashboardStats();
    updateCurrentDate();
    
    // Initialize Chart.js
    initializeCharts();
}

// Dashboard Data Management
let allRequests = [];
let currentFilteredRequests = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentRequestIndex = 0;

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.dashboard-view');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target view
            const viewId = this.getAttribute('data-view');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target view
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${viewId}View`) {
                    view.classList.add('active');
                    
                    // Load specific view data
                    switch(viewId) {
                        case 'requests':
                            loadRequests();
                            break;
                        case 'projects':
                            loadProjects();
                            break;
                        case 'clients':
                            loadClients();
                            break;
                    }
                }
            });
        });
    });
}

// Data Management
function setupDashboardData() {
    // Load existing data from localStorage
    const savedData = localStorage.getItem('clientSubmissions');
    allRequests = savedData ? JSON.parse(savedData) : [];
    
    // Load sample data if empty (for demo)
    if (allRequests.length === 0) {
        loadSampleData();
    }
    
    currentFilteredRequests = [...allRequests];
}

function loadSampleData() {
    const sampleData = [
        {
            id: '1',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'new',
            client: {
                fullName: 'Sarah Johnson',
                email: 'sarah@example.com',
                phone: '(555) 123-4567',
                businessName: 'Sarah\'s Bakery',
                businessType: 'restaurant',
                businessDescription: 'Artisan bakery specializing in custom cakes and pastries.'
            },
            project: {
                websiteType: ['informational', 'ecommerce'],
                pages: 7,
                features: ['responsive', 'contact-form', 'seo', 'gallery'],
                specificFeatures: 'Online ordering system, photo gallery of cakes, customer reviews'
            },
            design: {
                colorPreference: '#ec4899',
                websiteExamples: 'https://sprinkles.com, https://magnoliabakery.com',
                designStyle: 'creative',
                designNotes: 'Sweet and playful design with lots of pink'
            },
            timeline: {
                timeline: 'asap',
                budget: '500-800',
                paymentPreference: '50-50',
                contentMaterials: 'all-ready',
                assets: []
            },
            additional: {
                notes: 'Need website before holiday season'
            },
            notes: 'Sample client - interested in quick turnaround'
        },
        {
            id: '2',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'contacted',
            client: {
                fullName: 'Michael Chen',
                email: 'michael@techsolutions.com',
                phone: '(555) 987-6543',
                businessName: 'Tech Solutions Inc.',
                businessType: 'professional',
                businessDescription: 'IT consulting and software development services.'
            },
            project: {
                websiteType: ['portfolio', 'blog'],
                pages: 5,
                features: ['responsive', 'contact-form', 'seo', 'analytics', 'blog'],
                specificFeatures: 'Project portfolio, blog section, team profiles'
            },
            design: {
                colorPreference: '#3b82f6',
                websiteExamples: 'https://ibm.com, https://microsoft.com',
                designStyle: 'corporate',
                designNotes: 'Professional and trustworthy design'
            },
            timeline: {
                timeline: '1-month',
                budget: '800-1200',
                paymentPreference: 'milestones',
                contentMaterials: 'partial',
                assets: []
            },
            additional: {
                notes: 'Looking for long-term partnership'
            },
            notes: 'Sent initial quote, waiting for response'
        },
        {
            id: '3',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in-progress',
            client: {
                fullName: 'Emma Rodriguez',
                email: 'emma@greenliving.com',
                phone: '(555) 456-7890',
                businessName: 'Green Living',
                businessType: 'small-business',
                businessDescription: 'Eco-friendly products and sustainability consulting.'
            },
            project: {
                websiteType: ['ecommerce'],
                pages: 8,
                features: ['responsive', 'contact-form', 'seo', 'analytics', 'social-media', 'blog'],
                specificFeatures: 'Online store, blog about sustainability, product reviews'
            },
            design: {
                colorPreference: '#10b981',
                websiteExamples: 'https://patagonia.com, https://tentree.com',
                designStyle: 'modern',
                designNotes: 'Clean, nature-inspired design'
            },
            timeline: {
                timeline: '1-3-months',
                budget: '1200-2000',
                paymentPreference: '50-50',
                contentMaterials: 'none',
                assets: []
            },
            additional: {
                notes: 'Excited about this project!'
            },
            notes: '50% deposit received, working on design mockups',
            progress: 30
        },
        {
            id: '4',
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            client: {
                fullName: 'David Wilson',
                email: 'david@lawfirm.com',
                phone: '(555) 789-0123',
                businessName: 'Wilson & Associates',
                businessType: 'professional',
                businessDescription: 'Legal services specializing in business law.'
            },
            project: {
                websiteType: ['informational'],
                pages: 6,
                features: ['responsive', 'contact-form', 'seo'],
                specificFeatures: 'Attorney profiles, service pages, contact forms'
            },
            design: {
                colorPreference: '#000000',
                websiteExamples: '',
                designStyle: 'elegant',
                designNotes: 'Professional, authoritative design'
            },
            timeline: {
                timeline: 'asap',
                budget: '800-1200',
                paymentPreference: 'full-on-completion',
                contentMaterials: 'all-ready',
                assets: []
            },
            additional: {
                notes: 'Need website to be very professional'
            },
            notes: 'Project completed successfully, client very happy',
            progress: 100,
            revenue: 950
        }
    ];
    
    allRequests = sampleData;
    localStorage.setItem('clientSubmissions', JSON.stringify(allRequests));
}

// Event Listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadRequests();
            updateDashboardStats();
            showNotification('Data refreshed successfully', 'success');
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Export All button
    const exportAllBtn = document.getElementById('exportAll');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllData);
    }
    
    // Import button
    const importBtn = document.getElementById('importData');
    if (importBtn) {
        importBtn.addEventListener('click', importData);
    }
    
    // Add Project button
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', addProject);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    // Filter buttons
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Budget filter
    const budgetFilter = document.getElementById('budgetFilter');
    if (budgetFilter) {
        budgetFilter.addEventListener('change', applyFilters);
    }
}

function setupModals() {
    const requestModal = document.getElementById('requestModal');
    const modalClose = document.getElementById('modalClose');
    const notesModal = document.getElementById('notesModal');
    const notesClose = document.getElementById('notesClose');
    
    // Close modals when clicking X
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            requestModal.classList.remove('active');
        });
    }
    
    if (notesClose) {
        notesClose.addEventListener('click', () => {
            notesModal.classList.remove('active');
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === requestModal) {
            requestModal.classList.remove('active');
        }
        if (e.target === notesModal) {
            notesModal.classList.remove('active');
        }
    });
    
    // Save status button
    const saveStatusBtn = document.getElementById('saveStatus');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', saveRequestStatus);
    }
    
    // Delete request button
    const deleteRequestBtn = document.getElementById('deleteRequest');
    if (deleteRequestBtn) {
        deleteRequestBtn.addEventListener('click', deleteRequest);
    }
    
    // Save notes button
    const saveNotesBtn = document.getElementById('saveNotes');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', saveNotes);
    }
    
    // Modal navigation
    const modalPrevBtn = document.getElementById('modalPrev');
    const modalNextBtn = document.getElementById('modalNext');
    
    if (modalPrevBtn) {
        modalPrevBtn.addEventListener('click', showPrevRequest);
    }
    
    if (modalNextBtn) {
        modalNextBtn.addEventListener('click', showNextRequest);
    }
}

// Load and Display Requests
function loadRequests() {
    currentFilteredRequests = [...allRequests];
    renderRequestsTable();
    updatePagination();
}

function renderRequestsTable() {
    const tbody = document.getElementById('requestsBody');
    const emptyState = document.getElementById('emptyState');
    const tableCount = document.getElementById('tableCount');
    
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRequests = currentFilteredRequests.slice(startIndex, endIndex);
    
    if (pageRequests.length === 0) {
        tbody.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (tableCount) tableCount.textContent = '0';
        return;
    }
    
    tbody.style.display = 'table-row-group';
    if (emptyState) emptyState.style.display = 'none';
    if (tableCount) tableCount.textContent = currentFilteredRequests.length.toString();
    
    // Create table rows
    pageRequests.forEach((request, index) => {
        const row = document.createElement('tr');
        const globalIndex = startIndex + index;
        
        // Format date
        const date = new Date(request.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Get status badge class
        const statusClass = `status-${request.status.replace('-', '')}`;
        
        row.innerHTML = `
            <td>#${request.id}</td>
            <td>
                <strong>${request.client.fullName}</strong><br>
                <small>${request.client.email}</small>
            </td>
            <td>${request.client.businessName}</td>
            <td>${getWebsiteTypeLabel(request.project.websiteType[0])}</td>
            <td>${getBudgetLabel(request.timeline.budget)}</td>
            <td>${getTimelineLabel(request.timeline.timeline)}</td>
            <td><span class="status-badge ${statusClass}">${request.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon primary" onclick="viewRequest(${globalIndex})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editNotes(${globalIndex})" title="Edit Notes">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteRequest(${globalIndex})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filtering
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const budgetFilter = document.getElementById('budgetFilter');
    const searchInput = document.getElementById('searchInput');
    
    const status = statusFilter ? statusFilter.value : 'all';
    const budget = budgetFilter ? budgetFilter.value : 'all';
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    
    currentFilteredRequests = allRequests.filter(request => {
        // Status filter
        if (status !== 'all' && request.status !== status) {
            return false;
        }
        
        // Budget filter
        if (budget !== 'all' && request.timeline.budget !== budget) {
            return false;
        }
        
        // Search filter
        if (search) {
            const searchText = `
                ${request.client.fullName}
                ${request.client.email}
                ${request.client.businessName}
                ${request.client.businessDescription}
                ${request.project.specificFeatures}
                ${request.additional.notes || ''}
            `.toLowerCase();
            
            if (!searchText.includes(search)) {
                return false;
            }
        }
        
        return true;
    });
    
    currentPage = 1;
    renderRequestsTable();
    updatePagination();
}

function clearFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const budgetFilter = document.getElementById('budgetFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) statusFilter.value = 'all';
    if (budgetFilter) budgetFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    
    applyFilters();
}

// Pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(currentFilteredRequests.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Show page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
        <span class="pagination-info">
            Page ${currentPage} of ${totalPages}
        </span>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(currentFilteredRequests.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderRequestsTable();
    updatePagination();
    
    // Scroll to top of table
    const table = document.getElementById('requestsTable');
    if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Request Details Modal
function viewRequest(index) {
    currentRequestIndex = index;
    const request = currentFilteredRequests[index];
    
    if (!request) return;
    
    const modal = document.getElementById('requestModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const statusSelect = document.getElementById('statusSelect');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    // Update modal title
    modalTitle.textContent = `Request #${request.id} - ${request.client.businessName}`;
        // Update status select
    if (statusSelect) {
        statusSelect.value = request.status;
    }
    
    // Format date
    const date = new Date(request.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
        // Create request details HTML
    const detailsHTML = `
        <div class="request-details">
            <div class="detail-section">
                <h4><i class="fas fa-user"></i> Client Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">${request.client.fullName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">
                            <a href="mailto:${request.client.email}">${request.client.email}</a>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Phone</div>
                        <div class="detail-value">${request.client.phone || 'Not provided'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Name</div>
                        <div class="detail-value">${request.client.businessName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Type</div>
                        <div class="detail-value">${getBusinessTypeLabel(request.client.businessType)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Description</div>
                        <div class="detail-value">${request.client.businessDescription}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-clipboard-list"></i> Project Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Website Type</div>
                        <div class="detail-value">
                            ${request.project.websiteType.map(type => getWebsiteTypeLabel(type)).join(', ')}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Number of Pages</div>
                        <div class="detail-value">${request.project.pages}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Required Features</div>
                        <div class="detail-value">
                            <div class="features-list">
                                ${request.project.features.map(feature => `
                                    <span class="feature-tag">${getFeatureLabel(feature)}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Specific Requirements</div>
                        <div class="detail-value">${request.project.specificFeatures}</div>
                    </div>
                </div>
            </div>
                        <div class="detail-section">
                <h4><i class="fas fa-palette"></i> Design Preferences</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Color Preference</div>
                        <div class="detail-value">
                            <div class="color-preview">
                                <div class="color-swatch" style="background-color: ${request.design.colorPreference || '#ccc'}"></div>
                                ${request.design.colorPreference || 'Not specified'}
                            </div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Design Style</div>
                        <div class="detail-value">${getDesignStyleLabel(request.design.designStyle)}</div>
                    </div>
                    ${request.design.websiteExamples ? `
                    <div class="detail-item">
                        <div class="detail-label">Website Examples</div>
                        <div class="detail-value">${request.design.websiteExamples}</div>
                    </div>
                    ` : ''}
                    ${request.design.designNotes ? `
                    <div class="detail-item">
                        <div class="detail-label">Design Notes</div>
                        <div class="detail-value">${request.design.designNotes}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-calendar-alt"></i> Timeline & Budget</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Timeline</div>
                        <div class="detail-value">${getTimelineLabel(request.timeline.timeline)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Budget Range</div>
                        <div class="detail-value">${getBudgetLabel(request.timeline.budget)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Payment Preference</div>
                        <div class="detail-value">${getPaymentPreferenceLabel(request.timeline.paymentPreference) || 'Not specified'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Content Materials</div>
                        <div class="detail-value">${getContentMaterialsLabel(request.timeline.contentMaterials)}</div>
                    </div>
                </div>
            </div>
                        ${request.additional.notes ? `
            <div class="detail-section">
                <h4><i class="fas fa-comment"></i> Additional Notes</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-value">${request.additional.notes}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${request.notes ? `
            <div class="detail-section">
                <h4><i class="fas fa-sticky-note"></i> Your Notes</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-value">${request.notes}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h4><i class="fas fa-info-circle"></i> Submission Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Submission Date</div>
                        <div class="detail-value">${formattedDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Request ID</div>
                        <div class="detail-value">${request.id}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Current Status</div>
                        <div class="detail-value">
                            <span class="status-badge status-${request.status.replace('-', '')}">${request.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = detailsHTML;
    modal.classList.add('active');
}

function showPrevRequest() {
    if (currentRequestIndex > 0) {
        currentRequestIndex--;
        viewRequest(currentRequestIndex);
    }
}

function showNextRequest() {
    if (currentRequestIndex < currentFilteredRequests.length - 1) {
        currentRequestIndex++;
        viewRequest(currentRequestIndex);
    }
}
// Request Management
function saveRequestStatus() {
    const statusSelect = document.getElementById('statusSelect');
    if (!statusSelect) return;
    
    const newStatus = statusSelect.value;
    const request = currentFilteredRequests[currentRequestIndex];
    
    if (!request) return;
    
    // Update status
    request.status = newStatus;
    
    // Update in allRequests array
    const requestIndex = allRequests.findIndex(r => r.id === request.id);
    if (requestIndex !== -1) {
        allRequests[requestIndex].status = newStatus;
    }
    
    // Save to localStorage
    localStorage.setItem('clientSubmissions', JSON.stringify(allRequests));
    
    // Update UI
    renderRequestsTable();
    updateDashboardStats();
    initializeCharts();
    
    // Show success message
    showNotification('Status updated successfully', 'success');
}

function deleteRequest(index) {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        return;
    }
    
    const request = currentFilteredRequests[index];
    if (!request) return;
    
    // Remove from allRequests
    allRequests = allRequests.filter(r => r.id !== request.id);
    
    // Save to localStorage
    localStorage.setItem('clientSubmissions', JSON.stringify(allRequests));
    
    // Update filtered requests
    currentFilteredRequests = currentFilteredRequests.filter((_, i) => i !== index);
    
    // Update UI
    renderRequestsTable();
    updateDashboardStats();
    initializeCharts();
    
    // Close modal if open
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.classList.remove('active');
    }
        // Show success message
    showNotification('Request deleted successfully', 'success');
}

function editNotes(index) {
    currentRequestIndex = index;
    const request = currentFilteredRequests[index];
    
    if (!request) return;
    
    const notesModal = document.getElementById('notesModal');
    const notesTextarea = document.getElementById('notesTextarea');
    
    if (!notesModal || !notesTextarea) return;
    
    // Load existing notes
    notesTextarea.value = request.notes || '';
    
    // Show modal
    notesModal.classList.add('active');
    notesTextarea.focus();
}

function saveNotes() {
    const notesTextarea = document.getElementById('notesTextarea');
    if (!notesTextarea) return;
    
    const notes = notesTextarea.value.trim();
    const request = currentFilteredRequests[currentRequestIndex];
    
    if (!request) return;
    
    // Update notes
    request.notes = notes;
    
    // Update in allRequests array
    const requestIndex = allRequests.findIndex(r => r.id === request.id);
    if (requestIndex !== -1) {
        allRequests[requestIndex].notes = notes;
    }
    
    // Save to localStorage
    localStorage.setItem('clientSubmissions', JSON.stringify(allRequests));
    
    // Close modal
    const notesModal = document.getElementById('notesModal');
    if (notesModal) {
        notesModal.classList.remove('active');
    }
    
    // Show success message
    showNotification('Notes saved successfully', 'success');
}

/rd Stats
// Dashboard Stats
function updateDashboardStats() {
    // Total requests
    const totalRequests = document.getElementById('totalRequests');
    if (totalRequests) {
        totalRequests.textContent = allRequests.length.toString();
    }
    
    // New requests (status = 'new')
    const newRequests = document.getElementById('newRequests');
    if (newRequests) {
        const newCount = allRequests.filter(r => r.status === 'new').length;
        newRequests.textContent = newCount.toString();
    }
    
    // Active projects (status = 'in-progress')
    const activeProjects = document.getElementById('activeProjects');
    if (activeProjects) {
        const activeCount = allRequests.filter(r => r.status === 'in-progress').length;
        activeProjects.textContent = activeCount.toString();
    }
    
    // Total revenue (from completed projects)
    const totalRevenue = document.getElementById('totalRevenue');
    if (totalRevenue) {
        const completedProjects = allRequests.filter(r => r.status === 'completed');
        const revenue = completedProjects.reduce((sum, project) => {
            // Estimate revenue based on budget range
            const budget = project.timeline.budget;
            const revenueMap = {
                '300-500': 400,
                '500-800': 650,
                '800-1200': 1000,
                '1200-2000': 1600,
                '2000+': 2500
            };
            return sum + (revenueMap[budget] || 0);
        }, 0);
        totalRevenue.textContent = `$${revenue}`;
    }
    
   // Update activity list
    updateActivityList();
}

function updateActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Get recent activities (last 5)
    const recentRequests = [...allRequests]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    activityList.innerHTML = '';
    
    recentRequests.forEach(request => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Determine icon based on status
        let icon = 'fa-inbox';
        let color = '#3b82f6';
        
        switch(request.status) {
            case 'new':
                icon = 'fa-inbox';
                color = '#3b82f6';
                break;
            case 'contacted':
                icon = 'fa-envelope';
                color = '#06b6d4';
                break;
            case 'quoted':
                icon = 'fa-file-invoice-dollar';
                color = '#f59e0b';
                break;
            case 'accepted':
                icon = 'fa-handshake';
                color = '#10b981';
                break;
            case 'in-progress':
                icon = 'fa-tasks';
                color = '#8b5cf6';
                break;
            case 'completed':
                icon = 'fa-check-circle';
                color = '#22c55e';
                break;
            default:
                icon = 'fa-info-circle';
                color = '#6b7280';
        }
        
      // Format time
        const date = new Date(request.date);
        const timeAgo = getTimeAgo(date);
        
        activityItem.innerHTML = `
            <div class="activity-icon" style="background-color: ${color}20; color: ${color}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${request.client.businessName}</div>
                <div class="activity-description">New ${getWebsiteTypeLabel(request.project.websiteType[0])} request</div>
                <div class="activity-time">${timeAgo}</div>
            </div>
            <div class="activity-status">
                <span class="status-badge status-${request.status.replace('-', '')}">${request.status}</span>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
}

// Charts
function initializeCharts() {
    const statusChartCanvas = document.getElementById('statusChart');
    if (!statusChartCanvas) return;
    
    // Destroy existing chart if it exists
    if (window.statusChart instanceof Chart) {
        window.statusChart.destroy();
    }
    
    // Count requests by status
    const statusCounts = {
        'new': 0,
        'contacted': 0,
        'quoted': 0,
        'accepted': 0,
        'in-progress': 0,
        'completed': 0,
        'archived': 0
    };
    
    allRequests.forEach(request => {
        if (statusCounts.hasOwnProperty(request.status)) {
            statusCounts[request.status]++;
        }
    });
    
    // Filter out statuses with 0 counts
    const labels = [];
    const data = [];
    const backgroundColors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(107, 114, 128, 0.8)'
    ];
    
    Object.entries(statusCounts).forEach(([status, count], index) => {
        if (count > 0) {
            labels.push(status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '));
            data.push(count);
        }
    });
    
    // Create chart
    const ctx = statusChartCanvas.getContext('2d');
    window.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Projects View
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    // Get active projects (in-progress and accepted)
    const activeProjects = allRequests.filter(r => 
        r.status === 'in-progress' || r.status === 'accepted'
    );
    
    if (activeProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h4>No active projects</h4>
                <p>When you accept client requests, they'll appear here as projects.</p>
                <button class="btn" onclick="document.querySelector('[data-view=\"requests\"]').click()">
                    <i class="fas fa-inbox"></i> View Requests
                </button>
            </div>
        `;
        return;
    }
    
    projectsGrid.innerHTML = '';
    
    activeProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        // Calculate progress
        const progress = project.progress || (project.status === 'accepted' ? 10 : 30);
        
        // Estimate due date (2 weeks from acceptance for demo)
        const dueDate = new Date(new Date(project.date).getTime() + 14 * 24 * 60 * 60 * 1000);
        const formattedDueDate = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        projectCard.innerHTML = `
            <div class="project-header">
                <div>
                    <div class="project-title">${project.client.businessName} Website</div>
                    <div class="project-client">${project.client.fullName}</div>
                </div>
                <div class="project-budget">${getBudgetLabel(project.timeline.budget)}</div>
            </div>
            
            <div class="project-details">
                <div class="project-detail">
                    <span class="project-detail-label">Timeline</span>
                    <span class="project-detail-value">${getTimelineLabel(project.timeline.timeline)}</span>
                </div>
                <div class="project-detail">
                    <span class="project-detail-label">Pages</span>
                    <span class="project-detail-value">${project.project.pages}</span>
                </div>
                <div class="project-detail">
                    <span class="project-detail-label">Due Date</span>
                    <span class="project-detail-value">${formattedDueDate}</span>
                </div>
            </div>
            
            <div class="project-progress">
                <div class="progress-label">
                    <span>Project Progress</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="project-actions">
                <button class="btn btn-sm" onclick="viewRequest(${allRequests.findIndex(r => r.id === project.id)})">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-sm btn-primary" onclick="updateProjectProgress('${project.id}')">
                    <i class="fas fa-edit"></i> Update Progress
                </button>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
}

function updateProjectProgress(projectId) {
    const projectIndex = allRequests.findIndex(r => r.id === projectId);
    if (projectIndex === -1) return;
    
    const newProgress = prompt('Enter new progress percentage (0-100):', allRequests[projectIndex].progress || '0');
    
    if (newProgress !== null) {
        const progress = parseInt(newProgress);
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            allRequests[projectIndex].progress = progress;
            
            // Update status if progress is 100%
            if (progress === 100) {
                allRequests[projectIndex].status = 'completed';
            }
            
            // Save to localStorage
            localStorage.setItem('clientSubmissions', JSON.stringify(allRequests));
            
            // Update UI
            loadProjects();
            updateDashboardStats();
            initializeCharts();
            
            showNotification('Progress updated successfully', 'success');
        } else {
            alert('Please enter a valid number between 0 and 100.');
        }
    }
}

// Clients View
function loadClients() {
    const clientsList = document.getElementById('clientsList');
    if (!clientsList) return;
    
    // Group requests by client email
    const clients = {};
    
    allRequests.forEach(request => {
        const email = request.client.email;
        if (!clients[email]) {
            clients[email] = {
                name: request.client.fullName,
                business: request.client.businessName,
                email: email,
                phone: request.client.phone,
                projects: [],
                totalRevenue: 0
            };
        }
        
        clients[email].projects.push(request);
        
        // Calculate revenue for completed projects
        if (request.status === 'completed') {
            const budget = request.timeline.budget;
            const revenueMap = {
                '300-500': 400,
                '500-800': 650,
                '800-1200': 1000,
                '1200-2000': 1600,
                '2000+': 2500
            };
            clients[email].totalRevenue += revenueMap[budget] || 0;
        }
    });
    
    const clientArray = Object.values(clients);
    
    if (clientArray.length === 0) {
        clientsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>No clients yet</h4>
                <p>When clients submit requests, they'll appear here.</p>
            </div>
        `;
        return;
    }
    
    clientsList.innerHTML = '';
    
    clientArray.forEach(client => {
        const clientItem = document.createElement('div');
        clientItem.className = 'client-item';
        
        // Get initials for avatar
        const initials = client.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        clientItem.innerHTML = `
            <div class="client-avatar">
                ${initials}
            </div>
            <div class="client-info">
                <div class="client-name">${client.name}</div>
                <div class="client-business">${client.business}</div>
                <div class="client-email">${client.email}</div>
                <div class="client-projects">${client.projects.length} project${client.projects.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="client-stats">
                <div class="client-revenue">$${client.totalRevenue}</div>
                <div class="client-since">Total revenue</div>
            </div>
        `;
        
        clientsList.appendChild(clientItem);
    });
}

// Export/Import Data
function exportData() {
    const dataToExport = currentFilteredRequests.map(request => ({
        'ID': request.id,
        'Date': new Date(request.date).toLocaleDateString(),
        'Status': request.status,
        'Client Name': request.client.fullName,
        'Client Email': request.client.email,
        'Business Name': request.client.businessName,
        'Business Type': getBusinessTypeLabel(request.client.businessType),
        'Website Type': request.project.websiteType.map(type => getWebsiteTypeLabel(type)).join(', '),
        'Pages': request.project.pages,
        'Budget': getBudgetLabel(request.timeline.budget),
        'Timeline': getTimelineLabel(request.timeline.timeline),
        'Your Notes': request.notes || ''
    }));
    
    exportToCSV(dataToExport, `client-requests-${new Date().toISOString().split('T')[0]}.csv`);
}

function exportAllData() {
    const dataToExport = allRequests.map(request => ({
        'ID': request.id,
        'Date': new Date(request.date).toISOString(),
        'Status': request.status,
        'Client Name': request.client.fullName,
        'Client Email': request.client.email,
        'Client Phone': request.client.phone || '',
        'Business Name': request.client.businessName,
        'Business Type': request.client.businessType,
        'Business Description': request.client.businessDescription,
        'Website Type': request.project.websiteType.join(','),
        'Pages': request.project.pages,
        'Features': request.project.features.join(','),
        'Specific Features': request.project.specificFeatures,
        'Color Preference': request.design.colorPreference || '',
        'Design Style': request.design.designStyle,
        'Website Examples': request.design.websiteExamples || '',
        'Design Notes': request.design.designNotes || '',
        'Timeline': request.timeline.timeline,
        'Budget': request.timeline.budget,
        'Payment Preference': request.timeline.paymentPreference || '',
        'Content Materials': request.timeline.contentMaterials,
        'Additional Notes': request.additional.notes || '',
        'Your Notes': request.notes || '',
        'Progress': request.progress || 0
    }));
    
    exportToCSV(dataToExport, `all-client-data-${new Date().toISOString().split('T')[0]}.csv`);
}

function exportToCSV(data, filename) {
    if (data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    // Convert data to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma or quote
                const escaped = String(value || '').replace(/"/g, '""');
                return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
            }).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showNotification('Data exported successfully', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                let importedData;
                
                if (file.name.endsWith('.json')) {
                    importedData = JSON.parse(content);
                } else {
                    // Parse CSV
                    const lines = content.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    
                    importedData = lines.slice(1).filter(line => line.trim()).map(line => {
                        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        return row;
                    });
                }
                
                // Validate and merge data
                const newRequests = importedData.map(item => {
                    // Create a request object from imported data
                    // This is a simplified version - you might need to adjust based on your CSV structure
                    return {
                        id: item.ID || Date.now().toString(),
                        date: item.Date || new Date().toISOString(),
                        status: item.Status || 'new',
                        client: {
                            fullName: item['Client Name'] || '',
                            email: item['Client Email'] || '',
                            phone: item['Client Phone'] || '',
                            businessName: item['Business Name'] || '',
                            businessType: item['Business Type'] || 'other',
                            businessDescription: item['Business Description'] || ''
                        },
                        project: {
                            websiteType: (item['Website Type'] || '').split(',').filter(Boolean),
                            pages: parseInt(item.Pages) || 5,
                            features: (item.Features || '').split(',').filter(Boolean),
                            specificFeatures: item['Specific Features'] || ''
                        },
                        design: {
                            colorPreference: item['Color Preference'] || '',
                            websiteExamples: item['Website Examples'] || '',
                            designStyle: item['Design Style'] || '',
                            designNotes: item['Design Notes'] || ''
                        },
                        timeline: {
                            timeline: item.Timeline || '',
                            budget: item.Budget || '',
                            paymentPreference: item['Payment Preference'] || '',
                            contentMaterials: item['Content Materials'] || '',
                            assets: []
                        },
                        additional: {
                            notes: item['Additional Notes'] || ''
                        },
                        notes: item['Your Notes'] || '',
                        progress: parseInt(item.Progress) || 0
                    };
                });
                
                // Merge with existing data
                allRequests = [...allRequests, ...newRequests];
                
                // Remove duplicates based on ID
                const uniqueIds = new Set();
                allRequests = allRequests.filter(request => {
                    if (uniqueIds.has(request.id)) {
                        return false;
                    }
                    uniqueIds.add(request.id);
                    return true;
                });
                
                // Save to localStorage
                localStorage.setItem('clientSubmissions', JSON.stringify(allRequests));
                
                // Update UI
                loadRequests();
                updateDashboardStats();
                initializeCharts();
                
                showNotification(`${newRequests.length} records imported successfully`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                showNotification('Error importing data. Please check file format.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            border-left: 4px solid var(--primary);
        }
        
        .notification-success {
            border-left-color: var(--secondary);
        }
        
        .notification-error {
            border-left-color: var(--danger);
        }
        
        .notification-warning {
            border-left-color: var(--warning);
        }
        
        .notification i {
            font-size: 20px;
        }
        
        .notification-success i {
            color: var(--secondary);
        }
        
        .notification-error i {
            color: var(--danger);
        }
        
        .notification-warning i {
            color: var(--warning);
        }
        
        .notification span {
            flex: 1;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 20px;
            color: var(--gray);
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: var(--transition);
        }
        
        .notification-close:hover {
            background: var(--gray-light);
            color: var(--dark);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Add close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Helper functions from form.js (redefined for dashboard)
function getBusinessTypeLabel(value) {
    const labels = {
        'personal': 'Personal/Blog',
        'small-business': 'Small Business',
        'restaurant': 'Restaurant/Food',
        'retail': 'Retail/E-commerce',
        'professional': 'Professional Services',
        'nonprofit': 'Non-profit/Organization',
        'portfolio': 'Portfolio/Showcase',
        'other': 'Other'
    };
    return labels[value] || value;
}

function getWebsiteTypeLabel(value) {
    if (Array.isArray(value)) {
        value = value[0];
    }
    const labels = {
        'informational': 'Informational/Brochure Site',
        'portfolio': 'Portfolio/Showcase Site',
        'blog': 'Blog/Content Site',
        'ecommerce': 'E-commerce/Online Store',
        'booking': 'Booking/Appointment System',
        'other': 'Other'
    };
    return labels[value] || value;
}

function getFeatureLabel(value) {
    const labels = {
        'responsive': 'Mobile Responsive',
        'contact-form': 'Contact Form',
        'seo': 'SEO Optimization',
        'analytics': 'Google Analytics',
        'social-media': 'Social Media Integration',
        'blog': 'Blog/News Section',
        'gallery': 'Photo/Video Gallery',
        'multilingual': 'Multilingual Support'
    };
    return labels[value] || value;
}

function getDesignStyleLabel(value) {
    const labels = {
        'modern': 'Modern & Minimal',
        'corporate': 'Corporate & Professional',
        'creative': 'Creative & Bold',
        'elegant': 'Elegant & Luxurious'
    };
    return labels[value] || value;
}

function getTimelineLabel(value) {
    const labels = {
        'asap': 'ASAP (1-2 weeks)',
        '1-month': 'Within 1 month',
        '1-3-months': '1-3 months',
        'flexible': 'Flexible/No rush'
    };
    return labels[value] || value;
}

function getBudgetLabel(value) {
    const labels = {
        '300-500': '$300 - $500',
        '500-800': '$500 - $800',
        '800-1200': '$800 - $1,200',
        '1200-2000': '$1,200 - $2,000',
        '2000+': '$2,000+',
        'not-sure': 'Not sure/Need quote'
    };
    return labels[value] || value;
}

function getContentMaterialsLabel(value) {
    const labels = {
        'all-ready': 'All content ready',
        'partial': 'Some materials ready',
        'none': 'Need help creating content'
    };
    return labels[value] || value;
}

function getPaymentPreferenceLabel(value) {
    const labels = {
        '50-50': '50% upfront, 50% on completion',
        'milestones': 'Milestone-based payments',
        'full-on-completion': 'Full payment on completion'
    };
    return labels[value] || value;
}

// Additional Features (to be implemented)
function addProject() {
    showNotification('This feature will be implemented in the next version', 'info');
}

function showSettings() {
    showNotification('Settings panel will be implemented in the next version', 'info');
}

// Make functions available globally
window.viewRequest = viewRequest;
window.editNotes = editNotes;
window.deleteRequest = deleteRequest;
window.changePage = changePage;