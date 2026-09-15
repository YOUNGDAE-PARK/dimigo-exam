const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

const specialDir = path.join(__dirname, '02_특별전형');
const mdDir = path.join(specialDir, 'md');
const htmlDir = path.join(specialDir, 'html');
const pdfDir = path.join(specialDir, 'pdf');

[mdDir, htmlDir, pdfDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const browserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
let browserPath = browserPaths.find(p => fs.existsSync(p));

function generateHtml(title, markdownText) {
    let protectedText = markdownText.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>');
    const parsedHtml = marked.parse(protectedText);
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard/dist/web/static/pretendard.css">
    <style>
        @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
        body { font-family: 'Pretendard', sans-serif; line-height: 1.7; color: #222; margin: 0; padding: 25px 35px; font-size: 15px; }
        .page-break { page-break-before: always; break-before: page; height: 0; margin: 0; }
        h1 { color: #111; border-bottom: 3px solid #ff196f; padding-bottom: 10px; margin-top: 20px; font-size: 24px; }
        h2 { color: #2c3e50; border-left: 5px solid #202020; padding-left: 10px; margin-top: 24px; font-size: 19px; }
        h3 { color: #333; margin-top: 18px; font-size: 16px; }
        blockquote { background-color: #f8f9fa; border-left: 5px solid #ff196f; margin: 15px 0; padding: 12px 16px; border-radius: 4px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
        th, td { border: 1px solid #dcdcdc; padding: 9px 11px; text-align: left; }
        th { background-color: #f1f3f5; font-weight: bold; }
        pre, code { font-family: 'Consolas', monospace; background: #f1f3f5; padding: 2px 6px; border-radius: 4px; }
        pre { padding: 12px; border-left: 4px solid #6c5ce7; }
        hr { border: 0; height: 1px; background: #e0e0e0; margin: 20px 0; }
    </style>
</head>
<body>${parsedHtml}</body>
</html>`;
}

function convertHtmlToPdf(htmlPath, pdfPath) {
    const fullHtml = path.resolve(htmlPath);
    const fullPdf = path.resolve(pdfPath);
    const fileUrl = 'file:///' + fullHtml.replace(/\\/g, '/');
    const tempProfile = path.join(__dirname, '.chrome-temp-print-item');
    if (fs.existsSync(fullPdf)) {
        try { fs.unlinkSync(fullPdf); } catch(e) {}
    }
    const script = `& { Start-Process -FilePath '${browserPath}' -ArgumentList '--headless', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files', '--user-data-dir=${tempProfile}', '--print-to-pdf=${fullPdf}', '${fileUrl}' -Wait }`;
    execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '`"')}"`, { stdio: 'ignore' });
}

const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith('.md') && f !== 'ref.md');
mdFiles.sort();

let combinedMd = '';
mdFiles.forEach(file => {
    const baseName = path.parse(file).name;
    const content = fs.readFileSync(path.join(mdDir, file), 'utf8');
    combinedMd += content + '\n\n<div class="page-break"></div>\n\n';
    
    // 개별 파일 생성 (특별전형/html, 특별전형/pdf)
    const htmlFile = path.join(htmlDir, baseName + '.html');
    const pdfFile = path.join(pdfDir, baseName + '.pdf');
    fs.writeFileSync(htmlFile, generateHtml(baseName, content), 'utf8');
    convertHtmlToPdf(htmlFile, pdfFile);
    console.log('생성 완료: ' + baseName + ' -> html/, pdf/');
});

// 전체 통합본도 특별전형 내부 각각 html, pdf 폴더에 생성
const totalHtml = path.join(htmlDir, '00_디미고_특별전형_전체통합본.html');
const totalPdf = path.join(pdfDir, '00_디미고_특별전형_전체통합본.pdf');
fs.writeFileSync(totalHtml, generateHtml('디미고 특별전형 전체 통합본', combinedMd), 'utf8');
convertHtmlToPdf(totalHtml, totalPdf);
console.log('생성 완료: 00_디미고_특별전형_전체통합본 -> html/, pdf/');

