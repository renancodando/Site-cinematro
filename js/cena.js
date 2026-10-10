import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';

const ESCURO = new THREE.Color(0x05090b);
const AMANHECER = new THREE.Color(0xa9856f);
const NEVOA_DIA = new THREE.Color(0x9a8d82);

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function suavizar(inicio, fim, valor) {
  const x = limitar((valor - inicio) / (fim - inicio), 0, 1);
  return x * x * (3 - 2 * x);
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

function texturaAgua() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const contexto = canvas.getContext('2d');
  const imagem = contexto.createImageData(tamanho, tamanho);
  const rand = aleatorio(7814);

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      const i = (y * tamanho + x) * 4;
      const ondaA = Math.sin((x + y * 0.42) * 0.17);
      const ondaB = Math.sin((x * 0.31 - y) * 0.12);
      const ondaC = Math.sin((x * 0.09 + y * 0.23) * 0.35);
      const ruido = (rand() - 0.5) * 0.32;
      const nx = 128 + (ondaA + ondaC + ruido) * 34;
      const ny = 128 + (ondaB - ondaC + ruido) * 34;
      imagem.data[i] = limitar(nx, 0, 255);
      imagem.data[i + 1] = limitar(ny, 0, 255);
      imagem.data[i + 2] = 235;
      imagem.data[i + 3] = 255;
    }
  }

  contexto.putImageData(imagem, 0, 0);
  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.colorSpace = THREE.NoColorSpace;
  return textura;
}

