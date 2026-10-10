import * as THREE from 'three';

const NOITE = new THREE.Color(0x071116);
const NEVOA_NOITE = new THREE.Color(0x0b1b22);
const NEVOA_DIA = new THREE.Color(0xa8a096);
const MAR_NOITE = new THREE.Color(0x061a22);
const MAR_DIA = new THREE.Color(0x205a63);
const CEU_NOITE = new THREE.Color(0x07141f);
const CEU_ALTO = new THREE.Color(0x2d5366);
const CEU_DIA = new THREE.Color(0xaac6cf);
const HORIZONTE = new THREE.Color(0xe2ad82);
const PERIODO_ONDA = 9.4;

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

function pulsoCircular(fase, centro, largura) {
  const d = Math.min(Math.abs(fase - centro), 1 - Math.abs(fase - centro));
  return Math.exp(-Math.pow(d / largura, 2));
}

function detectarPerfil() {
  const largura = innerWidth;
  const altura = innerHeight;
  const area = largura * altura;
  const cores = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;
  const toque = matchMedia('(pointer: coarse)').matches;
  let nivel = 2;

  if (toque || area > 2200000 || cores <= 4 || memoria <= 4) nivel = 1;
  if ((toque && (cores <= 4 || memoria <= 3)) || area > 4200000 || cores <= 2) nivel = 0;

  const configuracoes = [
    { segmentos: 68, estrelas: 420, spray: 90, dprMin: 0.78, dprMax: 1.0, fps: 42 },
    { segmentos: 88, estrelas: 720, spray: 145, dprMin: 0.82, dprMax: 1.18, fps: 50 },
    { segmentos: 112, estrelas: 1050, spray: 210, dprMin: 0.9, dprMax: 1.42, fps: 60 }
  ];

  return { nivel, ...configuracoes[nivel] };
}

