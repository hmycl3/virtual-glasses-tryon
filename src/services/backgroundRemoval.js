const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png'])

function colorDistance(data, index, color) {
  const dr = data[index] - color[0]
  const dg = data[index + 1] - color[1]
  const db = data[index + 2] - color[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function sampleCorner(data, width, height, startX, startY, size) {
  let r = 0; let g = 0; let b = 0; let count = 0
  for (let y = startY; y < Math.min(height, startY + size); y += 1) {
    for (let x = startX; x < Math.min(width, startX + size); x += 1) {
      const i = (y * width + x) * 4
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count += 1
    }
  }
  return [r / count, g / count, b / count]
}

export function validateImageFile(file) {
  if (!file) return false
  if (!SUPPORTED_TYPES.has(file.type)) throw new Error('请上传 JPG 或 PNG 图片')
  return true
}

export async function removeGlassesBackground(file) {
  validateImageFile(file)
  const bitmap = await createImageBitmap(file)
  const maxEdge = 1600
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const image = ctx.getImageData(0, 0, width, height)
  const { data } = image
  const cornerSize = Math.max(3, Math.round(Math.min(width, height) * 0.035))
  const colors = [
    sampleCorner(data, width, height, 0, 0, cornerSize),
    sampleCorner(data, width, height, width - cornerSize, 0, cornerSize),
    sampleCorner(data, width, height, 0, height - cornerSize, cornerSize),
    sampleCorner(data, width, height, width - cornerSize, height - cornerSize, cornerSize),
  ]
  const isBackground = (pixelIndex, threshold = 54) =>
    colors.some((color) => colorDistance(data, pixelIndex * 4, color) <= threshold)

  const visited = new Uint8Array(width * height)
  const queue = new Int32Array(width * height)
  let head = 0; let tail = 0
  const enqueue = (pixel) => {
    if (visited[pixel] || !isBackground(pixel)) return
    visited[pixel] = 1; queue[tail] = pixel; tail += 1
  }
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x) }
  for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1) }

  while (head < tail) {
    const pixel = queue[head]; head += 1
    const x = pixel % width; const y = Math.floor(pixel / width)
    data[pixel * 4 + 3] = 0
    if (x > 0) enqueue(pixel - 1)
    if (x < width - 1) enqueue(pixel + 1)
    if (y > 0) enqueue(pixel - width)
    if (y < height - 1) enqueue(pixel + width)
  }

  // Soften the one-pixel boundary to avoid a bright halo on antialiased frames.
  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel]) continue
    const x = pixel % width; const y = Math.floor(pixel / width)
    const touchesBackground =
      (x > 0 && visited[pixel - 1]) || (x < width - 1 && visited[pixel + 1]) ||
      (y > 0 && visited[pixel - width]) || (y < height - 1 && visited[pixel + width])
    if (touchesBackground && isBackground(pixel, 76)) data[pixel * 4 + 3] = 90
  }

  ctx.putImageData(image, 0, 0)
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('透明图片生成失败')), 'image/png')
  )
  return URL.createObjectURL(blob)
}
