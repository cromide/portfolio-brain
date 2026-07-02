/* ===========================================================================
 * Network → Server — 요청 한 건이 흐르는 전 과정 (인터랙티브 흐름도)
 * 브라우저 URL 입력 → DNS → TCP → TLS → HTTP → CDN/LB → 웹서버 → 앱서버 → DB
 * 각 단계 클릭 = 상세 설명, ▶ 재생 = 패킷이 단계를 따라 흐르는 애니메이션
 * =========================================================================== */

// layer: client(브라우저) / network(인터넷 경로) / server(서버 내부) / data(저장소)
const STAGES = [
  {
    id: "browser",
    layer: "client",
    n: 1,
    title: "브라우저 (클라이언트)",
    sub: "당신이 주소창에 URL을 입력",
    icon: "🌐",
    what: "사용자가 https://myapp.com/dashboard 를 입력하면 여기서 모든 게 시작됩니다. 브라우저는 이 URL을 '프로토콜(https) + 도메인(myapp.com) + 경로(/dashboard)'로 분해합니다.",
    how: [
      "URL을 파싱해 어디로(도메인) 어떻게(https) 무엇을(경로) 요청할지 결정",
      "먼저 로컬 캐시·쿠키·세션을 확인 (이미 로그인돼 있으면 그 정보를 실어 보냄)",
      "도메인의 실제 IP 주소를 모르므로 → 다음 단계 'DNS 조회'가 필요"
    ],
    example: "myapp.com 은 사람이 읽는 이름일 뿐, 실제 통신은 76.76.21.21 같은 IP 숫자 주소로 이뤄집니다.",
    tech: "Chrome/Safari, fetch()·axios, 쿠키/localStorage, NextAuth 세션 토큰",
    neuron: "브라우저는 전화를 걸기 전 '상대 이름'만 아는 상태 — 전화번호(IP)를 아직 모릅니다."
  },
  {
    id: "dns",
    layer: "network",
    n: 2,
    title: "DNS 조회",
    sub: "도메인 이름 → IP 주소 번역",
    icon: "📖",
    what: "DNS(Domain Name System)는 인터넷의 전화번호부입니다. myapp.com 이라는 이름을 실제 서버의 IP 주소로 바꿔줍니다.",
    how: [
      "브라우저 캐시 → OS 캐시 → 라우터 → ISP DNS 서버 순으로 물어봄 (가까운 곳에 답이 있으면 즉시 반환)",
      "없으면 루트 → .com → myapp.com 담당 네임서버로 계층적으로 질의",
      "최종적으로 '76.76.21.21' 같은 IP를 받아 캐시에 저장 (TTL 동안 재사용)"
    ],
    example: "새 도메인 연결 후 반영이 느린 이유가 바로 이 캐시(TTL) 때문입니다. 보통 수 분~수 시간.",
    tech: "Vercel/Cloudflare DNS, A/AAAA/CNAME 레코드, nslookup·dig 명령",
    neuron: "이름(myapp.com)으로 전화번호부를 뒤져 실제 번호(IP)를 찾아내는 단계."
  },
  {
    id: "tcp",
    layer: "network",
    n: 3,
    title: "TCP 연결 (3-way handshake)",
    sub: "'연결됐나요?' 악수 3번",
    icon: "🤝",
    what: "IP를 알았으니 이제 그 서버와 '신뢰할 수 있는 통로'를 엽니다. TCP는 데이터가 순서대로·빠짐없이 도착하도록 보장하는 규약입니다.",
    how: [
      "① 클라이언트 → 서버 : SYN ('연결할까요?')",
      "② 서버 → 클라이언트 : SYN-ACK ('네, 저도 준비됐어요')",
      "③ 클라이언트 → 서버 : ACK ('좋아요, 시작합시다') — 이제 통로 완성",
      "이 왕복(RTT) 때문에 물리적으로 먼 서버일수록 첫 연결이 느림"
    ],
    example: "서버가 지구 반대편이면 이 악수만으로도 수백 ms가 듭니다 — CDN이 필요한 이유.",
    tech: "TCP/IP, 포트(HTTP:80·HTTPS:443), 소켓, Keep-Alive 연결 재사용",
    neuron: "전화를 걸어 '여보세요?' → '네 들려요' → '좋아요' 하고 통화를 확정하는 3단계."
  },
  {
    id: "tls",
    layer: "network",
    n: 4,
    title: "TLS 핸드셰이크 (HTTPS 암호화)",
    sub: "도청 못 하게 자물쇠 채우기",
    icon: "🔒",
    what: "https 의 s 가 여기서 붙습니다. 통로에 암호를 걸어, 중간에서 누가 엿봐도 내용을 못 읽게 만듭니다.",
    how: [
      "서버가 SSL 인증서를 제시 → 브라우저가 '이 인증서 진짜야?'를 신뢰기관(CA)으로 검증",
      "양쪽이 비밀 대칭키를 안전하게 교환 (이후 통신은 이 키로 암호화)",
      "주소창 자물쇠 아이콘 = 이 과정이 성공했다는 표시"
    ],
    example: "로그인 비밀번호·세션 토큰이 평문으로 노출되지 않는 이유. HTTPS 없으면 카페 와이파이에서 다 털립니다.",
    tech: "TLS 1.3, Let's Encrypt 인증서, Vercel/Cloudflare 자동 HTTPS",
    neuron: "통화 내용을 둘만 아는 암호로 바꿔, 도청꾼이 들어도 소음으로만 들리게 하는 단계."
  },
  {
    id: "http",
    layer: "network",
    n: 5,
    title: "HTTP 요청 전송",
    sub: "실제 '주문서'를 보냄",
    icon: "📨",
    what: "암호화된 통로가 열렸으니 진짜 요청을 보냅니다. HTTP는 '무엇을 어떻게 달라'는 약속된 양식입니다.",
    how: [
      "메서드(GET/POST/PUT/DELETE) + 경로(/api/dashboard) + 헤더(쿠키·인증토큰) + 바디(전송 데이터)로 구성",
      "예: GET /dashboard  Authorization: Bearer <세션토큰>",
      "이 요청은 곧바로 앱서버로 가지 않고, 먼저 CDN/로드밸런서를 만남"
    ],
    example: "브라우저 개발자도구 Network 탭에서 이 요청/응답의 실체를 그대로 볼 수 있습니다.",
    tech: "REST API, Express 라우팅, HTTP 상태코드(200·404·500), NextAuth 인증 헤더",
    neuron: "통로가 열린 뒤 '대시보드 데이터 주세요, 저는 이 회원이에요'라고 적은 주문서를 보내는 것."
  },
  {
    id: "cdn",
    layer: "network",
    n: 6,
    title: "CDN / 로드밸런서",
    sub: "교통정리 & 캐시된 건 바로 반환",
    icon: "🚦",
    what: "요청이 서버에 닿기 직전의 관문. 정적 파일은 여기서 바로 돌려주고, 동적 요청만 뒤로 넘깁니다. 트래픽도 여러 서버로 분산합니다.",
    how: [
      "CDN: 이미지·JS·CSS 같은 정적 자원을 사용자와 가까운 지역 서버에 캐시 → DNS·TCP 왕복을 줄여 빠름",
      "로드밸런서: 요청을 여러 대의 앱서버 중 여유 있는 곳으로 분배 (한 대에 몰리지 않게)",
      "캐시에 없거나 동적 데이터면 → 뒤쪽 웹서버로 전달"
    ],
    example: "Vercel에 배포하면 전 세계 엣지에서 정적 페이지가 즉시 뜨는 게 이 CDN 덕분입니다.",
    tech: "Vercel Edge, Cloudflare, Nginx 로드밸런싱, 오토스케일링",
    neuron: "매장 입구의 안내 데스크 — 흔한 질문은 바로 답하고, 전문 상담만 안쪽 직원에게 연결."
  },
  {
    id: "webserver",
    layer: "server",
    n: 7,
    title: "웹서버 (리버스 프록시)",
    sub: "요청을 받아 앱으로 넘기는 문지기",
    icon: "🚪",
    what: "Nginx 같은 웹서버가 요청을 최전선에서 받습니다. 정적 파일 서빙, HTTPS 종료, 요청을 실제 앱 프로세스로 전달하는 역할.",
    how: [
      "정적 파일 요청이면 디스크에서 바로 읽어 응답",
      "동적 요청(/api/...)이면 뒤에서 돌고 있는 앱서버(Node 프로세스)로 넘김 = 리버스 프록시",
      "요청 수가 폭주해도 앱서버가 죽지 않도록 버퍼·타임아웃·속도제한을 담당"
    ],
    example: "Node를 직접 80포트에 노출하지 않고 Nginx 뒤에 두는 게 표준 — 보안·성능·안정성 때문.",
    tech: "Nginx, 리버스 프록시, gzip 압축, 정적 파일 서빙, 포트 프록시(→ localhost:3000)",
    neuron: "건물 정문 경비 — 손님을 맞아 목적지 사무실(앱서버)로 안내하고, 규칙 위반은 막음."
  },
  {
    id: "appserver",
    layer: "server",
    n: 8,
    title: "애플리케이션 서버 (당신의 코드)",
    sub: "비즈니스 로직이 실행되는 곳",
    icon: "⚙️",
    what: "드디어 당신이 짠 코드가 도는 곳. 요청을 해석하고, 로그인 여부를 확인하고, 필요한 데이터를 계산·조합해 응답을 만듭니다.",
    how: [
      "라우터가 경로에 맞는 핸들러를 실행 (예: GET /dashboard → dashboardController)",
      "미들웨어가 인증·검증을 순서대로 통과시킴 (NextAuth가 세션 토큰 확인)",
      "필요한 데이터가 있으면 → 데이터베이스에 질의 (다음 단계)",
      "결과를 JSON이나 HTML로 조립해 응답 준비"
    ],
    example: "여기서 '이 사람 로그인 됐나? 이 데이터 볼 권한 있나?'를 판단합니다. 인가(authorization)의 핵심.",
    tech: "Node.js / Express, Next.js API Routes·Server Actions, NextAuth 미들웨어, 비즈니스 로직",
    neuron: "실제 업무를 처리하는 담당 직원 — 요청서를 읽고, 권한을 확인하고, 창고(DB)에서 물건을 꺼내옴."
  },
  {
    id: "db",
    layer: "data",
    n: 9,
    title: "데이터베이스",
    sub: "진짜 데이터가 저장된 창고",
    icon: "🗄️",
    what: "회원 정보, 게시글, 주문 내역 등 영구 데이터가 사는 곳. 앱서버가 '이 회원의 대시보드 데이터 줘'라고 질의하면 찾아서 돌려줍니다.",
    how: [
      "앱서버가 SQL(또는 Prisma 같은 ORM)로 질의: SELECT * FROM posts WHERE user_id = 42",
      "DB는 인덱스를 이용해 수백만 행 중 필요한 것만 빠르게 찾아 반환",
      "결과를 앱서버로 돌려주면 → 앱서버가 이걸 응답으로 가공",
      "느린 쿼리·인덱스 부재가 전체 응답 지연의 흔한 원인"
    ],
    example: "Prisma를 쓰면 SQL을 직접 안 짜고 prisma.post.findMany() 같은 코드로 안전하게 질의합니다. (단, 그 밑엔 결국 SQL과 PostgreSQL이 있음)",
    tech: "PostgreSQL, Prisma ORM, 인덱스, 트랜잭션, 커넥션 풀",
    neuron: "정리된 대형 창고 — 라벨(인덱스)이 잘 붙어 있어야 원하는 물건을 순식간에 찾음."
  },
  {
    id: "response",
    layer: "server",
    n: 10,
    title: "응답이 거꾸로 흘러 돌아옴",
    sub: "DB → 앱 → 웹서버 → 네트워크 → 브라우저",
    icon: "↩️",
    what: "데이터를 받은 앱서버가 응답(JSON/HTML)을 만들고, 왔던 길을 거꾸로 되짚어 브라우저까지 돌아갑니다.",
    how: [
      "앱서버: DB 결과 + 로직 → 최종 응답 조립 (HTTP 상태코드 200 등 포함)",
      "웹서버·CDN을 거쳐 (캐시 가능한 응답이면 CDN이 저장해 다음 요청을 가속)",
      "암호화된 통로를 타고 브라우저로 복귀"
    ],
    example: "응답이 느리면 어느 구간이 병목인지 개발자도구 Network 탭의 Timing에서 단계별로 확인 가능.",
    tech: "HTTP 응답 헤더, 캐시 정책(Cache-Control), gzip, 상태코드",
    neuron: "직원이 창고에서 꺼낸 물건을 포장해, 왔던 경로로 손님에게 되돌려주는 과정."
  },
  {
    id: "render",
    layer: "client",
    n: 11,
    title: "브라우저 렌더링",
    sub: "화면에 실제로 그려짐",
    icon: "🎨",
    what: "돌아온 응답(HTML/CSS/JS/데이터)을 브라우저가 해석해 픽셀로 그립니다. 사용자가 드디어 화면을 보게 되는 순간.",
    how: [
      "HTML → DOM 트리, CSS → 스타일 규칙으로 파싱",
      "레이아웃 계산(어디에 놓을지) → 페인트(색칠) → 합성(화면 출력)",
      "JS가 실행되며 상호작용(클릭·입력)을 붙임 — 여기서 다시 새 요청이 1번으로 순환"
    ],
    example: "이 렌더링을 최적화하는 게 프론트엔드 성능의 핵심 — 첫 화면이 뜨는 속도(LCP) 등.",
    tech: "DOM/CSSOM, 렌더 트리, React/Svelte 하이드레이션, Core Web Vitals",
    neuron: "받은 부품을 조립해 눈에 보이는 완성품(화면)으로 만드는 마지막 단계 — 그리고 다시 처음으로."
  }
];

