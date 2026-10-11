import * as THREE from 'three';

const BEGE = new THREE.Color(0xb7b0a3);
const CINZA = new THREE.Color(0x858f91);
const QUENTE = new THREE.Color(0xffdfb5);
const FRIO = new THREE.Color(0xc3d9e6);
const SOL = new THREE.Color(0xffc37c);

function limitar(v, a = 0, b = 1) { return Math.min(b, Math.max(a, v)); }
function suave(a, b, v) {
  const x = limitar((v - a) / Math.max(.0001, b - a));
  return x * x * (3 - 2 * x);
}
function mix(a, b, t) { return a + (b - a) * t; }
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let r = s;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function configuracao() {
  const toque = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;
  const leve = toque || cores <= 4 || memoria <= 4;
  return {
    leve,
    dprMin: leve ? .78 : .92,
    dprMax: leve ? 1.04 : 1.34,
    poeira: leve ? 120 : 250
  };
}

function texturaParede() {
  const c = document.createElement('canvas');
  const b = document.createElement('canvas');
  c.width = c.height = b.width = b.height = 256;
  const x = c.getContext('2d');
  const y = b.getContext('2d');
  const rnd = random(9137);
  x.fillStyle = '#b8b1a4';
  x.fillRect(0, 0, 256, 256);
  y.fillStyle = '#7d7d7d';
  y.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1500; i++) {
    const px = rnd() * 256;
    const py = rnd() * 256;
    const r = .4 + rnd() * 2.2;
    const tom = 110 + Math.floor(rnd() * 95);
    x.fillStyle = `rgba(${tom},${tom},${Math.max(0, tom - 8)},${.016 + rnd() * .045})`;
    x.fillRect(px, py, r, r);
    const bt = 95 + Math.floor(rnd() * 95);
    y.fillStyle = `rgba(${bt},${bt},${bt},${.08 + rnd() * .14})`;
    y.fillRect(px, py, r * .8, r * .8);
  }
  for (let i = 0; i < 14; i++) {
    const px = rnd() * 256;
    const py = rnd() * 256;
    x.strokeStyle = `rgba(82,72,60,${.025 + rnd() * .04})`;
    x.lineWidth = .5 + rnd() * 1.2;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (rnd() - .5) * 46, py + 12 + rnd() * 46);
    x.stroke();
  }
  const cor = new THREE.CanvasTexture(c);
  const bump = new THREE.CanvasTexture(b);
  [cor, bump].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
  });
  cor.colorSpace = THREE.SRGBColorSpace;
  return { cor, bump };
}

function texturaPiso() {
  const c = document.createElement('canvas');
  const r = document.createElement('canvas');
  c.width = c.height = r.width = r.height = 256;
  const x = c.getContext('2d');
  const q = r.getContext('2d');
  const rnd = random(4451);
  x.fillStyle = '#5d5a53';
  x.fillRect(0, 0, 256, 256);
  q.fillStyle = '#b0b0b0';
  q.fillRect(0, 0, 256, 256);
  for (let yy = 0; yy < 256; yy += 32) {
    for (let xx = 0; xx < 256; xx += 32) {
      const t = 72 + Math.floor(rnd() * 22);
      x.fillStyle = `rgb(${t},${t - 1},${t - 5})`;
      x.fillRect(xx + 1, yy + 1, 30, 30);
      x.strokeStyle = 'rgba(20,20,19,.42)';
      x.strokeRect(xx + .5, yy + .5, 31, 31);
      const rr = 155 + Math.floor(rnd() * 45);
      q.fillStyle = `rgb(${rr},${rr},${rr})`;
      q.fillRect(xx + 1, yy + 1, 30, 30);
    }
  }
  for (let i = 0; i < 650; i++) {
    x.fillStyle = `rgba(25,23,20,${rnd() * .065})`;
    x.fillRect(rnd() * 256, rnd() * 256, .5 + rnd() * 2.4, .5 + rnd() * 2.4);
  }
  const cor = new THREE.CanvasTexture(c);
  const rough = new THREE.CanvasTexture(r);
  [cor, rough].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(7, 14);
  });
  cor.colorSpace = THREE.SRGBColorSpace;
  return { cor, rough };
}

