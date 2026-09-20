const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const diagrams = [
  'system_context_diagram',
  'use_case_diagram',
  'entity_relationship_diagram',
  'admin_portal_flowchart',
  'mobile_app_flowchart',
  'super_admin_portal_flowchart',
  'functional_decomposition_diagram',
  'system_design_procedure',
  'data_flow_diagram',
  'system_architecture',
  'program_flowchart',
  'system_flowchart',
  'activity_diagram_user',
  'activity_diagram_admin',
  'activity_diagram_superadmin',
  'sequence_diagram'
];

const flowchartsDir = __dirname;

for (const name of diagrams) {
  const mmdPath = path.join(flowchartsDir, `${name}.mermaid`);
  const pngPath = path.join(flowchartsDir, `${name}.png`);
  const svgPath = path.join(flowchartsDir, `${name}_white.svg`);

  console.log(`Rendering ${name}...`);

  try {
    // Generate PNG
    const pngCmd = `npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${pngPath}" -b white -t default -s 3`;
    console.log(`> ${pngCmd}`);
    execSync(pngCmd, { stdio: 'inherit' });

    // Generate SVG
    const svgCmd = `npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${svgPath}" -b white -t default`;
    console.log(`> ${svgCmd}`);
    execSync(svgCmd, { stdio: 'inherit' });

    console.log(`Successfully rendered ${name}\n`);
  } catch (error) {
    console.error(`Failed to render ${name}:`, error.message);
  }
}

console.log('All diagrams compiled successfully to PNG and SVG!');
