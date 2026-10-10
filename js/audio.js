function criarRuido(contexto, segundos = 3.2) {
  const taxa = contexto.sampleRate;
  const tamanho = Math.floor(taxa * segundos);
  const buffer = contexto.createBuffer(1, tamanho, taxa);
  const dados = buffer.getChannelData(0);
  let anterior = 0;
  let semente = 4871;

  const random = () => {
    semente = (semente * 16807) % 2147483647;
    return (semente - 1) / 2147483646;
  };

  for (let i = 0; i < tamanho; i++) {
    const branco = random() * 2 - 1;
    anterior = (anterior + 0.022 * branco) / 1.022;
    dados[i] = anterior * 2.2 + branco * 0.17;
  }

  return buffer;
}

function conectarCamada(contexto, fonte, master, tipo, frequencia, q, ganho) {
  const filtro = contexto.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.value = frequencia;
  filtro.Q.value = q;

  const volume = contexto.createGain();
  volume.gain.value = ganho;

  fonte.connect(filtro);
  filtro.connect(volume);
  volume.connect(master);

  return { filtro, volume };
}

export function criarAudioAmbiente() {
  let contexto;
  let master;
  let fonte;
  let mar;
  let espuma;
  let impacto;
  let vento;
  let ativo = false;
  let iniciado = false;
  let ultimaAtualizacao = -1;
  let ultimoCapitulo = 1;

  function iniciarNos() {
    const AudioContexto = window.AudioContext || window.webkitAudioContext;
    if (!AudioContexto) return false;

    contexto = new AudioContexto({ latencyHint: 'interactive' });
    master = contexto.createGain();
    master.gain.value = 0;
    master.connect(contexto.destination);

    fonte = contexto.createBufferSource();
    fonte.buffer = criarRuido(contexto);
    fonte.loop = true;

    mar = conectarCamada(contexto, fonte, master, 'lowpass', 760, 0.38, 0.46);
    espuma = conectarCamada(contexto, fonte, master, 'bandpass', 1760, 0.5, 0.025);
    impacto = conectarCamada(contexto, fonte, master, 'lowpass', 230, 0.74, 0.008);
    vento = conectarCamada(contexto, fonte, master, 'bandpass', 1210, 0.66, 0.024);

    fonte.start();
    iniciado = true;
    return true;
  }

  function tocarSino(indice) {
    if (!iniciado || !ativo || !contexto || contexto.state !== 'running') return;

    const agora = contexto.currentTime;
    const frequenciaBase = 510 + (indice % 3) * 18;
    const ganho = contexto.createGain();
    const filtro = contexto.createBiquadFilter();
    const sinoA = contexto.createOscillator();
    const sinoB = contexto.createOscillator();

    sinoA.type = 'sine';
    sinoB.type = 'sine';
    sinoA.frequency.setValueAtTime(frequenciaBase, agora);
    sinoB.frequency.setValueAtTime(frequenciaBase * 1.495, agora);
    sinoB.detune.setValueAtTime(-7, agora);

    filtro.type = 'bandpass';
    filtro.frequency.setValueAtTime(920, agora);
    filtro.Q.setValueAtTime(0.72, agora);

    ganho.gain.setValueAtTime(0.0001, agora);
    ganho.gain.exponentialRampToValueAtTime(0.038, agora + 0.018);
    ganho.gain.exponentialRampToValueAtTime(0.012, agora + 0.32);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + 1.25);

    sinoA.connect(filtro);
    sinoB.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(master);

    sinoA.start(agora);
    sinoB.start(agora);
    sinoA.stop(agora + 1.3);
    sinoB.stop(agora + 1.3);
  }

  async function alternar() {
    if (!iniciado && !iniciarNos()) return false;
    if (contexto.state === 'suspended') await contexto.resume();

    ativo = !ativo;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
    master.gain.setValueAtTime(master.gain.value, agora);
    master.gain.linearRampToValueAtTime(ativo ? 0.2 : 0, agora + 0.55);
    return ativo;
  }

  function atualizar(progresso, estadoMar = {}) {
    if (!iniciado || !ativo) return;

    const agora = contexto.currentTime;
    if (ultimaAtualizacao >= 0 && agora - ultimaAtualizacao < 0.045) return;
    ultimaAtualizacao = agora;

    const nivelImpacto = Math.max(0, Math.min(1, estadoMar.impacto ?? 0));
    const nivelEspuma = Math.max(0, Math.min(1, estadoMar.espuma ?? 0));
    const nivelVento = Math.max(0, Math.min(1, estadoMar.vento ?? 0.4));
    const proximidade = 0.58 + Math.sin(progresso * Math.PI) * 0.42;

    mar.volume.gain.setTargetAtTime(0.34 + proximidade * 0.2, agora, 0.12);
    impacto.volume.gain.setTargetAtTime(0.006 + nivelImpacto * 0.48, agora, nivelImpacto > 0.2 ? 0.018 : 0.16);
    espuma.volume.gain.setTargetAtTime(0.018 + nivelEspuma * 0.2, agora, nivelEspuma > 0.12 ? 0.055 : 0.22);
    vento.volume.gain.setTargetAtTime(0.018 + nivelVento * 0.052, agora, 0.38);
    impacto.filtro.frequency.setTargetAtTime(170 + nivelImpacto * 310, agora, 0.035);
    espuma.filtro.frequency.setTargetAtTime(1540 + nivelEspuma * 520, agora, 0.08);
  }

  function marcarCapitulo(indice) {
    if (indice === ultimoCapitulo) return;
    ultimoCapitulo = indice;
    tocarSino(indice);
  }

  function desligar() {
    if (!iniciado) return;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
    master.gain.setValueAtTime(master.gain.value, agora);
    master.gain.linearRampToValueAtTime(0, agora + 0.28);
    ativo = false;
  }

  return {
    alternar,
    atualizar,
    marcarCapitulo,
    desligar,
    get ativo() {
      return ativo;
    }
  };
}
