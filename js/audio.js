function ruido(contexto, segundos = 2.4) {
  const tamanho = Math.floor(contexto.sampleRate * segundos);
  const buffer = contexto.createBuffer(1, tamanho, contexto.sampleRate);
  const dados = buffer.getChannelData(0);
  let semente = 4817;
  for (let i = 0; i < tamanho; i++) {
    semente = (semente * 16807) % 2147483647;
    dados[i] = ((semente - 1) / 2147483646) * 2 - 1;
  }
  return buffer;
}

function impulsoSala(contexto, duracao = .52, decaimento = 3.4) {
  const tamanho = Math.floor(contexto.sampleRate * duracao);
  const buffer = contexto.createBuffer(2, tamanho, contexto.sampleRate);
  let semente = 9131;
  const rnd = () => {
    semente = (semente * 16807) % 2147483647;
    return ((semente - 1) / 2147483646) * 2 - 1;
  };
  for (let canal = 0; canal < 2; canal++) {
    const dados = buffer.getChannelData(canal);
    for (let i = 0; i < tamanho; i++) {
      const t = i / tamanho;
      const envelope = Math.pow(1 - t, decaimento);
      dados[i] = rnd() * envelope * (canal ? .88 : 1);
    }
  }
  return buffer;
}

function camada(contexto, fonte, destino, tipo, frequencia, q, ganho) {
  const filtro = contexto.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.value = frequencia;
  filtro.Q.value = q;
  const volume = contexto.createGain();
  volume.gain.value = ganho;
  fonte.connect(filtro).connect(volume).connect(destino);
  return { filtro, volume };
}

