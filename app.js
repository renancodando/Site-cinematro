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
let paginaVisivel = true;
let resizeFrame;
let progressoAtual = 0;
let interfaceSuja = true;

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function medirProgresso() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progressoAtual = total > 0 ? limitar(scrollY / total) : 0;
}

function atualizarTexto() {
  if (reduzMovimento) return;

  const centroTela = innerHeight * 0.53;

  textos.forEach((texto) => {
    const secao = texto.closest('.capitulo');
    const rect = secao.getBoundingClientRect();
    const centroSecao = rect.top + rect.height * 0.5;
    const distancia = Math.abs(centroSecao - centroTela);
    const alcance = Math.max(innerHeight * 0.95, rect.height * 0.48);
    const presenca = limitar(1 - distancia / alcance);

    texto.style.opacity = String(0.28 + presenca * 0.72);
    texto.style.transform = `translate3d(0, ${(1 - presenca) * 22}px, 0)`;
  });
}

function atualizarCapitulo() {
  const linha = innerHeight * 0.53;
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

function atualizarInterface() {
  progressBar.style.transform = `scaleY(${progressoAtual})`;
  atualizarCapitulo();
  atualizarTexto();
  interfaceSuja = false;
}

function animar() {
  requestAnimationFrame(animar);
  if (!paginaVisivel || !cena3d) return;

  ponteiro.x += (ponteiroAlvo.x - ponteiro.x) * 0.045;
  ponteiro.y += (ponteiroAlvo.y - ponteiro.y) * 0.045;

  const estadoMar = cena3d.atualizar(progressoAtual, ponteiro);
  audio.atualizar(progressoAtual, estadoMar);

  if (interfaceSuja) atualizarInterface();
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

function aoRolar() {
  medirProgresso();
  interfaceSuja = true;
}

function redimensionar() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    medirProgresso();
    cena3d?.redimensionar();
    interfaceSuja = true;
  });
}

function esconderPreloader() {
  preloaderValue.textContent = '100%';
  setTimeout(() => preloader.classList.add('oculto'), 240);
}

function falhaWebGL() {
  document.body.classList.add('sem-webgl');
  canvas.style.background = 'linear-gradient(#15242c, #071014 55%, #020607)';
  esconderPreloader();
}

const audio = criarAudioAmbiente();

audioButton.addEventListener('click', async () => {
  try {
    const ativo = await audio.alternar();
    audioButton.setAttribute('aria-pressed', String(ativo));
    audioLabel.textContent = ativo ? 'mar ligado' : 'ouvir o mar';
  } catch {
    audioLabel.textContent = 'som indisponível';
    audioButton.disabled = true;
  }
});

restartButton.addEventListener('click', () => {
  scrollTo({ top: 0, behavior: reduzMovimento ? 'auto' : 'smooth' });
});

addEventListener('scroll', aoRolar, { passive: true });
addEventListener('pointermove', entradaPonteiro, { passive: true });
document.documentElement.addEventListener('mouseleave', sairPonteiro);
addEventListener('resize', redimensionar, { passive: true });

document.addEventListener('visibilitychange', () => {
  paginaVisivel = !document.hidden;

  if (!paginaVisivel) {
    audio.desligar();
    audioButton.setAttribute('aria-pressed', 'false');
    audioLabel.textContent = 'ouvir o mar';
  }
});

addEventListener('pagehide', () => {
  cena3d?.destruir();
}, { once: true });

async function iniciar() {
  medirProgresso();
  preloaderValue.textContent = '18%';
  await new Promise((resolver) => requestAnimationFrame(resolver));

  preloaderValue.textContent = '52%';

  try {
    cena3d = criarCena(canvas);
    preloaderValue.textContent = '88%';

    await new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver)));
    atualizarInterface();
    esconderPreloader();
    animar();
  } catch (erro) {
    console.error('Não foi possível iniciar o oceano WebGL.', erro);
    falhaWebGL();
  }
}

iniciar();