function texturaMadeira() {
  const c = document.createElement('canvas');
  const b = document.createElement('canvas');
  c.width = c.height = b.width = b.height = 256;
  const x = c.getContext('2d');
  const y = b.getContext('2d');
  const rnd = random(7781);
  x.fillStyle = '#896d4d';
  x.fillRect(0, 0, 256, 256);
  y.fillStyle = '#7f7f7f';
  y.fillRect(0, 0, 256, 256);
  for (let py = 0; py < 256; py += 2) {
    x.strokeStyle = `rgba(52,34,21,${.027 + rnd() * .032})`;
    x.beginPath();
    x.moveTo(0, py + Math.sin(py * .07) * 1.5);
    x.bezierCurveTo(65, py + rnd() * 5, 176, py - rnd() * 5, 256, py + rnd() * 2);
    x.stroke();
    y.strokeStyle = `rgba(170,170,170,${.05 + rnd() * .1})`;
    y.beginPath();
    y.moveTo(0, py);
    y.lineTo(256, py + (rnd() - .5) * 2);
    y.stroke();
  }
  for (let i = 0; i < 30; i++) {
    const px = rnd() * 256;
    const py = rnd() * 256;
    const len = 10 + rnd() * 42;
    x.strokeStyle = `rgba(28,21,15,${.08 + rnd() * .12})`;
    x.lineWidth = .5 + rnd();
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + len, py + (rnd() - .5) * 4);
    x.stroke();
  }
  const cor = new THREE.CanvasTexture(c);
  const bump = new THREE.CanvasTexture(b);
  [cor, bump].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.2, 1);
  });
  cor.colorSpace = THREE.SRGBColorSpace;
  return { cor, bump };
}

function texturaFolha() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const x = c.getContext('2d');
  x.fillStyle = '#e7e1d4';
  x.fillRect(0, 0, 256, 320);
  const grad = x.createLinearGradient(0, 0, 256, 320);
  grad.addColorStop(0, 'rgba(255,255,255,.16)');
  grad.addColorStop(.7, 'rgba(110,96,75,.035)');
  grad.addColorStop(1, 'rgba(75,65,52,.08)');
  x.fillStyle = grad;
  x.fillRect(0, 0, 256, 320);
  x.fillStyle = '#42423e';
  x.font = 'bold 13px Arial';
  x.fillText('AVALIAÇÃO', 20, 27);
  x.font = '9px Arial';
  x.fillText('nome: __________________________', 20, 47);
  x.fillText('turma: ________    data: ________', 20, 63);
  x.strokeStyle = 'rgba(55,55,52,.24)';
  for (let yy = 90; yy < 286; yy += 28) {
    x.beginPath();
    x.moveTo(20, yy);
    x.lineTo(234, yy);
    x.stroke();
  }
  x.strokeStyle = '#9f4c43';
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(188, 45);
  x.lineTo(228, 78);
  x.moveTo(228, 45);
  x.lineTo(188, 78);
  x.stroke();
  x.fillStyle = '#9f4c43';
  x.font = 'bold 20px Georgia';
  x.fillText('6,0', 180, 108);
  x.font = 'italic 10px Georgia';
  x.fillText('revise', 177, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaTela() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 288;
  const x = c.getContext('2d');
  x.fillStyle = '#111a1f';
  x.fillRect(0, 0, 512, 288);
  x.fillStyle = '#26353c';
  x.fillRect(0, 0, 512, 26);
  x.fillStyle = '#9fb1b8';
  x.font = 'bold 12px Arial';
  x.fillText('TURNO · PRODUÇÃO', 18, 18);
  x.fillStyle = '#6f858d';
  x.font = '10px Arial';
  x.fillText('meta', 22, 62);
  x.fillText('concluído', 22, 126);
  x.fillText('tempo restante', 22, 190);
  x.fillStyle = '#dce7e9';
  x.font = 'bold 30px Georgia';
  x.fillText('100%', 20, 98);
  x.fillText('87%', 20, 162);
  x.fillText('01:14', 20, 226);
  x.fillStyle = '#334a52';
  x.fillRect(186, 62, 290, 8);
  x.fillRect(186, 126, 290, 8);
  x.fillStyle = '#94b3bc';
  x.fillRect(186, 62, 290, 8);
  x.fillRect(186, 126, 252, 8);
  x.fillStyle = '#9f4b43';
  x.fillRect(186, 190, 112, 8);
  for (let i = 0; i < 8; i++) {
    x.fillStyle = `rgba(190,220,228,${.025 + i * .004})`;
    x.fillRect(0, i * 36, 512, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaVidro() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const rnd = random(21997);
  x.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 65; i++) {
    const px = rnd() * 256;
    const py = rnd() * 256;
    const len = 10 + rnd() * 70;
    x.strokeStyle = `rgba(210,205,190,${.018 + rnd() * .06})`;
    x.lineWidth = .5 + rnd() * 1.2;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (rnd() - .5) * 8, py + len);
    x.stroke();
  }
  for (let i = 0; i < 90; i++) {
    x.fillStyle = `rgba(225,220,205,${.012 + rnd() * .035})`;
    x.beginPath();
    x.arc(rnd() * 256, rnd() * 256, .6 + rnd() * 2.4, 0, Math.PI * 2);
    x.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function quadroEscola() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 420;
  const x = c.getContext('2d');
  const rnd = random(552);
  const g = x.createLinearGradient(0, 0, 0, 420);
  g.addColorStop(0, '#263c34');
  g.addColorStop(1, '#1d322b');
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 420);
  for (let i = 0; i < 1200; i++) {
    x.fillStyle = `rgba(234,232,218,${rnd() * .024})`;
    x.fillRect(rnd() * 1024, rnd() * 420, 1 + rnd() * 4, 1);
  }
  x.fillStyle = 'rgba(241,238,224,.76)';
  x.font = '30px Georgia';
  x.fillText('aprender = perguntar', 58, 88);
  x.font = '20px Georgia';
  x.fillText('por quê?', 58, 132);
  x.strokeStyle = 'rgba(240,237,224,.34)';
  x.beginPath();
  x.moveTo(58, 160);
  x.lineTo(442, 160);
  x.stroke();
  x.font = '18px Arial';
  x.fillText('prova · 07:30', 58, 232);
  x.fillText('tempo · 50 min', 58, 266);
  x.fillStyle = 'rgba(236,232,216,.08)';
  x.fillRect(0, 374, 1024, 46);
  return new THREE.CanvasTexture(c);
}

