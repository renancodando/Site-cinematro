import * as THREE from 'three';

const BEGE = new THREE.Color(0xb8b3a8);
const CINZA = new THREE.Color(0x8f9696);
const QUENTE = new THREE.Color(0xffe2b7);
const FRIO = new THREE.Color(0xc8ddeb);
const SOL = new THREE.Color(0xffc781);

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
  return { leve, dprMin: leve ? .8 : .94, dprMax: leve ? 1.08 : 1.38, poeira: leve ? 150 : 320 };
}

function texturaParede() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const rnd = random(9137);
  x.fillStyle = '#b8b3a8';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1100; i++) {
    const t = 125 + Math.floor(rnd() * 65);
    x.fillStyle = `rgba(${t},${t},${Math.max(0, t - 7)},${.014 + rnd() * .032})`;
    x.fillRect(rnd() * 256, rnd() * 256, .5 + rnd() * 1.5, .5 + rnd() * 1.5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaPiso() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const rnd = random(4451);
  x.fillStyle = '#5f5c55';
  x.fillRect(0, 0, 256, 256);
  for (let yy = 0; yy < 256; yy += 32) {
    for (let xx = 0; xx < 256; xx += 32) {
      const t = 78 + Math.floor(rnd() * 15);
      x.fillStyle = `rgb(${t},${t - 1},${t - 5})`;
      x.fillRect(xx + 1, yy + 1, 30, 30);
      x.strokeStyle = 'rgba(22,22,21,.35)';
      x.strokeRect(xx + .5, yy + .5, 31, 31);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaMadeira() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const rnd = random(7781);
  x.fillStyle = '#8a7051';
  x.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    x.strokeStyle = `rgba(58,37,22,${.025 + rnd() * .025})`;
    x.beginPath();
    x.moveTo(0, y);
    x.bezierCurveTo(70, y + rnd() * 4, 170, y - rnd() * 4, 256, y + rnd() * 2);
    x.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaFolha() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 320;
  const x = c.getContext('2d');
  x.fillStyle = '#e8e4d9'; x.fillRect(0, 0, 256, 320);
  x.fillStyle = '#454541'; x.font = 'bold 13px Arial'; x.fillText('AVALIAÇÃO', 20, 27);
  x.font = '9px Arial'; x.fillText('nome: __________________________', 20, 47);
  x.strokeStyle = 'rgba(55,55,52,.25)';
  for (let y = 80; y < 286; y += 28) { x.beginPath(); x.moveTo(20, y); x.lineTo(234, y); x.stroke(); }
  x.strokeStyle = '#a34d43'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(188, 45); x.lineTo(228, 78); x.moveTo(228, 45); x.lineTo(188, 78); x.stroke();
  x.fillStyle = '#a34d43'; x.font = 'bold 20px Georgia'; x.fillText('6,0', 180, 105);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function quadroEscola() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 420;
  const x = c.getContext('2d'); const rnd = random(552);
  x.fillStyle = '#21362f'; x.fillRect(0, 0, 1024, 420);
  for (let i = 0; i < 850; i++) { x.fillStyle = `rgba(230,230,218,${rnd() * .022})`; x.fillRect(rnd() * 1024, rnd() * 420, 1 + rnd() * 3, 1); }
  x.fillStyle = 'rgba(240,237,224,.74)'; x.font = '30px Georgia'; x.fillText('aprender = perguntar', 58, 88);
  x.font = '20px Georgia'; x.fillText('por quê?', 58, 132);
  x.strokeStyle = 'rgba(240,237,224,.38)'; x.beginPath(); x.moveTo(58, 160); x.lineTo(442, 160); x.stroke();
  x.font = '18px Arial'; x.fillText('prova · 07:30', 58, 232); x.fillText('tempo · 50 min', 58, 266);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function quadroTrabalho() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 420;
  const x = c.getContext('2d');
  x.fillStyle = '#11191c'; x.fillRect(0, 0, 1024, 420);
  x.fillStyle = '#dbe5e7'; x.font = 'bold 23px Arial'; x.fillText('PAINEL — TURNO', 56, 62);
  x.fillStyle = '#92a4a9'; x.font = '14px Arial';
  x.fillText('META', 56, 122); x.fillText('PRAZO', 350, 122); x.fillText('PRODUÇÃO', 620, 122);
  x.fillStyle = '#eef5f4'; x.font = '42px Georgia';
  x.fillText('100%', 56, 184); x.fillText('18:00', 350, 184); x.fillText('87%', 620, 184);
  x.strokeStyle = '#a64d43'; x.lineWidth = 5; x.beginPath(); x.moveTo(56, 253); x.lineTo(884, 253); x.stroke();
  x.fillStyle = '#a64d43'; x.font = 'bold 18px Arial'; x.fillText('ATRASO', 56, 307);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function sala(cena) {
  const paredeMat = new THREE.MeshStandardMaterial({ color: BEGE.clone(), map: texturaParede(), roughness: .96 });
  const pisoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaPiso(), roughness: .84, metalness: .015 });
  const tetoMat = new THREE.MeshStandardMaterial({ color: 0xd2cfc6, roughness: .98 });
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), pisoMat); piso.rotation.x = -Math.PI / 2; cena.add(piso);
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), tetoMat); teto.rotation.x = Math.PI / 2; teto.position.y = 8.2; cena.add(teto);
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(30, 8.2), paredeMat); frente.position.set(0, 4.1, -30); cena.add(frente);
  const esq = new THREE.Mesh(new THREE.PlaneGeometry(60, 8.2), paredeMat.clone()); esq.rotation.y = Math.PI / 2; esq.position.set(-15, 4.1, 0); cena.add(esq);
  const dir = new THREE.Mesh(new THREE.PlaneGeometry(60, 8.2), paredeMat.clone()); dir.rotation.y = -Math.PI / 2; dir.position.set(15, 4.1, 0); cena.add(dir);
  return { paredeMat, pisoMat, tetoMat };
}

