const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let katex;
try {
    katex = require('katex');
} catch(e) {
    console.log("Installing 'katex' for professional math rendering...");
    execSync('npm install katex --save', { stdio: 'inherit' });
    katex = require('katex');
}

console.log('=== 디미고 입시 자료 3분할 PDF 빌더 시작 ===\n');

// 1. 재귀적으로 마크다운 파일 탐색 (정렬 유지)
function getMarkdownFiles(dir, filterRegex = null) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR', { numeric: true }));

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getMarkdownFiles(fullPath, filterRegex));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            if (filterRegex && !filterRegex.test(entry.name)) continue;
            results.push(fullPath);
        }
    }
    return results;
}

// 2. 수식($...$, $$...$$)을 전문 수학 기호(KaTeX HTML)로 변환하는 전처리기
function renderMathInMarkdown(text) {
    const codeBlocks = [];
    // 코드 블록(```...```) 보호
    let protectedText = text.replace(/(```[\s\S]*?```)/g, (match) => {
        codeBlocks.push(match);
        return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });
    // 인라인 코드(`...`) 보호
    protectedText = protectedText.replace(/(`[^`\n]+`)/g, (match) => {
        codeBlocks.push(match);
        return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });

    // 마크다운 파서(CommonMark)에서 한글 조사, 괄호, 따옴표와 결합될 때 ** 가 닫히지 않고 날것으로 노출되는 버그 원천 방지
    protectedText = protectedText.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>');

    // 블록 수식 $$ ... $$ 변환 (순수 HTML 렌더링으로 annotation 태그 노출 방지)
    protectedText = protectedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
        try {
            return `\n\n<div class="katex-display">${katex.renderToString(math.trim(), { displayMode: true, output: 'html', throwOnError: false })}</div>\n\n`;
        } catch (e) {
            return match;
        }
    });

    // 인라인 수식 $ ... $ 변환 (순수 HTML 렌더링)
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

// 3. HTML 템플릿 생성기 (인쇄 최적화 + KaTeX 내장 스타일)
function generateHtml(title, markdownBody, options = {}) {
    const fontDelta = options.fontDelta || 0;
    let marked;
    try {
        marked = require('marked');
    } catch(e) {
        console.log("marked 라이브러리 확인 중...");
        execSync('npm install marked --no-save', { stdio: 'inherit' });
        marked = require('marked');
    }

    const renderer = new marked.Renderer();
    const originalCode = renderer.code.bind(renderer);
    renderer.code = (code, language) => {
        if (language === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
        }
        return originalCode(code, language);
    };
    marked.setOptions({ renderer, breaks: true, gfm: true });

    // 수식 변환 적용
    const mathProcessedMarkdown = renderMathInMarkdown(markdownBody);
    const htmlContent = marked.parse(mathProcessedMarkdown);

    // KaTeX CSS 로드 및 폰트 경로 보정
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
    font-size: ${13 + fontDelta}px;
  }
  h1 {
    font-size: ${22 + fontDelta}px;
    color: #1a365d;
    border-bottom: 2px solid #2b6cb0;
    padding-bottom: 6px;
    margin-top: 28px;
    page-break-after: avoid;
  }
  h2 {
    font-size: ${18 + fontDelta}px;
    color: #2c5282;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 24px;
    page-break-after: avoid;
  }
  h3 {
    font-size: ${15 + fontDelta}px;
    color: #2b6cb0;
    margin-top: 20px;
    page-break-after: avoid;
  }
  p { margin: 8px 0; }
  code {
    background-color: #f1f5f9;
    color: #c53030;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: ${12 + fontDelta}px;
  }
  pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
    font-size: ${12 + fontDelta}px;
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
    font-size: ${12 + fontDelta}px;
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
    margin: 25px 0;
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

// 4. 브라우저 엔진을 통한 직접 PDF 출력 (파일 잠금 감지 및 강제 갱신)
function convertHtmlToPdf(htmlFile, pdfFile) {
    const fullHtmlPath = path.resolve(htmlFile);
    const fullPdfPath = path.resolve(pdfFile);
    const fileUrl = 'file:///' + fullHtmlPath.replace(/\\/g, '/');
    const tempProfile = path.join(process.env.TEMP || 'C:\\temp', 'browser-pdf-profile-' + Math.floor(Math.random() * 100000));

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const browserPath = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

    if (!browserPath) {
        throw new Error('Chrome 또는 Edge 브라우저를 찾을 수 없습니다.');
    }

    // 기존 PDF가 열려 있는지 확인하고 삭제 (잠금 시 경고 출력)
    if (fs.existsSync(fullPdfPath)) {
        try {
            fs.unlinkSync(fullPdfPath);
        } catch (err) {
            console.error(`\n[주의] ${pdfFile} 파일이 PDF 뷰어(Acrobat/Edge)에서 열려 있어 갱신하지 못할 수 있습니다.`);
            console.error(`문서 뷰어를 닫아주셔야 새 내용으로 저장됩니다.\n`);
        }
    }

    console.log(`  -> PDF 렌더링 중: ${pdfFile}...`);
    const script = `& { Start-Process -FilePath '${browserPath}' -ArgumentList '--headless', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files', '--user-data-dir=${tempProfile}', '--print-to-pdf=${fullPdfPath}', '${fileUrl}' -Wait }`;
    
    execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '`"')}"`, { stdio: 'inherit' });

    if (fs.existsSync(fullPdfPath)) {
        const stats = fs.statSync(fullPdfPath);
        console.log(`  -> [완료] ${pdfFile} (${(stats.size / 1024).toFixed(1)} KB) - 갱신 성공`);
    } else {
        console.warn(`  -> [경고] ${pdfFile} 생성을 확인하지 못했습니다.`);
    }
}

