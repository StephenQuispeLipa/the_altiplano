const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const SQUARE_TOLERANCE = 0.02;
const OUTPUT_SIZE = 400;

export function validateProfilePhotoFile(file) {
  if (!file) {
    return { valid: false, message: 'No se seleccionó ningún archivo.' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: 'Formato no válido. Usa JPG, PNG, WebP o GIF.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, message: 'La imagen no debe superar 5 MB.' };
  }
  return { valid: true };
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function isSquareImage(width, height) {
  const ratio = width / height;
  return Math.abs(ratio - 1) <= SQUARE_TOLERANCE;
}

export function cropImageToSquareDataUrl(img) {
  const size = Math.min(img.naturalWidth, img.naturalHeight);
  const x = (img.naturalWidth - size) / 2;
  const y = (img.naturalHeight - size) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, x, y, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function processProfilePhotoFile(file) {
  const validation = validateProfilePhotoFile(file);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImageFromSrc(dataUrl);

  if (isSquareImage(img.naturalWidth, img.naturalHeight)) {
    const processed = cropImageToSquareDataUrl(img);
    return { success: true, dataUrl: processed, needsCrop: false };
  }

  return { success: true, dataUrl, needsCrop: true };
}
