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
    [
      { opacity: getComputedStyle(el).opacity, transform: `${getComputedStyle(el).transform} translateY(0)` },
      { opacity: 0, transform: `${getComputedStyle(el).transform} translateY(4px)` }
    ],
    { duration: 130, easing: 'ease-out', fill: 'forwards' }
  ).finished.then(() => {
    el.textContent = texto;
    el.animate(
      [
        { opacity: 0, transform: 'translateY(-3px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: 260, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' }
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
  const opacidade = .08 + presencaFrente * .24;
  const frieza = limitar((progresso - .46) / .28);
  const saida = limitar((progresso - .86) / .14);

  raiz.style.setProperty('--narrativa-opacidade', opacidade.toFixed(3));
  raiz.style.setProperty('--narrativa-fria', frieza.toFixed(3));
  raiz.style.setProperty('--narrativa-saida', saida.toFixed(3));

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