// DOM Elements
const form = document.getElementById('clientForm');
const steps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.step');
const progressFill = document.getElementById('progressFill');
const nextButtons = document.querySelectorAll('.btn-next');
const prevButtons = document.querySelectorAll('.btn-prev');
const successMessage = document.getElementById('successMessage');

// Form Data Storage
let formData = {
    client: {},
    project: {},
    design: {},
    timeline: {},
    additional: {}
};

// Initialize Form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setupCharacterCounters();
    setupFileUpload();
    setupColorSelection();
    setupRangeSlider();
});

function initializeForm() {
    // Show first step
    showStep(1);
    updateProgress(1);
    
    // Initialize form data with default values
    formData = {
        client: {
            fullName: '',
            email: '',
            phone: '',
            businessName: '',
            businessType: '',
            businessDescription: ''
        },
        project: {
            websiteType: [],
            pages: 5,
            features: [],
            specificFeatures: ''
        },
        design: {
            colorPreference: '',
            websiteExamples: '',
            designStyle: '',
            designNotes: ''
        },
        timeline: {
            timeline: '',
            budget: '',
            paymentPreference: '',
            contentMaterials: '',
            assets: []
        },
        additional: {
            notes: ''
        }
    };
}

function setupEventListeners() {
    // Next buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            if (validateCurrentStep()) {
                saveStepData();
                showStep(nextStep);
                updateProgress(nextStep);
            }
        });
    });
    
    // Previous buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            showStep(prevStep);
            updateProgress(prevStep);
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateStep(5) && document.getElementById('terms').checked) {
            // Update review before submitting
            updateReview();
            
            // Prepare form data for submission
            prepareFormData();
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Submit to Formspree
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showSuccessMessage();
                    // Store in localStorage for dashboard (optional)
                    saveToLocalStorage();
                    // Reset form
                    form.reset();
                    initializeForm();
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                alert('Sorry, there was an error submitting your form. Please try again.');
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
                submitBtn.disabled = false;
            });
        } else {
            alert('Please accept the terms and conditions before submitting.');
        }
    });
}

function setupCharacterCounters() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const charCount = textarea.parentElement.querySelector('.char-count');
        if (charCount) {
            textarea.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = `${count}/200 characters`;
                
                if (count > 200) {
                    charCount.style.color = '#ef4444';
                } else if (count > 180) {
                    charCount.style.color = '#f59e0b';
                } else {
                    charCount.style.color = '#6b7280';
                }
            });
        }
    });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('assets');
    const fileList = document.getElementById('fileList');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        uploadArea.style.borderColor = '#3b82f6';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = '';
        uploadArea.style.borderColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
        uploadArea.style.borderColor = '';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFiles(fileInput.files);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });
    
    function handleFiles(files) {
        fileList.innerHTML = '';
        formData.timeline.assets = [];
        
        for (let i = 0; i < Math.min(files.length, 5); i++) {
            const file = files[i];
            
            // Check file size (max 10MB total)
            if (file.size > 10 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                continue;
            }
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div>
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                    <small>(${(file.size / 1024).toFixed(1)} KB)</small>
                </div>
                <div class="file-remove" data-index="${i}">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            fileList.appendChild(fileItem);
            formData.timeline.assets.push(file);
        }
        
        if (fileList.children.length > 0) {
            fileList.style.display = 'block';
        }
        
        // Add remove event listeners
        document.querySelectorAll('.file-remove').forEach(removeBtn => {
            removeBtn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                formData.timeline.assets.splice(index, 1);
                updateFileDisplay();
            });
        });
    }
    
    function updateFileDisplay() {
        fileList.innerHTML = '';
        
        if (formData.timeline.assets.length === 0) {
            fileList.style.display = 'none';
            return;
        }
        
        formData.timeline.assets.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div>
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                    <small>(${(file.size / 1024).toFixed(1)} KB)</small>
                </div>
                <div class="file-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
        
        fileList.style.display = 'block';
        
        // Re-add event listeners
        document.querySelectorAll('.file-remove').forEach(removeBtn => {
            removeBtn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                formData.timeline.assets.splice(index, 1);
                updateFileDisplay();
            });
        });
    }
}

function setupColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    const colorInput = document.getElementById('colorPreference');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update hidden input
            colorInput.value = color;
            
            // Update form data
            formData.design.colorPreference = color;
        });
    });
}

function setupRangeSlider() {
    const pagesSlider = document.getElementById('pages');
    const pageValue = document.getElementById('pageValue');
    
    if (pagesSlider) {
        pagesSlider.addEventListener('input', function() {
            pageValue.textContent = this.value;
            formData.project.pages = parseInt(this.value);
        });
    }
}

