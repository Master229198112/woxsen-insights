// Migration Script: scripts/fixTableContent.js
// Run this to convert existing paragraph-based tables to proper HTML tables

const mongoose = require('mongoose');
const { JSDOM } = require('jsdom');
const path = require('path');

// Set up DOM for server-side parsing
const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

// Import the Blog model (using dynamic import for ES modules)
let Blog;

class ServerTableContentParser {
  static parseTableContent(content) {
    if (!content) return content;
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find potential table data
    const paragraphs = Array.from(tempDiv.querySelectorAll('p'));
    
    // Look for market cap tables specifically
    let inTable = false;
    let tableData = [];
    let currentTable = null;
    
    paragraphs.forEach((p, index) => {
      const text = p.textContent.trim();
      
      // Detect table start
      if (text.match(/Table \d+.*Market.*Cap/i) || text.match(/Big Tech Market/i) || text.match(/Indian IT Market/i)) {
        if (currentTable) {
          // Finish previous table
          const table = this.buildTable(currentTable);
          if (table) {
            currentTable.titleElement.parentNode.insertBefore(table, currentTable.titleElement);
            currentTable.elements.forEach(el => el.remove());
          }
        }
        
        // Start new table
        currentTable = {
          title: text,
          titleElement: p,
          elements: [p],
          headers: [],
          rows: []
        };
        inTable = true;
        return;
      }
      
      if (inTable && currentTable) {
        const isHeader = p.querySelector('strong') && 
          (text === 'Company' || text === '2023' || text === '2025' || text === 'Growth Trend');
        
        const isCompany = text.match(/^(Nvidia|Microsoft|Apple|Amazon|Alphabet|Meta|Tesla|TCS|Infosys|HCL|Wipro|LTI|Tech Mahindra|Persistent|Mphasis)$/i);
        const isValue = text.match(/^[\d.]+\+?$/) || text.match(/(Quadrupled|Doubled|Significant|Modest|Strong|Moderate|Marginal|High|Small|No).*Growth/i);
        
        if (isHeader) {
          currentTable.headers.push(text);
          currentTable.elements.push(p);
        } else if (isCompany || isValue) {
          currentTable.rows.push(text);
          currentTable.elements.push(p);
        } else if (text.length > 50 || text.match(/^(1\.|2\.|3\.)/)) {
          // End of table
          const table = this.buildTable(currentTable);
          if (table) {
            currentTable.titleElement.parentNode.insertBefore(table, currentTable.titleElement);
            currentTable.elements.forEach(el => el.remove());
          }
          currentTable = null;
          inTable = false;
        } else if (isValue || text.length < 30) {
          currentTable.rows.push(text);
          currentTable.elements.push(p);
        }
      }
    });
    
    // Handle last table
    if (currentTable) {
      const table = this.buildTable(currentTable);
      if (table) {
        currentTable.titleElement.parentNode.insertBefore(table, currentTable.titleElement);
        currentTable.elements.forEach(el => el.remove());
      }
    }
    
    return tempDiv.innerHTML;
  }
  
  static buildTable(tableData) {
    if (!tableData || tableData.rows.length === 0) return null;
    
    const table = document.createElement('table');
    table.className = 'border-collapse border border-gray-300 w-full my-4';
    
    // Add caption
    const caption = document.createElement('caption');
    caption.className = 'text-left font-semibold text-gray-900 mb-2 p-2';
    caption.textContent = tableData.title.replace(/^\*\*|\*\*$/g, '');
    table.appendChild(caption);
    
    // Create headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-50';
    
    const headers = ['Company', '2023', '2025', 'Growth Trend'];
    headers.forEach(header => {
      const th = document.createElement('th');
      th.className = 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left';
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Parse rows
    const tbody = document.createElement('tbody');
    let currentRowData = [];
    
    for (let i = 0; i < tableData.rows.length; i++) {
      const value = tableData.rows[i];
      
      // Check if this is a company name (start of new row)
      if (value.match(/^(Nvidia|Microsoft|Apple|Amazon|Alphabet|Meta|Tesla|TCS|Infosys|HCL|Wipro|LTI|Tech Mahindra|Persistent|Mphasis)$/i)) {
        // Finish previous row
        if (currentRowData.length > 0) {
          this.addTableRow(tbody, currentRowData);
          currentRowData = [];
        }
        currentRowData.push(value);
      } else {
        currentRowData.push(value);
      }
      
      // If we have 4 columns, finish the row
      if (currentRowData.length === 4) {
        this.addTableRow(tbody, currentRowData);
        currentRowData = [];
      }
    }
    
    // Don't forget the last row
    if (currentRowData.length > 0) {
      this.addTableRow(tbody, currentRowData);
    }
    
    table.appendChild(tbody);
    return table;
  }
  
  static addTableRow(tbody, rowData) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';
    
    // Ensure we have 4 columns
    while (rowData.length < 4) {
      rowData.push('');
    }
    
    rowData.slice(0, 4).forEach(cellData => {
      const td = document.createElement('td');
      td.className = 'border border-gray-300 px-4 py-2';
      td.textContent = cellData || '';
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  }
}

// Migration function
async function migrateTableContent() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is required');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Import the Blog model dynamically (ES module)
    try {
      const blogModule = await import('../models/Blog.js');
      Blog = blogModule.default;
      console.log('✓ Blog model loaded successfully');
    } catch (error) {
      console.error('❌ Error loading Blog model:', error.message);
      console.log('📁 Make sure the path ../models/Blog.js is correct from the scripts directory');
      process.exit(1);
    }
    
    // Find blogs with table-like content
    const blogs = await Blog.find({
      content: { 
        $regex: /(Table \d+|Market.*Cap|Nvidia|Microsoft.*trillion)/i 
      },
      category: 'blogs' // Only process blog posts
    });
    
    console.log(`Found ${blogs.length} blogs to migrate`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const blog of blogs) {
      console.log(`\nProcessing: "${blog.title}" (${blog.slug})`);
      
      const originalContent = blog.content;
      const fixedContent = ServerTableContentParser.parseTableContent(originalContent);
      
      if (fixedContent !== originalContent) {
        // Check if tables were actually created
        const hasTablesNow = fixedContent.includes('<table');
        
        if (hasTablesNow) {
          blog.content = fixedContent;
          await blog.save();
          console.log(`✓ Updated with ${(fixedContent.match(/<table/g) || []).length} table(s): ${blog.title}`);
          updated++;
        } else {
          console.log(`- Content changed but no tables created: ${blog.title}`);
          skipped++;
        }
      } else {
        console.log(`- No changes needed: ${blog.title}`);
        skipped++;
      }
    }
    
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Updated: ${updated} blog posts`);
    console.log(`⏭️  Skipped: ${skipped} blog posts`);
    console.log(`📊 Total processed: ${blogs.length} blog posts`);
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  // Load environment variables from .env.local
  require('dotenv').config({ path: '.env.local' });
  migrateTableContent();
}

module.exports = { migrateTableContent, ServerTableContentParser };