export function criarAudioAmbiente() {
  let contexto;
  let master;
  let dry;
  let wet;
  let reverb;
  let fonte;
  let bufferRuido;
  let sala;
  let trabalho;
  let exterior;
  let hum;
  let hum2;
  let humGain;
  let humGain2;
  let ativo = false;
  let iniciado = false;
  let ultimoTick = -1;
  let ultimoTeclado = -1;
  let ultimoCorredor = -1;
  let alternaTick = false;
  let ultimaAtualizacao = -1;

  function iniciarNos() {
    const AudioContexto = window.AudioContext || window.webkitAudioContext;
    if (!AudioContexto) return false;

    contexto = new AudioContexto({ latencyHint: 'interactive' });
    master = contexto.createGain();
    master.gain.value = 0;

    dry = contexto.createGain();
    dry.gain.value = .94;
    wet = contexto.createGain();
    wet.gain.value = .11;
    reverb = contexto.createConvolver();
    reverb.buffer = impulsoSala(contexto);

    master.connect(dry).connect(contexto.destination);
    master.connect(reverb).connect(wet).connect(contexto.destination);

    bufferRuido = ruido(contexto);
    fonte = contexto.createBufferSource();
    fonte.buffer = bufferRuido;
    fonte.loop = true;

    sala = camada(contexto, fonte, master, 'lowpass', 720, .34, .025);
    trabalho = camada(contexto, fonte, master, 'bandpass', 1680, .62, 0);
    exterior = camada(contexto, fonte, master, 'highpass', 560, .24, 0);

    hum = contexto.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 60;
    humGain = contexto.createGain();
    humGain.gain.value = .0055;
    hum.connect(humGain).connect(master);

    hum2 = contexto.createOscillator();
    hum2.type = 'sine';
    hum2.frequency.value = 120;
    humGain2 = contexto.createGain();
    humGain2.gain.value = .0018;
    hum2.connect(humGain2).connect(master);

    fonte.start();
    hum.start();
    hum2.start();
    iniciado = true;
    return true;
  }

  function toque(frequencia = 1450, duracao = .028, volume = .018, tipo = 'square') {
    if (!iniciado || !ativo) return;
    const agora = contexto.currentTime;
    const osc = contexto.createOscillator();
    const ganho = contexto.createGain();
    osc.type = tipo;
    osc.frequency.value = frequencia;
    ganho.gain.setValueAtTime(volume, agora);
    ganho.gain.exponentialRampToValueAtTime(.0001, agora + duracao);
    osc.connect(ganho).connect(master);
    osc.start(agora);
    osc.stop(agora + duracao + .01);
  }

  function transienteRuido(frequencia, q, duracao, volume, offset = .2) {
    if (!iniciado || !ativo || !bufferRuido) return;
    const agora = contexto.currentTime;
    const src = contexto.createBufferSource();
    const filtro = contexto.createBiquadFilter();
    const ganho = contexto.createGain();
    src.buffer = bufferRuido;
    filtro.type = 'bandpass';
    filtro.frequency.value = frequencia;
    filtro.Q.value = q;
    ganho.gain.setValueAtTime(0, agora);
    ganho.gain.linearRampToValueAtTime(volume, agora + .002);
    ganho.gain.exponentialRampToValueAtTime(.0001, agora + duracao);
    src.connect(filtro).connect(ganho).connect(master);
    src.start(agora, offset, Math.min(.08, duracao + .02));
    src.stop(agora + duracao + .03);
  }

  function tickRelogio(trabalhoNivel) {
    alternaTick = !alternaTick;
    transienteRuido(
      (trabalhoNivel > .55 ? 1180 : 1540) * (alternaTick ? 1 : .89),
      2.8,
      .032,
      trabalhoNivel > .55 ? .0055 : .0085,
      alternaTick ? .21 : .73
    );
  }

  function cliqueTeclado(indice = 0) {
    const tons = [2180, 2440, 1910, 2680];
    transienteRuido(tons[indice % tons.length], 3.6, .024, .0038, .31 + (indice % 3) * .19);
  }

  function ruidoCorredor() {
    if (!iniciado || !ativo) return;
    const agora = contexto.currentTime;
    const osc = contexto.createOscillator();
    const ganho = contexto.createGain();
    const filtro = contexto.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.value = 185 + Math.sin(agora * .43) * 12;
    filtro.type = 'lowpass';
    filtro.frequency.value = 520;
    ganho.gain.setValueAtTime(.0001, agora);
    ganho.gain.linearRampToValueAtTime(.0035, agora + .08);
    ganho.gain.exponentialRampToValueAtTime(.0001, agora + .5);
    osc.connect(filtro).connect(ganho).connect(master);
    osc.start(agora);
    osc.stop(agora + .54);
  }

  function sino(escritorio = false) {
    if (!iniciado || !ativo) return;
    const agora = contexto.currentTime;
    const frequencias = escritorio ? [176, 352] : [720, 910, 1120];
    frequencias.forEach((freq, i) => {
      const osc = contexto.createOscillator();
      const ganho = contexto.createGain();
      osc.type = escritorio ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const volume = escritorio ? .025 / (i + 1) : .018 / (1 + i * .45);
      ganho.gain.setValueAtTime(volume, agora);
      ganho.gain.exponentialRampToValueAtTime(.0001, agora + (escritorio ? .22 : .72));
      osc.connect(ganho).connect(master);
      osc.start(agora);
      osc.stop(agora + (escritorio ? .25 : .78));
    });
  }

  async function alternar() {
    if (!iniciado && !iniciarNos()) return false;
    if (contexto.state === 'suspended') await contexto.resume();
    ativo = !ativo;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
    master.gain.setValueAtTime(master.gain.value, agora);
    master.gain.linearRampToValueAtTime(ativo ? .42 : 0, agora + .55);
    return ativo;
  }

  function marcarCapitulo(capitulo) {
    if (!iniciado || !ativo) return;
    if (capitulo === 2 || capitulo === 3) sino(false);
    if (capitulo === 4 || capitulo === 5) sino(true);
    if (capitulo === 6) {
      toque(520, .14, .012, 'sine');
      setTimeout(() => toque(660, .18, .009, 'sine'), 110);
    }
  }

  function atualizar(progresso, estado = {}) {
    if (!iniciado || !ativo) return;
    const agora = contexto.currentTime;
    const trabalhoNivel = Math.max(0, Math.min(1, estado.trabalho ?? 0));
    const abertura = Math.max(0, Math.min(1, estado.abertura ?? 0));

    if (agora - ultimaAtualizacao > .06) {
      ultimaAtualizacao = agora;
      sala.volume.gain.setTargetAtTime(.022 + (1 - trabalhoNivel) * .018, agora, .22);
      trabalho.volume.gain.setTargetAtTime(trabalhoNivel * .035 * (1 - abertura), agora, .22);
      trabalho.filtro.frequency.setTargetAtTime(1460 + trabalhoNivel * 520, agora, .28);
      exterior.volume.gain.setTargetAtTime(abertura * .04, agora, .34);
      humGain.gain.setTargetAtTime((.0045 + trabalhoNivel * .007) * (1 - abertura * .92), agora, .25);
      humGain2.gain.setTargetAtTime((.0015 + trabalhoNivel * .003) * (1 - abertura * .94), agora, .25);
      wet.gain.setTargetAtTime(.12 - trabalhoNivel * .045 + abertura * .07, agora, .4);
      dry.gain.setTargetAtTime(.94 + trabalhoNivel * .032 - abertura * .035, agora, .4);
    }

    const segundo = Math.floor(agora);
    if (segundo !== ultimoTick && abertura < .7) {
      ultimoTick = segundo;
      tickRelogio(trabalhoNivel);
    }

    if (trabalhoNivel > .58 && abertura < .42) {
      const janelaTeclado = Math.floor(agora * 1.65);
      if (janelaTeclado !== ultimoTeclado && janelaTeclado % 3 !== 0) {
        ultimoTeclado = janelaTeclado;
        cliqueTeclado(janelaTeclado);
      }
    }

    if (trabalhoNivel < .22 && progresso > .08 && progresso < .42) {
      const janelaCorredor = Math.floor(agora / 5.5);
      if (janelaCorredor !== ultimoCorredor) {
        ultimoCorredor = janelaCorredor;
        ruidoCorredor();
      }
    }
  }

  function desligar() {
    if (!iniciado) return;
    const agora = contexto.currentTime;
    master.gain.cancelScheduledValues(agora);
    master.gain.setValueAtTime(master.gain.value, agora);
    master.gain.linearRampToValueAtTime(0, agora + .25);
    ativo = false;
  }

  return {
    alternar,
    atualizar,
    marcarCapitulo,
    desligar,
    get ativo() { return ativo; }
  };
}
