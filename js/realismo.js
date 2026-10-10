const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('#lente');
const ctx = canvas?.getContext('2d', { alpha: true });

if (!canvas || !ctx) {
  throw new Error('Canvas de realismo indisponível.');
}

let largura = 0;
let altura = 0;
let dpr = 1;
let ultimo = 0;
let progresso = 0;
let foco = 0;
let exposicao = 0;
let paginaVisivel = true;
const particulas = [];

function limitar(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}

function suave(a, b, v) {
  const x = limitar((v - a) / Math.max(.0001, b - a));
  return x * x * (3 - 2 * x);
}

function random(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let r = s;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = random(190827);

function redimensionar() {
  largura = innerWidth;
  altura = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, largura < 700 ? 1 : 1.25);
  canvas.width = Math.round(largura * dpr);
  canvas.height = Math.round(altura * dpr);
  canvas.style.width = `${largura}px`;
  canvas.style.height = `${altura}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particulas.length = 0;
  const quantidade = largura < 700 ? 26 : 48;
  for (let i = 0; i < quantidade; i++) {
    particulas.push({
      x: rnd() * largura,
      y: rnd() * altura,
      r: .35 + rnd() * 1.15,
      v: .05 + rnd() * .16,
      dx: (rnd() - .5) * .05,
      a: .04 + rnd() * .13,
      fase: rnd() * Math.PI * 2
    });
  }
}

function medir() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progresso = total > 0 ? limitar(scrollY / total) : 0;
}

function desenharParticulas(agora, abertura) {
  const intensidade = .18 + abertura * .82;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (const p of particulas) {
    p.y -= p.v * (1 + abertura * .45);
    p.x += p.dx + Math.sin(agora * .00022 + p.fase) * .015;
    if (p.y < -3) p.y = altura + 3;
    if (p.x < -3) p.x = largura + 3;
    if (p.x > largura + 3) p.x = -3;

    const pulso = .72 + Math.sin(agora * .0011 + p.fase) * .28;
    ctx.fillStyle = `rgba(235,224,202,${p.a * pulso * intensidade})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1 + abertura * .35), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function desenharReflexoJanela(abertura) {
  const entrada = suave(.78, 1, progresso) * abertura;
  if (entrada <= .001) return;

  const x = largura * .72;
  const y = altura * .46;
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(largura, altura) * .48);
  g.addColorStop(0, `rgba(255,218,169,${.055 * entrada})`);
  g.addColorStop(.25, `rgba(255,205,149,${.025 * entrada})`);
  g.addColorStop(1, 'rgba(255,205,149,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, largura, altura);
}

function desenharImperfeicaoLente(agora) {
  const respiracao = .5 + .5 * Math.sin(agora * .00031);
  const alpha = .012 + respiracao * .008;
  const g = ctx.createLinearGradient(0, 0, largura, altura);
  g.addColorStop(0, `rgba(160,190,200,${alpha * .6})`);
  g.addColorStop(.48, 'rgba(255,255,255,0)');
  g.addColorStop(1, `rgba(235,180,135,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, largura, altura);
}

function atualizarCss(agora) {
  const trabalho = suave(.46, .72, progresso);
  const abertura = suave(.84, 1, progresso);
  const flicker = trabalho * (Math.sin(agora * .041) * .004 + Math.sin(agora * .017) * .003);
  foco += ((.18 + trabalho * .32 - abertura * .26) - foco) * .03;
  exposicao += ((abertura * .24 - trabalho * .08 + flicker) - exposicao) * .04;

  document.documentElement.style.setProperty('--respiracao-foco', `${foco.toFixed(4)}px`);
  document.documentElement.style.setProperty('--exposicao-cena', exposicao.toFixed(4));
  document.documentElement.style.setProperty('--frieza-cena', trabalho.toFixed(4));
  document.documentElement.style.setProperty('--abertura-cena', abertura.toFixed(4));
}

function quadro(agora) {
  requestAnimationFrame(quadro);
  if (!paginaVisivel) return;
  if (reduzMovimento && agora - ultimo < 100) return;
  if (!reduzMovimento && agora - ultimo < 33) return;
  ultimo = agora;

  ctx.clearRect(0, 0, largura, altura);
  const abertura = suave(.84, 1, progresso);
  desenharImperfeicaoLente(agora);
  desenharReflexoJanela(abertura);
  desenharParticulas(agora, abertura);
  atualizarCss(agora);
}

addEventListener('scroll', medir, { passive: true });
addEventListener('resize', redimensionar, { passive: true });
document.addEventListener('visibilitychange', () => {
  paginaVisivel = !document.hidden;
});

redimensionar();
medir();
requestAnimationFrame(quadro);
