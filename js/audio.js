function ruidoMarrom(contexto, segundos = 7) {
  const taxa = contexto.sampleRate;
  const tamanho = Math.floor(taxa * segundos);
  const buffer = contexto.createBuffer(2, tamanho, taxa);

  for (let canal = 0; canal < 2; canal++) {
    const dados = buffer.getChannelData(canal);
    let anterior = 0;
    let semente = canal ? 9137 : 4871;

    const random = () => {
      semente = (semente * 16807) % 2147483647;
      return (semente - 1) / 2147483646;
    };

    for (let i = 0; i < tamanho; i++) {
      const branco = random() * 2 - 1;
      anterior = (anterior + 0.018 * branco) / 1.018;
      dados[i] = anterior * 3.25;
    }
  }

  return buffer;
}

export function criarAudioAmbiente() {
  let contexto;
  let master;
  let fonte;
  let vento;
  let grave;
  let lfo;
  let ativo = false;
  let iniciado = false;

  function iniciarNos() {
    const AudioContexto = window.AudioContext || window.webkitAudioContext;
    if (!AudioContexto) return false;

    contexto = new AudioContexto();
    master = contexto.createGain();
    master.gain.value = 0;
    master.connect(contexto.destination);

    fonte = contexto.createBufferSource();
    fonte.buffer = ruidoMarrom(contexto);
    fonte.loop = true;

    const filtroMar = contexto.createBiquadFilter();
    filtroMar.type = 'lowpass';
    filtroMar.frequency.value = 730;
    filtroMar.Q.value = 0.38;

    const ganhoMar = contexto.createGain();
    ganhoMar.gain.value = 0.72;

    fonte.connect(filtroMar);
    filtroMar.connect(ganhoMar);
    ganhoMar.connect(master);

    vento = contexto.createBufferSource();
    vento.buffer = ruidoMarrom(contexto, 5);
    vento.loop = true;

    const filtroVento = contexto.createBiquadFilter();
    filtroVento.type = 'bandpass';
    filtroVento.frequency.value = 1580;
    filtroVento.Q.value = 0.58;

    const ganhoVento = contexto.createGain();
    ganhoVento.gain.value = 0.11;

    vento.connect(filtroVento);
    filtroVento.connect(ganhoVento);
    ganhoVento.connect(master);

    grave = contexto.createOscillator();
    grave.type = 'sine';
    grave.frequency.value = 43;

    const ganhoGrave = contexto.createGain();
    ganhoGrave.gain.value = 0.018;
    grave.connect(ganhoGrave);
    ganhoGrave.connect(master);

    lfo = contexto.createOscillator();
    const lfoGain = contexto.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.075;
    lfoGain.gain.value = 0.055;
    lfo.connect(lfoGain);
    lfoGain.connect(ganhoMar.gain);

    fonte.start();
    vento.start();
    grave.start();
    lfo.start();
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
    master.gain.linearRampToValueAtTime(ativo ? 0.12 : 0, agora + 0.8);
    return ativo;
  }

  function atualizar(progresso) {
    if (!iniciado || !ativo) return;
    const agora = contexto.currentTime;
    const nivel = 0.105 + Math.sin(progresso * Math.PI) * 0.025;
    master.gain.setTargetAtTime(nivel, agora, 0.7);
  }

  function desligar() {
    if (!iniciado) return;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
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
