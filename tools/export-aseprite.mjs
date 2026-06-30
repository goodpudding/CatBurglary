import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Aseprite } from '@pixelation/aseprite';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'assests');

const OUTPUTS = [
  { input: sourceRoot, output: path.join(root, 'src', 'client', 'assets', 'furniture'), prefix: 'furniture' },
  { input: path.join(sourceRoot, 'Cats'), output: path.join(root, 'src', 'client', 'assets', 'cats'), prefix: 'cat' },
];

function slugify(name) {
  return name
    .replace(/\.aseprite$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function renderFrame(sprite, frameIndex = 0) {
  const { width, height } = sprite.header;
  const buffer = Buffer.alloc(width * height * 4, 0);
  const frame = sprite.frames[frameIndex];

  if (!frame) {
    throw new Error(`Missing frame ${frameIndex}`);
  }

  for (const layer of frame.layers) {
    if (!layer.visible) continue;

    for (const cel of layer.cels) {
      for (let py = 0; py < cel.height; py++) {
        for (let px = 0; px < cel.width; px++) {
          const pixel = cel.pixels[py * cel.width + px];
          if (!pixel || pixel[3] === 0) continue;

          const x = cel.x + px;
          const y = cel.y + py;
          if (x < 0 || y < 0 || x >= width || y >= height) continue;

          const idx = (y * width + x) * 4;
          buffer[idx] = pixel[0];
          buffer[idx + 1] = pixel[1];
          buffer[idx + 2] = pixel[2];
          buffer[idx + 3] = pixel[3];
        }
      }
    }
  }

  return buffer;
}

function inferSheetFrames(width, height) {
  if (height <= 0 || width <= height) {
    return { frameWidth: width, frameHeight: height, frameCount: 1 };
  }

  const frameHeight = height;
  const frameWidth = frameHeight;

  if (width % frameWidth !== 0) {
    return { frameWidth: width, frameHeight: height, frameCount: 1 };
  }

  return {
    frameWidth,
    frameHeight,
    frameCount: width / frameWidth,
  };
}

async function exportAsset(filePath, outputDir, prefix) {
  const fileName = path.basename(filePath);
  const id = slugify(fileName);
  const raw = fs.readFileSync(filePath);
  const sprite = new Aseprite(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));

  let pixels;
  let width = sprite.header.width;
  let height = sprite.header.height;
  let frameWidth = width;
  let frameHeight = height;
  let frameCount = sprite.frames.length;

  if (frameCount > 1 && width <= height * 2) {
    const strips = [];
    for (let i = 0; i < frameCount; i++) {
      strips.push(renderFrame(sprite, i));
    }
    frameWidth = width;
    frameHeight = height;
    width = frameWidth * frameCount;
    pixels = Buffer.alloc(width * height * 4, 0);
    for (let i = 0; i < frameCount; i++) {
      const strip = strips[i];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < frameWidth; x++) {
          const src = (y * frameWidth + x) * 4;
          const dst = (y * width + i * frameWidth + x) * 4;
          pixels[dst] = strip[src];
          pixels[dst + 1] = strip[src + 1];
          pixels[dst + 2] = strip[src + 2];
          pixels[dst + 3] = strip[src + 3];
        }
      }
    }
  } else {
    pixels = renderFrame(sprite, 0);
    const sheet = inferSheetFrames(width, height);
    frameWidth = sheet.frameWidth;
    frameHeight = sheet.frameHeight;
    frameCount = sheet.frameCount;
  }

  const pngPath = path.join(outputDir, `${id}.png`);
  await sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(pngPath);

  return {
    id,
    file: fileName,
    key: `${prefix}-${id}`,
    path: `${prefix === 'furniture' ? 'furniture' : 'cats'}/${id}.png`,
    width,
    height,
    frameWidth,
    frameHeight,
    frameCount,
  };
}

async function exportFolder({ input, output, prefix }) {
  if (!fs.existsSync(input)) {
    return [];
  }

  fs.mkdirSync(output, { recursive: true });

  const files = fs
    .readdirSync(input)
    .filter((name) => name.endsWith('.aseprite'))
    .filter((name) => !(prefix === 'cat' && name.toLowerCase() === 'tv.aseprite'))
    .map((name) => path.join(input, name));

  const manifest = [];
  for (const filePath of files) {
    const entry = await exportAsset(filePath, output, prefix);
    manifest.push(entry);
    console.log(
      `Exported ${entry.file} -> ${entry.path} (${entry.width}x${entry.height}, ${entry.frameCount} frames)`,
    );
  }

  manifest.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

async function main() {
  for (const folder of OUTPUTS) {
    await exportFolder(folder);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
