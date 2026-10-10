const canvas = document.querySelector('#vestigios');
const contexto = canvas?.getContext('2d', { alpha: true });

if (canvas && contexto && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const toque = matchMedia('(pointer: coarse)').matches;
  const reduzir = innerWidth < 700 || toque;
  const quantidadePapeis = reduzir ? 5 : 9;
  const quantidadePoeira = reduzir ? 26 : 44;
  const papeis = [];
  const poeira = [];
  let largura = innerWidth;
  let altura = innerHeight;
  let dpr = Math.min(devicePixelRatio || 1, reduzir ? 1 : 1.12);
  let ultimoFrame = 0;
  let ultimoScroll = scrollY;
  let impulsoScroll = 0;
  let visivel = !document.hidden;

  function aleatorio(minimo, maximo) {
    return minimo + Math.random() * (maximo - minimo);
  }

  function novoPapel(indice, inicial = false) {
    const escala = aleatorio(reduzir ? 0.58 : 0.68, reduzir ? 0.9 : 1.15);
    return {
      x: aleatorio(-largura * 0.1, largura * 1.05),
      y: inicial ? aleatorio(-altura * 0.2, altura * 1.2) : aleatorio(-altura * 0.3, -80),
      largura: aleatorio(58, 104) * escala,
      altura: aleatorio(78, 142) * escala,
      rotacao: aleatorio(-0.35, 0.35),
      velocidade: aleatorio(5, 13),
      deriva: aleatorio(-5, 8),
      fase: aleatorio(0, Math.PI * 2),
      opacidade: aleatorio(0.08, reduzir ? 0.17 : 0.22),
      tipo: indice % 4,
      profundidade: aleatorio(0.58, 1.12)
    };
  }

  function novaPoeira() {
    return {
      x: Math.random() * largura,
      y: Math.random() * altura,
      r: aleatorio(0.35, 1.3),
      velocidade: aleatorio(2, 8),
      deriva: aleatorio(-2, 2),
      opacidade: aleatorio(0.035, 0.16),
      fase: aleatorio(0, Math.PI * 2)
    };
  }

  function redimensionar() {
    largura = innerWidth;
    altura = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, reduzir ? 1 : 1.12);
    canvas.width = Math.max(1, Math.floor(largura * dpr));
    canvas.height = Math.max(1, Math.floor(altura * dpr));
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    contexto.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function desenharPapel(papel, tempo) {
    contexto.save();
    contexto.translate(papel.x, papel.y);
    contexto.rotate(papel.rotacao + Math.sin(tempo * 0.00032 + papel.fase) * 0.055);

    const ondulacao = 1 + Math.sin(tempo * 0.0007 + papel.fase) * 0.018;
    contexto.scale(ondulacao, 1 / ondulacao);
    contexto.globalAlpha = papel.opacidade;

    const w = papel.largura;
    const h = papel.altura;
    const canto = Math.min(w, h) * 0.06;

    contexto.shadowColor = 'rgba(0, 0, 0, .28)';
    contexto.shadowBlur = 12 * papel.profundidade;
    contexto.shadowOffsetY = 5;

    contexto.fillStyle = 'rgba(230, 224, 207, .78)';
    contexto.beginPath();
    contexto.moveTo(-w / 2 + canto, -h / 2);
    contexto.lineTo(w / 2 - canto * .5, -h / 2 + canto * .15);
    contexto.lineTo(w / 2, -h / 2 + canto * 1.3);
    contexto.lineTo(w / 2 - canto * .2, h / 2 - canto);
    contexto.lineTo(w / 2 - canto * 1.2, h / 2);
    contexto.lineTo(-w / 2 + canto * .55, h / 2 - canto * .2);
    contexto.lineTo(-w / 2, h / 2 - canto * 1.1);
    contexto.lineTo(-w / 2 + canto * .1, -h / 2 + canto);
    contexto.closePath();
    contexto.fill();

    contexto.shadowColor = 'transparent';
    contexto.strokeStyle = 'rgba(54, 75, 83, .25)';
    contexto.lineWidth = 0.6;

    const espacamento = Math.max(8, h / 11);
    for (let y = -h / 2 + espacamento * 2; y < h / 2 - espacamento; y += espacamento) {
      contexto.beginPath();
      contexto.moveTo(-w / 2 + 8, y);
      contexto.lineTo(w / 2 - 7, y + Math.sin(y * 0.13) * 0.7);
      contexto.stroke();
    }

    contexto.strokeStyle = 'rgba(163, 68, 60, .42)';
    contexto.lineWidth = 0.9;
    contexto.beginPath();
    contexto.moveTo(-w / 2 + w * 0.23, -h / 2 + 5);
    contexto.lineTo(-w / 2 + w * 0.23, h / 2 - 5);
    contexto.stroke();

    contexto.fillStyle = 'rgba(32, 37, 39, .42)';
    contexto.font = `${Math.max(5, w * 0.075)}px Georgia, serif`;
    contexto.textBaseline = 'middle';

    if (papel.tipo === 0) {
      contexto.fillText('7,0', w * 0.12, -h * 0.28);
      contexto.strokeStyle = 'rgba(168, 62, 54, .55)';
      contexto.lineWidth = 1.2;
      contexto.beginPath();
      contexto.moveTo(w * 0.07, -h * 0.12);
      contexto.lineTo(w * 0.22, -h * 0.02);
      contexto.moveTo(w * 0.22, -h * 0.12);
      contexto.lineTo(w * 0.07, -h * 0.02);
      contexto.stroke();
    } else if (papel.tipo === 1) {
      contexto.fillText('meta', -w * 0.05, -h * 0.28);
      contexto.fillText('prazo', -w * 0.01, -h * 0.05);
      contexto.strokeStyle = 'rgba(31, 43, 49, .34)';
      contexto.strokeRect(-w * 0.09, h * 0.16, w * 0.26, h * 0.1);
    } else if (papel.tipo === 2) {
      contexto.fillText('prova', -w * 0.08, -h * 0.26);
      for (let i = 0; i < 3; i++) {
        contexto.beginPath();
        contexto.arc(-w * 0.06 + i * w * 0.14, h * 0.07, Math.max(2, w * 0.025), 0, Math.PI * 2);
        contexto.strokeStyle = 'rgba(38, 50, 55, .38)';
        contexto.stroke();
      }
    } else {
      contexto.fillText('currículo', -w * 0.11, -h * 0.26);
      contexto.strokeStyle = 'rgba(32, 42, 46, .34)';
      contexto.beginPath();
      contexto.moveTo(-w * 0.1, -h * 0.08);
      contexto.lineTo(w * 0.19, -h * 0.08);
      contexto.moveTo(-w * 0.1, h * 0.03);
      contexto.lineTo(w * 0.11, h * 0.03);
      contexto.stroke();
    }

    contexto.restore();
  }

  function desenharPoeira(particula, tempo) {
    const brilho = 0.55 + Math.sin(tempo * 0.001 + particula.fase) * 0.45;
    contexto.globalAlpha = particula.opacidade * brilho;
    contexto.fillStyle = 'rgba(236, 227, 208, .72)';
    contexto.beginPath();
    contexto.arc(particula.x, particula.y, particula.r, 0, Math.PI * 2);
    contexto.fill();
  }

  function atualizar(delta, tempo) {
    const agoraScroll = scrollY;
    impulsoScroll += ((agoraScroll - ultimoScroll) - impulsoScroll) * 0.08;
    ultimoScroll = agoraScroll;

    for (const papel of papeis) {
      papel.fase += delta * 0.00022;
      papel.y += papel.velocidade * papel.profundidade * delta * 0.001;
      papel.x += (papel.deriva + Math.sin(tempo * 0.00021 + papel.fase) * 6 + impulsoScroll * 0.03) * delta * 0.001;
      papel.rotacao += Math.sin(tempo * 0.00017 + papel.fase) * 0.00011 * delta;

      if (papel.y > altura + papel.altura || papel.x < -largura * 0.35 || papel.x > largura * 1.35) {
        Object.assign(papel, novoPapel(papel.tipo, false));
      }
    }

    for (const particula of poeira) {
      particula.y += particula.velocidade * delta * 0.001;
      particula.x += (particula.deriva + Math.sin(tempo * 0.0003 + particula.fase)) * delta * 0.001;
      if (particula.y > altura + 4) {
        particula.y = -4;
        particula.x = Math.random() * largura;
      }
    }
  }

  function renderizar(tempo) {
    requestAnimationFrame(renderizar);
    if (!visivel || tempo - ultimoFrame < 33) return;

    const delta = Math.min(80, tempo - ultimoFrame || 33);
    ultimoFrame = tempo;
    contexto.clearRect(0, 0, largura, altura);
    atualizar(delta, tempo);

    for (const particula of poeira) desenharPoeira(particula, tempo);
    contexto.globalAlpha = 1;
    for (const papel of papeis) desenharPapel(papel, tempo);
    contexto.globalAlpha = 1;
  }

  for (let i = 0; i < quantidadePapeis; i++) papeis.push(novoPapel(i, true));
  for (let i = 0; i < quantidadePoeira; i++) poeira.push(novaPoeira());

  redimensionar();
  addEventListener('resize', redimensionar, { passive: true });
  document.addEventListener('visibilitychange', () => {
    visivel = !document.hidden;
  });
  requestAnimationFrame(renderizar);
}
