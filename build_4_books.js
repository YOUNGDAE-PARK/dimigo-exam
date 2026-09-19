const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let katex = require('katex');
let marked = require('marked');

console.log('=== 디미고 입시 A4 인쇄용 4대 통합 교재 빌더 시작 ===\n');

// 1. 브라우저 경로 탐색
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

if (!browserPath) {
    console.error('Chrome 또는 Edge 브라우저를 찾을 수 없습니다.');
    process.exit(1);
}

// 2. 수식($...$, $$...$$)을 KaTeX HTML로 변환
function renderMathInMarkdown(text) {
    const codeBlocks = [];
    let protectedText = text.replace(/(```[\s\S]*?```)/g, (match) => {
        codeBlocks.push(match);
        return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });
    protectedText = protectedText.replace(/(`[^`\n]+`)/g, (match) => {
        codeBlocks.push(match);
        return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });

    // 볼드 태그 마크다운 경계 버그 방지
    protectedText = protectedText.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>');

    // 블록 수식 $$...$$
    protectedText = protectedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
        try {
            return `\n\n<div class="katex-display">${katex.renderToString(math.trim(), { displayMode: true, output: 'html', throwOnError: false })}</div>\n\n`;
        } catch (e) {
            return match;
        }
    });

    // 인라인 수식 $...$
    protectedText = protectedText.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), { displayMode: false, output: 'html', throwOnError: false });
        } catch (e) {
            return match;
        }
    });

    // 코드 블록 복원
    protectedText = protectedText.replace(/%%CODEBLOCK_(\d+)%%/g, (match, index) => {
        return codeBlocks[parseInt(index, 10)];
    });

    return protectedText;
}

// 3. 인쇄 최적화 A4 HTML 생성기
function generateHtml(title, markdownBody, is2Up = false) {
    const renderer = new marked.Renderer();
    const originalCode = renderer.code.bind(renderer);
    renderer.code = (code, language) => {
        if (language === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
        }
        return originalCode(code, language);
    };
    marked.setOptions({ renderer, breaks: true, gfm: true });

    const mathProcessedMarkdown = renderMathInMarkdown(markdownBody);
    const htmlContent = marked.parse(mathProcessedMarkdown);

    let katexCss = '';
    const katexCssPath = path.join(__dirname, 'node_modules/katex/dist/katex.min.css');
    if (fs.existsSync(katexCssPath)) {
        const rawCss = fs.readFileSync(katexCssPath, 'utf8');
        const fontsDir = path.join(__dirname, 'node_modules/katex/dist/fonts').replace(/\\/g, '/');
        katexCss = rawCss.replace(/url\(fonts\//g, `url('file:///${fontsDir}/`);
    }

    const pageMargin = is2Up ? '10mm 10mm 10mm 10mm' : '18mm 15mm 18mm 15mm';
    const bodyFontSize = is2Up ? '20px' : '14.5px';
    const h1FontSize = is2Up ? '29px' : '23px';
    const h2FontSize = is2Up ? '24px' : '18px';
    const h3FontSize = is2Up ? '20px' : '15px';
    const codeFontSize = is2Up ? '17.5px' : '13px';
    const tableFontSize = is2Up ? '16.5px' : '13px';
    const blockquoteFontSize = is2Up ? '19px' : '14px';

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
${katexCss}

  @page {
    size: A4;
    margin: ${pageMargin};
  }
  body {
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    line-height: 1.68;
    color: #1a202c;
    background-color: #fff;
    margin: 0;
    padding: 0;
    font-size: ${bodyFontSize};
  }
  h1 {
    font-size: ${h1FontSize};
    color: #1a365d;
    border-bottom: 2.5px solid #2b6cb0;
    padding-bottom: 7px;
    margin-top: 28px;
    page-break-after: avoid;
  }
  h2 {
    font-size: ${h2FontSize};
    color: #2c5282;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 24px;
    page-break-after: avoid;
  }
  h3 {
    font-size: ${h3FontSize};
    color: #2b6cb0;
    margin-top: 20px;
    page-break-after: avoid;
  }
  p { margin: 9px 0; }
  code {
    background-color: #f1f5f9;
    color: #c53030;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: ${codeFontSize};
  }
  pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 14px;
    overflow-x: auto;
    font-size: ${codeFontSize};
    line-height: 1.5;
  }
  pre code {
    background-color: transparent;
    color: #334155;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #3182ce;
    margin: 14px 0;
    padding: 10px 16px;
    background: #ebf8ff;
    border-radius: 0 6px 6px 0;
    color: #2b6cb0;
    font-size: ${blockquoteFontSize};
    line-height: 1.6;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 15px 0;
    font-size: ${tableFontSize};
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 8px 11px;
    text-align: left;
  }
  th {
    background-color: #f1f5f9;
    font-weight: bold;
    color: #1e293b;
    text-align: center;
  }
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 24px 0;
  }
  .page-break {
    page-break-after: always;
    break-after: page;
    height: 0;
    margin: 0;
    padding: 0;
  }
  .katex {
    font-size: 1.1em;
  }
  .katex-display {
    margin: 12px 0;
    text-align: center;
  }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
}

