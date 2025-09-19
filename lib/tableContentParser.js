// TableContentParser.js - Utility to convert paragraph-based tables to proper HTML tables

export class TableContentParser {
  
  /**
   * Parse content and convert paragraph-based tables to proper HTML tables
   * @param {string} content - HTML content with paragraph-based tables
   * @returns {string} - HTML content with proper table structure
   */
  static parseTableContent(content) {
    if (!content) return content;
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find table patterns in the content
    const paragraphs = Array.from(tempDiv.querySelectorAll('p'));
    
    // Group paragraphs that form tables
    const tableGroups = this.identifyTableGroups(paragraphs);
    
    // Convert each table group to proper HTML table
    tableGroups.forEach(group => {
      const table = this.convertToTable(group);
      if (table) {
        // Replace the first paragraph with the table
        group.paragraphs[0].parentNode.insertBefore(table, group.paragraphs[0]);
        
        // Remove all the original paragraphs
        group.paragraphs.forEach(p => p.remove());
      }
    });
    
    return tempDiv.innerHTML;
  }
  
  /**
   * Identify groups of paragraphs that form tables
   * @param {Element[]} paragraphs - Array of paragraph elements
   * @returns {Object[]} - Array of table group objects
   */
  static identifyTableGroups(paragraphs) {
    const groups = [];
    let currentGroup = null;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const text = p.textContent.trim();
      
      // Check if this paragraph is a table title
      if (this.isTableTitle(text)) {
        // Start a new table group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          title: text,
          titleElement: p,
          paragraphs: [p],
          rows: []
        };
        continue;
      }
      