function quadroTrabalho() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 420;
  const x = c.getContext('2d');
  x.fillStyle = '#10181c';
  x.fillRect(0, 0, 1024, 420);
  x.fillStyle = '#dbe5e7';
  x.font = 'bold 23px Arial';
  x.fillText('PAINEL — TURNO', 56, 62);
  x.fillStyle = '#92a4a9';
  x.font = '14px Arial';
  x.fillText('META', 56, 122);
  x.fillText('PRAZO', 350, 122);
  x.fillText('PRODUÇÃO', 620, 122);
  x.fillStyle = '#eef5f4';
  x.font = '42px Georgia';
  x.fillText('100%', 56, 184);
  x.fillText('18:00', 350, 184);
  x.fillText('87%', 620, 184);
  x.strokeStyle = '#9e4b43';
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(56, 253);
  x.lineTo(884, 253);
  x.stroke();
  x.fillStyle = '#9e4b43';
  x.font = 'bold 18px Arial';
  x.fillText('ATRASO', 56, 307);
  for (let i = 0; i < 7; i++) {
    x.fillStyle = `rgba(185,215,224,${.018 + i * .004})`;
    x.fillRect(0, 38 + i * 54, 1024, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function sala(cena) {
  const parede = texturaParede();
  const piso = texturaPiso();
  const paredeMat = new THREE.MeshStandardMaterial({ color: BEGE.clone(), map: parede.cor, bumpMap: parede.bump, bumpScale: .045, roughness: .94 });
  const pisoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: piso.cor, roughnessMap: piso.rough, roughness: .78, metalness: .018 });
  const tetoMat = new THREE.MeshStandardMaterial({ color: 0xcfcbc1, roughness: .98 });
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), pisoMat);
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), tetoMat);
  teto.rotation.x = Math.PI / 2;
  teto.position.y = 8.2;
  cena.add(teto);
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(30, 8.2), paredeMat);
  frente.position.set(0, 4.1, -30);
  cena.add(frente);
  const esq = new THREE.Mesh(new THREE.PlaneGeometry(60, 8.2), paredeMat.clone());
  esq.rotation.y = Math.PI / 2;
  esq.position.set(-15, 4.1, 0);
  cena.add(esq);
  const dir = new THREE.Mesh(new THREE.PlaneGeometry(60, 8.2), paredeMat.clone());
  dir.rotation.y = -Math.PI / 2;
  dir.position.set(15, 4.1, 0);
  cena.add(dir);
  const rodapeMat = new THREE.MeshStandardMaterial({ color: 0x60594e, roughness: .88 });
  const rodapeFrente = new THREE.Mesh(new THREE.BoxGeometry(30, .22, .12), rodapeMat);
  rodapeFrente.position.set(0, .11, -29.9);
  cena.add(rodapeFrente);
  for (const xx of [-14.9, 14.9]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(.12, .22, 60), rodapeMat);
    r.position.set(xx, .11, 0);
    cena.add(r);
  }
  return { paredeMat, pisoMat, tetoMat };
}