function carteiras(cena) {
  const madeira = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaMadeira(), roughness: .66 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x3c4040, roughness: .55, metalness: .45 });
  const plastico = new THREE.MeshStandardMaterial({ color: 0x52645d, roughness: .8 });
  const papelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texturaFolha(), roughness: .94, transparent: true, opacity: 1, side: THREE.DoubleSide });
  const xs = [-8.4, -3.1, 3.1, 8.4]; const zs = [15, 7, -1, -9, -17]; const n = xs.length * zs.length;
  const tampo = new THREE.InstancedMesh(new THREE.BoxGeometry(3.25, .16, 1.65), madeira, n);
  const pernas = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, 1.55, .1), metal, n * 4);
  const assento = new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, .12, 1.45), plastico, n);
  const encosto = new THREE.InstancedMesh(new THREE.BoxGeometry(1.85, 1.28, .11), plastico, n);
  const folhas = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.05, 1.34), papelMat, n);
  const base = []; const d = new THREE.Object3D(); let i = 0; let p = 0;
  for (const z of zs) for (const x of xs) {
    const rot = ((i % 3) - 1) * .008; base.push({ x, z, rot });
    d.position.set(x, 1.65, z); d.rotation.set(0, rot, 0); d.scale.set(1,1,1); d.updateMatrix(); tampo.setMatrixAt(i, d.matrix);
    for (const [ox, oz] of [[-1.38,-.68],[1.38,-.68],[-1.38,.68],[1.38,.68]]) { d.position.set(x+ox,.84,z+oz); d.rotation.set(0,0,0); d.updateMatrix(); pernas.setMatrixAt(p++,d.matrix); }
    d.position.set(x,.92,z+2.02); d.updateMatrix(); assento.setMatrixAt(i,d.matrix);
    d.position.set(x,1.72,z+2.66); d.updateMatrix(); encosto.setMatrixAt(i,d.matrix);
    d.position.set(x+.52,1.745,z-.06); d.rotation.set(-Math.PI/2,0,-.045+(i%4)*.019); d.updateMatrix(); folhas.setMatrixAt(i,d.matrix); i++;
  }
  [tampo,pernas,assento,encosto,folhas].forEach(m => { m.instanceMatrix.needsUpdate = true; cena.add(m); });
  return { base, n, papelMat };
}

