import * as THREE from 'three';

// -------------------------------------------------------------
// Deterministic Fast Simplex/Perlin-style 2D Noise Implementation
// -------------------------------------------------------------
class FastNoise {
  constructor(seed = 1337) {
    this.p = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;

    // Linear Congruential Generator for reproducible seed
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      const tmp = perm[i];
      perm[i] = perm[j];
      perm[j] = tmp;
    }

    for (let i = 0; i < 512; i++) {
      this.p[i] = perm[i & 255];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.p[this.p[X] + Y];
    const ab = this.p[this.p[X] + Y + 1];
    const ba = this.p[this.p[X + 1] + Y];
    const bb = this.p[this.p[X + 1] + Y + 1];

    const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
    const x2 = this.lerp(u, this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1));

    return (this.lerp(v, x1, x2) + 1) * 0.5; // Normalized to [0, 1]
  }

  // Fractal Brownian Motion (fBm)
  fbm(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  // Turbulent noise (absolute value creases)
  turbulence(x, y, octaves = 4) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const n = Math.abs(this.noise2D(x * frequency, y * frequency) * 2 - 1);
      total += n * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return total / maxValue;
  }
}

const noise = new FastNoise(42);
const textureCache = new Map();

// Helper to convert offscreen canvas to optimized Three.js CanvasTexture
function toTexture(canvas, wrapRepeat = false) {
  const texture = new THREE.CanvasTexture(canvas);
  if (wrapRepeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  } else {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// -------------------------------------------------------------
// 1. SUN TEXTURE (Turbulent Convective Granules & Solar Flare Cells)
// -------------------------------------------------------------
export function getSunTexture() {
  if (textureCache.has('sun')) return textureCache.get('sun');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Multi-layer turbulent convective cells
      const n1 = noise.fbm(nx * 14, ny * 7, 5, 0.55);
      const n2 = noise.turbulence(nx * 26 + n1 * 2, ny * 13 + n1 * 2, 4);
      const blend = n1 * 0.6 + n2 * 0.4;

      // Sunspot simulation at mid-latitudes
      const latDist = Math.abs(ny - 0.5);
      let sunspot = 0;
      if (latDist > 0.1 && latDist < 0.28) {
        const spotNoise = noise.noise2D(nx * 8 + 10, ny * 8 + 10);
        if (spotNoise > 0.78) {
          sunspot = (spotNoise - 0.78) * 4.5;
        }
      }

      // Fiery plasma color ramp: White-yellow -> Bright gold -> Deep orange -> Dark red
      let r, g, b;
      if (blend > 0.65) {
        // Hot bright granules
        const t = (blend - 0.65) / 0.35;
        r = Math.min(255, 255);
        g = Math.min(255, Math.floor(220 + t * 35));
        b = Math.floor(120 + t * 135);
      } else if (blend > 0.35) {
        // Golden plasma
        const t = (blend - 0.35) / 0.3;
        r = Math.floor(255);
        g = Math.floor(130 + t * 90);
        b = Math.floor(20 + t * 100);
      } else {
        // Deep solar vortices
        const t = blend / 0.35;
        r = Math.floor(180 + t * 75);
        g = Math.floor(40 + t * 90);
        b = Math.floor(5 + t * 15);
      }

      // Darken for sunspot
      if (sunspot > 0) {
        const factor = Math.max(0.15, 1 - sunspot);
        r = Math.floor(r * factor);
        g = Math.floor(g * factor * 0.6);
        b = Math.floor(b * factor * 0.3);
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('sun', texture);
  return texture;
}

// -------------------------------------------------------------
// 2. MERCURY TEXTURE & BUMP (Desolate Regolith, Maria & Impact Craters)
// -------------------------------------------------------------
export function getMercuryTexture() {
  if (textureCache.has('mercury')) return textureCache.get('mercury');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Base rocky terrain
  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      const n1 = noise.fbm(nx * 10, ny * 5, 5, 0.5);
      const n2 = noise.noise2D(nx * 40, ny * 20);
      const roughness = n1 * 0.75 + n2 * 0.25;

      // Dusty brownish-grey tone
      const base = 110 + roughness * 70;
      data[idx] = Math.floor(base * 1.05); // slight warm brown tint
      data[idx + 1] = Math.floor(base * 0.98);
      data[idx + 2] = Math.floor(base * 0.92);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Stamp realistic rayed impact craters
  const rng = new FastNoise(999);
  for (let i = 0; i < 90; i++) {
    const cx = (rng.noise2D(i * 3.7, 12.3) * width) % width;
    const cy = (rng.noise2D(84.1, i * 4.9) * height) % height;
    const rad = 4 + rng.noise2D(i * 1.1, i * 2.2) * 28;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grad.addColorStop(0, 'rgba(45, 42, 40, 0.75)'); // crater floor
    grad.addColorStop(0.7, 'rgba(75, 70, 68, 0.6)');
    grad.addColorStop(0.88, 'rgba(215, 210, 205, 0.85)'); // raised rim
    grad.addColorStop(1, 'rgba(140, 135, 130, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();

    // Ejecta rays on larger craters
    if (rad > 14) {
      ctx.strokeStyle = 'rgba(210, 205, 200, 0.25)';
      ctx.lineWidth = 1.2;
      for (let ray = 0; ray < 8; ray++) {
        const angle = ray * (Math.PI / 4) + rng.noise2D(i, ray) * 0.5;
        const rayLen = rad * (1.6 + rng.noise2D(ray, i) * 1.4);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
        ctx.stroke();
      }
    }
  }

  const texture = toTexture(canvas, true);
  textureCache.set('mercury', texture);
  return texture;
}

export function getMercuryBump() {
  if (textureCache.has('mercury_bump')) return textureCache.get('mercury_bump');

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const n = noise.fbm((x / width) * 12, (y / height) * 6, 4);
      const val = Math.floor(n * 255);
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('mercury_bump', texture);
  return texture;
}

// -------------------------------------------------------------
// 3. VENUS TEXTURE (Swirling Sulfuric Acid Cloud Decks & Chevrons)
// -------------------------------------------------------------
export function getVenusTexture() {
  if (textureCache.has('venus')) return textureCache.get('venus');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Zonal horizontal shear + chevron distortion
      const wave = Math.sin(nx * Math.PI * 4 + ny * 6) * 0.04;
      const chevron = Math.abs(ny - 0.5) * 0.15;
      const n1 = noise.fbm((nx + wave) * 8, (ny + chevron) * 6, 5, 0.55);
      const n2 = noise.turbulence(nx * 16, ny * 12, 3);
      const val = n1 * 0.7 + n2 * 0.3;

      // Warm creamy-amber sulfuric acid cloud layers
      const r = Math.floor(225 + val * 30);
      const g = Math.floor(185 + val * 45);
      const b = Math.floor(115 + val * 45);

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('venus', texture);
  return texture;
}

// -------------------------------------------------------------
// 4. EARTH TEXTURES (Continents, Oceans, Polar Caps, Clouds & Night Lights)
// -------------------------------------------------------------
export function getEarthTexture() {
  if (textureCache.has('earth')) return textureCache.get('earth');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height; // 0 (North Pole) to 1 (South Pole)
    const lat = Math.abs(ny - 0.5) * 2; // 0 at equator, 1 at poles

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Multi-octave continent elevation
      const elev = noise.fbm(nx * 5, ny * 4, 6, 0.52);

      // Polar Ice Caps
      if (lat > 0.85) {
        const iceNoise = noise.noise2D(nx * 15, ny * 15);
        if (lat + iceNoise * 0.12 > 0.88) {
          data[idx] = 245;
          data[idx + 1] = 250;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
          continue;
        }
      }

      if (elev > 0.48) {
        // LANDMASS
        const landFactor = (elev - 0.48) / 0.52;
        if (landFactor > 0.45) {
          // Mountains & arid plateaus
          const m = (landFactor - 0.45) / 0.55;
          data[idx] = Math.floor(135 + m * 55);
          data[idx + 1] = Math.floor(115 + m * 50);
          data[idx + 2] = Math.floor(95 + m * 45);
        } else if (lat < 0.35 && landFactor < 0.2) {
          // Sahara / desert belt
          data[idx] = 195;
          data[idx + 1] = 168;
          data[idx + 2] = 118;
        } else {
          // Lush forest & grasslands
          data[idx] = Math.floor(45 + landFactor * 40);
          data[idx + 1] = Math.floor(105 + landFactor * 45);
          data[idx + 2] = Math.floor(40 + landFactor * 30);
        }
      } else {
        // OCEANS & CONTINENTAL SHELF
        const depth = elev / 0.48;
        if (depth > 0.88) {
          // Coastal shallow turquoise
          data[idx] = 22;
          data[idx + 1] = 105;
          data[idx + 2] = 145;
        } else {
          // Deep abyssal navy
          const d = depth / 0.88;
          data[idx] = Math.floor(10 + d * 10);
          data[idx + 1] = Math.floor(35 + d * 40);
          data[idx + 2] = Math.floor(75 + d * 55);
        }
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('earth', texture);
  return texture;
}

export function getEarthNightTexture() {
  if (textureCache.has('earth_night')) return textureCache.get('earth_night');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    const lat = Math.abs(ny - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      const elev = noise.fbm(nx * 5, ny * 4, 6, 0.52);

      // Only on land and outside polar wastelands
      if (elev > 0.48 && lat < 0.8) {
        // City clusters using high frequency noise
        const cityNoise = noise.noise2D(nx * 35, ny * 35);
        const subCity = noise.noise2D(nx * 70, ny * 70);

        if (cityNoise > 0.62 && subCity > 0.45) {
          const intensity = (cityNoise - 0.62) * 2.6;
          data[idx] = Math.min(255, Math.floor(255 * intensity));
          data[idx + 1] = Math.min(255, Math.floor(205 * intensity));
          data[idx + 2] = Math.min(255, Math.floor(100 * intensity));
          data[idx + 3] = 255;
          continue;
        }
      }

      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('earth_night', texture);
  return texture;
}

export function getEarthCloudsTexture() {
  if (textureCache.has('earth_clouds')) return textureCache.get('earth_clouds');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Swirling cyclonic storm patterns
      const swirl = Math.sin(nx * 8 + ny * 6) * 0.05;
      const n1 = noise.fbm((nx + swirl) * 8, ny * 6, 5, 0.55);
      const n2 = noise.turbulence(nx * 14, ny * 10, 3);
      const density = n1 * 0.75 + n2 * 0.25;

      if (density > 0.52) {
        const alpha = Math.min(255, Math.floor((density - 0.52) * 530));
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = alpha;
      } else {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('earth_clouds', texture);
  return texture;
}

// -------------------------------------------------------------
// 5. MOON TEXTURE (Lunar Maria & Cratered Highlands)
// -------------------------------------------------------------
export function getMoonTexture() {
  if (textureCache.has('moon')) return textureCache.get('moon');

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      const maria = noise.fbm(nx * 4, ny * 3, 4);
      const fine = noise.noise2D(nx * 25, ny * 25);

      let val;
      if (maria < 0.42) {
        // Dark basaltic lunar sea (Mare)
        val = 70 + fine * 30;
      } else {
        // Pale heavily cratered highlands
        val = 145 + fine * 55;
      }

      data[idx] = Math.floor(val);
      data[idx + 1] = Math.floor(val);
      data[idx + 2] = Math.floor(val);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('moon', texture);
  return texture;
}

// -------------------------------------------------------------
// 6. MARS TEXTURE & BUMP (Iron Oxide Terracotta, Valles Marineris & Polar Ice)
// -------------------------------------------------------------
export function getMarsTexture() {
  if (textureCache.has('mars')) return textureCache.get('mars');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    const lat = Math.abs(ny - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Polar Ice Caps
      if (lat > 0.88) {
        const ice = noise.noise2D(nx * 20, ny * 20);
        if (lat + ice * 0.08 > 0.9) {
          data[idx] = 248;
          data[idx + 1] = 244;
          data[idx + 2] = 242;
          data[idx + 3] = 255;
          continue;
        }
      }

      const terrain = noise.fbm(nx * 6, ny * 4, 5, 0.5);
      const detail = noise.noise2D(nx * 24, ny * 16);

      // Dark volcanic basalt regions (Syrtis Major)
      if (terrain < 0.38) {
        const d = terrain / 0.38;
        data[idx] = Math.floor(80 + d * 35);
        data[idx + 1] = Math.floor(45 + d * 25);
        data[idx + 2] = Math.floor(30 + d * 20);
      } else {
        // Red-orange rusty regolith
        const r = terrain * 0.7 + detail * 0.3;
        data[idx] = Math.floor(190 + r * 55);
        data[idx + 1] = Math.floor(85 + r * 45);
        data[idx + 2] = Math.floor(40 + r * 25);
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Valles Marineris canyon rift
  ctx.strokeStyle = 'rgba(50, 22, 12, 0.8)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.53);
  ctx.bezierCurveTo(width * 0.43, height * 0.55, width * 0.52, height * 0.52, width * 0.62, height * 0.54);
  ctx.stroke();

  const texture = toTexture(canvas, true);
  textureCache.set('mars', texture);
  return texture;
}

// -------------------------------------------------------------
// 7. JUPITER TEXTURE (Atmospheric Belts, Zones, Turbulence & Great Red Spot)
// -------------------------------------------------------------
export function getJupiterTexture() {
  if (textureCache.has('jupiter')) return textureCache.get('jupiter');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Zonal atmospheric banding (Jupiter belts & zones)
      const bandWave = Math.sin(ny * Math.PI * 18);
      const turb = noise.fbm(nx * 18, ny * 8, 4, 0.55) * 0.25;
      const bandVal = (bandWave + 1) * 0.5 + turb;

      let r, g, b;
      if (bandVal > 0.65) {
        // Bright cream/beige Zone
        r = 230;
        g = 210;
        b = 185;
      } else if (bandVal > 0.4) {
        // Reddish-amber Belt
        r = 185;
        g = 125;
        b = 85;
      } else {
        // Deep copper/brown belt rift
        r = 150;
        g = 85;
        b = 55;
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // The Great Red Spot (Anticyclonic storm at ~22 deg South)
  const grsX = width * 0.65;
  const grsY = height * 0.63;
  const grsRadiusX = 55;
  const grsRadiusY = 32;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsRadiusX, grsRadiusY, 0, 0, Math.PI * 2);
  const grsGrad = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, grsRadiusX);
  grsGrad.addColorStop(0, '#a32a18'); // deep crimson core
  grsGrad.addColorStop(0.55, '#d45832');
  grsGrad.addColorStop(0.85, '#e3845b');
  grsGrad.addColorStop(1, 'rgba(215, 175, 135, 0)');
  ctx.fillStyle = grsGrad;
  ctx.fill();
  ctx.restore();

  const texture = toTexture(canvas, true);
  textureCache.set('jupiter', texture);
  return texture;
}

// -------------------------------------------------------------
// 8. SATURN TEXTURE & CASINI-DIVISION RING TEXTURE
// -------------------------------------------------------------
export function getSaturnTexture() {
  if (textureCache.has('saturn')) return textureCache.get('saturn');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Soft pastel butterscotch bands
      const band = Math.sin(ny * Math.PI * 12) * 0.15;
      const n = noise.fbm(nx * 12, ny * 4, 3, 0.4) * 0.1;
      const val = 0.5 + band + n;

      // North polar hexagon subtle cool tint
      const isNorthPole = ny < 0.15;

      if (isNorthPole) {
        data[idx] = 160;
        data[idx + 1] = 175;
        data[idx + 2] = 165;
      } else {
        data[idx] = Math.floor(215 + val * 35);
        data[idx + 1] = Math.floor(185 + val * 35);
        data[idx + 2] = Math.floor(135 + val * 35);
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('saturn', texture);
  return texture;
}

// 1D Radial Saturn Ring texture (with Cassini Division)
export function getSaturnRingTexture() {
  if (textureCache.has('saturn_ring')) return textureCache.get('saturn_ring');

  const width = 1024;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // x goes from 0 (inner radius) to width (outer radius)
  for (let x = 0; x < width; x++) {
    const pos = x / width; // 0.0 to 1.0

    let alpha = 0;
    let r = 215, g = 195, b = 150;

    if (pos < 0.12) {
      // Inner clear space
      alpha = 0;
    } else if (pos < 0.32) {
      // C Ring (Crepe Ring: faint, semi-transparent)
      alpha = 0.28 + (pos - 0.12) * 0.5;
      r = 165; g = 150; b = 125;
    } else if (pos < 0.66) {
      // B Ring (Main, dense, bright ring with micro-stripes)
      const stripe = Math.sin(pos * 240) * 0.1;
      alpha = 0.92 + stripe;
      r = 230; g = 205; b = 160;
    } else if (pos < 0.74) {
      // CASSINI DIVISION (The dark, transparent gap!)
      alpha = 0.03; // almost entirely transparent void!
      r = 20; g = 20; b = 20;
    } else if (pos < 0.94) {
      // A Ring (Outer dense ring with Encke gap)
      if (pos > 0.86 && pos < 0.88) {
        // Encke division
        alpha = 0.1;
      } else {
        const stripe = Math.sin(pos * 180) * 0.08;
        alpha = 0.75 + stripe;
        r = 210; g = 185; b = 145;
      }
    } else {
      // Outer falloff / F-ring edge
      alpha = Math.max(0, (1.0 - pos) * 10) * 0.4;
      r = 190; g = 175; b = 140;
    }

    alpha = Math.max(0, Math.min(1, alpha));

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, false);
  textureCache.set('saturn_ring', texture);
  return texture;
}

// -------------------------------------------------------------
// 9. URANUS TEXTURE & ICE RING
// -------------------------------------------------------------
export function getUranusTexture() {
  if (textureCache.has('uranus')) return textureCache.get('uranus');

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Soft aquamarine cyan gradient with pale polar hood
      const polar = Math.abs(ny - 0.5) * 0.12;
      const n = noise.noise2D((x / width) * 8, ny * 4) * 0.06;
      const val = polar + n;

      data[idx] = Math.floor(100 + val * 50);
      data[idx + 1] = Math.floor(210 + val * 40);
      data[idx + 2] = Math.floor(225 + val * 30);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = toTexture(canvas, true);
  textureCache.set('uranus', texture);
  return texture;
}

// -------------------------------------------------------------
// 10. NEPTUNE TEXTURE (Deep Cobalt Azure Blue & Methane Cirrus Storms)
// -------------------------------------------------------------
export function getNeptuneTexture() {
  if (textureCache.has('neptune')) return textureCache.get('neptune');

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Deep, saturated cobalt blue banded atmosphere
      const band = Math.sin(ny * Math.PI * 10) * 0.08;
      const n = noise.fbm(nx * 10, ny * 6, 3) * 0.1;
      const val = 0.5 + band + n;

      data[idx] = Math.floor(24 + val * 20);
      data[idx + 1] = Math.floor(75 + val * 45);
      data[idx + 2] = Math.floor(190 + val * 65);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // The Great Dark Spot (oval storm)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(width * 0.42, height * 0.42, 40, 22, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 30, 95, 0.75)';
  ctx.fill();
  ctx.restore();

  // White high-altitude methane cirrus cloud streaks ("Scooter")
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.36, height * 0.45);
  ctx.bezierCurveTo(width * 0.48, height * 0.44, width * 0.56, height * 0.47, width * 0.68, height * 0.45);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(width * 0.15, height * 0.62);
  ctx.lineTo(width * 0.32, height * 0.63);
  ctx.stroke();

  const texture = toTexture(canvas, true);
  textureCache.set('neptune', texture);
  return texture;
}

// -------------------------------------------------------------
// 11. DEEP SPACE COSMIC NEBULA SKYBOX
// -------------------------------------------------------------
export function getNebulaTexture() {
  if (textureCache.has('nebula')) return textureCache.get('nebula');

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Cosmic dust clouds: teal & purple nebulosity
      const neb1 = noise.fbm(nx * 3, ny * 3, 5, 0.55);
      const neb2 = noise.turbulence(nx * 4, ny * 4, 4);

      let r = 2, g = 4, b = 10; // Dark cosmic void

      if (neb1 > 0.48) {
        // Deep purple & magenta interstellar dust
        const t = (neb1 - 0.48) * 1.8;
        r += Math.floor(t * 45);
        g += Math.floor(t * 12);
        b += Math.floor(t * 70);
      }

      if (neb2 > 0.52) {
        // Cyan-teal cosmic filaments
        const t = (neb2 - 0.52) * 1.5;
        r += Math.floor(t * 8);
        g += Math.floor(t * 35);
        b += Math.floor(t * 55);
      }

      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Add twinkling stellar clusters
  const rng = new FastNoise(777);
  for (let i = 0; i < 400; i++) {
    const sx = (rng.noise2D(i * 5.1, 44.2) * width) % width;
    const sy = (rng.noise2D(12.7, i * 6.3) * height) % height;
    const sRad = 0.5 + rng.noise2D(i, i) * 1.8;
    const isBlue = rng.noise2D(i * 2, 8) > 0.6;

    ctx.fillStyle = isBlue ? 'rgba(180, 220, 255, 0.9)' : 'rgba(255, 235, 200, 0.85)';
    ctx.beginPath();
    ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = toTexture(canvas, true);
  textureCache.set('nebula', texture);
  return texture;
}
