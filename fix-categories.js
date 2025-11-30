#!/usr/bin/env node

// Migration script to fix categories with missing display/accounting objects

const API_BASE = 'http://localhost:3000/api/admin/accounting';

async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE}/transaction-categories`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function updateCategory(categoryId, updateData) {
  try {
    const response = await fetch(`${API_BASE}/transaction-categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error(`Error updating category ${categoryId}:`, error);
    return false;
  }
}

function getDefaultDisplayValues(category) {
  const typeColors = {
    'revenue': '#10b981',
    'expense': '#ef4444', 
    'transfer': '#6366f1',
    'adjustment': '#f59e0b'
  };
  
  return {
    color: typeColors[category.type] || '#6366f1',
    sortOrder: 0,
    icon: null
  };
}

async function migrateCategoriesWithMissingDisplay() {
  console.log('🔧 Starting category migration...\n');
  
  const categories = await fetchCategories();
  console.log(`Found ${categories.length} categories to check\n`);
  
  let fixedCount = 0;
  
  for (const category of categories) {
    const needsDisplayFix = !category.display || category.display === null;
    const needsColorFix = category.display && !category.display.color;
    
    if (needsDisplayFix || needsColorFix) {
      console.log(`🔨 Fixing category: ${category.name}`);
      
      const currentDisplay = category.display || {};
      const defaultDisplay = getDefaultDisplayValues(category);
      
      const updatedDisplay = {
        color: currentDisplay.color || defaultDisplay.color,
        sortOrder: currentDisplay.sortOrder !== undefined ? currentDisplay.sortOrder : defaultDisplay.sortOrder,
        icon: currentDisplay.icon || defaultDisplay.icon
      };
      
      const updateData = {
        name: category.name,
        description: category.description,
        type: category.type,
        display: updatedDisplay,
        // Preserve existing accounting data
        accounting: category.accounting
      };
      
      const success = await updateCategory(category._id, updateData);
      
      if (success) {
        console.log(`   ✅ Fixed: ${category.name}`);
        fixedCount++;
      } else {
        console.log(`   ❌ Failed: ${category.name}`);
      }
    } else {
      console.log(`   ✓ OK: ${category.name}`);
    }
  }
  
  console.log(`\n✨ Migration complete!`);
  console.log(`   Fixed ${fixedCount} categories`);
  console.log(`   Categories page should now load without errors`);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or install node-fetch');
  process.exit(1);
}

migrateCategoriesWithMissingDisplay().catch(console.error);