// 4. HTML -> PDF 변환기 (파일 잠금 감지 및 안전 렌더링)
function convertHtmlToPdf(htmlPath, pdfPath) {
    const fullHtml = path.resolve(htmlPath);
    const fullPdf = path.resolve(pdfPath);
    const fileUrl = 'file:///' + fullHtml.replace(/\\/g, '/');
    const tempProfile = path.join(process.env.TEMP || 'C:\\temp', 'browser-pdf-profile-' + Math.floor(Math.random() * 100000));

    if (fs.existsSync(fullPdf)) {
        try {
            fs.unlinkSync(fullPdf);
        } catch (err) {
            console.error(`\n[주의] ${path.basename(pdfPath)} 파일이 PDF 뷰어에서 열려 있어 갱신하지 못할 수 있습니다.`);
            console.error(`PDF 뷰어를 닫아주셔야 새 내용으로 저장됩니다.\n`);
        }
    }

    console.log(`  -> [2단계] PDF 렌더링 중: ${path.basename(pdfPath)}...`);
    const script = `& { Start-Process -FilePath '${browserPath}' -ArgumentList '--headless', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files', '--user-data-dir=${tempProfile}', '--print-to-pdf=${fullPdf}', '${fileUrl}' -Wait }`;
    
    execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '`"')}"`, { stdio: 'inherit' });

    if (fs.existsSync(fullPdf)) {
        const stats = fs.statSync(fullPdf);
        console.log(`  -> [완료] PDF 생성 성공 (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
        console.warn(`  -> [경고] PDF 생성 실패 또는 파일 잠금 상태.`);
    }
}

// 5. 단일 타겟 빌드 함수 (HTML 생성 -> PDF 생성)
function buildBook(bookNumber, name, title, files, is2Up = false) {
    const finalName = is2Up ? `${name}_모아찍기용` : name;
    const finalTitle = is2Up ? `${title} (모아찍기용 - 큰 글씨)` : title;

    console.log(`\n==================================================`);
    console.log(`[제${bookNumber.replace('권', '')}권${is2Up ? ' - 모아찍기용' : ''}] ${finalTitle}`);
    console.log(`==================================================`);

    let combinedMarkdown = '';
    files.forEach((file) => {
        if (!fs.existsSync(file)) {
            console.warn(`  [경고] 파일이 존재하지 않습니다: ${file}`);
            return;
        }
        console.log(`  + 병합 파일: ${path.basename(file)}`);
        const content = fs.readFileSync(file, 'utf8');
        combinedMarkdown += content + '\n\n<div class="page-break"></div>\n\n';
    });

    // 출력 디렉토리: 00_A4인쇄용_통합교재_4종
    const baseOutDir = path.join(__dirname, '00_A4인쇄용_통합교재_4종');
    const htmlDir = path.join(baseOutDir, 'html');
    const pdfDir = path.join(baseOutDir, 'pdf');

    [baseOutDir, htmlDir, pdfDir].forEach(d => {
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    const htmlPath = path.join(htmlDir, `${finalName}.html`);
    const pdfPath = path.join(pdfDir, `${finalName}.pdf`);

    // 1단계: HTML 생성
    console.log(`  -> [1단계] HTML 변환 및 저장 중...`);
    const htmlContent = generateHtml(finalTitle, combinedMarkdown, is2Up);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`  -> [완료] HTML 저장: ${path.basename(htmlPath)}`);

    // 2단계: PDF 생성
    convertHtmlToPdf(htmlPath, pdfPath);
}

// 도서 목록 정의
const books = [
    {
        num: '1권',
        name: '01_디미고_입시전형요강_종합안내',
        title: '디미고 입시 전형 요강 종합 안내서 (일반전형 소질적성·면접 및 특별전형 심층면접)',
        files: [
            path.join(__dirname, '00_입시요강', '일반전형', '01_소질적성검사_안내.md'),
            path.join(__dirname, '00_입시요강', '일반전형', '02_일반면접_안내.md'),
            path.join(__dirname, '00_입시요강', '특별전형', '01_심층면접_안내.md')
        ]
    },
    {
        num: '2권',
        name: '02_디미고_IT필수_용어사전_및_영어독해',
        title: '디미고 소질·적성검사 IT 필수 용어사전 및 영어 융합 독해집',
        files: [
            path.join(__dirname, '01_일반전형', '01_가이드및용어집', '01_IT_및_소질적성_통합_용어사전.md')
        ]
    },
    {
        num: '3권',
        name: '03_디미고_소질적성검사_기본개념_완성본',
        title: '디미고 소질·적성검사 3대 영역 기본개념 완성본',
        files: [
            path.join(__dirname, '01_일반전형', '02_기본개념', '01_논리적추론.md'),
            path.join(__dirname, '01_일반전형', '02_기본개념', '02_이산수학.md'),
            path.join(__dirname, '01_일반전형', '02_기본개념', '03_컴퓨팅사고력.md')
        ]
    },
    {
        num: '4권',
        name: '04_디미고_소질적성검사_심화특강_완성본',
        title: '디미고 소질·적성검사 100점 만점 심화특강 완성본',
        files: [
            path.join(__dirname, '01_일반전형', '03_심화과정', '01_비버챌린지_집중공략.md'),
            path.join(__dirname, '01_일반전형', '03_심화과정', '02_정렬알고리즘_특강.md'),
            path.join(__dirname, '01_일반전형', '03_심화과정', '03_필수_알고리즘_및_회로특강.md')
        ]
    }
];

// CLI 옵션 분석
const rawArgs = process.argv.slice(2);
const is2Up = rawArgs.includes('--2up');
let targetBookNums = null;

const bookArgIndex = rawArgs.indexOf('--book');
if (bookArgIndex !== -1 && rawArgs[bookArgIndex + 1]) {
    targetBookNums = [rawArgs[bookArgIndex + 1]];
} else {
    const bookArgEquals = rawArgs.find(a => a.startsWith('--book='));
    if (bookArgEquals) targetBookNums = [bookArgEquals.split('=')[1]];
}

const targets = targetBookNums
    ? books.filter(b => targetBookNums.some(n => b.num.includes(n) || b.name.includes(n)))
    : books;

targets.forEach(b => {
    buildBook(b.num, b.name, b.title, b.files, is2Up);
});

console.log('\n==================================================');
console.log(`🎉 작업이 완료되었습니다! (모드: ${is2Up ? '2쪽 모아찍기용 큰 글씨' : '1쪽 표준'})`);
console.log('저장 위치: 00_A4인쇄용_통합교재_4종/');
targets.forEach(b => {
    const fn = is2Up ? `${b.name}_모아찍기용.pdf` : `${b.name}.pdf`;
    console.log(`  - ${fn}`);
});
console.log('==================================================\n');

