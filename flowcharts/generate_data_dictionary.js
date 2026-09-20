const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'data_dictionary.md');
const htmlPath = path.join(__dirname, 'data_dictionary_updated.html');

console.log('Parsing data_dictionary.md...');

if (!fs.existsSync(mdPath)) {
  console.error(`Error: data_dictionary.md not found at ${mdPath}`);
  process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, 'utf8');
const lines = mdContent.split(/\r?\n/);

const domains = {
  identity: {
    title: 'Identity & Profile Domain',
    tables: ['users', 'admin_staff']
  },
  clinical: {
    title: 'Clinical & Telehealth Domain',
    tables: ['pets', 'pet_monitoring', 'telemedicine', 'appointments']
  },
  ecommerce: {
    title: 'E-Commerce Domain',
    tables: ['products', 'cart', 'cart_items', 'orders', 'order_items', 'categories']
  },
  billing: {
    title: 'Financial & Billing Domain',
    tables: ['payments']
  },
  engagement: {
    title: 'Engagement & Communication Domain',
    tables: ['announcements', 'announcement_reactions', 'pet_tutorials', 'sms_notifications', 'feedback', 'notifications']
  }
};

function getDomainForTable(tableName) {
  for (const [domainKey, domainInfo] of Object.entries(domains)) {
    if (domainInfo.tables.includes(tableName)) {
      return domainKey;
    }
  }
  return 'engagement'; // fallback
}

const tablesData = [];
const enumsData = [];