function carteiras(cena) {
  const madeiraTex = texturaMadeira();
  const madeira = new THREE.MeshStandardMaterial({ color: 0xffffff, map: madeiraTex.cor, bumpMap: madeiraTex.bump, bumpScale: .03, roughness: .67 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x3a3e3d, roughness: .6, metalness: .5 });
  const plastico = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .82 });
  const papelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaFolha(), roughness: .96, transparent: true, opacity: 1, side: THREE.DoubleSide });
  const sombraMat = new THREE.MeshBasicMaterial({ color: 0x080807, transparent: true, opacity: .13, depthWrite: false });
  const parafusoMat = new THREE.MeshStandardMaterial({ color: 0x6a655b, roughness: .35, metalness: .72 });
  const xs = [-8.4, -3.1, 3.1, 8.4];
  const zs = [15, 7, -1, -9, -17];
  const n = xs.length * zs.length;
  const tampo = new THREE.InstancedMesh(new THREE.BoxGeometry(3.25, .16, 1.65), madeira, n);
  const pernas = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, 1.55, .1), metal, n * 4);
  const assento = new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, .12, 1.45), plastico, n);
  const encosto = new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, 1.28, .11), plastico, n);
  const geoFolha = new THREE.PlaneGeometry(1.05, 1.34, 5, 6);
  const pos = geoFolha.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const curva = Math.pow(Math.abs(px) / .525, 3) * .012 + Math.pow((py + .67) / 1.34, 5) * .016;
    pos.setZ(i, curva);
  }
  geoFolha.computeVertexNormals();
  const folhas = new THREE.InstancedMesh(geoFolha, papelMat, n);
  const sombras = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 24), sombraMat, n);
  const parafusos = new THREE.InstancedMesh(new THREE.CylinderGeometry(.035, .035, .018, 8), parafusoMat, n * 4);
  const base = [];
  const d = new THREE.Object3D();
  const rnd = random(64321);
  let i = 0, p = 0, s = 0;
  for (const z0 of zs) for (const x0 of xs) {
    const xx = x0 + (rnd() - .5) * .16;
    const zz = z0 + (rnd() - .5) * .18;
    const rot = (rnd() - .5) * .026;
    const altura = (rnd() - .5) * .025;
    const tomMadeira = new THREE.Color().setHSL(.085 + (rnd() - .5) * .018, .29 + rnd() * .09, .39 + rnd() * .08);
    const tomCadeira = new THREE.Color().setHSL(.38 + (rnd() - .5) * .025, .16 + rnd() * .08, .34 + rnd() * .07);
    base.push({ x: xx, z: zz, rot, altura });
    d.position.set(xx, 1.65 + altura, zz);
    d.rotation.set(0, rot, 0);
    d.scale.set(1, 1, 1);
    d.updateMatrix();
    tampo.setMatrixAt(i, d.matrix);
    tampo.setColorAt(i, tomMadeira);
    for (const [ox, oz] of [[-1.38, -.68], [1.38, -.68], [-1.38, .68], [1.38, .68]]) {
      d.position.set(xx + ox, .84 + altura, zz + oz);
      d.rotation.set((rnd() - .5) * .008, rot + (rnd() - .5) * .005, (rnd() - .5) * .008);
      d.updateMatrix();
      pernas.setMatrixAt(p++, d.matrix);
    }
    d.position.set(xx, .92 + altura, zz + 2.02);
    d.rotation.set(0, rot + (rnd() - .5) * .012, 0);
    d.updateMatrix();
    assento.setMatrixAt(i, d.matrix);
    assento.setColorAt(i, tomCadeira);
    d.position.set(xx, 1.72 + altura, zz + 2.66);
    d.rotation.set((rnd() - .5) * .012, rot + (rnd() - .5) * .016, (rnd() - .5) * .012);
    d.updateMatrix();
    encosto.setMatrixAt(i, d.matrix);
    encosto.setColorAt(i, tomCadeira);
    d.position.set(xx + .50 + (rnd() - .5) * .08, 1.748 + altura, zz - .06 + (rnd() - .5) * .06);
    d.rotation.set(-Math.PI / 2, (rnd() - .5) * .018, -.045 + (i % 4) * .019 + (rnd() - .5) * .03);
    d.updateMatrix();
    folhas.setMatrixAt(i, d.matrix);
    d.position.set(xx, .014, zz + .35);
    d.rotation.set(-Math.PI / 2, 0, 0);
    d.scale.set(2.0, 1.18, 1);
    d.updateMatrix();
    sombras.setMatrixAt(i, d.matrix);
    for (const [ox, oz] of [[-1.25, -.58], [1.25, -.58], [-1.25, .58], [1.25, .58]]) {
      d.position.set(xx + ox, 1.746 + altura, zz + oz);
      d.rotation.set(Math.PI / 2, 0, rot);
      d.scale.set(1, 1, 1);
      d.updateMatrix();
      parafusos.setMatrixAt(s++, d.matrix);
    }
    i++;
  }
  [tampo, pernas, assento, encosto, folhas, sombras, parafusos].forEach(m => {
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    cena.add(m);
  });
  return { base, n, papelMat };
}