function criarTexturaRocha() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(4211);

  const base = ctx.createLinearGradient(0, 0, tamanho, tamanho);
  base.addColorStop(0, '#465050');
  base.addColorStop(0.5, '#273031');
  base.addColorStop(1, '#161d1f');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, tamanho, tamanho);

  for (let i = 0; i < 900; i++) {
    const tom = 18 + Math.floor(rand() * 65);
    ctx.fillStyle = `rgba(${tom},${tom + 7},${tom + 8},${0.04 + rand() * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(
      rand() * tamanho,
      rand() * tamanho,
      0.5 + rand() * 4.5,
      0.35 + rand() * 2.8,
      rand() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  for (let i = 0; i < 22; i++) {
    ctx.strokeStyle = `rgba(4,8,9,${0.08 + rand() * 0.16})`;
    ctx.lineWidth = 0.6 + rand() * 1.5;
    ctx.beginPath();
    let x = rand() * tamanho;
    let y = rand() * tamanho;
    ctx.moveTo(x, y);
    for (let p = 0; p < 4; p++) {
      x += (rand() - 0.5) * 46;
      y += 12 + rand() * 38;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(2.4, 2.4);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 2;
  return textura;
}

function criarTexturaConcreto() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(17041);

  ctx.fillStyle = '#d5cec1';
  ctx.fillRect(0, 0, tamanho, tamanho);

  for (let i = 0; i < 1450; i++) {
    const claro = rand() > 0.42;
    const tom = claro ? 205 + Math.floor(rand() * 32) : 110 + Math.floor(rand() * 58);
    ctx.fillStyle = `rgba(${tom},${tom},${Math.max(0, tom - 7)},${0.018 + rand() * 0.048})`;
    const r = 0.35 + rand() * 1.8;
    ctx.fillRect(rand() * tamanho, rand() * tamanho, r, r);
  }

  for (let i = 0; i < 8; i++) {
    const x = rand() * tamanho;
    const g = ctx.createLinearGradient(x, 0, x + 18, 0);
    g.addColorStop(0, 'rgba(52,63,61,0)');
    g.addColorStop(0.5, `rgba(52,63,61,${0.025 + rand() * 0.05})`);
    g.addColorStop(1, 'rgba(52,63,61,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 10, 0, 36, tamanho);
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(1.15, 3.2);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 2;
  return textura;
}

function criarTexturaLua() {
  const tamanho = 256;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(1902);
  const centro = tamanho / 2;
  const raio = tamanho * 0.45;

  const brilho = ctx.createRadialGradient(centro * 0.82, centro * 0.74, 4, centro, centro, raio);
  brilho.addColorStop(0, '#fffbed');
  brilho.addColorStop(0.52, '#e8e4d7');
  brilho.addColorStop(0.87, '#b8b6ad');
  brilho.addColorStop(1, '#70716c');
  ctx.fillStyle = brilho;
  ctx.beginPath();
  ctx.arc(centro, centro, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(centro, centro, raio, 0, Math.PI * 2);
  ctx.clip();

  for (let i = 0; i < 85; i++) {
    const angulo = rand() * Math.PI * 2;
    const distancia = Math.sqrt(rand()) * raio * 0.92;
    const x = centro + Math.cos(angulo) * distancia;
    const y = centro + Math.sin(angulo) * distancia;
    const r = 1.4 + rand() * 10;
    ctx.fillStyle = `rgba(38,40,38,${0.035 + rand() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.6 + rand() * 0.42), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'multiply';
  const sombra = ctx.createLinearGradient(0, 0, tamanho, 0);
  sombra.addColorStop(0, 'rgba(8,14,18,.72)');
  sombra.addColorStop(0.3, 'rgba(12,16,17,.16)');
  sombra.addColorStop(0.68, 'rgba(0,0,0,0)');
  ctx.fillStyle = sombra;
  ctx.fillRect(0, 0, tamanho, tamanho);
  ctx.restore();

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function criarCeu() {
  const geometria = new THREE.SphereGeometry(1250, 28, 14);
  const uniforms = {
    uDawn: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.4, 0.15, -0.9).normalize() },
    uNight: { value: CEU_NOITE.clone() },
    uHigh: { value: CEU_ALTO.clone() },
    uDay: { value: CEU_DIA.clone() },
    uHorizon: { value: HORIZONTE.clone() }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vec4 mundo = modelMatrix * vec4(position, 1.0);
        vDir = normalize(mundo.xyz - cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * mundo;
      }
    `,
    fragmentShader: `
      uniform float uDawn;
      uniform vec3 uSunDir;
      uniform vec3 uNight;
      uniform vec3 uHigh;
      uniform vec3 uDay;
      uniform vec3 uHorizon;
      varying vec3 vDir;

      void main() {
        float altura = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
        float faixa = pow(1.0 - abs(vDir.y), 3.0);
        vec3 noite = mix(uNight, uHigh, smoothstep(0.12, 0.92, altura));
        vec3 dia = mix(uHorizon, uDay, smoothstep(0.04, 0.56, altura));
        vec3 cor = mix(noite, dia, uDawn);
        float sol = pow(max(dot(vDir, uSunDir), 0.0), 680.0);
        float halo = pow(max(dot(vDir, uSunDir), 0.0), 18.0);
        cor += vec3(1.0, 0.59, 0.28) * halo * uDawn * 0.28;
        cor += vec3(1.0, 0.88, 0.66) * sol * uDawn * 2.1;
        cor += vec3(0.17, 0.24, 0.26) * faixa * (1.0 - uDawn) * 0.12;
        gl_FragColor = vec4(cor, 1.0);
      }
    `
  });

  return { mesh: new THREE.Mesh(geometria, material), uniforms };
}

function criarEstrelas(quantidade) {
  const rand = aleatorio(93201);
  const posicoes = new Float32Array(quantidade * 3);
  const cores = new Float32Array(quantidade * 3);

  for (let i = 0; i < quantidade; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(0.08 + rand() * 0.86);
    const raio = 760 + rand() * 260;
    posicoes[i * 3] = Math.sin(phi) * Math.cos(theta) * raio;
    posicoes[i * 3 + 1] = Math.cos(phi) * raio + 88;
    posicoes[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * raio;

    const quente = rand();
    cores[i * 3] = 0.74 + quente * 0.26;
    cores[i * 3 + 1] = 0.8 + quente * 0.16;
    cores[i * 3 + 2] = 0.9 + (1 - quente) * 0.1;
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3));

  const material = new THREE.PointsMaterial({
    size: 1.25,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometria, material);
}

function criarOceano(segmentos) {
  const geometria = new THREE.PlaneGeometry(1180, 1180, segmentos, segmentos);
  geometria.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uDawn: { value: 0 },
    uImpact: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.4, 0.18, -0.9).normalize() },
    uFogColor: { value: NEVOA_NOITE.clone() },
    uSeaNight: { value: MAR_NOITE.clone() },
    uSeaDay: { value: MAR_DIA.clone() },
    uSkyNight: { value: CEU_ALTO.clone() },
    uSkyDay: { value: CEU_DIA.clone() },
    uHorizonDay: { value: HORIZONTE.clone() }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.FrontSide,
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorld;
      varying float vHeight;
      varying float vCrest;

      void onda(inout vec3 p, vec2 direcao, float amplitude, float comprimento, float velocidade, float inclinacao, inout float crista) {
        float k = 6.28318530718 / comprimento;
        vec2 d = normalize(direcao);
        float fase = k * dot(d, p.xz) - uTime * velocidade;
        float s = sin(fase);
        float c = cos(fase);
        p.x += d.x * amplitude * inclinacao * c;
        p.z += d.y * amplitude * inclinacao * c;
        p.y += amplitude * s;
        crista += amplitude * max(s, 0.0);
      }

      void main() {
        vec3 p = position;
        float crista = 0.0;
        onda(p, vec2(1.0, 0.28), 1.02, 34.0, 1.60, 0.74, crista);
        onda(p, vec2(0.58, 1.0), 0.53, 18.0, 2.03, 0.67, crista);
        onda(p, vec2(-0.46, 1.0), 0.24, 9.8, 2.76, 0.58, crista);
        onda(p, vec2(1.0, -0.75), 0.10, 5.4, 3.62, 0.46, crista);

        vec4 mundo = modelMatrix * vec4(p, 1.0);
        vWorld = mundo.xyz;
        vHeight = p.y;
        vCrest = crista;
        gl_Position = projectionMatrix * viewMatrix * mundo;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDawn;
      uniform float uImpact;
      uniform vec3 uSunDir;
      uniform vec3 uFogColor;
      uniform vec3 uSeaNight;
      uniform vec3 uSeaDay;
      uniform vec3 uSkyNight;
      uniform vec3 uSkyDay;
      uniform vec3 uHorizonDay;
      varying vec3 vWorld;
      varying float vHeight;
      varying float vCrest;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 dx = dFdx(vWorld);
        vec3 dy = dFdy(vWorld);
        vec3 normal = normalize(cross(dx, dy));
        if (normal.y < 0.0) normal *= -1.0;

        float micA = sin(vWorld.x * 0.82 + vWorld.z * 0.41 + uTime * 2.4);
        float micB = sin(vWorld.x * -0.37 + vWorld.z * 1.12 - uTime * 2.9);
        float micC = sin(vWorld.x * 1.73 - vWorld.z * 0.31 + uTime * 3.7);
        normal.xz += vec2(micA + micC * 0.45, micB - micC * 0.38) * 0.035;
        normal = normalize(normal);

        vec3 viewDir = normalize(cameraPosition - vWorld);
        float ndv = max(dot(normal, viewDir), 0.0);
        float fresnel = 0.025 + 0.975 * pow(1.0 - ndv, 4.8);

        vec3 mar = mix(uSeaNight, uSeaDay, uDawn);
        float profundidade = clamp(0.42 + vHeight * 0.11, 0.18, 0.78);
        mar *= profundidade + 0.58;

        float horizonte = pow(1.0 - max(normal.y, 0.0), 1.7);
        vec3 ceu = mix(uSkyNight, uSkyDay, uDawn);
        ceu = mix(ceu, uHorizonDay, uDawn * horizonte * 0.72);
        vec3 cor = mix(mar, ceu, fresnel * 0.86);

        vec3 refletido = reflect(-uSunDir, normal);
        float alinhamento = max(dot(refletido, viewDir), 0.0);
        float brilhoFino = pow(alinhamento, mix(170.0, 310.0, uDawn));
        float brilhoLargo = pow(alinhamento, 22.0);
        cor += vec3(1.0, 0.76, 0.5) * brilhoFino * (0.45 + uDawn * 4.2);
        cor += vec3(0.55, 0.68, 0.72) * brilhoLargo * 0.08;

        float ruido = hash21(floor(vWorld.xz * 0.44 + uTime * 0.22));
        float branca = smoothstep(1.00 + ruido * 0.22, 1.55, vCrest);
        branca *= smoothstep(0.08, 0.92, vHeight + 0.45);

        float costa = 1.0 - smoothstep(-112.0, -58.0, vWorld.z);
        float banda = sin(vWorld.z * 0.36 + vWorld.x * 0.085 + uTime * 0.67);
        float quebra = smoothstep(0.12, 0.84, banda * 0.5 + 0.5);
        quebra *= costa * (0.16 + uImpact * 0.84);
        quebra *= 0.62 + hash21(floor(vWorld.xz * 0.19)) * 0.38;

        float espumaTotal = clamp(branca * 0.78 + quebra * 0.88, 0.0, 0.92);
        vec3 espuma = mix(vec3(0.72, 0.82, 0.84), vec3(0.94, 0.96, 0.93), uDawn);
        cor = mix(cor, espuma, espumaTotal);

        float distancia = length(cameraPosition - vWorld);
        float nevoa = smoothstep(220.0, 860.0, distancia);
        cor = mix(cor, uFogColor, nevoa * 0.84);

        gl_FragColor = vec4(cor, 1.0);
      }
    `
  });

  const oceano = new THREE.Mesh(geometria, material);
  oceano.frustumCulled = false;
  return { oceano, uniforms };
}