let currentSection = null; // 'tables' or 'enums'
let currentTable = null;
let currentEnum = null;
let readingTableRows = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Detect Sections
  if (line.startsWith('## 📋 Entity Specifications')) {
    currentSection = 'tables';
    continue;
  }
  if (line.startsWith('## 🔀 Database Custom Enums')) {
    currentSection = 'enums';
    continue;
  }

  if (currentSection === 'tables') {
    // Detect Table Start
    const tableHeaderMatch = line.match(/^###\s+\d+\.\s+`([^`]+)`\s+Table/i);
    if (tableHeaderMatch) {
      const tableName = tableHeaderMatch[1];
      currentTable = {
        name: tableName,
        description: '',
        columns: [],
        domain: getDomainForTable(tableName)
      };
      tablesData.push(currentTable);
      readingTableRows = false;
      continue;
    }

    if (currentTable) {
      if (line.startsWith('|') && line.includes('Column Name')) {
        readingTableRows = true;
        i++; // Skip divider line (e.g. | :--- | :--- |)
        continue;
      }

      if (readingTableRows) {
        if (line.startsWith('|')) {
          const parts = line.split('|').map(p => p.trim());
          // Format is: | [empty] | Column Name | Prisma Type | PostgreSQL Type | Keys | Default Value | Description | [empty] |
          if (parts.length >= 7) {
            const colName = parts[1].replace(/`/g, '');
            const prismaType = parts[2].replace(/`/g, '');
            const pgType = parts[3].replace(/`/g, '');
            const keys = parts[4].replace(/\*\*/g, '').trim();
            const defaultVal = parts[5].replace(/`/g, '').trim();
            const description = parts[6].trim();

            if (colName && colName !== 'Column Name') {
              const isNullable = prismaType.endsWith('?') ? 'Yes' : 'No';
              currentTable.columns.push({
                name: colName,
                prismaType,
                pgType,
                keys,
                defaultVal: defaultVal === '-' ? '' : defaultVal,
                nullable: isNullable,
                description
              });
            }
          }
        } else if (line !== '') {
          readingTableRows = false;
        }
      } else {
        // Accumulate description
        if (line && !line.startsWith('---') && !line.startsWith('###')) {
          currentTable.description += (currentTable.description ? ' ' : '') + line;
        }
      }
    }
  }

  if (currentSection === 'enums') {
    const enumHeaderMatch = line.match(/^###\s+`([^`]+)`/i);
    if (enumHeaderMatch) {
      currentEnum = {
        name: enumHeaderMatch[1],
        description: '',
        values: []
      };
      enumsData.push(currentEnum);
      continue;
    }

    if (currentEnum) {
      if (line.startsWith('*') || line.startsWith('-')) {
        // Enum value
        const valMatch = line.match(/^[\*\-]\s+`([^`]+)`\s*(?:[:\u2014]\s*(.*))?/);
        if (valMatch) {
          currentEnum.values.push({
            value: valMatch[1],
            desc: valMatch[2] ? valMatch[2].trim() : ''
          });
        }
      } else if (line !== '' && !line.startsWith('---')) {
        currentEnum.description += (currentEnum.description ? ' ' : '') + line;
      }
    }
  }
}

console.log(`Parsed ${tablesData.length} tables and ${enumsData.length} enums.`);

// Build HTML content
let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Dictionary - FurEver PawCare</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #10b981;
            --primary-dark: #059669;
            --accent: #2e5e3e;
            --border-color: #334155;
            --th-bg: #0f172a;
            --tr-hover: rgba(255, 255, 255, 0.02);
            --badge-pk: #ef4444;
            --badge-fk: #3b82f6;
            --badge-uk: #f59e0b;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 32px 24px;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .header-container {
            text-align: center;
            max-width: 1000px;
            margin: 0 auto 32px auto;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0 0 12px 0;
            background: linear-gradient(135deg, #eaf3de 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.subtitle {
            color: var(--text-muted);
            font-size: 1.1rem;
            margin: 0;
        }

        .controls-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto 24px auto;
            gap: 16px;
            flex-wrap: wrap;
        }

        .search-container {
            position: relative;
            flex-grow: 1;
            max-width: 500px;
        }

        .search-input {
            width: 100%;
            font-family: inherit;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            padding: 12px 16px 12px 40px;
            border-radius: 8px;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .search-icon {
            position: absolute;
            left: 14px;
            top: 14px;
            color: var(--text-muted);
        }

        .actions-bar {
            display: flex;
            gap: 12px;
        }

        button {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background-color: var(--accent);
            color: #ffffff;
        }

        .btn-primary:hover {
            background-color: #3b754e;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background-color: #334155;
            color: #f8fafc;
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background-color: #475569;
            transform: translateY(-1px);
        }

        .domain-tabs {
            display: flex;
            gap: 8px;
            max-width: 1200px;
            margin: 0 auto 32px auto;
            flex-wrap: wrap;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
        }

        .tab-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            padding: 8px 16px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .tab-btn.active, .tab-btn:hover {
            background-color: var(--card-bg);
            color: var(--text-color);
        }

        .dictionary-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .table-card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease;
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .table-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--primary);
            margin: 0;
            font-family: monospace;
        }

        .table-description {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin: 0 0 16px 0;
            line-height: 1.5;
        }

        .specs-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.9rem;
        }

        .specs-table th {
            background-color: var(--th-bg);
            color: var(--text-color);
            padding: 12px 16px;
            font-weight: 600;
            border-bottom: 2px solid var(--border-color);
        }

        .specs-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            color: #e2e8f0;
            line-height: 1.4;
        }

        .specs-table tr:hover td {
            background-color: var(--tr-hover);
        }

        .specs-table code {
            font-family: monospace;
            font-size: 0.9rem;
            background-color: rgba(0,0,0,0.15);
            padding: 2px 6px;
            border-radius: 4px;
            color: #34d399;
        }

        .key-badge {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            color: #ffffff;
            display: inline-block;
        }

        .key-pk { background-color: var(--badge-pk); }
        .key-fk { background-color: var(--badge-fk); }
        .key-uk { background-color: var(--badge-uk); }

        .enums-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .enum-card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .enum-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--primary);
            margin: 0 0 8px 0;
            font-family: monospace;
        }

        .enum-desc {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin: 0 0 12px 0;
            line-height: 1.4;
        }

        .enum-values-list {
            padding-left: 20px;
            margin: 0;
            line-height: 1.6;
            font-size: 0.9rem;
            color: #e2e8f0;
        }

        .enum-values-list code {
            font-family: monospace;
            color: #34d399;
            background-color: rgba(0,0,0,0.15);
            padding: 2px 4px;
            border-radius: 4px;
        }

        .section-divider {
            max-width: 1200px;
            margin: 40px auto 20px auto;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 8px;
        }

        .section-divider h2 {
            margin: 0;
            font-size: 1.8rem;
            background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        @media print {
            body {
                background-color: #ffffff !important;
                color: #000000 !important;
                padding: 0;
            }

            .controls-bar, .domain-tabs, button {
                display: none !important;
            }

            .table-card, .enum-card {
                background-color: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                box-shadow: none !important;
                page-break-inside: avoid;
                margin-bottom: 24px;
                padding: 16px;
            }

            .table-title, .enum-title {
                color: #047857 !important;
            }

            .specs-table th {
                background-color: #f1f5f9 !important;
                color: #000000 !important;
                border-bottom: 2px solid #94a3b8 !important;
            }

            .specs-table td {
                color: #000000 !important;
                border-bottom: 1px solid #e2e8f0 !important;
            }

            .specs-table code, .enum-values-list code {
                background-color: #f1f5f9 !important;
                color: #0f172a !important;
                border: 1px solid #cbd5e1 !important;
            }

            h1 {
                -webkit-text-fill-color: initial !important;
                color: #000000 !important;
            }
        }
    </style>
</head>
<body>

    <div class="header-container">
        <h1 id="title-text">Database Data Dictionary</h1>
        <p class="subtitle" id="desc-text">Interactive physical schema documentation for the FurEver PawCare PostgreSQL database.</p>
    </div>

    <div class="controls-bar">
        <div class="search-container">
            <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" id="search-box" class="search-input" placeholder="Search tables, fields, types, or descriptions..." onkeyup="filterDictionary()">
        </div>
        <div class="actions-bar">
            <button class="btn-secondary" id="theme-toggle" onclick="toggleTheme()">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
                Light Theme
            </button>
            <button class="btn-primary" onclick="window.print()">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print / Save PDF
            </button>
        </div>
    </div>

    <div class="domain-tabs">
        <button class="tab-btn active" onclick="filterDomain('all')">All Domains</button>
        <button class="tab-btn" onclick="filterDomain('identity')">Identity & Profile</button>
        <button class="tab-btn" onclick="filterDomain('clinical')">Clinical & Telehealth</button>
        <button class="tab-btn" onclick="filterDomain('ecommerce')">E-Commerce</button>
        <button class="tab-btn" onclick="filterDomain('billing')">Financial & Billing</button>
        <button class="tab-btn" onclick="filterDomain('engagement')">Engagement & Comm</button>
    </div>

    <div class="dictionary-container" id="dict-container">
`;

// Add domain sections
for (const [domainKey, domainInfo] of Object.entries(domains)) {
  htmlContent += `
        <div class="section-divider" data-domain="${domainKey}">
            <h2>${domainInfo.title}</h2>
        </div>
  `;

  // Find all tables belonging to this domain
  const domainTables = tablesData.filter(t => t.domain === domainKey);
  for (const table of domainTables) {
    htmlContent += `
        <!-- ${table.name} Table -->
        <div class="table-card" data-domain="${domainKey}" id="table-${table.name.replace(/_/g, '-')}">
            <div class="table-header">
                <h3 class="table-title">${table.name}</h3>
            </div>
            <p class="table-description">${table.description}</p>
            <table class="specs-table">
                <thead>
                    <tr>
                        <th style="width: 20%;">Field Name</th>
                        <th style="width: 25%;">SQL Data Type</th>
                        <th style="width: 12%;">Key Type</th>
                        <th style="width: 10%;">Nullable</th>
                        <th style="width: 13%;">Default Value</th>
                        <th style="width: 20%;">Description</th>
                    </tr>
                </thead>
                <tbody>`;

    for (const col of table.columns) {
      let keyBadge = '';
      if (col.keys) {
        const badges = col.keys.split(',').map(k => k.trim());
        keyBadge = badges.map(b => {
          const lower = b.toLowerCase();
          return `<span class="key-badge key-${lower}">${b}</span>`;
        }).join(' ');
      }

      htmlContent += `
                    <tr>
                        <td><code>${col.name}</code></td>
                        <td><code>${col.pgType}</code></td>
                        <td>${keyBadge || '-'}</td>
                        <td>${col.nullable}</td>
                        <td>${col.defaultVal ? `<code>${col.defaultVal}</code>` : '-'}</td>
                        <td>${col.description}</td>
                    </tr>`;
    }

    htmlContent += `
                </tbody>
            </table>
        </div>
    `;
  }
}

htmlContent += `
        <div class="section-divider">
            <h2>Custom Database Enums</h2>
        </div>

        <div class="enums-grid" id="enums-container">`;

for (const enumItem of enumsData) {
  htmlContent += `
            <div class="enum-card">
                <h4 class="enum-title">${enumItem.name}</h4>
                <p class="enum-desc">${enumItem.description || 'System domain lookup enumeration values.'}</p>
                <ul class="enum-values-list">`;
  for (const val of enumItem.values) {
    htmlContent += `
                    <li><code>${val.value}</code> ${val.desc ? `— ${val.desc}` : ''}</li>`;
  }
  htmlContent += `
                </ul>
            </div>`;
}

htmlContent += `
        </div>

    </div>

    <script>
        let currentTheme = 'dark';

        function toggleTheme() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            const btn = document.getElementById('theme-toggle');
            const title = document.getElementById('title-text');
            
            if (currentTheme === 'light') {
                document.documentElement.style.setProperty('--bg-color', '#ffffff');
                document.documentElement.style.setProperty('--card-bg', '#f8fafc');
                document.documentElement.style.setProperty('--text-color', '#0f172a');
                document.documentElement.style.setProperty('--text-muted', '#475569');
                document.documentElement.style.setProperty('--border-color', '#cbd5e1');
                document.documentElement.style.setProperty('--th-bg', '#e2e8f0');
                document.documentElement.style.setProperty('--tr-hover', 'rgba(0, 0, 0, 0.02)');
                
                title.style.background = 'initial';
                title.style.color = '#2e5e3e';
                title.style.webkitTextFillColor = 'initial';
                
                btn.innerHTML = \`<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg> Dark Theme\`;
                btn.style.backgroundColor = '#e2e8f0';
                btn.style.color = '#0f172a';
            } else {
                document.documentElement.style.setProperty('--bg-color', '#0f172a');
                document.documentElement.style.setProperty('--card-bg', '#1e293b');
                document.documentElement.style.setProperty('--text-color', '#f8fafc');
                document.documentElement.style.setProperty('--text-muted', '#94a3b8');
                document.documentElement.style.setProperty('--border-color', '#334155');
                document.documentElement.style.setProperty('--th-bg', '#0f172a');
                document.documentElement.style.setProperty('--tr-hover', 'rgba(255, 255, 255, 0.02)');
                
                title.style.background = 'linear-gradient(135deg, #eaf3de 0%, #10b981 100%)';
                title.style.webkitBackgroundClip = 'text';
                title.style.webkitTextFillColor = 'transparent';
                
                btn.innerHTML = \`<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg> Light Theme\`;
                btn.style.backgroundColor = '#334155';
                btn.style.color = '#f8fafc';
            }
        }

        function filterDomain(domain) {
            const cards = document.querySelectorAll('.table-card');
            const dividers = document.querySelectorAll('.section-divider');
            const tabs = document.querySelectorAll('.tab-btn');
            
            // Update active tab style
            tabs.forEach(tab => {
                const text = tab.innerText.toLowerCase();
                if ((domain === 'all' && text.includes('all')) || 
                    (domain === 'identity' && text.includes('identity')) ||
                    (domain === 'clinical' && text.includes('clinical')) ||
                    (domain === 'ecommerce' && text.includes('e-commerce')) ||
                    (domain === 'billing' && text.includes('financial')) ||
                    (domain === 'engagement' && text.includes('engagement'))) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            cards.forEach(card => {
                if (domain === 'all' || card.getAttribute('data-domain') === domain) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            dividers.forEach(div => {
                if (domain === 'all' || div.getAttribute('data-domain') === domain) {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            });
        }

        function filterDictionary() {
            const query = document.getElementById('search-box').value.toLowerCase();
            const cards = document.querySelectorAll('.table-card');
            const dividers = document.querySelectorAll('.section-divider');
            
            if (!query) {
                const activeTab = document.querySelector('.tab-btn.active');
                const activeDomainText = activeTab.innerText.toLowerCase();
                let activeDomain = 'all';
                if (activeDomainText.includes('identity')) activeDomain = 'identity';
                else if (activeDomainText.includes('clinical')) activeDomain = 'clinical';
                else if (activeDomainText.includes('e-commerce')) activeDomain = 'ecommerce';
                else if (activeDomainText.includes('financial')) activeDomain = 'billing';
                else if (activeDomainText.includes('engagement')) activeDomain = 'engagement';
                
                filterDomain(activeDomain);
                return;
            }

            dividers.forEach(div => div.style.display = 'none');

            cards.forEach(card => {
                const textContent = card.innerText.toLowerCase();
                if (textContent.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Successfully generated flowcharts/data_dictionary_updated.html!');