function texturaLua() {
  const tamanho = 512;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(1902);
  const centro = tamanho / 2;
  const raio = tamanho * 0.45;

  ctx.clearRect(0, 0, tamanho, tamanho);
  const brilho = ctx.createRadialGradient(centro * 0.82, centro * 0.75, 8, centro, centro, raio);
  brilho.addColorStop(0, '#fffdf1');
  brilho.addColorStop(0.52, '#e8e3d2');
  brilho.addColorStop(0.86, '#bbb8aa');
  brilho.addColorStop(1, '#716f68');
  ctx.fillStyle = brilho;
  ctx.beginPath();
  ctx.arc(centro, centro, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(centro, centro, raio, 0, Math.PI * 2);
  ctx.clip();

  for (let i = 0; i < 150; i++) {
    const angulo = rand() * Math.PI * 2;
    const distancia = Math.sqrt(rand()) * raio * 0.9;
    const x = centro + Math.cos(angulo) * distancia;
    const y = centro + Math.sin(angulo) * distancia;
    const r = 2 + rand() * 18;
    const opacidade = 0.035 + rand() * 0.09;
    ctx.fillStyle = `rgba(45, 45, 42, ${opacidade})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.62 + rand() * 0.35), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'multiply';
  const sombra = ctx.createLinearGradient(0, 0, tamanho, 0);
  sombra.addColorStop(0, 'rgba(15,18,20,.56)');
  sombra.addColorStop(.3, 'rgba(20,20,20,.1)');
  sombra.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sombra;
  ctx.fillRect(0, 0, tamanho, tamanho);
  ctx.restore();

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function texturaRocha() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(4211);
  ctx.fillStyle = '#242a2b';
  ctx.fillRect(0, 0, tamanho, tamanho);

  for (let i = 0; i < 900; i++) {
    const tom = 25 + Math.floor(rand() * 35);
    const alpha = 0.08 + rand() * 0.2;
    ctx.fillStyle = `rgba(${tom},${tom + 4},${tom + 3},${alpha})`;
    ctx.beginPath();
    ctx.arc(rand() * tamanho, rand() * tamanho, 0.5 + rand() * 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(2.5, 2.5);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function criarEstrelas(quantidade) {
  const rand = aleatorio(93201);
  const posicoes = new Float32Array(quantidade * 3);
  const cores = new Float32Array(quantidade * 3);

  for (let i = 0; i < quantidade; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(0.08 + rand() * 0.9);
    const raio = 900 + rand() * 800;
    posicoes[i * 3] = Math.sin(phi) * Math.cos(theta) * raio;
    posicoes[i * 3 + 1] = Math.cos(phi) * raio + 140;
    posicoes[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * raio;

    const temperatura = rand();
    cores[i * 3] = 0.72 + temperatura * 0.28;
    cores[i * 3 + 1] = 0.79 + temperatura * 0.16;
    cores[i * 3 + 2] = 0.88 + (1 - temperatura) * 0.12;
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3));

  const material = new THREE.PointsMaterial({
    size: 1.55,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometria, material);
}

function criarRochas() {
  const grupo = new THREE.Group();
  const mapa = texturaRocha();
  const material = new THREE.MeshStandardMaterial({
    color: 0x24292a,
    map: mapa,
    roughness: 0.98,
    metalness: 0.01
  });

  const rand = aleatorio(8817);
  const formas = [
    [-28, 3.0, -88, 18, 9, 20],
    [-16, 2.0, -85, 16, 7, 14],
    [-36, 1.0, -78, 12, 5, 10],
    [-20, -1.0, -99, 23, 7, 20],
    [-44, -1.0, -93, 15, 5, 16]
  ];

  formas.forEach(([x, y, z, sx, sy, sz], indice) => {
    const geometria = new THREE.IcosahedronGeometry(1, 2);
    const pos = geometria.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const fator = 0.83 + rand() * 0.34;
      pos.setXYZ(i, pos.getX(i) * fator, pos.getY(i) * fator, pos.getZ(i) * fator);
    }
    geometria.computeVertexNormals();
    const rocha = new THREE.Mesh(geometria, material);
    rocha.position.set(x, y, z);
    rocha.scale.set(sx, sy, sz);
    rocha.rotation.set(rand() * 0.4, rand() * Math.PI, rand() * 0.18);
    rocha.castShadow = indice < 3;
    rocha.receiveShadow = true;
    grupo.add(rocha);
  });

  return grupo;
}

function criarFarol() {
  const grupo = new THREE.Group();
  grupo.position.set(-24, 7, -83);

  const concreto = new THREE.MeshStandardMaterial({
    color: 0xd8d2c5,
    roughness: 0.82,
    metalness: 0.02
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x23282a,
    roughness: 0.46,
    metalness: 0.72
  });
  const vidro = new THREE.MeshPhysicalMaterial({
    color: 0xd7e0df,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.36,
    transparent: true,
    opacity: 0.72,
    thickness: 0.18
  });

  const torre = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 3.7, 21, 48, 5), concreto);
  torre.position.y = 10.5;
  torre.castShadow = true;
  torre.receiveShadow = true;
  grupo.add(torre);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.6, 1.2, 48), metal);
  base.position.y = 0.6;
  base.castShadow = true;
  grupo.add(base);

  const sacada = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.25, 0.42, 48), metal);
  sacada.position.y = 21.3;
  sacada.castShadow = true;
  grupo.add(sacada);

  const lanterna = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 3.6, 32, 1, true), vidro);
  lanterna.position.y = 23.2;
  grupo.add(lanterna);

  const teto = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.7, 40), metal);
  teto.position.y = 25.8;
  teto.castShadow = true;
  grupo.add(teto);

  const grade = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const angulo = (i / 24) * Math.PI * 2;
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 6), metal);
    haste.position.set(Math.cos(angulo) * 2.85, 21.95, Math.sin(angulo) * 2.85);
    grade.add(haste);
  }
  grupo.add(grade);

  const lente = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0xffedc6, emissive: 0xffcf79, emissiveIntensity: 7, roughness: 0.25 })
  );
  lente.position.y = 23.25;
  grupo.add(lente);

  const luz = new THREE.PointLight(0xffd79a, 28, 60, 1.9);
  luz.position.y = 23.25;
  grupo.add(luz);

  const pivoFeixe = new THREE.Group();
  pivoFeixe.position.y = 23.25;
  grupo.add(pivoFeixe);

  const geoFeixe = new THREE.ConeGeometry(7, 92, 48, 1, true);
  geoFeixe.translate(0, -46, 0);
  geoFeixe.rotateX(Math.PI / 2);

  const matFeixe = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uOpacity: { value: 0.11 },
      uColor: { value: new THREE.Color(0xffe8b7) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float borda = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
        float fim = 1.0 - smoothstep(0.18, 1.0, vUv.y);
        float centro = 0.55 + 0.45 * sin(vUv.x * 3.14159265);
        gl_FragColor = vec4(uColor, uOpacity * borda * fim * centro);
      }
    `
  });

  const feixe = new THREE.Mesh(geoFeixe, matFeixe);
  pivoFeixe.add(feixe);

  return { grupo, pivoFeixe, matFeixe, luz, lente };
}

function criarLua() {
  const material = new THREE.SpriteMaterial({
    map: texturaLua(),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    fog: false
  });
  const lua = new THREE.Sprite(material);
  lua.scale.set(38, 38, 1);
  lua.position.set(150, 115, -470);
  return lua;
}