function monitores(cena, base) {
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x252a2c, roughness: .48, metalness: .24 });
  const telaMat = new THREE.MeshStandardMaterial({ color: 0x182126, emissive: 0x7f9daa, emissiveIntensity: .08, roughness: .22 });
  const n = base.length;
  const corpo = new THREE.InstancedMesh(new THREE.BoxGeometry(1.82, 1.08, .16), corpoMat, n);
  const tela = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.58, .84), telaMat, n);
  const haste = new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.62,.12), corpoMat, n);
  cena.add(corpo,tela,haste);
  return { corpo,tela,haste,telaMat,base,n };
}

function quadros(cena) {
  const mold = new THREE.Mesh(new THREE.BoxGeometry(13.7,4.45,.18), new THREE.MeshStandardMaterial({color:0x403b32,roughness:.84})); mold.position.set(0,4.35,-29.64); cena.add(mold);
  const escolaMat = new THREE.MeshStandardMaterial({map:quadroEscola(),roughness:.93,transparent:true,opacity:1});
  const escola = new THREE.Mesh(new THREE.PlaneGeometry(13.15,3.95),escolaMat); escola.position.set(0,4.35,-29.52); cena.add(escola);
  const trabalhoMat = new THREE.MeshStandardMaterial({map:quadroTrabalho(),emissive:0x2a3940,emissiveIntensity:.16,roughness:.42,transparent:true,opacity:0});
  const trab = new THREE.Mesh(new THREE.PlaneGeometry(13.15,3.95),trabalhoMat); trab.position.set(0,4.35,-29.48); cena.add(trab);
  return {escolaMat,trabalhoMat};
}

function relogio(cena) {
  const g=new THREE.Group(); g.position.set(10.2,5.7,-29.37);
  const f=new THREE.Mesh(new THREE.CircleGeometry(1.05,40),new THREE.MeshStandardMaterial({color:0xe0dcd2,roughness:.85})); g.add(f);
  const aro=new THREE.Mesh(new THREE.RingGeometry(1.02,1.12,40),new THREE.MeshStandardMaterial({color:0x282a2a,roughness:.5,metalness:.35})); aro.position.z=.02; g.add(aro);
  const h=new THREE.Mesh(new THREE.BoxGeometry(.055,.58,.035),new THREE.MeshBasicMaterial({color:0x202020})); h.geometry.translate(0,-.25,0); h.position.z=.06; g.add(h);
  const m=new THREE.Mesh(new THREE.BoxGeometry(.04,.8,.03),new THREE.MeshBasicMaterial({color:0x202020})); m.geometry.translate(0,-.35,0); m.position.z=.065; g.add(m);
  const c=new THREE.Mesh(new THREE.CircleGeometry(.075,16),new THREE.MeshBasicMaterial({color:0xa04b41})); c.position.z=.08; g.add(c); cena.add(g); return {h,m};
}

function janelas(cena) {
  const g=new THREE.Group(); const mold=new THREE.MeshStandardMaterial({color:0x424543,roughness:.72,metalness:.16}); const vidros=[]; const raios=[];
  for(let i=0;i<4;i++){
    const z=14-i*12; const vm=new THREE.MeshBasicMaterial({color:0xb7c7c6,transparent:true,opacity:.4,side:THREE.DoubleSide});
    const v=new THREE.Mesh(new THREE.PlaneGeometry(5.8,4.25),vm); v.rotation.y=-Math.PI/2; v.position.set(14.91,4.45,z); g.add(v); vidros.push(vm);
    const vert=new THREE.Mesh(new THREE.BoxGeometry(.12,4.4,.12),mold); vert.position.set(14.76,4.45,z); g.add(vert);
    for(const yy of [-2.16,2.16]){const b=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,5.95),mold);b.position.set(14.76,4.45+yy,z);g.add(b);}
    const rm=new THREE.MeshBasicMaterial({color:0xffca8c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const r=new THREE.Mesh(new THREE.PlaneGeometry(8,17),rm); r.rotation.set(-.18,-.95,.05); r.position.set(8.8,3.5,z-3.2); g.add(r); raios.push(rm);
  }
  cena.add(g); return {vidros,raios};
}