function criarRochas() {
  const textura = criarTexturaRocha();
  const material = new THREE.MeshStandardMaterial({
    color: 0x2b3334,
    map: textura,
    roughness: 0.78,
    metalness: 0.02
  });

  const geometria = new THREE.IcosahedronGeometry(1, 2);
  const instancias = [
    [-27, 2.8, -96, 17, 8.8, 18, 0.28, 0.3, 0.05],
    [-12, 1.7, -90, 12, 6.5, 13, -0.12, 1.1, -0.08],
    [-39, 0.7, -88, 11, 5.2, 10, 0.11, 2.1, 0.04],
    [-20, -0.7, -108, 22, 7.2, 20, -0.08, 0.7, 0.03],
    [-48, -0.9, -102, 16, 5.6, 17, 0.06, 2.8, -0.05],
    [-3, -1.2, -103, 10, 4.3, 11, -0.15, 1.8, 0.02]
  ];

  const malha = new THREE.InstancedMesh(geometria, material, instancias.length);
  const dummy = new THREE.Object3D();

  instancias.forEach(([x, y, z, sx, sy, sz, rx, ry, rz], i) => {
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(rx, ry, rz);
    dummy.updateMatrix();
    malha.setMatrixAt(i, dummy.matrix);
  });

  malha.instanceMatrix.needsUpdate = true;
  return malha;
}

