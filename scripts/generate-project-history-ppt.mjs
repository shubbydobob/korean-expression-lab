import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "docs", "generated", "project-history-ppt");
const pptxPath = path.join(rootDir, "docs", "generated", "korean-project-history.pptx");
const assetsDir = path.join(rootDir, "docs", "generated", "assets");
const slideImageFiles = {
  1: "slide-01-harness-cover.png",
  2: "slide-02-review-gate.png",
  3: "slide-03-project-world.png",
};

const slides = [
  {
    title: "Harness Engineering이란 무엇인가",
    subtitle: "AI 기능을 제품 운영 시스템으로 다루는 방식",
    bullets: [
      "Prompt, Schema, Fallback, Eval, Review를 하나의 운영 구조로 묶는다.",
      "좋은 답변보다 먼저, 안전하고 검수 가능한 시스템을 만든다.",
    ],
  },
  {
    title: "왜 이 프로젝트에 하네스 엔지니어링이 필요한가",
    subtitle: "교육 콘텐츠는 생성보다 통제가 더 중요하다",
    bullets: [
      "스키마 없는 응답 저장 금지. 평가 없는 승격 금지. 미검수 공개 금지.",
      "Korean Expression Lab은 생성 서비스가 아니라 검수 가능한 교육 운영 시스템이다.",
    ],
  },
  {
    title: "Korean Expression Lab",
    subtitle: "Public Learning, Admin Workflow, AI Harness",
    bullets: [
      "회원가입 없는 공개 학습 경험",
      "내부 운영자를 위한 관리자 워크플로와 AI 검수 하네스",
    ],
  },
  {
    title: "1. 문제 정의와 제품 원칙",
    bullets: [
      "회원가입 없이 누구나 공개 학습 자료를 탐색할 수 있게 설계",
      "AI 결과는 바로 공개하지 않고, 사람 검수를 통과한 결과만 노출",
    ],
  },
  {
    title: "2. 초기 기술 기반 구축",
    bullets: [
      "Next.js App Router, TypeScript, Tailwind CSS로 빠르게 제품 뼈대 구축",
      "공개 영역, 관리자 영역, Postgres 기준 데이터 설계를 동시에 정리",
    ],
  },
  {
    title: "3. 공개 사용자 경험 구현",
    bullets: [
      "공개 홈은 학습 트랙, 표현 카드, AI 교정 실험을 한 화면에 배치",
      "published 상태 콘텐츠만 노출해 공개 경험과 운영 통제를 분리",
    ],
  },
  {
    title: "4. 관리자 워크스페이스 구현",
    bullets: [
      "관리자 영역은 로그인 보호, 리뷰 큐, 상태 전이 중심으로 설계",
      "프롬프트, eval, 최근 AI 실행 로그를 운영 화면에서 직접 추적",
    ],
  },
  {
    title: "5. AI 하네스 설계",
    bullets: [
      "AI 로직을 src/lib/ai로 분리하고, 라우트는 입출력만 담당",
      "Prompt Registry, Schema, Harness, Fallback 계층으로 운영 구조를 고정",
    ],
  },
  {
    title: "6. 검수와 평가 체계 반영",
    bullets: [
      "프롬프트 버전, Eval Set, Eval Run, AI Run을 모두 추적 가능한 자산으로 관리",
      "새 버전은 평가를 거쳐야 하고, 콘텐츠는 검수를 거쳐야만 공개된다",
    ],
  },
  {
    title: "7. 데이터 모델과 운영 설계",
    bullets: [
      "콘텐츠, 프롬프트 버전, 평가 결과, 발행 작업을 하나의 흐름으로 연결",
      "Postgres 기준 모델로 이후 실운영 전환을 준비",
    ],
  },
  {
    title: "8. 실제 커밋 이력 기준 진행 순서",
    bullets: [
      "Initial commit에서 앱 구조, 관리자, AI 하네스, 문서, DB 초안까지 한 번에 구축",
      "그 다음 README를 제품 목표와 운영 원칙 중심으로 다시 정렬",
    ],
  },
  {
    title: "9. 현재 상태와 다음 확장 방향",
    bullets: [
      "현재는 샘플 데이터 기반 초기 제품이지만, 운영 구조와 품질 원칙은 이미 고정됐다",
      "다음 단계는 실제 DB 연동과 콘텐츠 운영 고도화다",
    ],
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function xml(strings, ...values) {
  return strings.reduce((acc, part, index) => acc + part + (values[index] ?? ""), "");
}

function textRuns(text, fontSize = 1800, bold = false) {
  return xml`<a:r><a:rPr lang="ko-KR" sz="${fontSize}"${bold ? ' b="1"' : ""} dirty="0" smtClean="0"/><a:t>${escapeXml(text)}</a:t></a:r>`;
}

function paragraph(text, options = {}) {
  const { level = 0, fontSize = 1800, bold = false, before = 0, after = 0 } = options;
  return xml`<a:p><a:pPr lvl="${level}" marL="${level === 0 ? 0 : 342900}" indent="0"><a:spcBef><a:spcPts val="${before}"/></a:spcBef><a:spcAft><a:spcPts val="${after}"/></a:spcAft><a:buChar char="•"/></a:pPr>${textRuns(text, fontSize, bold)}<a:endParaRPr lang="ko-KR" sz="${fontSize}"/></a:p>`;
}

function titleParagraph(text) {
  return xml`<a:p><a:pPr algn="l"/><a:r><a:rPr lang="ko-KR" sz="3000" b="1"/><a:t>${escapeXml(text)}</a:t></a:r><a:endParaRPr lang="ko-KR" sz="3000"/></a:p>`;
}

function subtitleParagraph(text) {
  return xml`<a:p><a:pPr algn="l"/><a:r><a:rPr lang="ko-KR" sz="1600"/><a:t>${escapeXml(text)}</a:t></a:r><a:endParaRPr lang="ko-KR" sz="1600"/></a:p>`;
}

function shapeXml(id, name, x, y, cx, cy, bodyXml) {
  return xml`<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="${id}" name="${escapeXml(name)}"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      <a:noFill/>
      <a:ln><a:noFill/></a:ln>
    </p:spPr>
    <p:txBody>
      <a:bodyPr wrap="square" rtlCol="0" anchor="t"/>
      <a:lstStyle/>
      ${bodyXml}
    </p:txBody>
  </p:sp>`;
}

function pictureXml(id, name, relId, x, y, cx, cy) {
  return xml`<p:pic>
    <p:nvPicPr>
      <p:cNvPr id="${id}" name="${escapeXml(name)}"/>
      <p:cNvPicPr/>
      <p:nvPr/>
    </p:nvPicPr>
    <p:blipFill>
      <a:blip r:embed="${relId}"/>
      <a:stretch><a:fillRect/></a:stretch>
    </p:blipFill>
    <p:spPr>
      <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      <a:ln w="12700">
        <a:solidFill><a:srgbClr val="E2DDD3"/></a:solidFill>
      </a:ln>
    </p:spPr>
  </p:pic>`;
}

function backgroundPanelXml(id, x, y, cx, cy, fill = "F4EFE6") {
  return xml`<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="${id}" name="Panel${id}"/>
      <p:cNvSpPr/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
      <a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>
      <a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>
      <a:ln><a:noFill/></a:ln>
    </p:spPr>
  </p:sp>`;
}

function slideXml(slide) {
  const slideIndex = slides.indexOf(slide) + 1;
  const hasImage = Boolean(slideImageFiles[slideIndex]);
  const isHero = slideIndex <= 3;
  const titleBox = shapeXml(
    2,
    "Title",
    548640,
    isHero ? 457200 : 365760,
    isHero ? 4572000 : 9875520,
    isHero ? 1200000 : 914400,
    titleParagraph(slide.title) + (slide.subtitle ? subtitleParagraph(slide.subtitle) : ""),
  );

  const bulletXml = (slide.bullets ?? [])
    .map((item, index) =>
      paragraph(item, {
        fontSize: isHero ? 1500 : 1650,
        before: index === 0 ? 0 : 400,
        after: 100,
      }),
    )
    .join("");

  const bodyBox = shapeXml(
    3,
    "Content",
    isHero ? 640080 : 822960,
    isHero ? 4846320 : 1554480,
    isHero ? 4206240 : hasImage ? 4389120 : 9875520,
    isHero ? 1143000 : 3840480,
    bulletXml,
  );

  const accentBox = xml`<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="4" name="Accent"/>
      <p:cNvSpPr/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      <a:xfrm><a:off x="548640" y="${isHero ? 4084320 : 1249680}"/><a:ext cx="${isHero ? 1920240 : 1554480}" cy="68580"/></a:xfrm>
      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      <a:solidFill><a:srgbClr val="D97706"/></a:solidFill>
      <a:ln><a:noFill/></a:ln>
    </p:spPr>
  </p:sp>`;

  return xml`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      ${!isHero ? backgroundPanelXml(6, 548640, 1371600, 9875520, 4297680) : ""}
      ${titleBox}
      ${accentBox}
      ${bodyBox}
      ${hasImage ? pictureXml(5, `SlideImage${slideIndex}`, "rId2", isHero ? 4937760 : 5943600, isHero ? 457200 : 1554480, isHero ? 4937760 : 4297680, isHero ? 5753100 : 3291840) : ""}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function slideRelXml(slideIndex) {
  const imageFile = slideImageFiles[slideIndex];
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  ${imageFile ? `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imageFile}"/>` : ""}
</Relationships>`;
}

async function writeFile(relativePath, content) {
  const fullPath = path.join(outDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content);
}

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let j = 0; j < 8; j += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

const crcTable = buildCrcTable();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0, 0);
  return buffer;
}

function contentTypesXml(slideCount) {
  const slideOverrides = Array.from({ length: slideCount }, (_, index) =>
    `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  ${slideOverrides}
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function appXml(slideCount) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <PresentationFormat>Widescreen</PresentationFormat>
  <Slides>${slideCount}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Slides</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>${slideCount}</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${slideCount}" baseType="lpstr">
      ${slides.map((slide) => `<vt:lpstr>${escapeXml(slide.title)}</vt:lpstr>`).join("")}
    </vt:vector>
  </TitlesOfParts>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>1.0</AppVersion>
</Properties>`;
}

function coreXml() {
  const created = "2026-04-15T14:30:00Z";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Korean Expression Lab 프로젝트 히스토리</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified>
</cp:coreProperties>`;
}

function presentationXml(slideCount) {
  const slideIds = Array.from({ length: slideCount }, (_, index) => {
    const relationshipId = index + 2;
    const slideId = 256 + index;
    return `<p:sldId id="${slideId}" r:id="rId${relationshipId}"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                saveSubsetFonts="1" autoCompressPictures="0">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${slideIds}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle>
    <a:defPPr>
      <a:defRPr lang="ko-KR"/>
    </a:defPPr>
  </p:defaultTextStyle>
</p:presentation>`;
}

function presentationRelsXml(slideCount) {
  const slideRels = Array.from({ length: slideCount }, (_, index) => {
    const relationshipId = index + 2;
    return `<Relationship Id="rId${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${slideRels}
</Relationships>`;
}

function slideMasterXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld name="Office Theme">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="F3EEE6"/></a:solidFill>
        <a:effectLst/>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="1" r:id="rId1"/>
  </p:sldLayoutIdLst>
      <p:txStyles>
    <p:titleStyle>
      <a:lvl1pPr algn="l"><a:defRPr sz="3000" b="1"/></a:lvl1pPr>
    </p:titleStyle>
    <p:bodyStyle>
      <a:lvl1pPr marL="0" indent="0"><a:defRPr sz="1650"/></a:lvl1pPr>
    </p:bodyStyle>
    <p:otherStyle>
      <a:defPPr><a:defRPr sz="1650"/></a:defPPr>
    </p:otherStyle>
  </p:txStyles>
</p:sldMaster>`;
}

function slideMasterRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
}

function slideLayoutXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
             type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

function slideLayoutRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
}

function themeXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Codex Theme">
  <a:themeElements>
    <a:clrScheme name="Codex">
      <a:dk1><a:srgbClr val="1F2937"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="0F172A"/></a:dk2>
      <a:lt2><a:srgbClr val="F8F5EF"/></a:lt2>
      <a:accent1><a:srgbClr val="D97706"/></a:accent1>
      <a:accent2><a:srgbClr val="14532D"/></a:accent2>
      <a:accent3><a:srgbClr val="7C2D12"/></a:accent3>
      <a:accent4><a:srgbClr val="2563EB"/></a:accent4>
      <a:accent5><a:srgbClr val="9A3412"/></a:accent5>
      <a:accent6><a:srgbClr val="475569"/></a:accent6>
      <a:hlink><a:srgbClr val="2563EB"/></a:hlink>
      <a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Codex Fonts">
      <a:majorFont>
        <a:latin typeface="Aptos Display"/>
        <a:ea typeface="Malgun Gothic"/>
        <a:cs typeface="Aptos"/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Aptos"/>
        <a:ea typeface="Malgun Gothic"/>
        <a:cs typeface="Aptos"/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Codex Formats">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="1"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="90000"/><a:satMod val="120000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`;
}

async function createPackage() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  await writeFile("[Content_Types].xml", contentTypesXml(slides.length));
  await writeFile("_rels/.rels", rootRelsXml());
  await writeFile("docProps/app.xml", appXml(slides.length));
  await writeFile("docProps/core.xml", coreXml());
  await writeFile("ppt/presentation.xml", presentationXml(slides.length));
  await writeFile("ppt/_rels/presentation.xml.rels", presentationRelsXml(slides.length));
  await writeFile("ppt/slideMasters/slideMaster1.xml", slideMasterXml());
  await writeFile("ppt/slideMasters/_rels/slideMaster1.xml.rels", slideMasterRelsXml());
  await writeFile("ppt/slideLayouts/slideLayout1.xml", slideLayoutXml());
  await writeFile("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slideLayoutRelsXml());
  await writeFile("ppt/theme/theme1.xml", themeXml());

  for (const [index, slide] of slides.entries()) {
    await writeFile(`ppt/slides/slide${index + 1}.xml`, slideXml(slide));
    await writeFile(`ppt/slides/_rels/slide${index + 1}.xml.rels`, slideRelXml(index + 1));
  }

  for (const imageFile of Object.values(slideImageFiles)) {
    const imagePath = path.join(assetsDir, imageFile);
    const imageBytes = await fs.readFile(imagePath);
    await writeFile(`ppt/media/${imageFile}`, imageBytes);
  }
}

async function collectFiles(dir, prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, relPath)));
    } else {
      files.push(relPath);
    }
  }

  return files.sort();
}

async function zipPackage() {
  await fs.mkdir(path.dirname(pptxPath), { recursive: true });
  await fs.rm(pptxPath, { force: true });
  const files = await collectFiles(outDir);
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const relativePath of files) {
    const fullPath = path.join(outDir, ...relativePath.split("/"));
    const data = await fs.readFile(fullPath);
    const name = Buffer.from(relativePath.replaceAll("\\", "/"), "utf8");
    const checksum = crc32(data);

    const localHeader = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(checksum),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
    ]);

    localChunks.push(localHeader, data);

    const centralHeader = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(checksum),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);

    centralChunks.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralChunks);
  const centralOffset = offset;
  const endRecord = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDirectory.length),
    u32(centralOffset),
    u16(0),
  ]);

  await fs.writeFile(pptxPath, Buffer.concat([...localChunks, centralDirectory, endRecord]));
}

await createPackage();
await zipPackage();
console.log(pptxPath);