function fluorescentes(cena) {
  const mat=new THREE.MeshStandardMaterial({color:0xe5e1d6,emissive:QUENTE.clone(),emissiveIntensity:1.35,roughness:.5}); const g=new THREE.Group();
  for(let z=18;z>=-18;z-=9) for(const x of [-6,6]){const l=new THREE.Mesh(new THREE.BoxGeometry(4.8,.08,.42),mat);l.position.set(x,8.05,z);g.add(l);} cena.add(g); return {mat,g};
}

function ponto(cena) {
  const g=new THREE.Group(); g.position.set(-11.8,2.1,-29.2); g.scale.setScalar(.001);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,2.3,.38),new THREE.MeshStandardMaterial({color:0x292e30,roughness:.5,metalness:.32})));
  const tela=new THREE.Mesh(new THREE.PlaneGeometry(.95,.46),new THREE.MeshStandardMaterial({color:0x14272b,emissive:0x58b6a9,emissiveIntensity:.58})); tela.position.set(0,.46,.2);g.add(tela);
  const ledMat=new THREE.MeshBasicMaterial({color:0x873d37}); const led=new THREE.Mesh(new THREE.CircleGeometry(.08,16),ledMat);led.position.set(.46,-.55,.205);g.add(led);cena.add(g);return {g,ledMat};
}

function porta(cena) {
  const brilhoMat=new THREE.MeshBasicMaterial({color:0xffd19a,transparent:true,opacity:0}); const brilho=new THREE.Mesh(new THREE.PlaneGeometry(3.1,5.5),brilhoMat);brilho.position.set(-10.8,2.75,-29.42);cena.add(brilho);
  const mold=new THREE.Mesh(new THREE.BoxGeometry(3.35,5.75,.2),new THREE.MeshStandardMaterial({color:0x37342f,roughness:.82}));mold.position.set(-10.8,2.87,-29.45);cena.add(mold);
  const fundoMat=brilhoMat.clone();fundoMat.opacity=.05;const fundo=new THREE.Mesh(new THREE.PlaneGeometry(2.85,5.2),fundoMat);fundo.position.set(-10.8,2.7,-29.31);cena.add(fundo);
  const pivo=new THREE.Group();pivo.position.set(-12.17,.1,-29.24);const d=new THREE.Mesh(new THREE.BoxGeometry(2.72,5.18,.13),new THREE.MeshStandardMaterial({color:0x6b5946,roughness:.8}));d.geometry.translate(1.36,2.59,0);pivo.add(d);cena.add(pivo);return {pivo,brilhoMat,fundoMat};
}

function poeira(cena,n) {
  const rnd=random(33017);const p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(rnd()-.5)*28;p[i*3+1]=.5+rnd()*7.2;p[i*3+2]=-27+rnd()*54;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));const mat=new THREE.PointsMaterial({color:0xe9deca,size:.045,transparent:true,opacity:.22,depthWrite:false});const pts=new THREE.Points(geo,mat);cena.add(pts);return {pts,mat};
}

