import fs from 'fs';

const key = fs.readFileSync('./firbase-admin.json', 'utf-8'); 
const keyWithoutNewline = key.replace(/\n/g, '\\n'); 
const base64 = Buffer.from(keyWithoutNewline).toString('base64');          
console.log(base64); 