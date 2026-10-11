const raiz = document.documentElement;
const camada = document.querySelector('#sinaisAmbiente');
const principal = document.querySelector('#sinalPrincipal');
const secundario = document.querySelector('#sinalSecundario');
const terciario = document.querySelector('#sinalTerciario');

if (!camada || !principal || !secundario || !terciario) {
  throw new Error('Narrativa ambiental indisponível.');
}

const fases = [
  {
    ate: .17,
    modo: 'escola',
    principal: 'APRENDER = PERGUNTAR',
    secundario: 'CHAMADA · 06:50',
    terciario: 'SILÊNCIO NO CORREDOR'
  },
  {
    ate: .34,
    modo: 'escola',
    principal: 'SILÊNCIO DURANTE A AVALIAÇÃO',
    secundario: 'TEMPO · 50 MIN',
    terciario: 'RESULTADO DA TURMA'
  },
  {
    ate: .5,
    modo: 'escola',
    principal: 'DISCIPLINA · PONTUALIDADE',
    secundario: 'ENTREGAR ATÉ 10:20',
    terciario: 'MÉDIA · 6,0'
  },
  {
    ate: .7,
    modo: 'trabalho',
    principal: 'REGISTRE SEU PONTO',
    secundario: 'JORNADA · 8H',
    terciario: 'ATRASO'
  },
  {
    ate: .87,
    modo: 'trabalho',
    principal: 'META · 100%',
    secundario: 'PRAZO · 18:00',
    terciario: 'PRODUÇÃO · 87%'
  },
  {
    ate: 1,
    modo: 'saida',
    principal: 'SAÍDA',
    secundario: 'FIM DO TURNO',
    terciario: 'PORTA ABERTA'
  }
];

let progresso = 0;
let faseAtual = -1;
let frame;

function limitar(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}

function medir() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progresso = total > 0 ? limitar(scrollY / total) : 0;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(atualizar);
}

function trocarTexto(el, texto) {
  if (el.textContent === texto) return;
  el.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 120, easing: 'ease-out', fill: 'forwards' }
  ).finished.then(() => {
    el.textContent = texto;
    el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 250, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' }
    );
  }).catch(() => {
    el.textContent = texto;
  });
}

function atualizar() {
  let indice = fases.findIndex(fase => progresso <= fase.ate);
  if (indice < 0) indice = fases.length - 1;
  const fase = fases[indice];

  const presencaFrente = Math.max(0, 1 - Math.abs(progresso - .56) / .58);
  const opacidadeBase = .08 + presencaFrente * .24;
  const fatorMobile = innerWidth < 560 ? .5 : innerWidth < 820 ? .72 : 1;
  const opacidade = opacidadeBase * fatorMobile;
  const frieza = limitar((progresso - .46) / .28);
  const saida = limitar((progresso - .86) / .14);
  const saturacao = 1 - frieza * .38;
  const opacidadeSaida = opacidade * (1 - saida * .82);

  raiz.style.setProperty('--narrativa-opacidade', opacidade.toFixed(3));
  raiz.style.setProperty('--narrativa-opacidade-saida', opacidadeSaida.toFixed(3));
  raiz.style.setProperty('--narrativa-saturacao', saturacao.toFixed(3));

  if (indice === faseAtual) return;
  faseAtual = indice;
  camada.dataset.fase = fase.modo;
  trocarTexto(principal, fase.principal);
  setTimeout(() => trocarTexto(secundario, fase.secundario), 55);
  setTimeout(() => trocarTexto(terciario, fase.terciario), 105);
}

addEventListener('scroll', medir, { passive: true });
addEventListener('resize', medir, { passive: true });
medir();