function criarSombraCosta() {
  const grupo = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: 0x020506,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  });

  const dados = [
    [-22, -96, 38, 23, 0.15],
    [-44, -99, 28, 18, -0.2],
    [-6, -94, 25, 16, 0.08]
  ];

  for (const [x, z, sx, sz, rot] of dados) {
    const sombra = new THREE.Mesh(new THREE.CircleGeometry(1, 32), material);
    sombra.rotation.x = -Math.PI / 2;
    sombra.rotation.z = rot;
    sombra.position.set(x, 0.08, z);
    sombra.scale.set(sx, sz, 1);
    grupo.add(sombra);
  }

  return grupo;
}

function criarFarol() {
  const grupo = new THREE.Group();
  grupo.position.set(-27, 7.5, -97);

  const concreto = new THREE.MeshStandardMaterial({
    color: 0xd4cdc0,
    map: criarTexturaConcreto(),
    roughness: 0.9,
    metalness: 0.01
  });
  const metal = new THREE.MeshStandardMaterial({ color: 0x20282b, roughness: 0.48, metalness: 0.7 });
  const vermelho = new THREE.MeshStandardMaterial({ color: 0x7b2b28, roughness: 0.66, metalness: 0.12 });
  const vidro = new THREE.MeshBasicMaterial({
    color: 0x9fb9be,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const torre = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 3.85, 22.5, 32, 4), concreto);
  torre.position.y = 11.25;
  grupo.add(torre);

  const faixa = new THREE.Mesh(new THREE.CylinderGeometry(2.66, 2.94, 4.15, 32), vermelho);
  faixa.position.y = 15.2;
  grupo.add(faixa);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 1.3, 32), metal);
  base.position.y = 0.65;
  grupo.add(base);

  const porta = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 2.45), metal);
  porta.position.set(0, 2.1, 3.49);
  grupo.add(porta);

  const janelaGeo = new THREE.PlaneGeometry(0.7, 1.05);
  const janelaMat = new THREE.MeshStandardMaterial({
    color: 0x22363e,
    emissive: 0x0a171e,
    emissiveIntensity: 0.34,
    roughness: 0.22
  });
  const janelas = new THREE.InstancedMesh(janelaGeo, janelaMat, 3);
  const alturas = [7.2, 11.3, 18.4];
  const dummy = new THREE.Object3D();
  alturas.forEach((y, i) => {
    dummy.position.set(0, y, 2.86 - (y / 22) * 0.75);
    dummy.updateMatrix();
    janelas.setMatrixAt(i, dummy.matrix);
  });
  janelas.instanceMatrix.needsUpdate = true;
  grupo.add(janelas);

  const sacada = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 0.46, 36), metal);
  sacada.position.y = 22.8;
  grupo.add(sacada);

  const lanterna = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 3.8, 24, 1, true), vidro);
  lanterna.position.y = 24.75;
  grupo.add(lanterna);

  const teto = new THREE.Mesh(new THREE.ConeGeometry(2.92, 1.82, 32), vermelho);
  teto.position.y = 27.55;
  grupo.add(teto);

  const aroBaixo = new THREE.Mesh(new THREE.TorusGeometry(2.94, 0.035, 4, 32), metal);
  aroBaixo.rotation.x = Math.PI / 2;
  aroBaixo.position.y = 23.25;
  grupo.add(aroBaixo);

  const aroAlto = aroBaixo.clone();
  aroAlto.position.y = 24.15;
  grupo.add(aroAlto);

  const hasteGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.92, 4);
  const hastes = new THREE.InstancedMesh(hasteGeo, metal, 16);
  for (let i = 0; i < 16; i++) {
    const angulo = (i / 16) * Math.PI * 2;
    dummy.position.set(Math.cos(angulo) * 2.94, 23.7, Math.sin(angulo) * 2.94);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    hastes.setMatrixAt(i, dummy.matrix);
  }
  hastes.instanceMatrix.needsUpdate = true;
  grupo.add(hastes);

  const lenteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffefc8,
    emissive: 0xffc96c,
    emissiveIntensity: 7.5,
    roughness: 0.16
  });
  const lente = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 10), lenteMaterial);
  lente.position.y = 24.78;
  grupo.add(lente);

  const luz = new THREE.PointLight(0xffd89a, 30, 70, 1.9);
  luz.position.y = 24.78;
  grupo.add(luz);

  const pivoFeixe = new THREE.Group();
  pivoFeixe.position.y = 24.78;
  grupo.add(pivoFeixe);

  const feixeGeo = new THREE.ConeGeometry(8.2, 112, 28, 1, true);
  feixeGeo.translate(0, -56, 0);
  feixeGeo.rotateX(Math.PI / 2);

  const feixeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uOpacity: { value: 0.15 },
      uColor: { value: new THREE.Color(0xffe7b0) }
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
        float borda = smoothstep(0.0, 0.17, vUv.x) * smoothstep(1.0, 0.83, vUv.x);
        float alcance = 1.0 - smoothstep(0.18, 1.0, vUv.y);
        float pulso = 0.86 + 0.14 * sin(vUv.y * 19.0);
        gl_FragColor = vec4(uColor, uOpacity * borda * alcance * pulso);
      }
    `
  });

  pivoFeixe.add(new THREE.Mesh(feixeGeo, feixeMaterial));

  return { grupo, pivoFeixe, feixeMaterial, luz, lenteMaterial };
}

function criarSpray(quantidade) {
  const rand = aleatorio(7771);
  const posicoes = new Float32Array(quantidade * 3);
  const sementes = new Float32Array(quantidade);
  const direcoes = new Float32Array(quantidade * 2);
  const regioes = [
    [-27, 1.2, -91],
    [-16, 1.0, -89],
    [-38, 1.0, -89],
    [-20, 1.0, -102]
  ];

  for (let i = 0; i < quantidade; i++) {
    const r = regioes[Math.floor(rand() * regioes.length)];
    posicoes[i * 3] = r[0] + (rand() - 0.5) * 12;
    posicoes[i * 3 + 1] = r[1] + rand() * 1.2;
    posicoes[i * 3 + 2] = r[2] + (rand() - 0.5) * 10;
    sementes[i] = rand();
    const angulo = rand() * Math.PI * 2;
    direcoes[i * 2] = Math.cos(angulo) * (0.35 + rand() * 0.8);
    direcoes[i * 2 + 1] = Math.sin(angulo) * (0.35 + rand() * 0.8);
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute('aSeed', new THREE.BufferAttribute(sementes, 1));
  geometria.setAttribute('aDir', new THREE.BufferAttribute(direcoes, 2));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uDawn: { value: 0 },
      uImpact: { value: 0 },
      uPixelRatio: { value: 1 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uDawn;
      uniform float uImpact;
      uniform float uPixelRatio;
      attribute float aSeed;
      attribute vec2 aDir;
      varying float vAlpha;
      varying float vDawn;

      void main() {
        float ciclo = fract((uTime / 9.4) + aSeed * 0.065);
        float nascimento = smoothstep(0.0, 0.045, ciclo);
        float morte = 1.0 - smoothstep(0.17, 0.38, ciclo);
        float vida = nascimento * morte * uImpact;
        float t = clamp(ciclo / 0.38, 0.0, 1.0);

        vec3 p = position;
        p.x += aDir.x * t * 3.8;
        p.z += aDir.y * t * 3.8;
        p.y += sin(t * 3.14159265) * (2.2 + aSeed * 3.9);
        p.y -= t * t * 1.2;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.5 + aSeed * 2.2) * uPixelRatio * (145.0 / max(30.0, -mv.z));
        gl_PointSize = clamp(gl_PointSize, 1.0, 4.8);
        vAlpha = vida * (0.18 + aSeed * 0.48);
        vDawn = uDawn;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vDawn;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float d = dot(p, p);
        if (d > 0.25) discard;
        float a = smoothstep(0.25, 0.025, d) * vAlpha;
        vec3 cor = mix(vec3(0.70, 0.80, 0.82), vec3(0.96, 0.97, 0.94), vDawn);
        gl_FragColor = vec4(cor, a);
      }
    `
  });

  return { pontos: new THREE.Points(geometria, material), material };
}