function showStep(stepNumber) {
    // Hide all steps
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStep = document.getElementById(`step${stepNumber}`);
    if (currentStep) {
        currentStep.classList.add('active');
        
        // Scroll to top of form
        currentStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
        const step = index + 1;
        
        indicator.classList.remove('active', 'completed');
        
        if (step === stepNumber) {
            indicator.classList.add('active');
        } else if (step < stepNumber) {
            indicator.classList.add('completed');
        }
    });
}

function updateProgress(currentStep) {
    const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
    progressFill.style.width = `${progress}%`;
}

function validateCurrentStep() {
    const currentStep = document.querySelector('.form-step.active');
    const stepNumber = parseInt(currentStep.id.replace('step', ''));
    return validateStep(stepNumber);
}

function validateStep(stepNumber) {
    let isValid = true;
    
    switch(stepNumber) {
        case 1:
            // Validate client info
            if (!validateRequired('fullName')) isValid = false;
            if (!validateEmail('email')) isValid = false;
            if (!validateRequired('businessName')) isValid = false;
            if (!validateRequired('businessType')) isValid = false;
            if (!validateRequired('businessDescription')) isValid = false;
            break;
            
        case 2:
            // Validate project details
            if (!validateCheckboxGroup('websiteType')) {
                alert('Please select at least one website type.');
                isValid = false;
            }
            if (!validateCheckboxGroup('features')) {
                alert('Please select at least one required feature.');
                isValid = false;
            }
            if (!validateRequired('specificFeatures')) isValid = false;
            break;
            
        case 3:
            // Validate design preferences
            if (!validateRadioGroup('designStyle')) {
                alert('Please select a design style.');
                isValid = false;
            }
            break;
            
        case 4:
            // Validate timeline & budget
            if (!validateRequired('timeline')) isValid = false;
            if (!validateRequired('budget')) isValid = false;
            if (!validateRequired('contentMaterials')) isValid = false;
            break;
    }
    
    return isValid;
}

function validateRequired(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error') || field.parentElement.querySelector('.error-message');
    
    if (!field || !field.value.trim()) {
        if (errorElement) {
            errorElement.textContent = 'This field is required';
            errorElement.style.display = 'block';
        }
        field.style.borderColor = '#ef4444';
        return false;
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    field.style.borderColor = '#10b981';
    return true;
}

function validateEmail(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error') || field.parentElement.querySelector('.error-message');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!field || !emailRegex.test(field.value.trim())) {
        if (errorElement) {
            errorElement.textContent = 'Please enter a valid email address';
            errorElement.style.display = 'block';
        }
        field.style.borderColor = '#ef4444';
        return false;
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    field.style.borderColor = '#10b981';
    return true;
}

function validateCheckboxGroup(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return checkboxes.length > 0;
}

function validateRadioGroup(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return !!radio;
}

function saveStepData() {
    const currentStep = document.querySelector('.form-step.active');
    const stepNumber = parseInt(currentStep.id.replace('step', ''));
    
    switch(stepNumber) {
        case 1:
            formData.client = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                businessName: document.getElementById('businessName').value,
                businessType: document.getElementById('businessType').value,
                businessDescription: document.getElementById('businessDescription').value
            };
            break;
            
        case 2:
            const websiteTypes = [];
            document.querySelectorAll('input[name="websiteType"]:checked').forEach(cb => {
                websiteTypes.push(cb.value);
            });
            
            const features = [];
            document.querySelectorAll('input[name="features"]:checked').forEach(cb => {
                features.push(cb.value);
            });
            
            formData.project = {
                websiteType: websiteTypes,
                pages: parseInt(document.getElementById('pages').value),
                features: features,
                specificFeatures: document.getElementById('specificFeatures').value
            };
            break;
            
        case 3:
            formData.design = {
                colorPreference: document.getElementById('colorPreference').value,
                websiteExamples: document.getElementById('websiteExamples').value,
                designStyle: document.querySelector('input[name="designStyle"]:checked')?.value || '',
                designNotes: document.getElementById('designNotes').value
            };
            break;
            
        case 4:
            const paymentPreference = document.querySelector('input[name="paymentPreference"]:checked')?.value || '';
            
            formData.timeline = {
                timeline: document.getElementById('timeline').value,
                budget: document.getElementById('budget').value,
                paymentPreference: paymentPreference,
                contentMaterials: document.getElementById('contentMaterials').value,
                assets: formData.timeline.assets // Already saved during file upload
            };
            break;
    }
}

