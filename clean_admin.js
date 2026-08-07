const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find where new admin div ends (</div> after </div> after line 788)
// The new admin view ends with </div> at line 788 and the old one starts right after
// We need to remove everything from the orphaned old admin code (after </div>\n</div> of new admin)
// up to and not including the BottomNavBar comment

const newAdminEnd = html.indexOf('</div>\n\n\n    <!-- BottomNavBar');
const oldAdminStart = html.indexOf('\n\n\n<div class="absolute inset-0 w-full h-full -z-10"');

if (oldAdminStart !== -1 && oldAdminStart < newAdminEnd) {
    // Remove the orphaned block
    const before = html.substring(0, oldAdminStart);
    const after = html.substring(newAdminEnd);
    html = before + after;
    fs.writeFileSync('index.html', html);
    console.log('Removed orphaned old admin HTML successfully.');
} else {
    // Try alternate approach - find by unique content
    const startMarker = '\n\n<div class="absolute inset-0 w-full h-full -z-10" style="display:block;">';
    const endMarker = '</div>\n\n\n    <!-- BottomNavBar';
    
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker);
    
    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        html = html.substring(0, startIdx) + '\n\n' + html.substring(endIdx);
        fs.writeFileSync('index.html', html);
        console.log('Removed orphaned block via alternate method. Start:', startIdx, 'End:', endIdx);
    } else {
        console.log('Could not find orphaned block. Start:', startIdx, 'End:', endIdx);
    }
}