const LAYERS = {
  client:  { label: "CLIENT · 브라우저", color: "#f472b6" },
  network: { label: "NETWORK · 인터넷 경로", color: "#60a5fa" },
  server:  { label: "SERVER · 서버 내부", color: "#34d399" },
  data:    { label: "DATA · 저장소", color: "#fbbf24" }
};

// ---- DOM 빌드 ---------------------------------------------------------------
const flowEl = document.getElementById("flow");
const panel = document.getElementById("nf-panel");

let lastLayer = null;
STAGES.forEach((s) => {
  if (s.layer !== lastLayer) {
    const band = document.createElement("div");
    band.className = "layer-band";
    band.style.setProperty("--layer-color", LAYERS[s.layer].color);
    band.innerHTML = `<span class="layer-dot"></span>${LAYERS[s.layer].label}`;
    flowEl.appendChild(band);
    lastLayer = s.layer;
  }

  const card = document.createElement("button");
  card.className = "stage";
  card.dataset.id = s.id;
  card.style.setProperty("--layer-color", LAYERS[s.layer].color);
  card.innerHTML = `
    <span class="stage-num">${s.n}</span>
    <span class="stage-icon">${s.icon}</span>
    <span class="stage-text">
      <span class="stage-title">${s.title}</span>
      <span class="stage-sub">${s.sub}</span>
    </span>
    <span class="stage-arrow">›</span>`;
  card.addEventListener("click", () => openPanel(s));
  flowEl.appendChild(card);

  // 단계 사이 연결선 (마지막 제외)
  if (s.n < STAGES.length) {
    const link = document.createElement("div");
    link.className = "stage-link";
    link.innerHTML = `<span class="packet-track"></span>`;
    flowEl.appendChild(link);
  }
});