      // Check if this paragraph is part of a table
      if (currentGroup && this.isTableRow(text, p)) {
        currentGroup.paragraphs.push(p);
        currentGroup.rows.push({
          element: p,
          text: text,
          cells: this.parseTableCells(text, p)
        });
      } else {
        // End current group if we encounter non-table content
        if (currentGroup) {
          groups.push(currentGroup);
          currentGroup = null;
        }
      }
    }
    
    // Don't forget the last group
    if (currentGroup) {
      groups.push(currentGroup);
    }
    
    return groups.filter(group => group.rows.length > 0);
  }
  
  /**
   * Check if text looks like a table title
   * @param {string} text - Text to check
   * @returns {boolean}
   */
  static isTableTitle(text) {
    const tablePatterns = [
      /^Table\s+\d+:/i,
      /Market\s+Cap/i,
      /^\*\*Table/i,
      /Company.*\$.*trillion/i
    ];
    
    return tablePatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if text/element looks like a table row
   * @param {string} text - Text to check
   * @param {Element} element - Element to check
   * @returns {boolean}
   */
  static isTableRow(text, element) {
    // Check if element has strong tags (likely headers)
    const hasStrongTags = element.querySelectorAll('strong').length > 0;
    
    // Check for numeric patterns (years, values, etc.)
    const hasNumericData = /\d+(\.\d+)?/.test(text);
    
    // Check for currency symbols or percentage
    const hasFinancialData = /[\$£€¥%]|\btrillion\b|\bbillion\b|\bmillion\b/i.test(text);
    
    // Check if it's a company name or known table data
    const isKnownTableData = /^(Nvidia|Microsoft|Apple|Amazon|Alphabet|Meta|Tesla|TCS|Infosys|HCL|Wipro|Company|2023|2025|Growth|Trend)/i.test(text);
    
    // Empty or very short text is likely a table cell
    const isShortText = text.length > 0 && text.length < 50;
    
    return (hasStrongTags || hasNumericData || hasFinancialData || isKnownTableData) && isShortText;
  }
  
  /**
   * Parse table cells from text and element
   * @param {string} text - Text content
   * @param {Element} element - Element to parse
   * @returns {string[]} - Array of cell contents
   */
  static parseTableCells(text, element) {
    // If element has strong tags, preserve them
    if (element.querySelectorAll('strong').length > 0) {
      return [element.innerHTML];
    }
    
    // For simple text, return as single cell
    return [text];
  }
  
  /**
   * Convert a table group to proper HTML table
   * @param {Object} group - Table group object
   * @returns {Element|null} - HTML table element or null
   */
  static convertToTable(group) {
    if (!group || group.rows.length === 0) return null;
    
    // Analyze table structure
    const analysis = this.analyzeTableStructure(group);
    if (!analysis.isValid) return null;
    
    // Create table element
    const table = document.createElement('table');
    table.className = 'border-collapse border border-gray-300 w-full my-4';
    
    // Add table caption if there's a title
    if (group.title && !this.isTableTitle(group.rows[0].text)) {
      const caption = document.createElement('caption');
      caption.className = 'text-left font-semibold text-gray-900 mb-2 p-2';
      caption.innerHTML = group.title.replace(/^\*\*|\*\*$/g, '');
      table.appendChild(caption);
    }
    
    // Create table structure based on analysis
    if (analysis.hasHeaders) {
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      
      // Add header row
      const headerRow = this.createTableRow(analysis.headers, true);
      thead.appendChild(headerRow);
      
      // Add data rows
      analysis.dataRows.forEach(row => {
        const tr = this.createTableRow(row.cells, false);
        tbody.appendChild(tr);
      });
      
      table.appendChild(thead);
      table.appendChild(tbody);
    } else {
      const tbody = document.createElement('tbody');
      
      // Add all rows as data rows
      group.rows.forEach(row => {
        const tr = this.createTableRow(row.cells, false);
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
    }
    
    return table;
  }
  
  /**
   * Analyze table structure to determine headers and data rows
   * @param {Object} group - Table group object
   * @returns {Object} - Analysis result
   */
  static analyzeTableStructure(group) {
    const rows = group.rows;
    
    // Look for header patterns
    let headers = [];
    let dataRows = [];
    let hasHeaders = false;
    
    // For the specific case in the document, we know the structure
    if (this.isMarketCapTable(group)) {
      headers = ['Company', '2023', '2025', 'Growth Trend'];
      dataRows = this.parseMarketCapData(rows);
      hasHeaders = true;
    } else {
      // Generic table parsing
      headers = this.extractHeaders(rows);
      dataRows = this.extractDataRows(rows, headers.length);
      hasHeaders = headers.length > 0;
    }
    
    return {
      isValid: dataRows.length > 0,
      hasHeaders,
      headers,
      dataRows
    };
  }
  
  /**
   * Check if this is a market cap table based on content
   * @param {Object} group - Table group object
   * @returns {boolean}
   */
  static isMarketCapTable(group) {
    const text = group.rows.map(r => r.text).join(' ').toLowerCase();
    return text.includes('market cap') || 
           text.includes('nvidia') || 
           text.includes('microsoft') ||
           text.includes('trillion');
  }
  
  /**
   * Parse market cap specific data
   * @param {Object[]} rows - Array of row objects
   * @returns {Object[]} - Array of parsed data rows
   */
  static parseMarketCapData(rows) {
    const dataRows = [];
    let currentRow = {};
    let columnIndex = 0;
    
    for (const row of rows) {
      const text = row.text.trim();
      
      // Skip header-like rows
      if (/^(Company|2023|2025|Growth|Trend)$/i.test(text)) {
        continue;
      }
      
      // Company names (start of new row)
      if (/^(Nvidia|Microsoft|Apple|Amazon|Alphabet|Meta|Tesla|TCS|Infosys|HCL|Wipro|LTI|Tech Mahindra|Persistent|Mphasis)$/i.test(text)) {
        if (Object.keys(currentRow).length > 0) {
          dataRows.push({ cells: Object.values(currentRow) });
        }
        currentRow = { company: text };
        columnIndex = 1;
      }
      // Numeric values (continuation of current row)
      else if (/^[\d.]+\+?$/.test(text) || /^(Quadrupled|Doubled|Significant|Modest|Strong|Moderate|Marginal|High|Small|No).*Growth$/i.test(text)) {
        if (columnIndex === 1) currentRow.year2023 = text;
        else if (columnIndex === 2) currentRow.year2025 = text;
        else if (columnIndex === 3) currentRow.growth = text;
        columnIndex++;
      }
      // Growth descriptions
      else if (Object.keys(currentRow).length > 0) {
        if (!currentRow.growth) {
          currentRow.growth = text;
        }
      }
    }
    
    // Don't forget the last row
    if (Object.keys(currentRow).length > 0) {
      dataRows.push({ cells: Object.values(currentRow) });
    }
    
    return dataRows;
  }
  
  /**
   * Extract headers from rows
   * @param {Object[]} rows - Array of row objects
   * @returns {string[]} - Array of header texts
   */
  static extractHeaders(rows) {
    // Find rows with strong tags
    const headerRows = rows.filter(row => 
      row.element.querySelectorAll('strong').length > 0
    );
    
    if (headerRows.length > 0) {
      return headerRows.map(row => row.text);
    }
    
    // Default headers
    return [];
  }
  
  /**
   * Extract data rows
   * @param {Object[]} rows - Array of row objects
   * @param {number} columnCount - Expected number of columns
   * @returns {Object[]} - Array of data row objects
   */
  static extractDataRows(rows, columnCount) {
    return rows
      .filter(row => row.element.querySelectorAll('strong').length === 0)
      .map(row => ({ cells: [row.text] }));
  }
  
  /**
   * Create a table row element
   * @param {string[]} cells - Array of cell contents
   * @param {boolean} isHeader - Whether this is a header row
   * @returns {Element} - Table row element
   */
  static createTableRow(cells, isHeader) {
    const tr = document.createElement('tr');
    tr.className = isHeader ? 'bg-gray-50' : 'hover:bg-gray-50';
    
    cells.forEach(cellContent => {
      const cell = document.createElement(isHeader ? 'th' : 'td');
      cell.className = isHeader 
        ? 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left'
        : 'border border-gray-300 px-4 py-2';
      cell.innerHTML = cellContent || '';
      tr.appendChild(cell);
    });
    
    return tr;
  }
}

// Usage function
export function parseAndFixTableContent(content) {
  if (typeof window === 'undefined') {
    // Server-side: return content as-is
    return content;
  }
  
  try {
    return TableContentParser.parseTableContent(content);
  } catch (error) {
    console.error('Error parsing table content:', error);
    return content; // Return original content if parsing fails
  }
}