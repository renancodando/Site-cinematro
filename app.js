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
const frases = [...document.querySelectorAll('.frase')];
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ponteiro = { x: 0, y: 0 };
const ponteiroAlvo = { x: 0, y: 0 };
let cena3d;
let paginaVisivel = true;
let resizeFrame;
let progressoAtual = 0;
let interfaceSuja = true;
let capituloAtual = 1;

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function medirProgresso() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progressoAtual = total > 0 ? limitar(scrollY / total) : 0;
}

function atualizarFrases() {
  if (reduzMovimento) return;
  const centroTela = innerHeight * .53;
  frases.forEach((frase) => {
    const secao = frase.closest('.capitulo');
    const rect = secao.getBoundingClientRect();
    const centro = rect.top + rect.height * .5;
    const distancia = Math.abs(centro - centroTela);
    const alcance = Math.max(innerHeight * .94, rect.height * .48);
    const presenca = limitar(1 - distancia / alcance);
    frase.style.opacity = String(.16 + presenca * .84);
    frase.style.transform = `translate3d(0, ${(1 - presenca) * 25}px, 0)`;
  });
}

function atualizarCapitulo() {
  const linha = innerHeight * .53;
  let atual = 1;
  let menor = Infinity;
  capitulos.forEach((capitulo, indice) => {
    const rect = capitulo.getBoundingClientRect();
    const centro = rect.top + rect.height * .5;
    const distancia = Math.abs(centro - linha);
    if (distancia < menor) {
      menor = distancia;
      atual = indice + 1;
    }
  });

  chapterIndex.textContent = String(atual).padStart(2, '0');
  if (atual !== capituloAtual) {
    capituloAtual = atual;
    audio.marcarCapitulo(atual);
  }
}

function atualizarInterface() {
  progressBar.style.transform = `scaleY(${progressoAtual})`;
  atualizarCapitulo();
  atualizarFrases();
  interfaceSuja = false;
}

function animar() {
  requestAnimationFrame(animar);
  if (!paginaVisivel || !cena3d) return;

  ponteiro.x += (ponteiroAlvo.x - ponteiro.x) * .045;
  ponteiro.y += (ponteiroAlvo.y - ponteiro.y) * .045;

  const estado = cena3d.atualizar(progressoAtual, ponteiro);
  audio.atualizar(progressoAtual, estado);
  if (interfaceSuja) atualizarInterface();
}

function entradaPonteiro(evento) {
  if (evento.pointerType === 'touch') return;
  ponteiroAlvo.x = limitar((evento.clientX / innerWidth) * 2 - 1, -1, 1);
  ponteiroAlvo.y = limitar(-((evento.clientY / innerHeight) * 2 - 1), -1, 1);
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
  canvas.style.background = 'linear-gradient(180deg,#5a574f 0%,#343532 40%,#171716 100%)';
  esconderPreloader();
}

const audio = criarAudioAmbiente();

audioButton.addEventListener('click', async () => {
  try {
    const ativo = await audio.alternar();
    audioButton.setAttribute('aria-pressed', String(ativo));
    audioLabel.textContent = ativo ? 'sala ligada' : 'ouvir a sala';
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
document.documentElement.addEventListener('mouseleave', () => {
  ponteiroAlvo.x = 0;
  ponteiroAlvo.y = 0;
});
addEventListener('resize', redimensionar, { passive: true });

document.addEventListener('visibilitychange', () => {
  paginaVisivel = !document.hidden;
  if (!paginaVisivel) {
    audio.desligar();
    audioButton.setAttribute('aria-pressed', 'false');
    audioLabel.textContent = 'ouvir a sala';
  }
});

addEventListener('pagehide', () => cena3d?.destruir(), { once: true });

async function iniciar() {
  medirProgresso();
  preloaderValue.textContent = '16%';
  await new Promise((resolver) => requestAnimationFrame(resolver));
  preloaderValue.textContent = '48%';

  try {
    cena3d = criarCena(canvas);
    preloaderValue.textContent = '86%';
    await new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver)));
    atualizarInterface();
    esconderPreloader();
    animar();
  } catch (erro) {
    console.error('Não foi possível iniciar a sala WebGL.', erro);
    falhaWebGL();
  }
}

iniciar();