function monitores(cena, base) {
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x252a2c, roughness: .5, metalness: .26 });
  const telaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaTela(), emissive: 0x6f8e9a, emissiveIntensity: .06, roughness: .18 });
  const tecladoMat = new THREE.MeshStandardMaterial({ color: 0x32383a, roughness: .72, metalness: .06 });
  const n = base.length;
  const corpo = new THREE.InstancedMesh(new THREE.BoxGeometry(1.82, 1.08, .16), corpoMat, n);
  const tela = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.58, .84), telaMat, n);
  const haste = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .62, .12), corpoMat, n);
  const teclado = new THREE.InstancedMesh(new THREE.BoxGeometry(1.62, .055, .56), tecladoMat, n);
  cena.add(corpo, tela, haste, teclado);
  return { corpo, tela, haste, teclado, telaMat, base, n };
}

function quadros(cena) {
  const mold = new THREE.Mesh(new THREE.BoxGeometry(13.7, 4.45, .18), new THREE.MeshStandardMaterial({ color: 0x403b32, roughness: .86 }));
  mold.position.set(0, 4.35, -29.64);
  cena.add(mold);
  const escolaTex = quadroEscola();
  escolaTex.colorSpace = THREE.SRGBColorSpace;
  const escolaMat = new THREE.MeshStandardMaterial({ map: escolaTex, roughness: .94, transparent: true, opacity: 1 });
  const escola = new THREE.Mesh(new THREE.PlaneGeometry(13.15, 3.95), escolaMat);
  escola.position.set(0, 4.35, -29.52);
  cena.add(escola);
  const trabalhoMat = new THREE.MeshStandardMaterial({ map: quadroTrabalho(), emissive: 0x2a3940, emissiveIntensity: .14, roughness: .4, transparent: true, opacity: 0 });
  const trab = new THREE.Mesh(new THREE.PlaneGeometry(13.15, 3.95), trabalhoMat);
  trab.position.set(0, 4.35, -29.48);
  cena.add(trab);
  const po = new THREE.Mesh(new THREE.PlaneGeometry(13.0, .34), new THREE.MeshBasicMaterial({ color: 0xd9d4c7, transparent: true, opacity: .09, depthWrite: false }));
  po.position.set(0, 2.46, -29.43);
  cena.add(po);
  return { escolaMat, trabalhoMat, po };
}

function relogio(cena) {
  const g = new THREE.Group();
  g.position.set(10.2, 5.7, -29.37);
  const f = new THREE.Mesh(new THREE.CircleGeometry(1.05, 48), new THREE.MeshStandardMaterial({ color: 0xe0dcd2, roughness: .88 }));
  g.add(f);
  const aro = new THREE.Mesh(new THREE.RingGeometry(1.02, 1.12, 48), new THREE.MeshStandardMaterial({ color: 0x282a2a, roughness: .48, metalness: .38 }));
  aro.position.z = .02;
  g.add(aro);
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x373737 });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(.025, i % 3 === 0 ? .17 : .1, .02), tickMat);
    tick.position.set(Math.sin(a) * .86, Math.cos(a) * .86, .055);
    tick.rotation.z = -a;
    g.add(tick);
  }
  const h = new THREE.Mesh(new THREE.BoxGeometry(.055, .58, .035), new THREE.MeshBasicMaterial({ color: 0x202020 }));
  h.geometry.translate(0, -.25, 0);
  h.position.z = .07;
  g.add(h);
  const m = new THREE.Mesh(new THREE.BoxGeometry(.04, .8, .03), new THREE.MeshBasicMaterial({ color: 0x202020 }));
  m.geometry.translate(0, -.35, 0);
  m.position.z = .075;
  g.add(m);
  const centro = new THREE.Mesh(new THREE.CircleGeometry(.075, 16), new THREE.MeshBasicMaterial({ color: 0xa04b41 }));
  centro.position.z = .085;
  g.add(centro);
  const vidro = new THREE.Mesh(new THREE.CircleGeometry(.98, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .06, transparent: true, opacity: .12, transmission: .35, clearcoat: 1, clearcoatRoughness: .06, depthWrite: false }));
  vidro.position.z = .11;
  g.add(vidro);
  cena.add(g);
  return { h, m };
}

function janelas(cena) {
  const g = new THREE.Group();
  const mold = new THREE.MeshStandardMaterial({ color: 0x424543, roughness: .72, metalness: .18 });
  const sujeira = texturaVidro();
  const vidros = [];
  const raios = [];
  for (let i = 0; i < 4; i++) {
    const z = 14 - i * 12;
    const vm = new THREE.MeshPhysicalMaterial({ color: 0xaabfc3, map: sujeira, transparent: true, opacity: .34, roughness: .16 + i * .025, transmission: .08, clearcoat: .28, clearcoatRoughness: .18, side: THREE.DoubleSide, depthWrite: false });
    const v = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.25), vm);
    v.rotation.y = -Math.PI / 2;
    v.position.set(14.91, 4.45, z);
    g.add(v);
    vidros.push(vm);
    const vert = new THREE.Mesh(new THREE.BoxGeometry(.12, 4.4, .12), mold);
    vert.position.set(14.76, 4.45, z);
    g.add(vert);
    for (const yy of [-2.16, 2.16]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, 5.95), mold);
      b.position.set(14.76, 4.45 + yy, z);
      g.add(b);
    }
    const rm = new THREE.MeshBasicMaterial({ color: 0xffca8c, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const r = new THREE.Mesh(new THREE.PlaneGeometry(8, 17), rm);
    r.rotation.set(-.18, -.95, .05);
    r.position.set(8.8, 3.5, z - 3.2);
    g.add(r);
    raios.push(rm);
  }
  cena.add(g);
  return { vidros, raios };
}

