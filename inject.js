const fs = require('fs');

const createAccountHtml = fs.readFileSync('create_account_find_it/code.html', 'utf8');
const createAccountMain = createAccountHtml.match(/<main[\s\S]*?<\/main>/)[0];
const createAccountStyleMatch = createAccountHtml.match(/<style>([\s\S]*?)<\/style>/);
const createAccountStyle = createAccountStyleMatch ? createAccountStyleMatch[1] : '';

const forgotPasswordHtml = fs.readFileSync('forgot_password_updated_layout/code.html', 'utf8');
const forgotPasswordContent = forgotPasswordHtml.match(/<div class="relative overflow-hidden min-h-screen">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0];

let indexHtml = fs.readFileSync('index.html', 'utf8');

const createAccountView = `
        <!-- ==================== 0a. CREATE ACCOUNT VIEW ==================== -->
        <div id="view-create-account" class="view-section hidden ambient-mesh fixed inset-0 z-[100] overflow-y-auto min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop antialiased">
            <style>${createAccountStyle}</style>
            ${createAccountMain}
        </div>`;

const forgotPasswordView = `
        <!-- ==================== 0b. FORGOT PASSWORD VIEW ==================== -->
        <div id="view-forgot-password" class="view-section hidden fixed inset-0 z-[100] bg-background text-on-background font-body overflow-y-auto min-h-screen antialiased">
            ${forgotPasswordContent}
        </div>`;

indexHtml = indexHtml.replace('<!-- ==================== 1. HOME (FEED) VIEW ==================== -->', createAccountView + '\n\n' + forgotPasswordView + '\n\n        <!-- ==================== 1. HOME (FEED) VIEW ==================== -->');

// Also update login buttons
indexHtml = indexHtml.replace(
    '<a href="#" class="font-label-sm text-label-sm text-primary hover:underline">Forgot?</a>',
    '<a href="#" onclick="event.preventDefault(); navigateTo(\'forgot-password\')" class="font-label-sm text-label-sm text-primary hover:underline">Forgot?</a>'
);
indexHtml = indexHtml.replace(
    '<button type="button" class="w-full bg-transparent border border-outline-variant text-on-surface font-body-md text-body-md font-bold py-sm rounded-lg hover:bg-surface-container transition-all">',
    '<button type="button" onclick="navigateTo(\'create-account\')" class="w-full bg-transparent border border-outline-variant text-on-surface font-body-md text-body-md font-bold py-sm rounded-lg hover:bg-surface-container transition-all">'
);

// Update back links inside new views
indexHtml = indexHtml.replace(
    '<a class="font-medium text-primary hover:text-primary-fixed transition-colors" href="#">Sign In</a>',
    '<a class="font-medium text-primary hover:text-primary-fixed transition-colors" href="#" onclick="event.preventDefault(); navigateTo(\'login\')">Sign In</a>'
);

indexHtml = indexHtml.replace(
    '<a class="text-on-surface-variant hover:text-primary transition-colors font-body text-body-sm flex items-center justify-center gap-1" href="#">',
    '<a class="text-on-surface-variant hover:text-primary transition-colors font-body text-body-sm flex items-center justify-center gap-1" href="#" onclick="event.preventDefault(); navigateTo(\'login\')">'
);

fs.writeFileSync('index.html', indexHtml);
console.log('Successfully injected views into index.html');