function criarBrilhoSolar() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 5, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,242,208,1)');
  g.addColorStop(.08, 'rgba(255,218,160,.96)');
  g.addColorStop(.35, 'rgba(255,189,132,.18)');
  g.addColorStop(1, 'rgba(255,175,115,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: textura, transparent: true, depthWrite: false, opacity: 0 });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(120, 120, 1);
  return sprite;
}

export function criarCena(canvas) {
  const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const celular = innerWidth < 720;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !celular,
    powerPreference: 'high-performance',
    alpha: false
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio, celular ? 1.35 : 1.8));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.48;
  renderer.shadowMap.enabled = !celular;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  cena.background = ESCURO.clone();
  cena.fog = new THREE.FogExp2(0x071015, celular ? 0.0032 : 0.0025);

  const camera = new THREE.PerspectiveCamera(celular ? 57 : 48, innerWidth / innerHeight, 0.1, 5000);
  camera.position.set(3.5, 4.2, 20);

  const sky = new Sky();
  sky.scale.setScalar(4500);
  cena.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms.turbidity.value = 9;
  skyUniforms.rayleigh.value = 0.65;
  skyUniforms.mieCoefficient.value = 0.005;
  skyUniforms.mieDirectionalG.value = 0.82;

  const sol = new THREE.Vector3();
  skyUniforms.sunPosition.value.copy(sol);

  const normalAgua = texturaAgua();
  const agua = new Water(new THREE.PlaneGeometry(5000, 5000, 1, 1), {
    textureWidth: celular ? 512 : 1024,
    textureHeight: celular ? 512 : 1024,
    waterNormals: normalAgua,
    sunDirection: sol.clone().normalize(),
    sunColor: 0xffd6a0,
    waterColor: 0x071216,
    distortionScale: 2.6,
    fog: true,
    alpha: 1
  });
  agua.rotation.x = -Math.PI / 2;
  agua.position.y = 0;
  cena.add(agua);

  const estrelas = criarEstrelas(celular ? 1700 : 4200);
  cena.add(estrelas);

  const lua = criarLua();
  cena.add(lua);

  const brilhoSolar = criarBrilhoSolar();
  cena.add(brilhoSolar);

  const rochas = criarRochas();
  cena.add(rochas);

  const farol = criarFarol();
  cena.add(farol.grupo);

  const luzHemisferica = new THREE.HemisphereLight(0x8aa0b5, 0x0b1110, 0.26);
  cena.add(luzHemisferica);

  const luzSolar = new THREE.DirectionalLight(0xffd7ac, 0.05);
  luzSolar.position.set(100, 40, -120);
  luzSolar.castShadow = !celular;
  luzSolar.shadow.mapSize.set(celular ? 512 : 1024, celular ? 512 : 1024);
  luzSolar.shadow.camera.left = -80;
  luzSolar.shadow.camera.right = 80;
  luzSolar.shadow.camera.top = 80;
  luzSolar.shadow.camera.bottom = -80;
  cena.add(luzSolar);

  const caminhoCamera = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.5, 4.2, 20),
    new THREE.Vector3(1.0, 4.7, 8),
    new THREE.Vector3(-4.5, 5.8, -9),
    new THREE.Vector3(-9.0, 7.5, -28),
    new THREE.Vector3(-12.0, 9.2, -46)
  ], false, 'catmullrom', 0.7);

  const caminhoAlvo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-18, 5, -86),
    new THREE.Vector3(-20, 8, -85),
    new THREE.Vector3(-23, 12, -84),
    new THREE.Vector3(-28, 6, -120),
    new THREE.Vector3(-38, 4, -170)
  ], false, 'catmullrom', 0.75);

  const relogio = new THREE.Clock();
  const alvoAtual = new THREE.Vector3();
  const posAtual = camera.position.clone();
  let progressoAtual = 0;
  let ultimoSol = -1;
  let quadro = 0;

  function atualizarSol(progresso) {
    const dia = suavizar(0.12, 0.92, progresso);
    const elevacao = THREE.MathUtils.lerp(-7.5, 10.5, dia);
    const azimute = THREE.MathUtils.lerp(212, 198, dia);
    const phi = THREE.MathUtils.degToRad(90 - elevacao);
    const theta = THREE.MathUtils.degToRad(azimute);
    sol.setFromSphericalCoords(1, phi, theta);
    skyUniforms.sunPosition.value.copy(sol);
    agua.material.uniforms.sunDirection.value.copy(sol).normalize();

    const distanciaSol = 1000;
    brilhoSolar.position.copy(sol).multiplyScalar(distanciaSol);
    brilhoSolar.position.y = Math.max(brilhoSolar.position.y, -35);
    brilhoSolar.material.opacity = suavizar(0.18, 0.72, progresso) * (1 - suavizar(0.94, 1, progresso) * 0.22);

    luzSolar.position.copy(sol).multiplyScalar(300);
    luzSolar.intensity = THREE.MathUtils.lerp(0.03, 3.2, suavizar(0.27, 0.96, progresso));
    luzHemisferica.intensity = THREE.MathUtils.lerp(0.2, 1.15, suavizar(0.2, 0.9, progresso));

    skyUniforms.turbidity.value = THREE.MathUtils.lerp(9, 4.2, dia);
    skyUniforms.rayleigh.value = THREE.MathUtils.lerp(0.65, 2.45, dia);
    skyUniforms.mieCoefficient.value = THREE.MathUtils.lerp(0.005, 0.013, suavizar(0.28, 0.72, progresso));
    skyUniforms.mieDirectionalG.value = THREE.MathUtils.lerp(0.82, 0.89, dia);

    const corNevoa = ESCURO.clone().lerp(AMANHECER, suavizar(0.3, 0.7, progresso)).lerp(NEVOA_DIA, suavizar(0.68, 1, progresso));
    cena.fog.color.copy(corNevoa);
    cena.background.copy(corNevoa).multiplyScalar(0.82);
    renderer.toneMappingExposure = THREE.MathUtils.lerp(0.48, 0.96, suavizar(0.15, 0.92, progresso));

    agua.material.uniforms.waterColor.value.set(0x071216).lerp(new THREE.Color(0x163137), suavizar(0.36, 1, progresso) * 0.72);
  }

  function atualizar(progresso, ponteiro = { x: 0, y: 0 }) {
    const delta = Math.min(relogio.getDelta(), 0.05);
    progressoAtual += (limitar(progresso, 0, 1) - progressoAtual) * (reduzMovimento ? 1 : 0.055);
    quadro++;

    agua.material.uniforms.time.value += delta * (reduzMovimento ? 0.24 : 0.78);

    if (Math.abs(progressoAtual - ultimoSol) > 0.0025 || quadro % 16 === 0) {
      atualizarSol(progressoAtual);
      ultimoSol = progressoAtual;
    }

    const estrelasRestantes = 1 - suavizar(0.22, 0.67, progressoAtual);
    estrelas.material.opacity = estrelasRestantes * 0.9;
    lua.material.opacity = (1 - suavizar(0.22, 0.62, progressoAtual)) * 0.9;
    lua.position.y = 115 - progressoAtual * 44;

    farol.pivoFeixe.rotation.y += delta * (reduzMovimento ? 0.08 : 0.22);
    const luzFarol = 1 - suavizar(0.3, 0.78, progressoAtual);
    farol.matFeixe.uniforms.uOpacity.value = 0.115 * luzFarol;
    farol.luz.intensity = 28 * luzFarol;
    farol.lente.material.emissiveIntensity = 1.1 + 6 * luzFarol;

    const pontoCamera = caminhoCamera.getPointAt(progressoAtual);
    const pontoAlvo = caminhoAlvo.getPointAt(progressoAtual);
    const intensidadePonteiro = celular || reduzMovimento ? 0 : 1;
    pontoCamera.x += ponteiro.x * 1.5 * intensidadePonteiro;
    pontoCamera.y += ponteiro.y * 0.58 * intensidadePonteiro;
    pontoAlvo.x += ponteiro.x * 2.2 * intensidadePonteiro;

    posAtual.lerp(pontoCamera, reduzMovimento ? 1 : 0.075);
    alvoAtual.lerp(pontoAlvo, reduzMovimento ? 1 : 0.065);
    camera.position.copy(posAtual);
    camera.lookAt(alvoAtual);

    renderer.render(cena, camera);
  }

  function redimensionar() {
    const mobileAgora = innerWidth < 720;
    camera.aspect = innerWidth / innerHeight;
    camera.fov = mobileAgora ? 57 : 48;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobileAgora ? 1.35 : 1.8));
    renderer.setSize(innerWidth, innerHeight, false);
  }

  function destruir() {
    renderer.dispose();
    normalAgua.dispose();
    estrelas.geometry.dispose();
    estrelas.material.dispose();
    lua.material.map?.dispose();
    lua.material.dispose();
  }

  atualizarSol(0);
  atualizar(0);

  return { atualizar, redimensionar, destruir };
}