function fluorescentes(cena) {
  const matA = new THREE.MeshStandardMaterial({ color: 0xe5e1d6, emissive: QUENTE.clone(), emissiveIntensity: 1.32, roughness: .48 });
  const matB = matA.clone();
  const suporteMat = new THREE.MeshStandardMaterial({ color: 0x8e8e88, roughness: .72, metalness: .18 });
  const g = new THREE.Group();
  let i = 0;
  for (let z = 18; z >= -18; z -= 9) for (const x of [-6, 6]) {
    const suporte = new THREE.Mesh(new THREE.BoxGeometry(5.05, .1, .62), suporteMat);
    suporte.position.set(x, 8.01, z);
    g.add(suporte);
    const tubo = new THREE.Mesh(new THREE.BoxGeometry(4.75, .055, .28), i++ % 3 === 0 ? matB : matA);
    tubo.position.set(x, 7.95, z);
    g.add(tubo);
  }
  cena.add(g);
  return { matA, matB };
}

function ponto(cena) {
  const g = new THREE.Group();
  g.position.set(-11.8, 2.1, -29.2);
  g.scale.setScalar(.001);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, .38), new THREE.MeshStandardMaterial({ color: 0x292e30, roughness: .52, metalness: .32 })));
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(.95, .46), new THREE.MeshStandardMaterial({ color: 0x14272b, emissive: 0x58b6a9, emissiveIntensity: .58, roughness: .16 }));
  tela.position.set(0, .46, .2);
  g.add(tela);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x873d37 });
  const led = new THREE.Mesh(new THREE.CircleGeometry(.08, 16), ledMat);
  led.position.set(.46, -.55, .205);
  g.add(led);
  cena.add(g);
  return { g, ledMat };
}

function porta(cena) {
  const brilhoMat = new THREE.MeshBasicMaterial({ color: 0xffd19a, transparent: true, opacity: 0 });
  const brilho = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 5.5), brilhoMat);
  brilho.position.set(-10.8, 2.75, -29.42);
  cena.add(brilho);
  const mold = new THREE.Mesh(new THREE.BoxGeometry(3.35, 5.75, .2), new THREE.MeshStandardMaterial({ color: 0x37342f, roughness: .84 }));
  mold.position.set(-10.8, 2.87, -29.45);
  cena.add(mold);
  const fundoMat = brilhoMat.clone();
  fundoMat.opacity = .05;
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 5.2), fundoMat);
  fundo.position.set(-10.8, 2.7, -29.31);
  cena.add(fundo);
  const pivo = new THREE.Group();
  pivo.position.set(-12.17, .1, -29.24);
  const d = new THREE.Mesh(new THREE.BoxGeometry(2.72, 5.18, .13), new THREE.MeshStandardMaterial({ color: 0x695744, roughness: .83 }));
  d.geometry.translate(1.36, 2.59, 0);
  pivo.add(d);
  const macaneta = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), new THREE.MeshStandardMaterial({ color: 0x71685a, roughness: .3, metalness: .72 }));
  macaneta.position.set(2.42, 2.55, .12);
  pivo.add(macaneta);
  cena.add(pivo);
  return { pivo, brilhoMat, fundoMat };
}

