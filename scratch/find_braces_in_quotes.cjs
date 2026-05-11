const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const matches = content.match(/".*}.*"/g);
if (matches) {
    matches.forEach(m => console.log(`Found } in quotes: ${m}`));
} else {
    console.log('No } found in quotes.');
}
