// script.js - JavaScript for AeroMax Aircraft Sales Website

// Aircraft Inquiry Function
function inquireAbout(aircraftName) {
    // Redirect to contact page with aircraft info
    const params = new URLSearchParams();
    params.set('aircraft', aircraftName);
    window.location.href = `contact.html?${params.toString()}`;
}

// Pre-fill contact form based on URL parameters
function prefillContactForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const aircraft = urlParams.get('aircraft');
    
    if (aircraft) {
        // Pre-fill the interest field
        const interestSelect = document.getElementById('interest');
        if (interestSelect) {
            interestSelect.value = 'purchasing';
        }
        
        // Pre-fill message with aircraft name
        const messageTextarea = document.getElementById('message');
        if (messageTextarea) {
            messageTextarea.value = `I am interested in learning more about the ${aircraft}. Please contact me with additional information.`;
        }
    }
}

// Financing Calculator
function calculatePayment() {
    const price = parseFloat(document.getElementById('aircraft-price').value) || 0;
    const downPaymentPercent = parseFloat(document.getElementById('down-payment').value) || 20;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 5.5;
    const loanTermYears = parseFloat(document.getElementById('loan-term').value) || 10;
    
    // Calculate loan amount
    const downPayment = price * (downPaymentPercent / 100);
    const loanAmount = price - downPayment;
    
    // Calculate monthly payment using loan formula
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                       (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
        monthlyPayment = loanAmount / numberOfPayments;
    }
    
    // Display results
    const resultDiv = document.getElementById('payment-result');
    if (price > 0) {
        resultDiv.innerHTML = `
            <div style="background: #e8f5e9; padding: 1rem; border-radius: 5px; border: 1px solid #4CAF50;">
                <p><strong>Loan Amount:</strong> $${loanAmount.toLocaleString()}</p>
                <p><strong>Down Payment:</strong> $${downPayment.toLocaleString()}</p>
                <p><strong>Monthly Payment:</strong> <span style="color: #4CAF50; font-size: 1.3em;">$${monthlyPayment.toLocaleString()}</span></p>
                <p style="font-size: 0.9em; color: #666; margin-top: 0.5rem;">
                    *Estimate only. Actual rates and terms may vary based on creditworthiness and other factors.
                </p>
            </div>
        `;
    } else {
        resultDiv.innerHTML = '<p style="color: red;">Please enter a valid aircraft price.</p>';
    }
}

// Contact Form Submission
function submitForm(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Validate required fields
    if (!data.name || !data.email) {
        showFormStatus('error', 'Please fill in all required fields.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFormStatus('error', 'Please enter a valid email address.');
        return;
    }
    
    // Show loading state
    showFormStatus('loading', 'Sending your message...');
    
    // Simulate form submission (in real implementation, this would send to server)
    setTimeout(() => {
        // Show success message
        showFormStatus('success', `
            <h3>Thank you, ${data.name}!</h3>
            <p>Your message has been received. One of our aviation experts will contact you within 24 hours to discuss your needs.</p>
            <p>In the meantime, feel free to browse our aircraft inventory or call us at +1 (555) 123-AERO for immediate assistance.</p>
        `);
        
        // Reset form
        document.getElementById('contact-form').reset();
        
        // Scroll to success message
        document.getElementById('form-status').scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// Show form status messages
function showFormStatus(type, message) {
    const statusDiv = document.getElementById('form-status');
    if (!statusDiv) return;
    
    let className = '';
    switch(type) {
        case 'loading':
            className = 'loading';
            break;
        case 'success':
            className = 'success';
            break;
        case 'error':
            className = 'error';
            break;
    }
    
    statusDiv.innerHTML = `<div class="${className}">${message}</div>`;
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    if (navLinks && hamburger) {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// Smooth Scrolling for Internal Links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Auto-calculate financing on input change
function initFinancingCalculator() {
    const calculatorInputs = ['aircraft-price', 'down-payment', 'interest-rate', 'loan-term'];
    calculatorInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                // Auto-calculate if all fields have values
                const allInputs = calculatorInputs.map(id => {
                    const el = document.getElementById(id);
                    return el ? el.value : '';
                });
                if (allInputs.every(value => value !== '')) {
                    calculatePayment();
                }
            });
        }
    });
}

// Format phone number input
function formatPhoneNumber(input) {
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    
    input.value = value;
}

// Initialize phone number formatting
function initPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
}

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone) || phone === '';
}

// Real-time form validation
function initFormValidation() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const nameInput = document.getElementById('name');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#ff4444';
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.style.borderColor = '#ddd';
                hideFieldError(this);
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.style.borderColor = '#ff4444';
                showFieldError(this, 'Please enter a valid phone number');
            } else {
                this.style.borderColor = '#ddd';
                hideFieldError(this);
            }
        });
    }
    
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#ff4444';
                showFieldError(this, 'Name is required');
            } else {
                this.style.borderColor = '#ddd';
                hideFieldError(this);
            }
        });
    }
}

function showFieldError(field, message) {
    hideFieldError(field); // Remove existing error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#ff4444';
    errorDiv.style.fontSize = '0.9em';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Navigation highlighting (for current page)
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.style.color = '#4CAF50';
            link.style.fontWeight = 'bold';
        }
    });
}

// Lazy loading for images (performance optimization)
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Animation on scroll (optional enhancement)
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .section');
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        elementObserver.observe(el);
    });
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    prefillContactForm();
    initSmoothScrolling();
    initFinancingCalculator();
    initPhoneFormatting();
    initFormValidation();
    highlightCurrentPage();
    
    // Performance enhancements
    initLazyLoading();
    
    // Optional visual enhancements
    // initScrollAnimations(); // Uncomment if you want scroll animations
    
    // Set up event listeners for any existing forms
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', submitForm);
    }
    
    // Set up calculator button if it exists
    const calcButton = document.querySelector('button[onclick="calculatePayment()"]');
    if (calcButton) {
        calcButton.addEventListener('click', calculatePayment);
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Close mobile menu if window is resized to desktop size
    if (window.innerWidth > 768) {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        if (navLinks) navLinks.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    }
});

// Export functions for global access (if needed)
window.AeroMax = {
    inquireAbout,
    calculatePayment,
    submitForm,
    toggleMobileMenu,
    formatPhoneNumber
};