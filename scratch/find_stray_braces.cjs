const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Arda Furkan Aslanbaş\\.gemini\\antigravity\\scratch\\socialart-ajans\\src\\pages\\Home.jsx', 'utf8');

// Simple regex to find } in what looks like text content in JSX
// This is hard to do perfectly with regex, but let's try to find } 
// that are not part of code blocks.

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Look for } that are not part of {{ or }} or { ... }
    // A simple check: if } appears in a line that doesn't start with code-like characters
    // or is clearly inside a text block.
    
    // Actually, let's just look for } and see the context.
    if (line.includes('}') && !line.includes('{') && !line.trim().startsWith('}') && !line.trim().startsWith('</')) {
        console.log(`Potential stray } at line ${i+1}: ${line.trim()}`);
    }
}
