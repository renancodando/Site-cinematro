import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

const NOITE = new THREE.Color(0x071014);
const NEVOA_NOITE = new THREE.Color(0x0d1d25);
const NEVOA_DIA = new THREE.Color(0xa69a8d);
const CEU_NOITE = new THREE.Color(0x102735);
const CEU_DIA = new THREE.Color(0xb7cad1);
const HORIZONTE_DIA = new THREE.Color(0xd8a77f);
const MAR_NOITE = new THREE.Color(0x071c24);
const MAR_DIA = new THREE.Color(0x1f5862);
const PERIODO_ONDA = 9.4;

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function suavizar(inicio, fim, valor) {
  const x = limitar((valor - inicio) / (fim - inicio));
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

function texturaRocha() {
  const tamanho = 512;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(4211);

  const base = ctx.createLinearGradient(0, 0, tamanho, tamanho);
  base.addColorStop(0, '#3b4241');
  base.addColorStop(0.5, '#252c2d');
  base.addColorStop(1, '#171d1f');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, tamanho, tamanho);

  for (let i = 0; i < 2600; i++) {
    const tom = 18 + Math.floor(rand() * 55);
    const alpha = 0.045 + rand() * 0.19;
    ctx.fillStyle = `rgba(${tom},${tom + 6},${tom + 7},${alpha})`;
    ctx.beginPath();
    ctx.ellipse(
      rand() * tamanho,
      rand() * tamanho,
      0.6 + rand() * 7,
      0.4 + rand() * 3.5,
      rand() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  for (let i = 0; i < 55; i++) {
    ctx.strokeStyle = `rgba(6,10,11,${0.08 + rand() * 0.2})`;
    ctx.lineWidth = 0.6 + rand() * 2.2;
    ctx.beginPath();
    let x = rand() * tamanho;
    let y = rand() * tamanho;
    ctx.moveTo(x, y);
    for (let p = 0; p < 5; p++) {
      x += (rand() - 0.5) * 80;
      y += 20 + rand() * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(2.8, 2.8);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  return textura;
}

function texturaConcreto() {
  const tamanho = 512;
  const canvas = document.createElement('canvas');
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  const rand = aleatorio(17041);

  ctx.fillStyle = '#d7d0c3';
  ctx.fillRect(0, 0, tamanho, tamanho);

  for (let i = 0; i < 5800; i++) {
    const claro = rand() > 0.45;
    const tom = claro ? 210 + Math.floor(rand() * 30) : 115 + Math.floor(rand() * 55);
    ctx.fillStyle = `rgba(${tom},${tom},${Math.max(0, tom - 5)},${0.018 + rand() * 0.055})`;
    const r = 0.3 + rand() * 2.5;
    ctx.fillRect(rand() * tamanho, rand() * tamanho, r, r);
  }

  for (let i = 0; i < 18; i++) {
    const y = rand() * tamanho;
    const g = ctx.createLinearGradient(0, y - 8, 0, y + 35);
    g.addColorStop(0, 'rgba(65,72,70,0)');
    g.addColorStop(0.4, `rgba(65,72,70,${0.025 + rand() * 0.05})`);
    g.addColorStop(1, 'rgba(65,72,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 8, tamanho, 43);
  }

  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(1.25, 3.8);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
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

  const brilho = ctx.createRadialGradient(centro * 0.82, centro * 0.74, 8, centro, centro, raio);
  brilho.addColorStop(0, '#fffbed');
  brilho.addColorStop(0.5, '#e9e5d8');
  brilho.addColorStop(0.86, '#bcb9ae');
  brilho.addColorStop(1, '#6f716d');
  ctx.fillStyle = brilho;
  ctx.beginPath();
  ctx.arc(centro, centro, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(centro, centro, raio, 0, Math.PI * 2);
  ctx.clip();

  for (let i = 0; i < 175; i++) {
    const angulo = rand() * Math.PI * 2;
    const distancia = Math.sqrt(rand()) * raio * 0.92;
    const x = centro + Math.cos(angulo) * distancia;
    const y = centro + Math.sin(angulo) * distancia;
    const r = 2 + rand() * 19;
    ctx.fillStyle = `rgba(42,43,40,${0.035 + rand() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.62 + rand() * 0.4), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'multiply';
  const sombra = ctx.createLinearGradient(0, 0, tamanho, 0);
  sombra.addColorStop(0, 'rgba(8,14,18,.72)');
  sombra.addColorStop(0.26, 'rgba(12,16,17,.18)');
  sombra.addColorStop(0.64, 'rgba(0,0,0,0)');
  ctx.fillStyle = sombra;
  ctx.fillRect(0, 0, tamanho, tamanho);
  ctx.restore();

  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  return textura;
}

function criarEstrelas(quantidade) {
  const rand = aleatorio(93201);
  const posicoes = new Float32Array(quantidade * 3);
  const cores = new Float32Array(quantidade * 3);

  for (let i = 0; i < quantidade; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(0.04 + rand() * 0.88);
    const raio = 850 + rand() * 950;
    posicoes[i * 3] = Math.sin(phi) * Math.cos(theta) * raio;
    posicoes[i * 3 + 1] = Math.cos(phi) * raio + 95;
    posicoes[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * raio;

    const temperatura = rand();
    cores[i * 3] = 0.73 + temperatura * 0.27;
    cores[i * 3 + 1] = 0.78 + temperatura * 0.2;
    cores[i * 3 + 2] = 0.88 + (1 - temperatura) * 0.12;
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute('color', new THREE.BufferAttribute(cores, 3));

  const material = new THREE.PointsMaterial({
    size: 1.45,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometria, material);
}

function criarOceano() {
  const segmentos = innerWidth < 720 ? 132 : innerWidth < 1400 ? 188 : 228;
  const geometria = new THREE.PlaneGeometry(1500, 1500, segmentos, segmentos);
  geometria.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uDawn: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0.4, 0.25, -0.8).normalize() },
    uFogColor: { value: NEVOA_NOITE.clone() },
    uSeaNight: { value: MAR_NOITE.clone() },
    uSeaDay: { value: MAR_DIA.clone() },
    uSkyNight: { value: CEU_NOITE.clone() },
    uSkyDay: { value: CEU_DIA.clone() },
    uHorizonDay: { value: HORIZONTE_DIA.clone() }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: false,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorldPosition;
      varying float vHeight;
      varying float vCrest;

      void onda(inout vec3 p, vec2 direcao, float amplitude, float comprimento, float velocidade, inout float crista) {
        float k = 6.28318530718 / comprimento;
        vec2 d = normalize(direcao);
        float fase = k * dot(d, p.xz) - uTime * velocidade;
        float c = cos(fase);
        float s = sin(fase);
        float inclinacao = 0.78;
        p.x += d.x * amplitude * inclinacao * c;
        p.z += d.y * amplitude * inclinacao * c;
        p.y += amplitude * s;
        crista += amplitude * (s * 0.5 + 0.5);
      }

      void main() {
        vec3 p = position;
        float crista = 0.0;
        onda(p, vec2(1.0, 0.30), 1.12, 34.0, 1.62, crista);
        onda(p, vec2(0.62, 1.0), 0.58, 18.0, 2.08, crista);
        onda(p, vec2(-0.42, 1.0), 0.27, 9.5, 2.74, crista);
        onda(p, vec2(1.0, -0.72), 0.13, 5.2, 3.62, crista);

        vec4 mundo = modelMatrix * vec4(p, 1.0);
        vWorldPosition = mundo.xyz;
        vHeight = p.y;
        vCrest = crista;
        gl_Position = projectionMatrix * viewMatrix * mundo;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDawn;
      uniform vec3 uSunDir;
      uniform vec3 uFogColor;
      uniform vec3 uSeaNight;
      uniform vec3 uSeaDay;
      uniform vec3 uSkyNight;
      uniform vec3 uSkyDay;
      uniform vec3 uHorizonDay;
      varying vec3 vWorldPosition;
      varying float vHeight;
      varying float vCrest;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 dx = dFdx(vWorldPosition);
        vec3 dy = dFdy(vWorldPosition);
        vec3 normal = normalize(cross(dx, dy));
        if (normal.y < 0.0) normal *= -1.0;

        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.6);

        vec3 mar = mix(uSeaNight, uSeaDay, uDawn);
        mar += vec3(0.0, 0.018, 0.022) * vHeight;

        float horizonte = pow(1.0 - max(normal.y, 0.0), 1.8);
        vec3 ceu = mix(uSkyNight, uSkyDay, uDawn);
        ceu = mix(ceu, uHorizonDay, uDawn * horizonte * 0.7);

        vec3 refletido = mix(mar, ceu, 0.28 + fresnel * 0.72);

        vec3 r = reflect(-uSunDir, normal);
        float especular = pow(max(dot(r, viewDir), 0.0), mix(150.0, 310.0, uDawn));
        float brilhoLargo = pow(max(dot(r, viewDir), 0.0), 24.0);
        vec3 brilho = vec3(1.0, 0.74, 0.48) * especular * (0.7 + 4.2 * uDawn);
        brilho += vec3(0.55, 0.68, 0.72) * brilhoLargo * 0.11;

        float ruido = hash21(floor(vWorldPosition.xz * 0.58 + uTime * 0.35));
        float espumaCrista = smoothstep(1.23 + ruido * 0.26, 1.84, vCrest);
        espumaCrista *= smoothstep(0.14, 0.78, vHeight + 0.55);
        vec3 espuma = mix(vec3(0.74, 0.84, 0.85), vec3(0.91, 0.94, 0.92), uDawn);

        vec3 cor = mix(refletido + brilho, espuma, espumaCrista * 0.82);
        float distancia = length(cameraPosition - vWorldPosition);
        float nevoa = smoothstep(260.0, 920.0, distancia);
        cor = mix(cor, uFogColor, nevoa * 0.88);

        gl_FragColor = vec4(cor, 1.0);
      }
    `
  });

  const oceano = new THREE.Mesh(geometria, material);
  oceano.position.y = 0;
  oceano.frustumCulled = false;
  return { oceano, material, uniforms };
}

function criarRochas() {
  const grupo = new THREE.Group();
  const mapa = texturaRocha();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x2b3232,
    map: mapa,
    roughness: 0.72,
    metalness: 0.0,
    clearcoat: 0.28,
    clearcoatRoughness: 0.62
  });

  const rand = aleatorio(8817);
  const formas = [
    [-27, 2.8, -96, 17, 8.8, 18],
    [-12, 1.7, -90, 12, 6.5, 13],
    [-39, 0.7, -88, 11, 5.2, 10],
    [-20, -0.7, -108, 22, 7.2, 20],
    [-48, -0.9, -102, 16, 5.6, 17],
    [-3, -1.2, -103, 10, 4.3, 11]
  ];

  formas.forEach(([x, y, z, sx, sy, sz], indice) => {
    const geometria = new THREE.IcosahedronGeometry(1, 3);
    const pos = geometria.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const fator = 0.82 + rand() * 0.36;
      pos.setXYZ(i, pos.getX(i) * fator, pos.getY(i) * fator, pos.getZ(i) * fator);
    }
    geometria.computeVertexNormals();
    const rocha = new THREE.Mesh(geometria, material);
    rocha.position.set(x, y, z);
    rocha.scale.set(sx, sy, sz);
    rocha.rotation.set((rand() - 0.5) * 0.32, rand() * Math.PI, (rand() - 0.5) * 0.2);
    rocha.castShadow = indice < 4;
    rocha.receiveShadow = true;
    grupo.add(rocha);
  });

  return grupo;
}

function criarFarol() {
  const grupo = new THREE.Group();
  grupo.position.set(-27, 7.5, -97);

  const concreto = new THREE.MeshPhysicalMaterial({
    color: 0xd6d0c5,
    map: texturaConcreto(),
    roughness: 0.88,
    metalness: 0,
    clearcoat: 0.05
  });

  const metal = new THREE.MeshStandardMaterial({
    color: 0x20282b,
    roughness: 0.42,
    metalness: 0.78
  });

  const metalVermelho = new THREE.MeshStandardMaterial({
    color: 0x7e2927,
    roughness: 0.62,
    metalness: 0.18
  });

  const vidro = new THREE.MeshPhysicalMaterial({
    color: 0xdbe9e8,
    roughness: 0.06,
    metalness: 0,
    transmission: 0.68,
    transparent: true,
    opacity: 0.82,
    thickness: 0.28,
    ior: 1.45
  });

  const torre = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 3.85, 22.5, 64, 8), concreto);
  torre.position.y = 11.25;
  torre.castShadow = true;
  torre.receiveShadow = true;
  grupo.add(torre);

  const faixa = new THREE.Mesh(new THREE.CylinderGeometry(2.66, 2.94, 4.15, 64), metalVermelho);
  faixa.position.y = 15.2;
  faixa.castShadow = true;
  grupo.add(faixa);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 1.3, 64), metal);
  base.position.y = 0.65;
  base.castShadow = true;
  grupo.add(base);

  const porta = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 2.45), metal);
  porta.position.set(0, 2.1, 3.48);
  grupo.add(porta);

  for (const y of [7.2, 11.3, 18.4]) {
    const janela = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x23363e, emissive: 0x0c1820, emissiveIntensity: 0.35, roughness: 0.18 })
    );
    janela.position.set(0, y, 2.85 - (y / 22) * 0.75);
    grupo.add(janela);
  }

  const sacada = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 0.46, 64), metal);
  sacada.position.y = 22.8;
  sacada.castShadow = true;
  grupo.add(sacada);

  const lanterna = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 3.8, 40, 1, true), vidro);
  lanterna.position.y = 24.75;
  grupo.add(lanterna);

  const teto = new THREE.Mesh(new THREE.ConeGeometry(2.92, 1.82, 48), metalVermelho);
  teto.position.y = 27.55;
  teto.castShadow = true;
  grupo.add(teto);

  const grade = new THREE.Group();
  const aroBaixo = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.035, 6, 64), metal);
  aroBaixo.rotation.x = Math.PI / 2;
  aroBaixo.position.y = 23.25;
  grade.add(aroBaixo);
  const aroAlto = aroBaixo.clone();
  aroAlto.position.y = 24.15;
  grade.add(aroAlto);

  for (let i = 0; i < 28; i++) {
    const angulo = (i / 28) * Math.PI * 2;
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.92, 6), metal);
    haste.position.set(Math.cos(angulo) * 2.95, 23.7, Math.sin(angulo) * 2.95);
    grade.add(haste);
  }
  grupo.add(grade);

  const lenteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffefc8,
    emissive: 0xffc96c,
    emissiveIntensity: 8.5,
    roughness: 0.18
  });
  const lente = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 20), lenteMaterial);
  lente.position.y = 24.78;
  grupo.add(lente);

  const luz = new THREE.PointLight(0xffd89a, 42, 82, 1.8);
  luz.position.y = 24.78;
  grupo.add(luz);

  const pivoFeixe = new THREE.Group();
  pivoFeixe.position.y = 24.78;
  grupo.add(pivoFeixe);

  const geoFeixe = new THREE.ConeGeometry(8.5, 126, 64, 1, true);
  geoFeixe.translate(0, -63, 0);
  geoFeixe.rotateX(Math.PI / 2);

  const matFeixe = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uOpacity: { value: 0.17 },
      uColor: { value: new THREE.Color(0xffe8b3) }
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
        float borda = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x);
        float alcance = 1.0 - smoothstep(0.16, 1.0, vUv.y);
        float centro = 0.64 + 0.36 * sin(vUv.x * 3.14159265);
        gl_FragColor = vec4(uColor, uOpacity * borda * alcance * centro);
      }
    `
  });

  const feixe = new THREE.Mesh(geoFeixe, matFeixe);
  pivoFeixe.add(feixe);

  return { grupo, pivoFeixe, matFeixe, luz, lenteMaterial };
}

function criarEspumaCosta() {
  const grupo = new THREE.Group();
  const aneis = [];
  const locais = [
    [-26, -91, 8, 5, 0.04],
    [-15, -88, 7, 4, 0.20],
    [-38, -88, 9, 4.5, 0.34],
    [-19, -103, 12, 6, 0.52],
    [-48, -99, 9, 5, 0.68],
    [-5, -101, 7, 4, 0.82]
  ];

  locais.forEach(([x, z, externo, interno, fase], indice) => {
    const geometria = new THREE.RingGeometry(interno, externo, 72, 2);
    geometria.rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
      color: indice % 2 ? 0xdbe7e6 : 0xe9efeb,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const anel = new THREE.Mesh(geometria, material);
    anel.position.set(x, 0.38 + indice * 0.014, z);
    anel.rotation.y = indice * 0.61;
    anel.scale.set(0.72, 1, 0.62 + (indice % 3) * 0.08);
    grupo.add(anel);
    aneis.push({ mesh: anel, material, fase, baseX: anel.scale.x, baseZ: anel.scale.z });
  });

  return { grupo, aneis };
}

function criarSpray() {
  const quantidade = innerWidth < 700 ? 260 : 520;
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
    posicoes[i * 3] = r[0] + (rand() - 0.5) * 13;
    posicoes[i * 3 + 1] = r[1] + rand() * 1.4;
    posicoes[i * 3 + 2] = r[2] + (rand() - 0.5) * 11;
    sementes[i] = rand();
    const angulo = rand() * Math.PI * 2;
    direcoes[i * 2] = Math.cos(angulo) * (0.4 + rand() * 0.9);
    direcoes[i * 2 + 1] = Math.sin(angulo) * (0.4 + rand() * 0.9);
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute('aSeed', new THREE.BufferAttribute(sementes, 1));
  geometria.setAttribute('aDir', new THREE.BufferAttribute(direcoes, 2));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
      uDawn: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSeed;
      attribute vec2 aDir;
      varying float vAlpha;
      varying float vDawn;
      uniform float uDawn;

      void main() {
        float ciclo = fract((uTime / 9.4) + aSeed * 0.042);
        float vida = smoothstep(0.0, 0.045, ciclo) * (1.0 - smoothstep(0.22, 0.42, ciclo));
        float t = clamp(ciclo / 0.42, 0.0, 1.0);
        vec3 p = position;
        p.x += aDir.x * t * 4.5;
        p.z += aDir.y * t * 4.5;
        p.y += sin(t * 3.14159265) * (2.8 + aSeed * 4.8);
        p.y -= t * t * 1.7;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + aSeed * 3.3) * uPixelRatio * (180.0 / max(25.0, -mv.z));
        gl_PointSize = clamp(gl_PointSize, 1.2, 7.5);
        vAlpha = vida * (0.25 + aSeed * 0.62);
        vDawn = uDawn;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vDawn;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float d = length(p);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.08, d) * vAlpha;
        vec3 cor = mix(vec3(0.68, 0.78, 0.82), vec3(0.95, 0.97, 0.94), vDawn);
        gl_FragColor = vec4(cor, a);
      }
    `
  });

  return { pontos: new THREE.Points(geometria, material), material };
}

