import fs from 'fs';
const path = 'c:\\Users\\Jhankee\\OneDrive\\Desktop\\REPOSITORYS\\PERSONAL\\BioTask\\frontend\\src\\pages\\StoryDetailPage.tsx';

let content = fs.readFileSync(path, 'utf8');
// Find the first occurrence of "    </div>" after the last ConfirmDialog
// Actually, let's just find the first occurrence of " \"\"}" and cut there.

let splitPos = content.indexOf(' ""}\r\n');
if (splitPos === -1) splitPos = content.indexOf(' ""}\n');

if (splitPos !== -1) {
    let newContent = content.substring(0, splitPos);
    // Ensure it ends with ) and }
    if (!newContent.trim().endsWith('}')) {
        newContent += "\n  )\n}";
    }
    fs.writeFileSync(path, newContent, 'utf8');
    console.log("Fixed with splitPos: " + splitPos);
} else {
    console.log("Could not find trigger.");
}
