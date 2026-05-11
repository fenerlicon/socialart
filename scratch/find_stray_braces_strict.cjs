const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    if (trimmed.includes('}') && !trimmed.startsWith('}') && !trimmed.startsWith('</') && !trimmed.includes('{')) {
        console.log(`Line ${i+1}: ${line}`);
    }
}
