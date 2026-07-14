import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Aseprite } from '@pixelation/aseprite';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'assets');

const OUTPUTS = [
  { input: sourceRoot, output: path.join(root, 'src', 'client', 'assets', 'furniture'), prefix: 'furniture', folder: 'furniture' },
  { input: path.join(sourceRoot, 'Cats'), output: path.join(root, 'src', 'client', 'assets', 'cats'), prefix: 'cat', folder: 'cats' },
  { input: path.join(sourceRoot, 'outfits'), output: path.join(root, 'src', 'client', 'assets', 'outfits'), prefix: 'outfit', folder: 'outfits' },
];

/**
 * Hand-tuned manifest entries the auto-inference gets wrong. These win over
 * inferred values so re-running the export never clobbers approved fixes.
 * (marshmellow-sitting-sheet really is 25x20x12 even though inference says 20x20x15.)
 */
const MANIFEST_OVERRIDES = {
  'marshmellow-sitting-sheet': { frameWidth: 25, frameHeight: 20, frameCount: 12 },
};

/**
 * Downscaled variants baked from exported art. Thin 1px details (glasses lens
 * rings) vanish under nearest-neighbor scaling in-engine, so these are shrunk
 * with a smooth kernel then alpha-thresholded back to crisp pixels.
 */
const BAKED_VARIANTS = [
  {
    source: path.join(root, 'src', 'client', 'assets', 'outfits', 'glasses-w24h10.png'),
    output: path.join(root, 'src', 'client', 'assets', 'outfits', 'glasses-small-w15h6.png'),
    width: 15,
    height: 6,
  },
];

async function bakeVariants() {
  for (const v of BAKED_VARIANTS) {
    if (!fs.existsSync(v.source)) continue;
    const { data, info } = await sharp(v.source)
      .resize(v.width, v.height, { kernel: 'lanczos3' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = data[i + 3] < 60 ? 0 : 255;
    }
    await sharp(data, { raw: info }).png().toFile(v.output);
    console.log(`Baked ${path.basename(v.source)} -> ${path.basename(v.output)} (${v.width}x${v.height})`);
  }
}

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

async function exportAsset(filePath, outputDir, prefix, folder) {
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
    path: `${folder}/${id}.png`,
    width,
    height,
    frameWidth,
    frameHeight,
    frameCount,
    ...(MANIFEST_OVERRIDES[id] ?? {}),
  };
}

async function exportFolder({ input, output, prefix, folder }) {
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
    const entry = await exportAsset(filePath, output, prefix, folder);
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
  await bakeVariants();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