// ---- 상세 패널 --------------------------------------------------------------
function openPanel(s) {
  document.querySelectorAll(".stage").forEach((el) =>
    el.classList.toggle("selected", el.dataset.id === s.id)
  );
  panel.style.setProperty("--layer-color", LAYERS[s.layer].color);
  panel.innerHTML = `
    <div class="nf-card">
      <button id="nf-panel-close">&times;</button>
      <div class="nf-badge">STEP ${s.n} / ${STAGES.length} · ${LAYERS[s.layer].label}</div>
      <h2>${s.icon} ${s.title}</h2>
      <p class="nf-sub">${s.sub}</p>

      <h3>무엇인가</h3>
      <p>${s.what}</p>

      <h3>어떻게 작동하나</h3>
      <ul>${s.how.map((h) => `<li>${h}</li>`).join("")}</ul>

      <div class="nf-example"><strong>💡 실무 포인트</strong><br>${s.example}</div>

      <h3>당신의 스택에선</h3>
      <p class="nf-tech">${s.tech}</p>

      <div class="nf-analogy"><strong>🧠 비유</strong><br>${s.neuron}</div>
    </div>
  `;
  panel.classList.add("open");
  document.getElementById("nf-panel-close").addEventListener("click", closePanel);
}
function closePanel() {
  panel.classList.remove("open");
  document.querySelectorAll(".stage.selected").forEach((el) => el.classList.remove("selected"));
}
panel.addEventListener("click", (e) => { if (e.target === panel) closePanel(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });

// ---- 요청 흐름 애니메이션 ----------------------------------------------------
const playBtn = document.getElementById("nf-play");
const caption = document.getElementById("nf-caption");
let playing = false;
let timers = [];

function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function play() {
  if (playing) { stop(); return; }
  playing = true;
  playBtn.textContent = "■ 정지";
  caption.classList.add("show");
  const cards = [...document.querySelectorAll(".stage")];
  const step = 780; // ms per stage

  cards.forEach((card, i) => {
    timers.push(setTimeout(() => {
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      const s = STAGES[i];
      caption.innerHTML = `<span class="cap-num">${s.n}</span> ${s.icon} <strong>${s.title}</strong> — ${s.sub}`;
    }, i * step));
  });

  // 마지막 → 정리
  timers.push(setTimeout(() => {
    caption.innerHTML = `✅ 요청 한 건이 <strong>브라우저 → 서버 → DB → 브라우저</strong>를 왕복했습니다. 아무 단계나 눌러 자세히 보세요.`;
    stop(false);
  }, cards.length * step + 400));
}

function stop(reset = true) {
  clearTimers();
  playing = false;
  playBtn.textContent = "▶ 요청 흐름 재생";
  if (reset) {
    document.querySelectorAll(".stage.active").forEach((el) => el.classList.remove("active"));
    caption.classList.remove("show");
  }
}
playBtn.addEventListener("click", play);