function updateReview() {
    // Client Information
    const reviewClient = document.getElementById('reviewClient');
    reviewClient.innerHTML = `
        <div class="review-item">
            <div class="review-label">Full Name</div>
            <div class="review-value">${formData.client.fullName}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Email</div>
            <div class="review-value">${formData.client.email}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Business Name</div>
            <div class="review-value">${formData.client.businessName}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Business Type</div>
            <div class="review-value">${getBusinessTypeLabel(formData.client.businessType)}</div>
        </div>
    `;
    
    // Project Details
    const reviewProject = document.getElementById('reviewProject');
    reviewProject.innerHTML = `
        <div class="review-item">
            <div class="review-label">Website Type</div>
            <div class="review-value">${formData.project.websiteType.map(type => getWebsiteTypeLabel(type)).join(', ')}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Number of Pages</div>
            <div class="review-value">${formData.project.pages}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Required Features</div>
            <div class="review-value">${formData.project.features.map(feature => getFeatureLabel(feature)).join(', ')}</div>
        </div>
    `;
    
    // Design Preferences
    const reviewDesign = document.getElementById('reviewDesign');
    reviewDesign.innerHTML = `
        <div class="review-item">
            <div class="review-label">Color Preference</div>
            <div class="review-value">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${formData.design.colorPreference || '#ccc'}"></div>
                    ${formData.design.colorPreference || 'Not specified'}
                </div>
            </div>
        </div>
        <div class="review-item">
            <div class="review-label">Design Style</div>
            <div class="review-value">${getDesignStyleLabel(formData.design.designStyle)}</div>
        </div>
        ${formData.design.websiteExamples ? `
        <div class="review-item">
            <div class="review-label">Website Examples</div>
            <div class="review-value">${formData.design.websiteExamples}</div>
        </div>
        ` : ''}
    `;
        // Timeline & Budget
    const reviewTimeline = document.getElementById('reviewTimeline');
    reviewTimeline.innerHTML = `
        <div class="review-item">
            <div class="review-label">Timeline</div>
            <div class="review-value">${getTimelineLabel(formData.timeline.timeline)}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Budget Range</div>
            <div class="review-value">${getBudgetLabel(formData.timeline.budget)}</div>
        </div>
        <div class="review-item">
            <div class="review-label">Content Materials</div>
            <div class="review-value">${getContentMaterialsLabel(formData.timeline.contentMaterials)}</div>
        </div>
        ${formData.timeline.paymentPreference ? `
        <div class="review-item">
            <div class="review-label">Payment Preference</div>
            <div class="review-value">${getPaymentPreferenceLabel(formData.timeline.paymentPreference)}</div>
        </div>
        ` : ''}
    `;
}

// Helper functions for labels
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

function prepareFormData() {
    // This function prepares the form data for submission
    // Formspree will handle the actual submission
    // We just need to ensure all data is in the form
    
    // Add hidden fields for better email formatting
    const reviewData = `
CLIENT INFORMATION:
Name: ${formData.client.fullName}
Email: ${formData.client.email}
Phone: ${formData.client.phone || 'Not provided'}
Business: ${formData.client.businessName}
Business Type: ${getBusinessTypeLabel(formData.client.businessType)}
Description: ${formData.client.businessDescription}

PROJECT DETAILS:
Website Type: ${formData.project.websiteType.map(type => getWebsiteTypeLabel(type)).join(', ')}
Number of Pages: ${formData.project.pages}
Features: ${formData.project.features.map(feature => getFeatureLabel(feature)).join(', ')}
Specific Requirements: ${formData.project.specificFeatures}

DESIGN PREFERENCES:
Color Preference: ${formData.design.colorPreference}
Design Style: ${getDesignStyleLabel(formData.design.designStyle)}
Website Examples: ${formData.design.websiteExamples || 'Not provided'}
Design Notes: ${formData.design.designNotes || 'Not provided'}

TIMELINE & BUDGET:
Timeline: ${getTimelineLabel(formData.timeline.timeline)}
Budget: ${getBudgetLabel(formData.timeline.budget)}
Payment Preference: ${getPaymentPreferenceLabel(formData.timeline.paymentPreference) || 'Not specified'}
Content Materials: ${getContentMaterialsLabel(formData.timeline.contentMaterials)}
Files Uploaded: ${formData.timeline.assets.length} file(s)

ADDITIONAL NOTES:
${document.getElementById('additionalNotes').value || 'None'}
    `.trim();
    
    // Create a hidden textarea for the formatted data
    let reviewField = document.getElementById('formattedReview');
    if (!reviewField) {
        reviewField = document.createElement('textarea');
        reviewField.id = 'formattedReview';
        reviewField.name = 'formattedReview';
        reviewField.style.display = 'none';
        form.appendChild(reviewField);
    }
    reviewField.value = reviewData;
}

