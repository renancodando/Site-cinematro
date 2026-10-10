import { criarCena } from './js/cena.js';
import { criarAudioAmbiente } from './js/audio.js';

const canvas = document.querySelector('#cinema');
const preloader = document.querySelector('#preloader');
const preloaderValue = document.querySelector('#preloaderValue');
const progressBar = document.querySelector('#progressBar');
const chapterIndex = document.querySelector('#chapterIndex');
const audioButton = document.querySelector('#audioButton');
const audioLabel = document.querySelector('#audioLabel');
const restartButton = document.querySelector('#restartButton');
const capitulos = [...document.querySelectorAll('.capitulo')];
const textos = [...document.querySelectorAll('.texto')];
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ponteiro = { x: 0, y: 0 };
const ponteiroAlvo = { x: 0, y: 0 };
let cena3d;
let ultimoProgresso = -1;
let paginaVisivel = true;
let resizeFrame;

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function progressoPagina() {
  const total = document.documentElement.scrollHeight - innerHeight;
  return total > 0 ? limitar(scrollY / total) : 0;
}

function atualizarTexto() {
  if (reduzMovimento) return;

  const centroTela = innerHeight * 0.52;
  textos.forEach((texto) => {
    const secao = texto.closest('.capitulo');
    const rect = secao.getBoundingClientRect();
    const centroSecao = rect.top + rect.height * 0.5;
    const distancia = Math.abs(centroSecao - centroTela);
    const alcance = Math.max(innerHeight * 0.9, rect.height * 0.47);
    const presenca = limitar(1 - distancia / alcance);
    const deslocamento = (1 - presenca) * 28;
    texto.style.opacity = String(0.2 + presenca * 0.8);
    texto.style.transform = `translate3d(0, ${deslocamento}px, 0)`;
  });
}

function atualizarCapitulo() {
  const linha = innerHeight * 0.52;
  let atual = 1;
  let menorDistancia = Infinity;

  capitulos.forEach((capitulo, indice) => {
    const rect = capitulo.getBoundingClientRect();
    const centro = rect.top + rect.height * 0.5;
    const distancia = Math.abs(centro - linha);
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      atual = indice + 1;
    }
  });

  chapterIndex.textContent = String(atual).padStart(2, '0');
}

function atualizarInterface(progresso) {
  progressBar.style.transform = `scaleY(${progresso})`;
  atualizarCapitulo();
  atualizarTexto();
}

function animar() {
  requestAnimationFrame(animar);
  if (!paginaVisivel || !cena3d) return;

  ponteiro.x += (ponteiroAlvo.x - ponteiro.x) * 0.045;
  ponteiro.y += (ponteiroAlvo.y - ponteiro.y) * 0.045;

  const progresso = progressoPagina();
  cena3d.atualizar(progresso, ponteiro);

  if (Math.abs(progresso - ultimoProgresso) > 0.0005) {
    atualizarInterface(progresso);
    audio.atualizar(progresso);
    ultimoProgresso = progresso;
  }
}

function entradaPonteiro(evento) {
  if (evento.pointerType === 'touch') return;
  ponteiroAlvo.x = limitar((evento.clientX / innerWidth) * 2 - 1, -1, 1);
  ponteiroAlvo.y = limitar(-((evento.clientY / innerHeight) * 2 - 1), -1, 1);
}

function sairPonteiro() {
  ponteiroAlvo.x = 0;
  ponteiroAlvo.y = 0;
}

function redimensionar() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    cena3d?.redimensionar();
    atualizarInterface(progressoPagina());
  });
}

function esconderPreloader() {
  preloaderValue.textContent = '100%';
  setTimeout(() => preloader.classList.add('oculto'), 220);
}

function falhaWebGL() {
  document.body.classList.add('sem-webgl');
  canvas.style.background = '#071015';
  esconderPreloader();
}

const audio = criarAudioAmbiente();

audioButton.addEventListener('click', async () => {
  try {
    const ativo = await audio.alternar();
    audioButton.setAttribute('aria-pressed', String(ativo));
    audioLabel.textContent = ativo ? 'som ligado' : 'ativar som';
  } catch {
    audioLabel.textContent = 'som indisponível';
    audioButton.disabled = true;
  }
});

restartButton.addEventListener('click', () => {
  scrollTo({ top: 0, behavior: reduzMovimento ? 'auto' : 'smooth' });
});

addEventListener('pointermove', entradaPonteiro, { passive: true });
document.documentElement.addEventListener('mouseleave', sairPonteiro);
addEventListener('resize', redimensionar, { passive: true });

document.addEventListener('visibilitychange', () => {
  paginaVisivel = !document.hidden;
  if (!paginaVisivel) audio.desligar();
  if (!paginaVisivel) {
    audioButton.setAttribute('aria-pressed', 'false');
    audioLabel.textContent = 'ativar som';
  }
});

addEventListener('pagehide', () => {
  cena3d?.destruir();
}, { once: true });

async function iniciar() {
  preloaderValue.textContent = '18%';

  await new Promise((resolver) => requestAnimationFrame(resolver));
  preloaderValue.textContent = '46%';

  try {
    cena3d = criarCena(canvas);
    preloaderValue.textContent = '82%';

    await new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver)));
    atualizarInterface(progressoPagina());
    esconderPreloader();
    animar();
  } catch (erro) {
    console.error('Não foi possível iniciar a cena WebGL.', erro);
    falhaWebGL();
  }
}

iniciar();