function criarLua() {
  const material = new THREE.SpriteMaterial({
    map: criarTexturaLua(),
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    fog: false
  });
  const lua = new THREE.Sprite(material);
  lua.scale.set(38, 38, 1);
  lua.position.set(150, 116, -470);
  return lua;
}

function criarSol() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 1, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,248,226,1)');
  g.addColorStop(0.08, 'rgba(255,222,164,.96)');
  g.addColorStop(0.32, 'rgba(255,171,102,.32)');
  g.addColorStop(1, 'rgba(255,140,90,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: textura,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(92, 92, 1);
  return sprite;
}

export function criarCena(canvas) {
  const perfil = detectarPerfil();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: perfil.nivel > 0,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.shadowMap.enabled = false;

  let dprAtual = Math.min(devicePixelRatio || 1, perfil.dprMax);
  renderer.setPixelRatio(dprAtual);
  renderer.setSize(innerWidth, innerHeight, false);

  const cena = new THREE.Scene();
  cena.background = NOITE.clone();
  cena.fog = new THREE.FogExp2(NEVOA_NOITE.clone(), 0.00145);

  const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.1, 1800);
  camera.position.set(38, 16, 66);

  const ceu = criarCeu();
  cena.add(ceu.mesh);

  const estrelas = criarEstrelas(perfil.estrelas);
  cena.add(estrelas);

  const lua = criarLua();
  cena.add(lua);

  const sol = criarSol();
  cena.add(sol);

  const oceano = criarOceano(perfil.segmentos);
  cena.add(oceano.oceano);

  const rochas = criarRochas();
  cena.add(rochas);
  cena.add(criarSombraCosta());

  const farol = criarFarol();
  cena.add(farol.grupo);

  const spray = criarSpray(perfil.spray);
  cena.add(spray.pontos);

  const hemisferio = new THREE.HemisphereLight(0x7994a5, 0x0a1113, 0.66);
  cena.add(hemisferio);

  const direcional = new THREE.DirectionalLight(0xb8d1dd, 1.0);
  direcional.position.set(90, 120, 60);
  cena.add(direcional);

  const vetorSol = new THREE.Vector3();
  const alvoAtual = new THREE.Vector3(-21, 8, -94);
  const posicaoCamera = camera.position.clone();
  const alvoDesejado = new THREE.Vector3();
  const cameraDesejada = new THREE.Vector3();
  const corHemisferioDia = new THREE.Color(0xcbdde0);
  const corChaoDia = new THREE.Color(0x514c45);
  const corHemisferioNoite = new THREE.Color(0x7994a5);
  const corChaoNoite = new THREE.Color(0x0a1113);
  const corDirecionalNoite = new THREE.Color(0xb8d1dd);
  const corDirecionalDia = new THREE.Color(0xffd0a3);

  let tempoAcumulado = 0;
  let ultimoTempo = performance.now() * 0.001;
  let ultimoRender = 0;
  let acumuladorFrame = 0;
  let amostrasFrame = 0;
  let ultimaAdaptacao = 0;

  const keyframes = [
    { p: 0.00, c: [38, 16, 66], a: [-20, 8, -94] },
    { p: 0.23, c: [27, 12, 34], a: [-20, 7, -96] },
    { p: 0.48, c: [11, 8, 4], a: [-18, 5, -93] },
    { p: 0.73, c: [-1, 14, -20], a: [-27, 17, -98] },
    { p: 1.00, c: [22, 22, 12], a: [-18, 6, -112] }
  ];

  function amostrarCamera(progresso) {
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
    cameraDesejada.set(
      interpolar(a.c[0], b.c[0], t),
      interpolar(a.c[1], b.c[1], t),
      interpolar(a.c[2], b.c[2], t)
    );
    alvoDesejado.set(
      interpolar(a.a[0], b.a[0], t),
      interpolar(a.a[1], b.a[1], t),
      interpolar(a.a[2], b.a[2], t)
    );
  }

  function adaptarResolucao(agora) {
    if (agora - ultimaAdaptacao < 1.6 || amostrasFrame < 30) return;

    const medio = acumuladorFrame / amostrasFrame;
    const alvo = 1000 / perfil.fps;

    if (medio > alvo * 1.18 && dprAtual > perfil.dprMin + 0.02) {
      dprAtual = Math.max(perfil.dprMin, dprAtual - 0.08);
      renderer.setPixelRatio(dprAtual);
      renderer.setSize(innerWidth, innerHeight, false);
    } else if (medio < alvo * 0.82 && dprAtual < perfil.dprMax - 0.02) {
      dprAtual = Math.min(perfil.dprMax, dprAtual + 0.04);
      renderer.setPixelRatio(dprAtual);
      renderer.setSize(innerWidth, innerHeight, false);
    }

    acumuladorFrame = 0;
    amostrasFrame = 0;
    ultimaAdaptacao = agora;
  }

  function atualizar(progresso, ponteiro) {
    const agora = performance.now() * 0.001;
    const delta = limitar(agora - ultimoTempo, 0, 0.05);
    ultimoTempo = agora;
    tempoAcumulado += delta;

    const tempo = tempoAcumulado;
    const amanhecer = suavizar(0.32, 0.92, progresso);
    const luzManha = suavizar(0.5, 1.0, progresso);
    const fasePrincipal = (tempo % PERIODO_ONDA) / PERIODO_ONDA;
    const faseSecundaria = ((tempo + 1.8) % 5.2) / 5.2;
    const impactoPrincipal = pulsoCircular(fasePrincipal, 0.08, 0.03);
    const impactoSecundario = pulsoCircular(faseSecundaria, 0.06, 0.04) * 0.5;
    const impacto = Math.max(impactoPrincipal, impactoSecundario);
    const espuma = Math.max(
      pulsoCircular(fasePrincipal, 0.17, 0.14),
      pulsoCircular(faseSecundaria, 0.17, 0.16) * 0.54
    );

    const elevacao = THREE.MathUtils.degToRad(interpolar(-7.5, 7.8, amanhecer));
    const azimute = THREE.MathUtils.degToRad(118);
    vetorSol.set(
      Math.cos(elevacao) * Math.sin(azimute),
      Math.sin(elevacao),
      Math.cos(elevacao) * Math.cos(azimute)
    ).normalize();

    oceano.uniforms.uTime.value = tempo;
    oceano.uniforms.uDawn.value = amanhecer;
    oceano.uniforms.uImpact.value = impacto;
    oceano.uniforms.uSunDir.value.copy(vetorSol);
    oceano.uniforms.uFogColor.value.copy(NEVOA_NOITE).lerp(NEVOA_DIA, amanhecer);

    ceu.uniforms.uDawn.value = amanhecer;
    ceu.uniforms.uSunDir.value.copy(vetorSol);

    spray.material.uniforms.uTime.value = tempo;
    spray.material.uniforms.uDawn.value = amanhecer;
    spray.material.uniforms.uImpact.value = impacto;

    sol.position.copy(vetorSol).multiplyScalar(680);
    sol.material.opacity = luzManha * 0.88;
    lua.material.opacity = limitar(0.92 - amanhecer * 1.16, 0, 0.92);
    estrelas.material.opacity = limitar(0.9 - amanhecer * 1.38, 0, 0.9);

    direcional.position.copy(vetorSol).multiplyScalar(140);
    direcional.color.copy(corDirecionalNoite).lerp(corDirecionalDia, amanhecer);
    direcional.intensity = interpolar(1.0, 2.5, luzManha);
    hemisferio.intensity = interpolar(0.66, 1.5, amanhecer);
    hemisferio.color.copy(corHemisferioNoite).lerp(corHemisferioDia, amanhecer);
    hemisferio.groundColor.copy(corChaoNoite).lerp(corChaoDia, amanhecer);

    cena.fog.color.copy(NEVOA_NOITE).lerp(NEVOA_DIA, amanhecer);
    cena.fog.density = interpolar(0.00145, 0.00078, amanhecer);
    renderer.toneMappingExposure = interpolar(1.24, 1.5, amanhecer);

    farol.pivoFeixe.rotation.y = tempo * 0.34;
    farol.feixeMaterial.uniforms.uOpacity.value = interpolar(0.16, 0.012, suavizar(0.54, 0.95, progresso));
    farol.luz.intensity = interpolar(30, 3, suavizar(0.56, 1, progresso));
    farol.lenteMaterial.emissiveIntensity = interpolar(7.5, 1.0, suavizar(0.56, 1, progresso));

    amostrarCamera(progresso);
    cameraDesejada.x += ponteiro.x * 2.3;
    cameraDesejada.y += ponteiro.y * 1.05;
    alvoDesejado.x += ponteiro.x * 1.25;
    alvoDesejado.y += ponteiro.y * 0.58;

    posicaoCamera.lerp(cameraDesejada, 0.05);
    alvoAtual.lerp(alvoDesejado, 0.055);
    camera.position.copy(posicaoCamera);
    camera.lookAt(alvoAtual);

    const intervalo = 1 / perfil.fps;
    const deveRenderizar = agora - ultimoRender >= intervalo;

    if (deveRenderizar) {
      const inicio = performance.now();
      renderer.render(cena, camera);
      const custo = performance.now() - inicio;
      acumuladorFrame += custo;
      amostrasFrame++;
      ultimoRender = agora;
      adaptarResolucao(agora);
    }

    return {
      impacto,
      espuma,
      vento: 0.4 + Math.sin(tempo * 0.21) * 0.08,
      fase: fasePrincipal,
      qualidade: perfil.nivel,
      dpr: dprAtual
    };
  }

  function redimensionar() {
    const largura = innerWidth;
    const altura = innerHeight;
    camera.aspect = largura / altura;
    camera.fov = largura < 600 ? 50 : largura > 1800 ? 40 : 43;
    camera.updateProjectionMatrix();

    dprAtual = limitar(dprAtual, perfil.dprMin, Math.min(devicePixelRatio || 1, perfil.dprMax));
    renderer.setPixelRatio(dprAtual);
    renderer.setSize(largura, altura, false);
    spray.material.uniforms.uPixelRatio.value = dprAtual;
  }

  spray.material.uniforms.uPixelRatio.value = dprAtual;

  function destruir() {
    cena.traverse((objeto) => {
      objeto.geometry?.dispose();
      if (!objeto.material) return;
      const materiais = Array.isArray(objeto.material) ? objeto.material : [objeto.material];

      materiais.forEach((material) => {
        for (const chave of ['map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) {
          material[chave]?.dispose?.();
        }
        material.dispose();
      });
    });
    renderer.dispose();
  }

  return { atualizar, redimensionar, destruir };
}
