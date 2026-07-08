const fs = require('fs');
const path = require('path');
const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;

const files = [
  'src/components/layout/AdminDashboardLayout.jsx',
  'src/components/layout/GuideDashboardLayout.jsx',
  'src/components/layout/HodDashboardLayout.jsx',
  'src/components/layout/DashboardLayout.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/guide/GuideDashboard.jsx',
  'src/pages/hod/HodDashboard.jsx',
  'src/pages/public/Login.jsx',
  'src/pages/student/StudentDashboard.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Remove emojis
  content = content.replace(emojiRegex, '');
  
  // Add Navbar to layout files
  if (f.includes('Layout.jsx') && !content.includes('import Navbar')) {
    // Add import after the first import statement
    content = content.replace(/import\s+.*?from\s+['"].*?['"];?/, match => match + '\nimport Navbar from \'./Navbar\';');
    
    // Wrap the dashboard-layout with the wrapper
    const layoutWrapperStart = '<div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>\n      <Navbar />\n      <div className="dashboard-layout" style={{ flex: 1, position: "relative", overflow: "hidden" }}>';
    content = content.replace(/<div className="dashboard-layout">/, layoutWrapperStart);
    
    // Find the last closing div and add another closing div
    const lastDivIndex = content.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
      content = content.substring(0, lastDivIndex + 6) + '\n    </div>' + content.substring(lastDivIndex + 6);
    }
  }
  
  fs.writeFileSync(f, content);
});
console.log("Done");