export function criarCena(canvas) {
  const cfg=configuracao();let dpr=Math.min(devicePixelRatio,cfg.dprMax);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!cfg.leve,alpha:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight,false);
  const cena=new THREE.Scene();cena.background=new THREE.Color(0x252522);cena.fog=new THREE.Fog(0x353531,24,78);
  const camera=new THREE.PerspectiveCamera(innerWidth<600?50:44,innerWidth/innerHeight,.1,130);camera.position.set(0,4.2,24);
  const ambienteSala=sala(cena);const desks=carteiras(cena);const pcs=monitores(cena,desks.base);const boards=quadros(cena);const clock=relogio(cena);const windows=janelas(cena);const lamps=fluorescentes(cena);const punch=ponto(cena);const door=porta(cena);const dust=poeira(cena,cfg.poeira);

  const hemi=new THREE.HemisphereLight(0xc9c2af,0x3d3b36,1.18);cena.add(hemi);
  const sol=new THREE.DirectionalLight(0xffddb0,1.08);sol.position.set(9,12,18);cena.add(sol);
  const frio=new THREE.PointLight(0xc9dded,0,42,1.5);frio.position.set(0,7.2,-5);cena.add(frio);
  const portaLuz=new THREE.PointLight(0xffbf78,0,34,1.7);portaLuz.position.set(-10,3.3,-24);cena.add(portaLuz);

  const dummy=new THREE.Object3D();const camAtual=camera.position.clone();const alvoAtual=new THREE.Vector3(0,2.5,-8);const inicio=performance.now()*.001;let ultimo=inicio;let frames=0;let soma=0;
  const keys=[
    {p:0,c:[0,4.3,24],a:[0,2.4,-12]},{p:.2,c:[-1.5,3.8,15],a:[-2,2.1,-10]},{p:.4,c:[1.6,3.35,6],a:[0,2.25,-15]},
    {p:.62,c:[-1.2,3.55,1],a:[0,2.7,-21]},{p:.8,c:[2.2,3.7,-5],a:[-1.5,2.8,-25]},{p:1,c:[-4.8,3.6,-12],a:[-10.4,2.8,-29]}
  ];

  function cameraAlvo(p,ponteiro){let a=keys[0],b=keys[keys.length-1];for(let i=0;i<keys.length-1;i++)if(p>=keys[i].p&&p<=keys[i+1].p){a=keys[i];b=keys[i+1];break;}const t=suave(a.p,b.p,p);return{
    c:new THREE.Vector3(mix(a.c[0],b.c[0],t)+ponteiro.x*.72,mix(a.c[1],b.c[1],t)+ponteiro.y*.36,mix(a.c[2],b.c[2],t)),
    a:new THREE.Vector3(mix(a.a[0],b.a[0],t)+ponteiro.x*.35,mix(a.a[1],b.a[1],t)+ponteiro.y*.18,mix(a.a[2],b.a[2],t))};}

  function atualizarMonitores(p){const t=suave(.48,.69,p);const abrir=suave(.86,1,p);const escala=Math.max(.001,t*(1-abrir*.96));for(let i=0;i<pcs.n;i++){
    const b=pcs.base[i];dummy.scale.set(escala,escala,escala);dummy.rotation.set(0,0,0);
    dummy.position.set(b.x,2.34,b.z-.12);dummy.updateMatrix();pcs.corpo.setMatrixAt(i,dummy.matrix);
    dummy.position.set(b.x,2.35,b.z-.215);dummy.updateMatrix();pcs.tela.setMatrixAt(i,dummy.matrix);
    dummy.position.set(b.x,1.91,b.z-.12);dummy.updateMatrix();pcs.haste.setMatrixAt(i,dummy.matrix);
  }pcs.corpo.instanceMatrix.needsUpdate=true;pcs.tela.instanceMatrix.needsUpdate=true;pcs.haste.instanceMatrix.needsUpdate=true;dummy.scale.set(1,1,1);desks.papelMat.opacity=1-suave(.34,.57,p);}

  function atualizarRelogio(p){const ini=6*60+48,fim=18*60+46,total=mix(ini,fim,suave(0,.86,p)),min=total%60,h=(total/60)%12;clock.m.rotation.z=-min/60*Math.PI*2;clock.h.rotation.z=-h/12*Math.PI*2;}

  function ambiente(p,tempo){const trab=suave(.46,.72,p),abrir=suave(.84,1,p);ambienteSala.paredeMat.color.copy(BEGE).lerp(CINZA,trab*(1-abrir*.8));
    cena.background.set(0x252522).lerp(new THREE.Color(0x1b2023),trab*.86).lerp(new THREE.Color(0x6b6255),abrir*.45);cena.fog.color.set(0x353531).lerp(new THREE.Color(0x293238),trab).lerp(new THREE.Color(0x9c8e79),abrir*.52);cena.fog.near=mix(24,30,abrir);cena.fog.far=mix(78,105,abrir);
    lamps.mat.emissive.copy(QUENTE).lerp(FRIO,trab);lamps.mat.emissiveIntensity=mix(1.35,2.08,trab)*(1-abrir*.78);hemi.color.copy(QUENTE).lerp(FRIO,trab).lerp(SOL,abrir);hemi.intensity=mix(1.16,1.34,trab)+abrir*.58;sol.color.copy(QUENTE).lerp(FRIO,trab).lerp(SOL,abrir);sol.intensity=mix(1.06,.52,trab)+abrir*1.35;frio.intensity=trab*1.3*(1-abrir);portaLuz.intensity=abrir*3.2;renderer.toneMappingExposure=mix(1.05,.94,trab)+abrir*.5;
    boards.escolaMat.opacity=1-suave(.48,.67,p);boards.trabalhoMat.opacity=suave(.5,.69,p)*(1-abrir*.9);boards.trabalhoMat.emissiveIntensity=.15+trab*.28;pcs.telaMat.emissiveIntensity=.08+trab*.44*(1-abrir*.98);
    const ps=suave(.52,.64,p)*(1-abrir*.88);punch.g.scale.setScalar(Math.max(.001,ps));punch.ledMat.color.set(tempo%1<.17&&trab>.45?0xff5b4d:0x873d37);
    door.pivo.rotation.y=-abrir*1.28;door.brilhoMat.opacity=abrir*.88;door.fundoMat.opacity=.05+abrir*.76;windows.vidros.forEach(v=>v.opacity=mix(.4,.86,abrir));windows.raios.forEach((r,i)=>r.opacity=abrir*(.05+i*.012));dust.mat.opacity=.2+abrir*.34;dust.pts.position.y=Math.sin(tempo*.17)*.05;
  }

  function qualidade(delta){soma+=delta;frames++;if(frames<90)return;const med=soma/frames;if(med>.025&&dpr>cfg.dprMin+.04)dpr=Math.max(cfg.dprMin,dpr-.08);else if(med<.017&&dpr<cfg.dprMax-.04)dpr=Math.min(cfg.dprMax,dpr+.04);renderer.setPixelRatio(dpr);frames=0;soma=0;}

  function atualizar(p,ponteiro){const agora=performance.now()*.001,delta=limitar(agora-ultimo,0,.05);ultimo=agora;const tempo=agora-inicio;atualizarMonitores(p);atualizarRelogio(p);ambiente(p,tempo);const k=cameraAlvo(p,ponteiro);camAtual.lerp(k.c,.055);alvoAtual.lerp(k.a,.06);camera.position.copy(camAtual);camera.lookAt(alvoAtual);renderer.render(cena,camera);qualidade(delta);return{trabalho:suave(.46,.72,p),abertura:suave(.84,1,p),relogio:tempo};}
  function redimensionar(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<600?50:innerWidth>1800?41:44;camera.updateProjectionMatrix();dpr=Math.min(devicePixelRatio,cfg.dprMax);renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight,false);}
  function destruir(){cena.traverse(o=>{o.geometry?.dispose?.();const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];mats.forEach(m=>{Object.values(m).forEach(v=>v?.isTexture&&v.dispose());m.dispose?.();});});renderer.dispose();}
  return{atualizar,redimensionar,destruir};
}