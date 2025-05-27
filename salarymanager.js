// salarymanager.js
document.addEventListener('DOMContentLoaded', function() {
  const salaryInput = document.getElementById('salary');
  const addCategoryBtn = document.getElementById('add-category');
  const categoriesContainer = document.getElementById('categories-container');
  const categoryTemplate = document.getElementById('category-template');
  const totalAllocatedElem = document.getElementById('total-allocated');
  const remainingLabelElem = document.getElementById('remaining-label');
  const remainingAmountElem = document.getElementById('remaining-amount');
  
  let categoryCounter = 0;
  
  // Initialize with default categories
  addCategory('Savings', 'percentage', 20);
  addCategory('Rent', 'fixed', 5000);
  addCategory('Bills', 'fixed', 2000);
  
  // Add new category button handler
  addCategoryBtn.addEventListener('click', function() {
    addCategory('New Category', 'percentage', 10);
  });
  
  // Salary input change handler
  salaryInput.addEventListener('input', updateCalculations);
  
  function addCategory(name, type, value) {
    categoryCounter++;
    const id = `category-${categoryCounter}`;
    
    // Clone the template
    const categoryNode = document.importNode(categoryTemplate.content, true);
    const categoryDiv = categoryNode.querySelector('.category');
    categoryDiv.setAttribute('data-id', id);
    categoryDiv.setAttribute('data-type', type);
    
    // Set category name
    const categoryLabel = categoryDiv.querySelector('.category-label');
    categoryLabel.textContent = name;
    
    // Set value
    const valueInput = categoryDiv.querySelector('.category-value');
    valueInput.value = value;
    
    // Show the correct icon
    if (type === 'percentage') {
      categoryDiv.querySelector('.icon-percent').classList.remove('hidden');
      categoryDiv.querySelector('.icon-dollar').classList.add('hidden');
    } else {
      categoryDiv.querySelector('.icon-percent').classList.add('hidden');
      categoryDiv.querySelector('.icon-dollar').classList.remove('hidden');
    }
    
    // Setup event handlers
    setupCategoryEvents(categoryDiv);
    
    // Add to the DOM
    categoriesContainer.appendChild(categoryDiv);
    
    // Update calculations
    updateCalculations();
  }
  
  function setupCategoryEvents(categoryDiv) {
    const id = categoryDiv.getAttribute('data-id');
    
    // Delete button
    const deleteBtn = categoryDiv.querySelector('.delete-category');
    deleteBtn.addEventListener('click', function() {
      categoryDiv.remove();
      updateCalculations();
    });
    
    // Toggle type button
    const toggleBtn = categoryDiv.querySelector('.toggle-type');
    toggleBtn.addEventListener('click', function() {
      const currentType = categoryDiv.getAttribute('data-type');
      const newType = currentType === 'percentage' ? 'fixed' : 'percentage';
      categoryDiv.setAttribute('data-type', newType);
      
      // Update icon
      categoryDiv.querySelector('.icon-percent').classList.toggle('hidden');
      categoryDiv.querySelector('.icon-dollar').classList.toggle('hidden');
      
      // Convert value
      const valueInput = categoryDiv.querySelector('.category-value');
      const currentValue = parseFloat(valueInput.value) || 0;
      const salary = parseFloat(salaryInput.value) || 0;
      
      if (newType === 'percentage') {
        valueInput.value = salary > 0 ? Math.round((currentValue / salary) * 100) : 10;
      } else {
        valueInput.value = Math.round((currentValue / 100) * salary) || 1000;
      }
      
      updateCalculations();
    });
    
    // Value input
    const valueInput = categoryDiv.querySelector('.category-value');
    valueInput.addEventListener('input', updateCalculations);
    
    // Edit name button
    const editNameBtn = categoryDiv.querySelector('.edit-name');
    editNameBtn.addEventListener('click', function() {
      const categoryLabel = categoryDiv.querySelector('.category-label');
      const currentName = categoryLabel.textContent;
      const newName = prompt('Enter category name:', currentName);
      
      if (newName !== null && newName.trim() !== '') {
        categoryLabel.textContent = newName;
      }
    });
  }
  
  function updateCalculations() {
    const salary = parseFloat(salaryInput.value) || 0;
    let totalAllocated = 0;
    
    // Update each category amount
    document.querySelectorAll('.category').forEach(categoryDiv => {
      const type = categoryDiv.getAttribute('data-type');
      const valueInput = categoryDiv.querySelector('.category-value');
      const amountDiv = categoryDiv.querySelector('.amount');
      const value = parseFloat(valueInput.value) || 0;
      
      let amount = 0;
      if (type === 'percentage') {
        amount = (salary * value) / 100;
      } else {
        amount = value;
      }
      
      amountDiv.textContent = amount.toFixed(2) + ' AED';
      totalAllocated += amount;
    });
    
    // Update summary
    totalAllocatedElem.textContent = totalAllocated.toFixed(2) + ' AED';
    
    const remaining = salary - totalAllocated;
    remainingAmountElem.textContent = Math.abs(remaining).toFixed(2) + ' AED';
    
    if (remaining < 0) {
      remainingLabelElem.textContent = 'Overspent:';
      remainingLabelElem.className = 'negative';
      remainingAmountElem.className = 'negative';
    } else {
      remainingLabelElem.textContent = 'Remaining:';
      remainingLabelElem.className = 'positive';
      remainingAmountElem.className = 'positive';
    }
  }
});