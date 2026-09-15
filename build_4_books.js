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
function generateHtml(title, markdownBody) {
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

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
${katexCss}

  @page {
    size: A4;
    margin: 18mm 15mm 18mm 15mm;
  }
  body {
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    line-height: 1.65;
    color: #222;
    background-color: #fff;
    margin: 0;
    padding: 0;
    font-size: 14.5px;
  }
  h1 {
    font-size: 23px;
    color: #1a365d;
    border-bottom: 2px solid #2b6cb0;
    padding-bottom: 6px;
    margin-top: 26px;
    page-break-after: avoid;
  }
  h2 {
    font-size: 18px;
    color: #2c5282;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 22px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 15px;
    color: #2b6cb0;
    margin-top: 18px;
    page-break-after: avoid;
  }
  p { margin: 8px 0; }
  code {
    background-color: #f1f5f9;
    color: #c53030;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
  }
  pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
  }
  pre code {
    background-color: transparent;
    color: #334155;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #3182ce;
    margin: 12px 0;
    padding: 10px 14px;
    background: #ebf8ff;
    border-radius: 0 6px 6px 0;
    color: #2b6cb0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 15px 0;
    font-size: 13px;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 8px 10px;
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
    font-size: 1.05em;
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
function buildBook(bookNumber, name, title, files) {
    console.log(`\n==================================================`);
    console.log(`[제${bookNumber}권] ${title}`);
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

    const htmlPath = path.join(htmlDir, `${name}.html`);
    const pdfPath = path.join(pdfDir, `${name}.pdf`);

    // 1단계: HTML 생성
    console.log(`  -> [1단계] HTML 변환 및 저장 중...`);
    const htmlContent = generateHtml(title, combinedMarkdown);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`  -> [완료] HTML 저장: ${path.basename(htmlPath)}`);

    // 2단계: PDF 생성
    convertHtmlToPdf(htmlPath, pdfPath);
}

// ==============================================================================
// [제1권] 특별전형 안내 및 실전대비 통합본
// ==============================================================================
const book1Files = [
    path.join(__dirname, '00_입시요강', '특별전형', '01_심층면접_안내.md'),
    path.join(__dirname, '02_특별전형', 'md', '00_특별전형_합격_마스터가이드.md'),
    path.join(__dirname, '02_특별전형', 'md', '01_스쿨배틀_실적설명서_작성_및_보완가이드.md'),
    path.join(__dirname, '02_특별전형', 'md', '02_3분_보조영상_촬영_시나리오_및_큐시트.md'),
    path.join(__dirname, '02_특별전형', 'md', '03_자기소개서_및_학업창업계획서_가이드.md'),
    path.join(__dirname, '02_특별전형', 'md', '04_심층면접_기출분석_및_실전_답변대본.md'),
    path.join(__dirname, '02_특별전형', 'md', '05_스쿨배틀_완전내재화_마스터플랜.md'),
    path.join(__dirname, '02_특별전형', 'md', '06_교사인터뷰.md'),
    path.join(__dirname, '02_특별전형', 'md', '07_심사위원_예상질문리스트.md')
];
buildBook('1권', '01_디미고_특별전형_안내_및_실전합격_통합본', '디미고 진로적성특별전형 합격 마스터가이드 및 실전대비 통합본', book1Files);

// ==============================================================================
// [제2권] 일반전형 가이드 및 IT 필수 용어사전
// ==============================================================================
const book2Files = [
    path.join(__dirname, '00_입시요강', '일반전형', '01_소질적성검사_안내.md'),
    path.join(__dirname, '00_입시요강', '일반전형', '02_일반면접_안내.md'),
    path.join(__dirname, '01_일반전형', '01_가이드및용어집', '01_IT_및_소질적성_통합_용어사전.md')
];
buildBook('2권', '02_디미고_소질적성_입시가이드_및_용어사전', '디미고 소질·적성검사 입시 가이드 및 IT 필수 용어사전', book2Files);

// ==============================================================================
// [제3권] 일반전형 소질적성검사 기본개념 완성본
// ==============================================================================
const book3Files = [
    path.join(__dirname, '01_일반전형', '02_기본개념', '01_논리적추론.md'),
    path.join(__dirname, '01_일반전형', '02_기본개념', '02_이산수학.md'),
    path.join(__dirname, '01_일반전형', '02_기본개념', '03_컴퓨팅사고력.md')
];
buildBook('3권', '03_디미고_소질적성검사_기본개념_완성본', '디미고 소질·적성검사 3대 영역 기본개념 완성본', book3Files);

// ==============================================================================
// [제4권] 일반전형 소질적성검사 100점 만점 심화특강 완성본
// ==============================================================================
const book4Files = [
    path.join(__dirname, '01_일반전형', '03_심화과정', '01_비버챌린지_집중공략.md'),
    path.join(__dirname, '01_일반전형', '03_심화과정', '02_정렬알고리즘_특강.md'),
    path.join(__dirname, '01_일반전형', '03_심화과정', '03_필수_알고리즘_및_회로특강.md')
];
buildBook('4권', '04_디미고_소질적성검사_심화특강_완성본', '디미고 소질·적성검사 100점 만점 심화특강 완성본', book4Files);

console.log('\n==================================================');
console.log('🎉 4대 A4 인쇄용 통합 HTML 및 PDF 생성이 모두 완료되었습니다!');
console.log('저장 위치: 00_A4인쇄용_통합교재_4종/');
console.log('  1. 01_디미고_특별전형_안내_및_실전합격_통합본.pdf');
console.log('  2. 02_디미고_소질적성_입시가이드_및_용어사전.pdf');
console.log('  3. 03_디미고_소질적성검사_기본개념_완성본.pdf');
console.log('  4. 04_디미고_소질적성검사_심화특강_완성본.pdf');
console.log('==================================================\n');