function saveToLocalStorage() {
    // Save submission to localStorage for dashboard display
    const submissions = JSON.parse(localStorage.getItem('clientSubmissions') || '[]');
    
    const submission = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'new',
        ...formData,
        additionalNotes: document.getElementById('additionalNotes').value
    };
    
    submissions.unshift(submission); // Add to beginning
    localStorage.setItem('clientSubmissions', JSON.stringify(submissions));
}

function showSuccessMessage() {
    // Hide form and show success message
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
        e.preventDefault();
        
        const activeStep = document.querySelector('.form-step.active');
        const stepNumber = parseInt(activeStep.id.replace('step', ''));
        
        if (stepNumber < 5) {
            const nextButton = activeStep.querySelector('.btn-next');
            if (nextButton) nextButton.click();
        }
    }
});
// Add form auto-save (every 30 seconds)
setInterval(() => {
    const activeStep = document.querySelector('.form-step.active');
    if (activeStep) {
        const stepNumber = parseInt(activeStep.id.replace('step', ''));
        saveStepData();
        localStorage.setItem('formDataDraft', JSON.stringify(formData));
        localStorage.setItem('currentStep', stepNumber.toString());
    }
}, 30000);

// Load draft on page load
window.addEventListener('load', () => {
    const savedStep = localStorage.getItem('currentStep');
    const savedData = localStorage.getItem('formDataDraft');
    
    if (savedStep && savedData) {
        if (confirm('You have a saved draft. Would you like to continue where you left off?')) {
            formData = JSON.parse(savedData);
            showStep(parseInt(savedStep));
            updateProgress(parseInt(savedStep));
            populateFormFromDraft();
        } else {
            localStorage.removeItem('formDataDraft');
            localStorage.removeItem('currentStep');
        }
    }
});

function populateFormFromDraft() {
    // Populate form fields from saved draft
    document.getElementById('fullName').value = formData.client.fullName || '';
    document.getElementById('email').value = formData.client.email || '';
    document.getElementById('phone').value = formData.client.phone || '';
    document.getElementById('businessName').value = formData.client.businessName || '';
    document.getElementById('businessType').value = formData.client.businessType || '';
    document.getElementById('businessDescription').value = formData.client.businessDescription || '';
    
    // Populate checkboxes
    formData.project.websiteType?.forEach(type => {
        const checkbox = document.querySelector(`input[name="websiteType"][value="${type}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    formData.project.features?.forEach(feature => {
        const checkbox = document.querySelector(`input[name="features"][value="${feature}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Populate other fields
    document.getElementById('pages').value = formData.project.pages || 5;
    document.getElementById('pageValue').textContent = formData.project.pages || 5;
    document.getElementById('specificFeatures').value = formData.project.specificFeatures || '';
    
    // Color preference
    if (formData.design.colorPreference) {
        document.getElementById('colorPreference').value = formData.design.colorPreference;
        const colorOption = document.querySelector(`.color-option[data-color="${formData.design.colorPreference}"]`);
        if (colorOption) colorOption.classList.add('selected');
    }
    
    document.getElementById('websiteExamples').value = formData.design.websiteExamples || '';
    
    // Radio buttons
    if (formData.design.designStyle) {
        const radio = document.querySelector(`input[name="designStyle"][value="${formData.design.designStyle}"]`);
        if (radio) radio.checked = true;
    }
    
    document.getElementById('designNotes').value = formData.design.designNotes || '';
    document.getElementById('timeline').value = formData.timeline.timeline || '';
    document.getElementById('budget').value = formData.timeline.budget || '';
    document.getElementById('contentMaterials').value = formData.timeline.contentMaterials || '';
    
    // Payment preference
    if (formData.timeline.paymentPreference) {
        const radio = document.querySelector(`input[name="paymentPreference"][value="${formData.timeline.paymentPreference}"]`);
        if (radio) radio.checked = true;
    }
    
    document.getElementById('additionalNotes').value = formData.additional.notes || '';
}
// Add copy functionality for contact info
function setupContactCopy() {
    // This can be called after showing success message
    // For now, we'll add event listeners for WhatsApp and Email
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contact-value') || 
            e.target.closest('.contact-value')) {
            const contactElement = e.target.classList.contains('contact-value') ? 
                e.target : e.target.closest('.contact-value');
            
            if (contactElement) {
                const text = contactElement.textContent.trim();
                
                // Create temporary element for copying
                const tempInput = document.createElement('input');
                tempInput.value = text;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // Show copied notification
                showCopiedNotification(text);
            }
        }
    });
}

function showCopiedNotification(text) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.copy-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Copied to clipboard: ${text}</span>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#copy-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'copy-notification-styles';
        style.textContent = `
            .copy-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--secondary);
                color: white;
                padding: 12px 20px;
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize copy functionality when form loads
document.addEventListener('DOMContentLoaded', function() {
    setupContactCopy();
});