function poeira(cena, n) {
  const rnd = random(33017);
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    p[i * 3] = (rnd() - .5) * 28;
    p[i * 3 + 1] = .5 + rnd() * 7.2;
    p[i * 3 + 2] = -27 + rnd() * 54;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const mat = new THREE.PointsMaterial({ color: 0xe9deca, size: .04, transparent: true, opacity: .18, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  cena.add(pts);
  return { pts, mat };
}

export function criarCena(canvas) {
  const cfg = configuracao();
  let dpr = Math.min(devicePixelRatio, cfg.dprMax);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !cfg.leve, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0x252522);
  cena.fog = new THREE.Fog(0x343430, 24, 78);
  const camera = new THREE.PerspectiveCamera(innerWidth < 600 ? 50 : 44, innerWidth / innerHeight, .1, 130);
  camera.position.set(0, 4.2, 24);
  const ambienteSala = sala(cena);
  const desks = carteiras(cena);
  const pcs = monitores(cena, desks.base);
  const boards = quadros(cena);
  const clock = relogio(cena);
  const windows = janelas(cena);
  const lamps = fluorescentes(cena);
  const punch = ponto(cena);
  const door = porta(cena);
  const dust = poeira(cena, cfg.poeira);
  const hemi = new THREE.HemisphereLight(0xc9c2af, 0x3d3b36, 1.12);
  cena.add(hemi);
  const sol = new THREE.DirectionalLight(0xffddb0, 1.02);
  sol.position.set(9, 12, 18);
  cena.add(sol);
  const frio = new THREE.PointLight(0xc9dded, 0, 42, 1.5);
  frio.position.set(0, 7.2, -5);
  cena.add(frio);
  const portaLuz = new THREE.PointLight(0xffbf78, 0, 34, 1.7);
  portaLuz.position.set(-10, 3.3, -24);
  cena.add(portaLuz);
  const dummy = new THREE.Object3D();
  const camAtual = camera.position.clone();
  const alvoAtual = new THREE.Vector3(0, 2.5, -8);
  const inicio = performance.now() * .001;
  let ultimo = inicio, frames = 0, soma = 0;
  const keys = [
    { p: 0, c: [0, 4.3, 24], a: [0, 2.4, -12] },
    { p: .2, c: [-1.5, 3.8, 15], a: [-2, 2.1, -10] },
    { p: .4, c: [1.6, 3.35, 6], a: [0, 2.25, -15] },
    { p: .62, c: [-1.2, 3.55, 1], a: [0, 2.7, -21] },
    { p: .8, c: [2.2, 3.7, -5], a: [-1.5, 2.8, -25] },
    { p: 1, c: [-4.8, 3.6, -12], a: [-10.4, 2.8, -29] }
  ];
  function cameraAlvo(p, ponteiro, tempo) {
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) if (p >= keys[i].p && p <= keys[i + 1].p) { a = keys[i]; b = keys[i + 1]; break; }
    const t = suave(a.p, b.p, p);
    const rx = Math.sin(tempo * .23) * .025 + Math.sin(tempo * .071) * .018;
    const ry = Math.sin(tempo * .18 + 1.3) * .017;
    return {
      c: new THREE.Vector3(mix(a.c[0], b.c[0], t) + ponteiro.x * .72 + rx, mix(a.c[1], b.c[1], t) + ponteiro.y * .36 + ry, mix(a.c[2], b.c[2], t)),
      a: new THREE.Vector3(mix(a.a[0], b.a[0], t) + ponteiro.x * .35, mix(a.a[1], b.a[1], t) + ponteiro.y * .18, mix(a.a[2], b.a[2], t))
    };
  }
  function atualizarMonitores(p) {
    const t = suave(.48, .69, p);
    const abrir = suave(.86, 1, p);
    const escala = Math.max(.001, t * (1 - abrir * .96));
    for (let i = 0; i < pcs.n; i++) {
      const b = pcs.base[i];
      const variacao = 1 + ((i % 5) - 2) * .008;
      dummy.scale.set(escala * variacao, escala * variacao, escala * variacao);
      dummy.rotation.set(0, b.rot + ((i % 4) - 1.5) * .01, 0);
      dummy.position.set(b.x, 2.34 + b.altura, b.z - .12);
      dummy.updateMatrix(); pcs.corpo.setMatrixAt(i, dummy.matrix);
      dummy.position.set(b.x, 2.35 + b.altura, b.z - .215);
      dummy.updateMatrix(); pcs.tela.setMatrixAt(i, dummy.matrix);
      dummy.position.set(b.x, 1.91 + b.altura, b.z - .12);
      dummy.updateMatrix(); pcs.haste.setMatrixAt(i, dummy.matrix);
      dummy.position.set(b.x, 1.755 + b.altura, b.z + .34);
      dummy.scale.set(escala * 1.05, escala, escala * .95);
      dummy.rotation.set(0, b.rot, 0);
      dummy.updateMatrix(); pcs.teclado.setMatrixAt(i, dummy.matrix);
    }
    [pcs.corpo, pcs.tela, pcs.haste, pcs.teclado].forEach(m => m.instanceMatrix.needsUpdate = true);
    dummy.scale.set(1, 1, 1);
    desks.papelMat.opacity = 1 - suave(.34, .57, p);
  }
  function atualizarRelogio(p) {
    const ini = 6 * 60 + 48, fim = 18 * 60 + 46;
    const total = mix(ini, fim, suave(0, .86, p));
    const min = total % 60, h = (total / 60) % 12;
    clock.m.rotation.z = -min / 60 * Math.PI * 2;
    clock.h.rotation.z = -h / 12 * Math.PI * 2;
  }
  function ambiente(p, tempo) {
    const trab = suave(.46, .72, p), abrir = suave(.84, 1, p);
    const flickerA = Math.sin(tempo * 37.7) * .035 + Math.sin(tempo * 19.3) * .018;
    const falha = Math.sin(tempo * .67) > .997 ? -.35 : 0;
    ambienteSala.paredeMat.color.copy(BEGE).lerp(CINZA, trab * (1 - abrir * .8));
    cena.background.set(0x252522).lerp(new THREE.Color(0x1b2023), trab * .86).lerp(new THREE.Color(0x6b6255), abrir * .45);
    cena.fog.color.set(0x343430).lerp(new THREE.Color(0x293238), trab).lerp(new THREE.Color(0x9c8e79), abrir * .52);
    cena.fog.near = mix(24, 30, abrir);
    cena.fog.far = mix(78, 105, abrir);
    lamps.matA.emissive.copy(QUENTE).lerp(FRIO, trab);
    lamps.matB.emissive.copy(QUENTE).lerp(FRIO, trab);
    lamps.matA.emissiveIntensity = Math.max(.12, mix(1.28, 1.98, trab) * (1 - abrir * .78) + flickerA * trab);
    lamps.matB.emissiveIntensity = Math.max(.08, mix(1.18, 1.82, trab) * (1 - abrir * .82) + (flickerA + falha) * trab);
    hemi.color.copy(QUENTE).lerp(FRIO, trab).lerp(SOL, abrir);
    hemi.intensity = mix(1.1, 1.26, trab) + abrir * .58;
    sol.color.copy(QUENTE).lerp(FRIO, trab).lerp(SOL, abrir);
    sol.intensity = mix(1.0, .5, trab) + abrir * 1.34;
    frio.intensity = trab * 1.22 * (1 - abrir);
    portaLuz.intensity = abrir * 3.15;
    renderer.toneMappingExposure = mix(1.02, .93, trab) + abrir * .48 + Math.sin(tempo * .12) * .006;
    boards.escolaMat.opacity = 1 - suave(.48, .67, p);
    boards.trabalhoMat.opacity = suave(.5, .69, p) * (1 - abrir * .9);
    boards.trabalhoMat.emissiveIntensity = .13 + trab * .27;
    boards.po.material.opacity = .09 * (1 - suave(.45, .68, p));
    pcs.telaMat.emissiveIntensity = .06 + trab * .5 * (1 - abrir * .98) + Math.sin(tempo * 11.4) * .008 * trab;
    const ps = suave(.52, .64, p) * (1 - abrir * .88);
    punch.g.scale.setScalar(Math.max(.001, ps));
    punch.ledMat.color.set(tempo % 1 < .17 && trab > .45 ? 0xff5b4d : 0x873d37);
    door.pivo.rotation.y = -abrir * 1.28;
    door.brilhoMat.opacity = abrir * .88;
    door.fundoMat.opacity = .05 + abrir * .76;
    windows.vidros.forEach((v, i) => {
      v.opacity = mix(.32 + i * .012, .58 + i * .025, abrir);
      v.roughness = mix(.18 + i * .02, .11 + i * .015, abrir);
    });
    windows.raios.forEach((r, i) => r.opacity = abrir * (.045 + i * .012));
    dust.mat.opacity = .16 + abrir * .42;
    dust.pts.position.y = Math.sin(tempo * .17) * .05;
    dust.pts.rotation.y = Math.sin(tempo * .043) * .008;
  }
  function qualidade(delta) {
    soma += delta;
    frames++;
    if (frames < 90) return;
    const med = soma / frames;
    if (med > .025 && dpr > cfg.dprMin + .04) dpr = Math.max(cfg.dprMin, dpr - .08);
    else if (med < .017 && dpr < cfg.dprMax - .04) dpr = Math.min(cfg.dprMax, dpr + .04);
    renderer.setPixelRatio(dpr);
    frames = 0;
    soma = 0;
  }
  function atualizar(p, ponteiro) {
    const agora = performance.now() * .001;
    const delta = limitar(agora - ultimo, 0, .05);
    ultimo = agora;
    const tempo = agora - inicio;
    atualizarMonitores(p);
    atualizarRelogio(p);
    ambiente(p, tempo);
    const k = cameraAlvo(p, ponteiro, tempo);
    camAtual.lerp(k.c, .052);
    alvoAtual.lerp(k.a, .058);
    camera.position.copy(camAtual);
    camera.lookAt(alvoAtual);
    renderer.render(cena, camera);
    qualidade(delta);
    return { trabalho: suave(.46, .72, p), abertura: suave(.84, 1, p), relogio: tempo };
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
    const texturas = new Set();
    cena.traverse(o => {
      o.geometry?.dispose?.();
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mats.forEach(m => {
        Object.values(m).forEach(v => { if (v?.isTexture) texturas.add(v); });
        m.dispose?.();
      });
    });
    texturas.forEach(t => t.dispose());
    renderer.dispose();
  }
  return { atualizar, redimensionar, destruir };
}
