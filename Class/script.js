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

//Redirect to Inquire page
function inquireAbout(aircraftName) {
    window.location.href = `contact.html?aircraft=${encodeURIComponent(aircraftName)}`;
}

//Inquire Listener
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const aircraft = urlParams.get('aircraft');
    
    if (aircraft) {
        document.getElementById('subject').value = 'aircraft-inquiry';
        document.getElementById('message').value = `I'm interested in the ${decodeURIComponent(aircraft)}. Please send me more information.`;
    }
});

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