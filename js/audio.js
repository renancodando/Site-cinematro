function criarRuido(contexto, segundos, tipo = 'marrom', sementeInicial = 4871) {
  const taxa = contexto.sampleRate;
  const tamanho = Math.floor(taxa * segundos);
  const buffer = contexto.createBuffer(2, tamanho, taxa);

  for (let canal = 0; canal < 2; canal++) {
    const dados = buffer.getChannelData(canal);
    let anterior = 0;
    let semente = sementeInicial + canal * 4261;

    const random = () => {
      semente = (semente * 16807) % 2147483647;
      return (semente - 1) / 2147483646;
    };

    for (let i = 0; i < tamanho; i++) {
      const branco = random() * 2 - 1;
      if (tipo === 'marrom') {
        anterior = (anterior + 0.02 * branco) / 1.02;
        dados[i] = anterior * 3.15;
      } else {
        dados[i] = branco * 0.72;
      }
    }
  }

  return buffer;
}

function fonteLoop(contexto, buffer) {
  const fonte = contexto.createBufferSource();
  fonte.buffer = buffer;
  fonte.loop = true;
  return fonte;
}

export function criarAudioAmbiente() {
  let contexto;
  let master;
  let ganhoMar;
  let ganhoEspuma;
  let ganhoImpacto;
  let ganhoVento;
  let filtroImpacto;
  let ativo = false;
  let iniciado = false;

  function iniciarNos() {
    const AudioContexto = window.AudioContext || window.webkitAudioContext;
    if (!AudioContexto) return false;

    contexto = new AudioContexto();
    master = contexto.createGain();
    master.gain.value = 0;
    master.connect(contexto.destination);

    const mar = fonteLoop(contexto, criarRuido(contexto, 9, 'marrom', 4871));
    const filtroMar = contexto.createBiquadFilter();
    filtroMar.type = 'lowpass';
    filtroMar.frequency.value = 860;
    filtroMar.Q.value = 0.42;
    ganhoMar = contexto.createGain();
    ganhoMar.gain.value = 0.44;
    mar.connect(filtroMar).connect(ganhoMar).connect(master);

    const espuma = fonteLoop(contexto, criarRuido(contexto, 7, 'branco', 8411));
    const filtroEspuma = contexto.createBiquadFilter();
    filtroEspuma.type = 'bandpass';
    filtroEspuma.frequency.value = 1850;
    filtroEspuma.Q.value = 0.5;
    ganhoEspuma = contexto.createGain();
    ganhoEspuma.gain.value = 0.035;
    espuma.connect(filtroEspuma).connect(ganhoEspuma).connect(master);

    const impacto = fonteLoop(contexto, criarRuido(contexto, 6, 'marrom', 1229));
    filtroImpacto = contexto.createBiquadFilter();
    filtroImpacto.type = 'lowpass';
    filtroImpacto.frequency.value = 240;
    filtroImpacto.Q.value = 0.7;
    ganhoImpacto = contexto.createGain();
    ganhoImpacto.gain.value = 0.01;
    impacto.connect(filtroImpacto).connect(ganhoImpacto).connect(master);

    const vento = fonteLoop(contexto, criarRuido(contexto, 5, 'branco', 5939));
    const filtroVento = contexto.createBiquadFilter();
    filtroVento.type = 'bandpass';
    filtroVento.frequency.value = 1260;
    filtroVento.Q.value = 0.74;
    ganhoVento = contexto.createGain();
    ganhoVento.gain.value = 0.035;
    vento.connect(filtroVento).connect(ganhoVento).connect(master);

    mar.start();
    espuma.start();
    impacto.start();
    vento.start();
    iniciado = true;
    return true;
  }

  async function alternar() {
    if (!iniciado && !iniciarNos()) return false;
    if (contexto.state === 'suspended') await contexto.resume();

    ativo = !ativo;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
    master.gain.setValueAtTime(master.gain.value, agora);
    master.gain.linearRampToValueAtTime(ativo ? 0.22 : 0, agora + 0.75);
    return ativo;
  }

  function atualizar(progresso, estadoMar = {}) {
    if (!iniciado || !ativo) return;

    const agora = contexto.currentTime;
    const impacto = Math.max(0, Math.min(1, estadoMar.impacto ?? 0));
    const espuma = Math.max(0, Math.min(1, estadoMar.espuma ?? 0));
    const vento = Math.max(0, Math.min(1, estadoMar.vento ?? 0.35));
    const proximidadeCosta = 0.62 + Math.sin(progresso * Math.PI) * 0.38;

    ganhoMar.gain.setTargetAtTime(0.38 + proximidadeCosta * 0.18, agora, 0.14);
    ganhoImpacto.gain.setTargetAtTime(0.012 + impacto * 0.42, agora, impacto > 0.15 ? 0.025 : 0.22);
    ganhoEspuma.gain.setTargetAtTime(0.025 + espuma * 0.19, agora, espuma > 0.12 ? 0.08 : 0.3);
    ganhoVento.gain.setTargetAtTime(0.024 + vento * 0.055, agora, 0.5);
    filtroImpacto.frequency.setTargetAtTime(180 + impacto * 260, agora, 0.05);
  }

  function desligar() {
    if (!iniciado) return;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
    master.gain.setValueAtTime(master.gain.value, agora);
    master.gain.linearRampToValueAtTime(0, agora + 0.35);
    ativo = false;
  }

  return {
    alternar,
    atualizar,
    desligar,
    get ativo() {
      return ativo;
    }
  };
}