function criarLua() {
  const material = new THREE.SpriteMaterial({
    map: texturaLua(),
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    fog: false
  });
  const lua = new THREE.Sprite(material);
  lua.scale.set(42, 42, 1);
  lua.position.set(150, 116, -470);
  return lua;
}

function criarBrilhoSolar() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 2, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,246,220,1)');
  g.addColorStop(0.07, 'rgba(255,224,172,.96)');
  g.addColorStop(0.28, 'rgba(255,174,105,.36)');
  g.addColorStop(1, 'rgba(255,140,90,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

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
  sprite.scale.set(110, 110, 1);
  return sprite;
}

function criarNeblinaBaixa() {
  const rand = aleatorio(99341);
  const quantidade = 80;
  const pos = new Float32Array(quantidade * 3);
  for (let i = 0; i < quantidade; i++) {
    pos[i * 3] = (rand() - 0.5) * 780;
    pos[i * 3 + 1] = 1.2 + rand() * 12;
    pos[i * 3 + 2] = -180 - rand() * 420;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x95a6a8,
    size: 24,
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
    sizeAttenuation: true
  });
  return new THREE.Points(geo, mat);
}

export function criarCena(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.34;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.55 : 2));
  renderer.setSize(innerWidth, innerHeight, false);

  const cena = new THREE.Scene();
  cena.background = NOITE.clone();
  cena.fog = new THREE.FogExp2(NEVOA_NOITE.clone(), 0.00155);

  const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.1, 2200);
  camera.position.set(38, 16, 66);

  const sky = new Sky();
  sky.scale.setScalar(10000);
  cena.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms.turbidity.value = 8.5;
  skyUniforms.rayleigh.value = 1.55;
  skyUniforms.mieCoefficient.value = 0.006;
  skyUniforms.mieDirectionalG.value = 0.84;

  const estrelas = criarEstrelas(innerWidth < 700 ? 850 : 1500);
  cena.add(estrelas);

  const lua = criarLua();
  cena.add(lua);

  const sol = criarBrilhoSolar();
  cena.add(sol);

  const neblina = criarNeblinaBaixa();
  cena.add(neblina);

  const { oceano, uniforms: oceanoUniforms } = criarOceano();
  cena.add(oceano);

  const rochas = criarRochas();
  cena.add(rochas);

  const farol = criarFarol();
  cena.add(farol.grupo);

  const espumaCosta = criarEspumaCosta();
  cena.add(espumaCosta.grupo);

  const spray = criarSpray();
  cena.add(spray.pontos);

  const hemisferio = new THREE.HemisphereLight(0x7892a6, 0x091012, 0.62);
  cena.add(hemisferio);

  const luaLuz = new THREE.DirectionalLight(0xacc8d8, 1.15);
  luaLuz.position.set(90, 120, 60);
  cena.add(luaLuz);

  const solLuz = new THREE.DirectionalLight(0xffd1a4, 0);
  solLuz.castShadow = innerWidth > 720;
  solLuz.shadow.mapSize.set(innerWidth > 1500 ? 2048 : 1024, innerWidth > 1500 ? 2048 : 1024);
  solLuz.shadow.camera.near = 10;
  solLuz.shadow.camera.far = 350;
  solLuz.shadow.camera.left = -90;
  solLuz.shadow.camera.right = 90;
  solLuz.shadow.camera.top = 90;
  solLuz.shadow.camera.bottom = -90;
  cena.add(solLuz);

  const alvo = new THREE.Vector3(-21, 8, -94);
  const alvoAtual = alvo.clone();
  const posicaoCamera = camera.position.clone();
  let tempoAcumulado = 0;
  let ultimoTempo = performance.now() * 0.001;

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
    return {
      camera: new THREE.Vector3(
        interpolar(a.c[0], b.c[0], t),
        interpolar(a.c[1], b.c[1], t),
        interpolar(a.c[2], b.c[2], t)
      ),
      alvo: new THREE.Vector3(
        interpolar(a.a[0], b.a[0], t),
        interpolar(a.a[1], b.a[1], t),
        interpolar(a.a[2], b.a[2], t)
      )
    };
  }

  function atualizarEspuma(tempo, amanhecer) {
    espumaCosta.aneis.forEach((item, indice) => {
      const fase = (tempo / PERIODO_ONDA + item.fase * 0.16) % 1;
      const vida = fase < 0.52 ? Math.sin((fase / 0.52) * Math.PI) : 0;
      const crescimento = 0.72 + fase * 0.8;
      item.mesh.scale.x = item.baseX * crescimento;
      item.mesh.scale.z = item.baseZ * (0.86 + fase * 0.65);
      item.material.opacity = vida * (0.11 + (indice % 3) * 0.026) * (0.9 + amanhecer * 0.22);
      item.mesh.rotation.y += 0.00018 * (indice % 2 ? 1 : -1);
    });
  }

  function atualizar(progresso, ponteiro) {
    const agora = performance.now() * 0.001;
    const delta = limitar(agora - ultimoTempo, 0, 0.05);
    ultimoTempo = agora;
    tempoAcumulado += delta;

    const tempo = tempoAcumulado;
    const amanhecer = suavizar(0.34, 0.92, progresso);
    const luzManha = suavizar(0.52, 1.0, progresso);

    oceanoUniforms.uTime.value = tempo;
    oceanoUniforms.uDawn.value = amanhecer;
    oceanoUniforms.uFogColor.value.copy(NEVOA_NOITE).lerp(NEVOA_DIA, amanhecer);
    spray.material.uniforms.uTime.value = tempo;
    spray.material.uniforms.uDawn.value = amanhecer;

    const elevacao = THREE.MathUtils.degToRad(interpolar(-7.5, 7.8, amanhecer));
    const azimute = THREE.MathUtils.degToRad(118);
    vetorSol.set(
      Math.cos(elevacao) * Math.sin(azimute),
      Math.sin(elevacao),
      Math.cos(elevacao) * Math.cos(azimute)
    ).normalize();
    skyUniforms.sunPosition.value.copy(vetorSol);
    oceanoUniforms.uSunDir.value.copy(vetorSol);

    sol.position.copy(vetorSol).multiplyScalar(680);
    sol.material.opacity = luzManha * 0.9;
    solLuz.position.copy(vetorSol).multiplyScalar(140);
    solLuz.intensity = luzManha * 3.4;
    luaLuz.intensity = 1.12 * (1 - amanhecer * 0.88);
    hemisferio.intensity = interpolar(0.62, 1.72, amanhecer);
    hemisferio.color.set(0x7892a6).lerp(new THREE.Color(0xcbdde0), amanhecer);
    hemisferio.groundColor.set(0x091012).lerp(new THREE.Color(0x514c45), amanhecer);

    lua.material.opacity = limitar(0.96 - amanhecer * 1.18, 0, 0.96);
    estrelas.material.opacity = limitar(0.95 - amanhecer * 1.4, 0, 0.95);
    neblina.material.opacity = interpolar(0.055, 0.028, amanhecer);

    cena.fog.color.copy(NEVOA_NOITE).lerp(NEVOA_DIA, amanhecer);
    cena.fog.density = interpolar(0.00155, 0.00082, amanhecer);
    renderer.toneMappingExposure = interpolar(1.38, 1.62, amanhecer);

    farol.pivoFeixe.rotation.y = tempo * 0.34;
    farol.matFeixe.uniforms.uOpacity.value = interpolar(0.19, 0.015, suavizar(0.55, 0.95, progresso));
    farol.luz.intensity = interpolar(42, 5, suavizar(0.58, 1, progresso));
    farol.lenteMaterial.emissiveIntensity = interpolar(8.5, 1.2, suavizar(0.58, 1, progresso));

    atualizarEspuma(tempo, amanhecer);

    const amostra = amostrarCamera(progresso);
    amostra.camera.x += ponteiro.x * 2.5;
    amostra.camera.y += ponteiro.y * 1.2;
    amostra.alvo.x += ponteiro.x * 1.4;
    amostra.alvo.y += ponteiro.y * 0.65;

    posicaoCamera.lerp(amostra.camera, 0.045);
    alvoAtual.lerp(amostra.alvo, 0.05);
    camera.position.copy(posicaoCamera);
    camera.lookAt(alvoAtual);

    const fasePrincipal = (tempo % PERIODO_ONDA) / PERIODO_ONDA;
    const faseSecundaria = ((tempo + 1.8) % 5.2) / 5.2;
    const impactoPrincipal = pulsoCircular(fasePrincipal, 0.08, 0.028);
    const impactoSecundario = pulsoCircular(faseSecundaria, 0.06, 0.038) * 0.52;
    const impacto = Math.max(impactoPrincipal, impactoSecundario);
    const espuma = Math.max(
      pulsoCircular(fasePrincipal, 0.17, 0.13),
      pulsoCircular(faseSecundaria, 0.17, 0.16) * 0.56
    );

    renderer.render(cena, camera);

    return {
      impacto,
      espuma,
      vento: 0.42 + Math.sin(tempo * 0.21) * 0.08,
      fase: fasePrincipal
    };
  }

  function redimensionar() {
    const largura = innerWidth;
    const altura = innerHeight;
    camera.aspect = largura / altura;
    camera.fov = largura < 600 ? 50 : largura > 1800 ? 40 : 43;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, largura < 700 ? 1.55 : 2));
    renderer.setSize(largura, altura, false);
    spray.material.uniforms.uPixelRatio.value = Math.min(devicePixelRatio, 2);
  }

  function destruir() {
    cena.traverse((objeto) => {
      if (objeto.geometry) objeto.geometry.dispose();
      if (objeto.material) {
        const materiais = Array.isArray(objeto.material) ? objeto.material : [objeto.material];
        materiais.forEach((material) => {
          Object.values(material).forEach((valor) => {
            if (valor?.isTexture) valor.dispose();
          });
          material.dispose();
        });
      }
    });
    renderer.dispose();
  }

  return {
    atualizar,
    redimensionar,
    destruir
  };
}
