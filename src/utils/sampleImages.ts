/**
 * Generates beautiful, artist-grade reference illustrations procedurally
 * using HTML Canvas so users can test immediately with zero external dependencies.
 */

export interface SampleImageItem {
  id: string;
  title: string;
  category: string;
  aspect: string;
  generate: () => string; // returns data URL
}

function createClassicalPortrait(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1250;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background deep sepia/charcoal gradient
  const bgGrad = ctx.createRadialGradient(500, 550, 80, 500, 625, 750);
  bgGrad.addColorStop(0, '#2a2622');
  bgGrad.addColorStop(0.5, '#191715');
  bgGrad.addColorStop(1, '#0e0d0c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 1250);

  // Soft studio key light halo behind bust
  const halo = ctx.createRadialGradient(420, 480, 20, 420, 480, 380);
  halo.addColorStop(0, 'rgba(215, 195, 170, 0.18)');
  halo.addColorStop(0.6, 'rgba(180, 155, 130, 0.06)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 1000, 1250);

  // Pedestal base
  ctx.fillStyle = '#221f1c';
  ctx.beginPath();
  ctx.roundRect(320, 1060, 360, 140, [12, 12, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#3d3832';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Torso / Shoulders silhouette (classical bust)
  ctx.beginPath();
  ctx.moveTo(500, 750);
  // Left shoulder
  ctx.bezierCurveTo(420, 780, 280, 840, 220, 950);
  ctx.bezierCurveTo(200, 990, 240, 1040, 320, 1050);
  ctx.lineTo(680, 1050);
  ctx.bezierCurveTo(760, 1040, 800, 990, 780, 950);
  ctx.bezierCurveTo(720, 840, 580, 780, 500, 750);
  ctx.closePath();

  const bustGrad = ctx.createLinearGradient(250, 800, 750, 1050);
  bustGrad.addColorStop(0, '#dfd5c6');
  bustGrad.addColorStop(0.35, '#a89c8d');
  bustGrad.addColorStop(0.7, '#4a4239');
  bustGrad.addColorStop(1, '#231e1a');
  ctx.fillStyle = bustGrad;
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.moveTo(430, 600);
  ctx.quadraticCurveTo(420, 720, 380, 770);
  ctx.lineTo(620, 770);
  ctx.quadraticCurveTo(580, 720, 570, 600);
  ctx.closePath();
  const neckGrad = ctx.createLinearGradient(400, 650, 600, 750);
  neckGrad.addColorStop(0, '#f0e6d6');
  neckGrad.addColorStop(0.45, '#b9ad9d');
  neckGrad.addColorStop(1, '#3a332c');
  ctx.fillStyle = neckGrad;
  ctx.fill();

  // Head oval & classical jawline
  ctx.save();
  ctx.translate(500, 480);
  ctx.rotate(-0.04);

  // Base head shape
  ctx.beginPath();
  ctx.moveTo(0, -220); // Top of head
  ctx.bezierCurveTo(140, -220, 170, -100, 160, 20); // Right cranium & cheek
  ctx.bezierCurveTo(150, 110, 100, 180, 40, 220); // Right jaw to chin
  ctx.bezierCurveTo(10, 230, -30, 230, -50, 220); // Chin
  ctx.bezierCurveTo(-110, 180, -150, 100, -160, 20); // Left jaw
  ctx.bezierCurveTo(-170, -100, -140, -220, 0, -220); // Left cranium
  ctx.closePath();

  const headGrad = ctx.createLinearGradient(-120, -150, 140, 150);
  headGrad.addColorStop(0, '#fbf4ea');
  headGrad.addColorStop(0.3, '#d8cbba');
  headGrad.addColorStop(0.65, '#7d7062');
  headGrad.addColorStop(1, '#2c2621');
  ctx.fillStyle = headGrad;
  ctx.fill();

  // Chiaroscuro shadow side (right side cast shadow)
  ctx.beginPath();
  ctx.moveTo(-10, -200);
  ctx.bezierCurveTo(30, -120, 30, -50, 10, -20); // Brow ridge to nose root
  ctx.lineTo(45, 40); // Nose tip
  ctx.lineTo(15, 60); // Under nose
  ctx.lineTo(35, 110); // Lips
  ctx.lineTo(15, 135);
  ctx.bezierCurveTo(20, 170, 50, 190, 40, 220);
  ctx.bezierCurveTo(100, 180, 150, 110, 160, 20);
  ctx.bezierCurveTo(170, -100, 140, -220, 0, -220);
  ctx.closePath();
  ctx.fillStyle = 'rgba(25, 20, 18, 0.65)';
  ctx.fill();

  // Classical hair volume (curls and sculptural waves)
  ctx.fillStyle = '#4a4036';
  for (let i = 0; i < 9; i++) {
    const angle = -Math.PI * 0.85 + (i * Math.PI * 0.8) / 8;
    const r = 180 + (i % 2 === 0 ? 15 : -10);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r * 0.9 - 30;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  // Refined eye sockets, nose, and lips (academic study lines)
  ctx.fillStyle = '#26201b';
  // Left eye (illuminated)
  ctx.beginPath();
  ctx.ellipse(-65, -15, 22, 10, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#615446';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Right eye (in shadow)
  ctx.beginPath();
  ctx.ellipse(65, -15, 20, 9, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Nose shadow & bridge
  ctx.beginPath();
  ctx.moveTo(-5, -35);
  ctx.lineTo(-12, 42);
  ctx.lineTo(25, 42);
  ctx.lineTo(18, 28);
  ctx.closePath();
  ctx.fillStyle = '#615243';
  ctx.fill();

  // Highlights on forehead, nose tip, cheekbone
  const highlight = ctx.createRadialGradient(-70, -80, 5, -70, -80, 60);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.arc(-70, -80, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Subtle academic hatch texture overlay
  ctx.strokeStyle = 'rgba(220, 200, 180, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 100; y < 1150; y += 8) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(900, y + 25);
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

function createStillLife(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Dark warm background
  const bg = ctx.createLinearGradient(0, 0, 1200, 900);
  bg.addColorStop(0, '#1c1815');
  bg.addColorStop(0.5, '#26201a');
  bg.addColorStop(1, '#110f0e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 900);

  // Table surface with perspective edge
  ctx.fillStyle = '#3a2d24';
  ctx.beginPath();
  ctx.moveTo(0, 580);
  ctx.lineTo(1200, 580);
  ctx.lineTo(1200, 900);
  ctx.lineTo(0, 900);
  ctx.closePath();
  ctx.fill();

  // Wood grain & table rim highlight
  ctx.strokeStyle = '#5a4638';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 580);
  ctx.lineTo(1200, 580);
  ctx.stroke();

  // Drapery / Linen cloth draped over left table
  ctx.fillStyle = '#c5b8a5';
  ctx.beginPath();
  ctx.moveTo(140, 540);
  ctx.bezierCurveTo(240, 540, 380, 590, 480, 600);
  ctx.bezierCurveTo(460, 720, 420, 820, 400, 880);
  ctx.lineTo(120, 880);
  ctx.bezierCurveTo(110, 780, 120, 660, 140, 540);
  ctx.closePath();
  ctx.fill();

  // Drapery folds
  ctx.fillStyle = '#8f806d';
  ctx.beginPath();
  ctx.moveTo(250, 560);
  ctx.bezierCurveTo(280, 680, 290, 780, 270, 880);
  ctx.lineTo(310, 880);
  ctx.bezierCurveTo(340, 760, 320, 640, 290, 570);
  ctx.closePath();
  ctx.fill();

  // Ceramic Pitcher (Main subject)
  // Cast shadow
  ctx.fillStyle = 'rgba(15, 12, 10, 0.7)';
  ctx.beginPath();
  ctx.ellipse(660, 640, 160, 45, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Pitcher body
  const pitcherGrad = ctx.createLinearGradient(480, 300, 780, 620);
  pitcherGrad.addColorStop(0, '#eae2d6'); // highlight left
  pitcherGrad.addColorStop(0.3, '#bfb19f');
  pitcherGrad.addColorStop(0.7, '#6b5e50');
  pitcherGrad.addColorStop(1, '#2c251f'); // shadow right

  ctx.fillStyle = pitcherGrad;
  ctx.beginPath();
  // Spout & rim
  ctx.moveTo(540, 220);
  ctx.bezierCurveTo(580, 200, 660, 200, 700, 220);
  ctx.lineTo(680, 290);
  // Belly
  ctx.bezierCurveTo(770, 360, 800, 480, 750, 580);
  ctx.bezierCurveTo(720, 630, 580, 640, 540, 600);
  ctx.bezierCurveTo(490, 520, 480, 380, 560, 290);
  ctx.closePath();
  ctx.fill();

  // Pitcher handle
  ctx.strokeStyle = '#857463';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(700, 240);
  ctx.bezierCurveTo(830, 270, 840, 420, 740, 480);
  ctx.stroke();

  // Fruit 1: Golden Pear (center-left)
  ctx.fillStyle = 'rgba(15, 12, 10, 0.6)';
  ctx.beginPath();
  ctx.ellipse(440, 670, 75, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  const pearGrad = ctx.createRadialGradient(420, 600, 10, 440, 630, 90);
  pearGrad.addColorStop(0, '#f2df77');
  pearGrad.addColorStop(0.4, '#c9a838');
  pearGrad.addColorStop(0.8, '#69551c');
  pearGrad.addColorStop(1, '#2a2007');
  ctx.fillStyle = pearGrad;
  ctx.beginPath();
  ctx.moveTo(430, 530);
  ctx.bezierCurveTo(450, 530, 480, 570, 500, 620);
  ctx.bezierCurveTo(510, 670, 450, 690, 420, 685);
  ctx.bezierCurveTo(370, 680, 360, 610, 410, 560);
  ctx.closePath();
  ctx.fill();

  // Fruit 2 & 3: Deep red apples / pomegranates
  const apple1 = ctx.createRadialGradient(780, 610, 10, 800, 640, 75);
  apple1.addColorStop(0, '#f45c43');
  apple1.addColorStop(0.4, '#a71d2a');
  apple1.addColorStop(0.85, '#4e0a12');
  apple1.addColorStop(1, '#1b0205');
  ctx.fillStyle = apple1;
  ctx.beginPath();
  ctx.arc(800, 630, 68, 0, Math.PI * 2);
  ctx.fill();

  const apple2 = ctx.createRadialGradient(900, 630, 8, 920, 650, 65);
  apple2.addColorStop(0, '#e57373');
  apple2.addColorStop(0.4, '#8b1e25');
  apple2.addColorStop(1, '#220407');
  ctx.fillStyle = apple2;
  ctx.beginPath();
  ctx.arc(915, 645, 56, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

function createArchitecturalPerspective(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sky / distant ambient light
  const sky = ctx.createLinearGradient(0, 0, 0, 800);
  sky.addColorStop(0, '#2b3a4a');
  sky.addColorStop(0.5, '#7b8c9d');
  sky.addColorStop(1, '#d8dfd5');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 800);

  // Central vanishing point for perspective drawing
  const vpX = 600;
  const vpY = 430;

  // Stone floor with receding perspective lines
  ctx.fillStyle = '#645d56';
  ctx.beginPath();
  ctx.moveTo(0, 600);
  ctx.lineTo(1200, 600);
  ctx.lineTo(1200, 800);
  ctx.lineTo(0, 800);
  ctx.closePath();
  ctx.fill();

  // Perspective tiles on floor
  ctx.strokeStyle = '#433d37';
  ctx.lineWidth = 2;
  for (let x = -400; x <= 1600; x += 120) {
    ctx.beginPath();
    ctx.moveTo(vpX, vpY + 80);
    ctx.lineTo(x, 800);
    ctx.stroke();
  }

  // Receding horizontal floor lines
  for (let t = 0.1; t <= 1; t += 0.12) {
    const y = 430 + (800 - 430) * Math.pow(t, 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // Colonnade arches (3 pairs of arches receding into perspective)
  const arches = [
    { leftX: 100, rightX: 1100, topY: 100, height: 520, width: 90 },
    { leftX: 280, rightX: 920, topY: 220, height: 400, width: 65 },
    { leftX: 420, rightX: 780, topY: 310, height: 310, width: 45 },
  ];

  arches.forEach((arch, idx) => {
    // Left column
    ctx.fillStyle = idx === 0 ? '#38322c' : idx === 1 ? '#4d463f' : '#696058';
    ctx.fillRect(arch.leftX, arch.topY + 120, arch.width, arch.height);
    // Right column
    ctx.fillRect(arch.rightX - arch.width, arch.topY + 120, arch.width, arch.height);

    // Arch vault span
    ctx.beginPath();
    ctx.moveTo(arch.leftX, arch.topY + 140);
    ctx.bezierCurveTo(arch.leftX, arch.topY, arch.rightX, arch.topY, arch.rightX, arch.topY + 140);
    ctx.lineWidth = arch.width;
    ctx.strokeStyle = idx === 0 ? '#433c36' : idx === 1 ? '#5c544c' : '#787067';
    ctx.stroke();
  });

  // Distant glowing arch portal with warm light
  const sunGlow = ctx.createRadialGradient(vpX, vpY - 20, 10, vpX, vpY - 20, 200);
  sunGlow.addColorStop(0, '#fff6dd');
  sunGlow.addColorStop(0.5, '#e5c48b');
  sunGlow.addColorStop(1, 'rgba(210, 180, 140, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(vpX - 200, vpY - 220, 400, 400);

  return canvas.toDataURL('image/png');
}

function createMountainLandscape(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sky gradient with dawn warm glow
  const sky = ctx.createLinearGradient(0, 0, 0, 450);
  sky.addColorStop(0, '#1d263b');
  sky.addColorStop(0.4, '#394d6d');
  sky.addColorStop(0.75, '#8c7b83');
  sky.addColorStop(1, '#e8b894');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 750);

  // Soft morning sun
  ctx.fillStyle = '#fff4df';
  ctx.beginPath();
  ctx.arc(720, 280, 55, 0, Math.PI * 2);
  ctx.fill();

  // Distant mountain ridge (pale blue/violet aerial perspective)
  ctx.fillStyle = '#7a768c';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.lineTo(240, 310);
  ctx.lineTo(460, 380);
  ctx.lineTo(720, 250);
  ctx.lineTo(950, 340);
  ctx.lineTo(1200, 270);
  ctx.lineTo(1200, 750);
  ctx.lineTo(0, 750);
  ctx.closePath();
  ctx.fill();

  // Midground mountain ridge (richer slate)
  ctx.fillStyle = '#42495d';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.lineTo(180, 410);
  ctx.lineTo(390, 490);
  ctx.lineTo(600, 360);
  ctx.lineTo(840, 440);
  ctx.lineTo(1100, 380);
  ctx.lineTo(1200, 420);
  ctx.lineTo(1200, 750);
  ctx.lineTo(0, 750);
  ctx.closePath();
  ctx.fill();

  // Misty valley layer
  const mist = ctx.createLinearGradient(0, 460, 0, 560);
  mist.addColorStop(0, 'rgba(235, 220, 210, 0.45)');
  mist.addColorStop(1, 'rgba(235, 220, 210, 0)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, 460, 1200, 100);

  // Foreground dark pine ridges
  ctx.fillStyle = '#18241e';
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.lineTo(250, 490);
  ctx.lineTo(520, 580);
  ctx.lineTo(850, 510);
  ctx.lineTo(1200, 600);
  ctx.lineTo(1200, 750);
  ctx.lineTo(0, 750);
  ctx.closePath();
  ctx.fill();

  // Alpine lake reflection
  const lake = ctx.createLinearGradient(0, 620, 0, 750);
  lake.addColorStop(0, '#223841');
  lake.addColorStop(1, '#0e1c22');
  ctx.fillStyle = lake;
  ctx.fillRect(0, 620, 1200, 130);

  // Silhouetted pine trees on bottom-left
  ctx.fillStyle = '#0a120e';
  const pines = [60, 110, 160, 210, 280, 950, 1020, 1090];
  pines.forEach((px) => {
    const height = 110 + (px % 40);
    ctx.beginPath();
    ctx.moveTo(px, 750 - height);
    ctx.lineTo(px - 22, 750);
    ctx.lineTo(px + 22, 750);
    ctx.closePath();
    ctx.fill();
  });

  return canvas.toDataURL('image/png');
}

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'classical_portrait',
    title: 'Classical Sculpture & Anatomy',
    category: 'Portrait & Tone',
    aspect: '4:5',
    generate: createClassicalPortrait,
  },
  {
    id: 'renaissance_still_life',
    title: 'Still Life with Pitcher & Fruit',
    category: 'Chiaroscuro & Forms',
    aspect: '4:3',
    generate: createStillLife,
  },
  {
    id: 'architectural_arches',
    title: 'Architectural Colonnade & Vaults',
    category: 'Perspective & Line',
    aspect: '3:2',
    generate: createArchitecturalPerspective,
  },
  {
    id: 'mountain_valley',
    title: 'Alpine Ridge & Morning Mist',
    category: 'Atmospheric Landscape',
    aspect: '16:10',
    generate: createMountainLandscape,
  },
];