// 5. 빌드 타겟 병합 및 빌드 함수
function buildTarget(name, files, title, options = {}) {
    console.log(`\n========================================`);
    console.log(`[타겟 빌드] ${title}`);
    if (options.fontDelta) {
        console.log(`  (폰트 크기 조정: +${options.fontDelta}px 적용)`);
    }
    console.log(`========================================`);

    let combinedMarkdown = '';
    files.forEach((file) => {
        console.log(`  + 파일 병합: ${file}`);
        const content = fs.readFileSync(file, 'utf8');
        combinedMarkdown += content + '\n\n<div class="page-break"></div>\n\n';
    });

    const outDir = path.join('01_일반전형', '05_소질적성검사_완성본');
    const mdDir = path.join(outDir, 'md');
    const htmlDir = path.join(outDir, 'html');
    const pdfDir = path.join(outDir, 'pdf');

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir);
    if (!fs.existsSync(htmlDir)) fs.mkdirSync(htmlDir);
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

    const mdPath = path.join(mdDir, `${name}.md`);
    const htmlPath = path.join(htmlDir, `${name}.html`);
    const pdfPath = path.join(pdfDir, `${name}.pdf`);

    fs.writeFileSync(mdPath, combinedMarkdown, 'utf8');
    console.log(`  -> 마크다운 저장: ${mdPath}`);

    const htmlContent = generateHtml(title, combinedMarkdown, options);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`  -> HTML 변환 저장 (수식 KaTeX 적용 완료): ${htmlPath}`);

    convertHtmlToPdf(htmlPath, pdfPath);
}

// [타겟 1] 이론 통합본 (01_가이드및용어집, 02_기본개념, 03_심화과정)
const theoryFolders = ['01_가이드및용어집', '02_기본개념', '03_심화과정'].map(f => path.join('01_일반전형', f));
let theoryFiles = [];
theoryFolders.forEach(folder => {
    theoryFiles = theoryFiles.concat(getMarkdownFiles(folder));
});
buildTarget('디미고_소질적성검사_이론통합본', theoryFiles, '한국디지털미디어고등학교 소질·적성검사 이론 통합본', { fontDelta: 4 });

// [타겟 2] 실전 모의고사 문제지 (04_실전모의고사 내 00_안내 및 01_문제지들: 1회~6회)
const mockDir = path.join('01_일반전형', '04_실전모의고사');
let questionFiles = getMarkdownFiles(mockDir, /00_모의고사_안내\.md|01_문제지\.md/);
buildTarget('디미고_실전모의고사_문제지', questionFiles, '디미고 소질·적성검사 실전 모의고사 (문제지)');

// [타겟 3] 실전 모의고사 해설지 (04_실전모의고사 내 02_정답및해설들: 1회~6회)
let answerFiles = getMarkdownFiles(mockDir, /02_정답및해설\.md/);
buildTarget('디미고_실전모의고사_해설지', answerFiles, '디미고 소질·적성검사 실전 모의고사 (정답 및 해설지)');

console.log('\n========================================');
console.log('🎉 수식이 정상 변환된 3종 PDF 문서 생성이 모두 완료되었습니다!');
console.log('1. 디미고_소질적성검사_이론통합본.pdf');
console.log('2. 디미고_실전모의고사_문제지.pdf');
console.log('3. 디미고_실전모의고사_해설지.pdf');
console.log('========================================\n');
