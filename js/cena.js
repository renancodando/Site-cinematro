import * as THREE from 'three';

const COR_PAREDE = new THREE.Color(0xb7b2a7);
const COR_PAREDE_FRIA = new THREE.Color(0x8f9696);
const COR_LUZ_ESCOLA = new THREE.Color(0xffe7bd);
const COR_LUZ_TRABALHO = new THREE.Color(0xc9dded);
const COR_MANHA = new THREE.Color(0xffcf98);

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function suavizar(inicio, fim, valor) {
  const x = limitar((valor - inicio) / Math.max(0.0001, fim - inicio));
  return x * x * (3 - 2 * x);
}

function interpolar(a, b, t) {
  return a + (b - a) * t;
}

function aleatorio(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function perfil() {
  const toque = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;
  const fraco = toque || cores <= 4 || memoria <= 4;
  return {
    dprMin: fraco ? 0.82 : 0.95,
    dprMax: fraco ? 1.08 : 1.38,
    poeira: fraco ? 180 : 360,
    antialias: !fraco
  };
}

function texturaParede() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(9137);
  ctx.fillStyle = '#b7b2a7';
  ctx.fillRect(0, 0, tamanho, tamanho);

  for (let i = 0; i < 1500; i++) {
    const tom = 115 + Math.floor(rand() * 75);
    ctx.fillStyle = `rgba(${tom},${tom},${Math.max(0, tom - 8)},${0.016 + rand() * 0.035})`;
    const r = 0.4 + rand() * 1.7;
    ctx.fillRect(rand() * tamanho, rand() * tamanho, r, r);
  }

  for (let i = 0; i < 12; i++) {
    const y = rand() * tamanho;
    const g = ctx.createLinearGradient(0, y, 0, y + 28);
    g.addColorStop(0, 'rgba(70,65,57,0)');
    g.addColorStop(.45, `rgba(70,65,57,${0.02 + rand() * 0.035})`);
    g.addColorStop(1, 'rgba(70,65,57,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, tamanho, 28);
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(3, 2);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function texturaPiso() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(4451);
  ctx.fillStyle = '#605d56';
  ctx.fillRect(0, 0, tamanho, tamanho);

  const modulo = 32;
  for (let y = 0; y < tamanho; y += modulo) {
    for (let x = 0; x < tamanho; x += modulo) {
      const v = 82 + Math.floor(rand() * 12);
      ctx.fillStyle = `rgb(${v},${v - 2},${v - 6})`;
      ctx.fillRect(x + 1, y + 1, modulo - 2, modulo - 2);
      ctx.strokeStyle = 'rgba(28,28,27,.34)';
      ctx.strokeRect(x + .5, y + .5, modulo - 1, modulo - 1);
    }
  }

  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(20,20,19,${rand() * .045})`;
    ctx.fillRect(rand() * tamanho, rand() * tamanho, .5 + rand() * 2, .5 + rand() * 2);
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(7, 14);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function texturaMadeira() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(7781);
  ctx.fillStyle = '#8d7253';
  ctx.fillRect(0, 0, tamanho, tamanho);
  for (let y = 0; y < tamanho; y++) {
    const a = 0.025 + Math.sin(y * .17) * .01 + rand() * .016;
    ctx.strokeStyle = `rgba(63,39,24,${a})`;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * .08) * 2);
    ctx.bezierCurveTo(64, y + rand() * 4, 170, y - rand() * 4, tamanho, y + Math.sin(y * .05) * 2);
    ctx.stroke();
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(2.2, 1);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function texturaPapel() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8e4d9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4a4a46';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('AVALIAÇÃO', 22, 28);
  ctx.font = '10px Arial';
  ctx.fillText('nome: __________________________', 22, 48);
  ctx.strokeStyle = 'rgba(54,54,51,.28)';
  for (let y = 78; y < 285; y += 28) {
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(232, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#a44d43';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(184, 42);
  ctx.lineTo(226, 76);
  ctx.moveTo(226, 42);
  ctx.lineTo(184, 76);
  ctx.stroke();
  ctx.fillStyle = '#a44d43';
  ctx.font = 'bold 20px Georgia';
  ctx.fillText('6,0', 179, 102);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function texturaQuadro() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(551);
  ctx.fillStyle = '#20352e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = `rgba(220,225,215,${rand() * .025})`;
    ctx.fillRect(rand() * canvas.width, rand() * canvas.height, 1 + rand() * 3, 1);
  }
  ctx.fillStyle = 'rgba(238,235,222,.72)';
  ctx.font = '28px Georgia';
  ctx.fillText('aprender = perguntar', 58, 88);
  ctx.font = '20px Georgia';
  ctx.fillText('por quê?', 58, 132);
  ctx.strokeStyle = 'rgba(238,235,222,.36)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(58, 163);
  ctx.lineTo(438, 163);
  ctx.stroke();
  ctx.font = '18px Arial';
  ctx.fillText('prova · 07:30', 58, 230);
  ctx.fillText('tempo · 50 min', 58, 262);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function texturaMeta() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#10171a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#d7e3e7';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('PAINEL — TURNO', 56, 60);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#91a2a8';
  ctx.fillText('META', 56, 118);
  ctx.fillText('PRAZO', 340, 118);
  ctx.fillText('PRODUÇÃO', 596, 118);
  ctx.fillStyle = '#eef5f5';
  ctx.font = '42px Georgia';
  ctx.fillText('100%', 56, 180);
  ctx.fillText('18:00', 340, 180);
  ctx.fillText('87%', 596, 180);
  ctx.strokeStyle = '#a74e43';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(56, 250);
  ctx.lineTo(876, 250);
  ctx.stroke();
  ctx.fillStyle = '#a74e43';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('ATRASO', 56, 302);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function criarSala(cena) {
  const matParede = new THREE.MeshStandardMaterial({ color: COR_PAREDE.clone(), map: texturaParede(), roughness: .96 });
  const matPiso = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaPiso(), roughness: .82, metalness: .02 });
  const matTeto = new THREE.MeshStandardMaterial({ color: 0xd3d0c7, roughness: .98 });

  const piso = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), matPiso);
  piso.rotation.x = -Math.PI / 2;
  cena.add(piso);

  const teto = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), matTeto);
  teto.rotation.x = Math.PI / 2;
  teto.position.y = 8.2;
  cena.add(teto);

  const frente = new THREE.Mesh(new THREE.PlaneGeometry(30, 8.2), matParede);
  frente.position.set(0, 4.1, -30);
  cena.add(frente);

  const esquerda = new THREE.Mesh(new THREE.PlaneGeometry(60, 8.2), matParede.clone());
  esquerda.rotation.y = Math.PI / 2;
  esquerda.position.set(-15, 4.1, 0);
  cena.add(esquerda);

  const direita = esquerda.clone();
  direita.rotation.y = -Math.PI / 2;
  direita.position.x = 15;
  cena.add(direita);

  return { matParede, matPiso, matTeto };
}

function criarCarteiras(cena) {
  const madeira = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaMadeira(), roughness: .66, metalness: .02 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x3e4242, roughness: .58, metalness: .46 });
  const cadeira = new THREE.MeshStandardMaterial({ color: 0x50645d, roughness: .78, metalness: .04 });
  const papelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: texturaPapel(),
    roughness: .94,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1
  });

  const colunas = [-8.4, -3.1, 3.1, 8.4];
  const linhas = [15, 7, -1, -9, -17];
  const total = colunas.length * linhas.length;
  const tampos = new THREE.InstancedMesh(new THREE.BoxGeometry(3.25, .16, 1.65), madeira, total);
  const pernas = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, 1.55, .1), metal, total * 4);
  const assentos = new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, .12, 1.45), cadeira, total);
  const encostos = new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, 1.28, .11), cadeira, total);
  const papeis = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.05, 1.34), papelMat, total);
  const base = [];
  const dummy = new THREE.Object3D();
  let i = 0;
  let p = 0;

  for (const z of linhas) {
    for (const x of colunas) {
      const rot = ((i % 3) - 1) * .008;
      base.push({ x, z, rot, ruido: ((i * 17) % 11) / 11 });
      dummy.position.set(x, 1.65, z);
      dummy.rotation.y = rot;
      dummy.updateMatrix();
      tampos.setMatrixAt(i, dummy.matrix);

      const offsets = [[-1.38, -.68], [1.38, -.68], [-1.38, .68], [1.38, .68]];
      for (const [ox, oz] of offsets) {
        dummy.position.set(x + ox, .84, z + oz);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        pernas.setMatrixAt(p++, dummy.matrix);
      }

      dummy.position.set(x, .92, z + 2.02);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      assentos.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, 1.72, z + 2.66);
      dummy.updateMatrix();
      encostos.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x + .52, 1.745, z - .06);
      dummy.rotation.set(-Math.PI / 2, 0, -.045 + (i % 4) * .019);
      dummy.updateMatrix();
      papeis.setMatrixAt(i, dummy.matrix);
      i++;
    }
  }

  tampos.instanceMatrix.needsUpdate = true;
  pernas.instanceMatrix.needsUpdate = true;
  assentos.instanceMatrix.needsUpdate = true;
  encostos.instanceMatrix.needsUpdate = true;
  papeis.instanceMatrix.needsUpdate = true;
  cena.add(tampos, pernas, assentos, encostos, papeis);

  return { tampos, pernas, assentos, encostos, papeis, papelMat, base, total, madeira, cadeira };
}

function criarMonitores(cena, base) {
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x24292b, roughness: .5, metalness: .24 });
  const telaMat = new THREE.MeshStandardMaterial({ color: 0x182126, emissive: 0x7d9aad, emissiveIntensity: .12, roughness: .24 });
  const total = base.length;
  const corpos = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 1.08, .16), corpoMat, total);
  const telas = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.56, .82), telaMat, total);
  const suportes = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .64, .12), corpoMat, total);
  cena.add(corpos, telas, suportes);
  return { corpos, telas, suportes, corpoMat, telaMat, total };
}

function criarQuadros(cena) {
  const moldura = new THREE.Mesh(new THREE.BoxGeometry(13.6, 4.4, .18), new THREE.MeshStandardMaterial({ color: 0x403b32, roughness: .84 }));
  moldura.position.set(0, 4.35, -29.65);
  cena.add(moldura);

  const escolaMat = new THREE.MeshStandardMaterial({ map: texturaQuadro(), roughness: .92, transparent: true, opacity: 1 });
  const escola = new THREE.Mesh(new THREE.PlaneGeometry(13.1, 3.9), escolaMat);
  escola.position.set(0, 4.35, -29.54);
  cena.add(escola);

  const trabalhoMat = new THREE.MeshStandardMaterial({ map: texturaMeta(), emissive: 0x2b3a40, emissiveIntensity: .16, roughness: .42, transparent: true, opacity: 0 });
  const trabalho = new THREE.Mesh(new THREE.PlaneGeometry(13.1, 3.9), trabalhoMat);
  trabalho.position.set(0, 4.35, -29.5);
  cena.add(trabalho);

  return { escolaMat, trabalhoMat };
}

function criarRelogio(cena) {
  const grupo = new THREE.Group();
  grupo.position.set(10.2, 5.7, -29.38);
  const fundo = new THREE.Mesh(new THREE.CircleGeometry(1.05, 48), new THREE.MeshStandardMaterial({ color: 0xe0dcd2, roughness: .84 }));
  grupo.add(fundo);
  const aro = new THREE.Mesh(new THREE.RingGeometry(1.02, 1.12, 48), new THREE.MeshStandardMaterial({ color: 0x292b2b, roughness: .5, metalness: .34 }));
  aro.position.z = .02;
  grupo.add(aro);
  const hora = new THREE.Mesh(new THREE.BoxGeometry(.055, .62, .035), new THREE.MeshBasicMaterial({ color: 0x222222 }));
  hora.position.set(0, .26, .055);
  hora.geometry.translate(0, -.26, 0);
  grupo.add(hora);
  const minuto = new THREE.Mesh(new THREE.BoxGeometry(.04, .82, .03), new THREE.MeshBasicMaterial({ color: 0x222222 }));
  minuto.position.set(0, .36, .06);
  minuto.geometry.translate(0, -.36, 0);
  grupo.add(minuto);
  const centro = new THREE.Mesh(new THREE.CircleGeometry(.08, 20), new THREE.MeshBasicMaterial({ color: 0x9c493f }));
  centro.position.z = .08;
  grupo.add(centro);
  cena.add(grupo);
  return { hora, minuto };
}

function criarJanelas(cena) {
  const grupo = new THREE.Group();
  const luzMat = new THREE.MeshBasicMaterial({ color: 0xb9c8c6, transparent: true, opacity: .45, side: THREE.DoubleSide });
  const molduraMat = new THREE.MeshStandardMaterial({ color: 0x414442, roughness: .7, metalness: .18 });
  const raios = [];

  for (let i = 0; i < 4; i++) {
    const z = 14 - i * 12;
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.25), luzMat.clone());
    vidro.rotation.y = -Math.PI / 2;
    vidro.position.set(14.91, 4.45, z);
    grupo.add(vidro);

    for (const yy of [-2.16, 2.16]) {
      const barra = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, 5.95), molduraMat);
      barra.position.set(14.76, 4.45 + yy, z);
      grupo.add(barra);
    }
    const vertical = new THREE.Mesh(new THREE.BoxGeometry(.12, 4.4, .12), molduraMat);
    vertical.position.set(14.76, 4.45, z);
    grupo.add(vertical);

    const raioMat = new THREE.MeshBasicMaterial({ color: 0xffd19a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const raio = new THREE.Mesh(new THREE.PlaneGeometry(8, 17), raioMat);
    raio.rotation.set(-.18, -.95, .05);
    raio.position.set(8.8, 3.5, z - 3.2);
    grupo.add(raio);
    raios.push(raioMat);
  }

  cena.add(grupo);
  return { grupo, luzMat, raios };
}

function criarFluorescentes(cena) {
  const grupo = new THREE.Group();
  const caixas = [];
  const material = new THREE.MeshStandardMaterial({ color: 0xe5e1d5, emissive: COR_LUZ_ESCOLA.clone(), emissiveIntensity: 1.4, roughness: .5 });
  for (let z = 18; z >= -18; z -= 9) {
    for (const x of [-6, 6]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(4.8, .08, .42), material);
      lamp.position.set(x, 8.05, z);
      grupo.add(lamp);
      caixas.push(lamp);
    }
  }
  cena.add(grupo);
  return { grupo, material, caixas };
}

function criarPonto(cena) {
  const grupo = new THREE.Group();
  grupo.position.set(-11.8, 2.1, -29.2);
  grupo.scale.setScalar(.001);
  const caixa = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, .38), new THREE.MeshStandardMaterial({ color: 0x292e30, roughness: .5, metalness: .32 }));
  grupo.add(caixa);
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(.95, .46), new THREE.MeshStandardMaterial({ color: 0x14272b, emissive: 0x58b6a9, emissiveIntensity: .6 }));
  tela.position.set(0, .46, .2);
  grupo.add(tela);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xaa3f38 });
  const led = new THREE.Mesh(new THREE.CircleGeometry(.08, 16), ledMat);
  led.position.set(.46, -.55, .205);
  grupo.add(led);
  cena.add(grupo);
  return { grupo, ledMat };
}

function criarPorta(cena) {
  const molduraMat = new THREE.MeshStandardMaterial({ color: 0x37342f, roughness: .82 });
  const portaMat = new THREE.MeshStandardMaterial({ color: 0x6b5946, roughness: .8 });
  const brilhoMat = new THREE.MeshBasicMaterial({ color: 0xffd7a5, transparent: true, opacity: 0 });

  const brilho = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 5.5), brilhoMat);
  brilho.position.set(-10.8, 2.75, -29.42);
  cena.add(brilho);

  const moldura = new THREE.Mesh(new THREE.BoxGeometry(3.35, 5.75, .2), molduraMat);
  moldura.position.set(-10.8, 2.87, -29.45);
  cena.add(moldura);

  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 5.2), brilhoMat.clone());
  fundo.material.opacity = .06;
  fundo.position.set(-10.8, 2.7, -29.32);
  cena.add(fundo);

  const pivo = new THREE.Group();
  pivo.position.set(-12.17, .1, -29.25);
  const porta = new THREE.Mesh(new THREE.BoxGeometry(2.72, 5.18, .13), portaMat);
  porta.geometry.translate(1.36, 2.59, 0);
  pivo.add(porta);
  cena.add(pivo);
  return { pivo, brilhoMat, fundoMat: fundo.material };
}

function criarPoeira(cena, quantidade) {
  const rand = aleatorio(33017);
  const pos = new Float32Array(quantidade * 3);
  for (let i = 0; i < quantidade; i++) {
    pos[i * 3] = (rand() - .5) * 28;
    pos[i * 3 + 1] = .5 + rand() * 7.2;
    pos[i * 3 + 2] = -27 + rand() * 54;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xe8deca, size: .045, transparent: true, opacity: .28, depthWrite: false, sizeAttenuation: true });
  const pontos = new THREE.Points(geo, mat);
  cena.add(pontos);
  return { pontos, mat };
}

export function criarCena(canvas) {
  const cfg = perfil();
  let dpr = Math.min(devicePixelRatio, cfg.dprMax);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: cfg.antialias, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0x252522);
  cena.fog = new THREE.Fog(0x353531, 24, 78);

  const camera = new THREE.PerspectiveCamera(innerWidth < 600 ? 50 : 44, innerWidth / innerHeight, .1, 130);
  camera.position.set(0, 4.2, 24);

  const sala = criarSala(cena);
  const carteiras = criarCarteiras(cena);
  const monitores = criarMonitores(cena, carteiras.base);
  const quadros = criarQuadros(cena);
  const relogio = criarRelogio(cena);
  const janelas = criarJanelas(cena);
  const fluorescentes = criarFluorescentes(cena);
  const ponto = criarPonto(cena);
  const porta = criarPorta(cena);
  const poeira = criarPoeira(cena, cfg.poeira);

  const ambiente = new THREE.HemisphereLight(0xc9c2af, 0x3d3b36, 1.22);
  cena.add(ambiente);
  const luzFrente = new THREE.DirectionalLight(0xffddb0, 1.15);
  luzFrente.position.set(9, 12, 18);
  cena.add(luzFrente);
  const luzFria = new THREE.PointLight(0xc9dded, 0, 42, 1.5);
  luzFria.position.set(0, 7.2, -5);
  cena.add(luzFria);
  const luzPorta = new THREE.PointLight(0xffc27f, 0, 34, 1.7);
  luzPorta.position.set(-10, 3.3, -24);
  cena.add(luzPorta);

  const cameraAtual = camera.position.clone();
  const alvoAtual = new THREE.Vector3(0, 2.5, -8);
  const dummy = new THREE.Object3D();
  const inicio = performance.now() * .001;
  let ultimo = inicio;
  let quadro = 0;
  let acumulado = 0;

  const keyframes = [
    { p: 0, c: [0, 4.3, 24], a: [0, 2.4, -12] },
    { p: .2, c: [-1.5, 3.8, 15], a: [-2, 2.1, -10] },
    { p: .4, c: [1.6, 3.35, 6], a: [0, 2.25, -15] },
    { p: .62, c: [-1.2, 3.55, 1], a: [0, 2.7, -21] },
    { p: .8, c: [2.2, 3.7, -5], a: [-1.5, 2.8, -25] },
    { p: 1, c: [-4.8, 3.6, -12], a: [-10.4, 2.8, -29] }
  ];

  function amostrar(progresso, ponteiro) {
    let a = keyframes[0];
    let b = keyframes[keyframes.length - 1];
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progresso >= keyframes[i].p && progresso <= keyframes[i + 1].p) {
        a = keyframes[i];
        b = keyframes[i + 1];
        break;
      }
    }
    const t = suavizar(a.p, b.p, progresso);
    return {
      c: new THREE.Vector3(
        interpolar(a.c[0], b.c[0], t) + ponteiro.x * .72,
        interpolar(a.c[1], b.c[1], t) + ponteiro.y * .36,
        interpolar(a.c[2], b.c[2], t)
      ),
      a: new THREE.Vector3(
        interpolar(a.a[0], b.a[0], t) + ponteiro.x * .35,
        interpolar(a.a[1], b.a[1], t) + ponteiro.y * .18,
        interpolar(a.a[2], b.a[2], t)
      )
    };
  }

  function atualizarCarteiras(progresso) {
    const trabalho = suavizar(.48, .7, progresso);
    const abrir = suavizar(.84, 1, progresso);
    for (let i = 0; i < carteiras.total; i++) {
      const base = carteiras.base[i];
      const lado = base.x < 0 ? -1 : 1;
      const x = base.x + lado * abrir * (1.6 + Math.abs(base.x) * .08);
      const z = base.z + trabalho * ((i % 4) * .18 - .27);

      dummy.position.set(x, 1.65, z);
      dummy.rotation.set(0, base.rot * (1 - trabalho), 0);
      dummy.updateMatrix();
      carteiras.tampos.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, .92, z + 2.02);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      carteiras.assentos.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, 1.72, z + 2.66);
      dummy.updateMatrix();
      carteiras.encostos.setMatrixAt(i, dummy.matrix);

      const crescimento = Math.max(.001, trabalho * (1 - abrir * .72));
      dummy.position.set(x, 2.33, z - .12);
      dummy.scale.set(crescimento, crescimento, crescimento);
      dummy.updateMatrix();
      monitores.corpos.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, 2.34, z - .205);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      monitores.telas.setMatrixAt(i, dummy.matrix);
      monitores.telas.setMatrixAt(i, crescimento < .01 ? new THREE.Matrix4().makeScale(.001, .001, .001) : dummy.matrix);

      dummy.position.set(x, 1.92, z - .12);
      dummy.scale.set(crescimento, crescimento, crescimento);
      dummy.updateMatrix();
      monitores.suportes.setMatrixAt(i, dummy.matrix);
      dummy.scale.set(1, 1, 1);
    }
    carteiras.tampos.instanceMatrix.needsUpdate = true;
    carteiras.assentos.instanceMatrix.needsUpdate = true;
    carteiras.encostos.instanceMatrix.needsUpdate = true;
    monitores.corpos.instanceMatrix.needsUpdate = true;
    monitores.telas.instanceMatrix.needsUpdate = true;
    monitores.suportes.instanceMatrix.needsUpdate = true;
    carteiras.papelMat.opacity = 1 - suavizar(.35, .58, progresso);
  }

  function atualizarRelogio(progresso) {
    const minutosInicio = 6 * 60 + 48;
    const minutosFim = 18 * 60 + 46;
    const total = interpolar(minutosInicio, minutosFim, suavizar(0, .86, progresso));
    const minutos = total % 60;
    const horas = (total / 60) % 12;
    relogio.minuto.rotation.z = -minutos / 60 * Math.PI * 2;
    relogio.hora.rotation.z = -(horas / 12) * Math.PI * 2;
  }

  function atualizarAmbiente(progresso, tempo) {
    const trabalho = suavizar(.46, .72, progresso);
    const libertar = suavizar(.84, 1, progresso);

    sala.matParede.color.copy(COR_PAREDE).lerp(COR_PAREDE_FRIA, trabalho * (1 - libertar * .82));
    cena.background.set(0x252522).lerp(new THREE.Color(0x1a2023), trabalho * .85).lerp(new THREE.Color(0x5b5a50), libertar * .45);
    cena.fog.color.set(0x353531).lerp(new THREE.Color(0x293238), trabalho).lerp(new THREE.Color(0x9c8e79), libertar * .5);
    cena.fog.near = interpolar(24, 30, libertar);
    cena.fog.far = interpolar(78, 105, libertar);

    fluorescentes.material.emissive.copy(COR_LUZ_ESCOLA).lerp(COR_LUZ_TRABALHO, trabalho);
    fluorescentes.material.emissiveIntensity = interpolar(1.35, 2.15, trabalho) * (1 - libertar * .76);
    ambiente.color.copy(COR_LUZ_ESCOLA).lerp(COR_LUZ_TRABALHO, trabalho).lerp(COR_MANHA, libertar);
    ambiente.intensity = interpolar(1.18, 1.35, trabalho) + libertar * .56;
    luzFrente.color.copy(COR_LUZ_ESCOLA).lerp(COR_LUZ_TRABALHO, trabalho).lerp(COR_MANHA, libertar);
    luzFrente.intensity = interpolar(1.08, .52, trabalho) + libertar * 1.25;
    luzFria.intensity = trabalho * 1.35 * (1 - libertar);
    luzPorta.intensity = libertar * 3.1;
    renderer.toneMappingExposure = interpolar(1.06, .94, trabalho) + libertar * .48;

    quadros.escolaMat.opacity = 1 - suavizar(.48, .67, progresso);
    quadros.trabalhoMat.opacity = suavizar(.5, .69, progresso) * (1 - libertar * .86);
    quadros.trabalhoMat.emissiveIntensity = .14 + trabalho * .28;
    monitores.telaMat.emissiveIntensity = .08 + trabalho * .42 * (1 - libertar * .95);

    const pontoEscala = suavizar(.52, .64, progresso) * (1 - libertar * .85);
    ponto.grupo.scale.setScalar(Math.max(.001, pontoEscala));
    ponto.ledMat.color.set(tempo % 1 < .18 && trabalho > .4 ? 0xff5b4d : 0x873d37);

    porta.pivo.rotation.y = -libertar * 1.28;
    porta.brilhoMat.opacity = libertar * .88;
    porta.fundoMat.opacity = .06 + libertar * .74;
    janelas.raios.forEach((mat, i) => {
      mat.opacity = libertar * (.06 + i * .012);
    });
    poeira.mat.opacity = .18 + libertar * .38;
    poeira.pontos.position.y = Math.sin(tempo * .17) * .06;
    poeira.pontos.rotation.y = Math.sin(tempo * .025) * .003;
  }

  function ajustarResolucao(delta) {
    acumulado += delta;
    quadro++;
    if (quadro < 90) return;
    const medio = acumulado / quadro;
    if (medio > .025 && dpr > cfg.dprMin + .04) dpr = Math.max(cfg.dprMin, dpr - .08);
    else if (medio < .017 && dpr < cfg.dprMax - .04) dpr = Math.min(cfg.dprMax, dpr + .04);
    renderer.setPixelRatio(dpr);
    quadro = 0;
    acumulado = 0;
  }

  function atualizar(progresso, ponteiro) {
    const agora = performance.now() * .001;
    const delta = limitar(agora - ultimo, 0, .05);
    ultimo = agora;
    const tempo = agora - inicio;

    atualizarCarteiras(progresso);
    atualizarRelogio(progresso);
    atualizarAmbiente(progresso, tempo);

    const amostra = amostrar(progresso, ponteiro);
    cameraAtual.lerp(amostra.c, .055);
    alvoAtual.lerp(amostra.a, .06);
    camera.position.copy(cameraAtual);
    camera.lookAt(alvoAtual);

    renderer.render(cena, camera);
    ajustarResolucao(delta);

    return {
      trabalho: suavizar(.46, .72, progresso),
      abertura: suavizar(.84, 1, progresso),
      relogio: tempo
    };
  }

  function redimensionar() {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 600 ? 50 : innerWidth > 1800 ? 41 : 44;
    camera.updateProjectionMatrix();
    dpr = Math.min(devicePixelRatio, cfg.dprMax);
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight, false);
  }

  function destruir() {
    cena.traverse((objeto) => {
      objeto.geometry?.dispose?.();
      const materiais = objeto.material ? (Array.isArray(objeto.material) ? objeto.material : [objeto.material]) : [];
      materiais.forEach((material) => {
        Object.values(material).forEach((valor) => valor?.isTexture && valor.dispose());
        material.dispose?.();
      });
    });
    renderer.dispose();
  }

  return { atualizar, redimensionar, destruir };
}