/**
 * 从图片URL中提取主色调
 * 使用canvas API采样图片像素并计算平均色相
 */
export const extractDominantHue = (
  imageUrl: string
): Promise<{ hue: number; saturation: number; lightness: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.addEventListener('load', () => {
      const result = processImage(img)
      resolve(result)
    })

    img.addEventListener('error', () => {
      reject(new Error('Failed to load image'))
    })

    img.src = imageUrl
  })

/**
 * 处理图片并提取颜色
 */
function processImage(img: HTMLImageElement): {
  hue: number
  saturation: number
  lightness: number
} {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return { hue: 0, saturation: 70, lightness: 80 }
  }

  // 使用更大的采样尺寸以提高准确度
  const size = 200
  canvas.width = size
  canvas.height = size

  // 绘制图片到canvas
  ctx.drawImage(img, 0, 0, size, size)

  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, size, size)
  const rgbColors = extractRgbColors(imageData.data)

  if (rgbColors.length === 0) {
    return { hue: 0, saturation: 70, lightness: 80 }
  }

  // 使用K-means聚类找到主色调
  const dominantColor = findDominantColorByKMeans(rgbColors, 5)
  return rgbToHslObject(dominantColor.r, dominantColor.g, dominantColor.b)
}

/**
 * 从像素数据中提取RGB颜色
 */
function extractRgbColors(
  data: Uint8ClampedArray
): Array<{ r: number; g: number; b: number }> {
  const colors: Array<{ r: number; g: number; b: number }> = []

  // 每隔几个像素采样一次
  for (let i = 0; i < data.length; i += 12) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // 跳过透明像素
    if (a < 128) {
      continue
    }

    // 跳过太亮或太暗的像素
    const brightness = (r + g + b) / 3
    if (brightness > 250 || brightness < 10) {
      continue
    }

    colors.push({ r, g, b })
  }

  return colors
}

/**
 * 使用简化的K-means聚类算法找出主色调
 */
function findDominantColorByKMeans(
  colors: Array<{ r: number; g: number; b: number }>,
  k: number
): { r: number; g: number; b: number } {
  if (colors.length === 0) {
    return { r: 255, g: 200, b: 200 }
  }

  // 初始化聚类中心
  const centroids = initializeCentroids(colors, k)

  // 迭代优化聚类
  for (let iter = 0; iter < 10; iter++) {
    const clusters = assignColorsToClusters(colors, centroids, k)
    updateCentroids(centroids, clusters)
  }

  // 返回饱和度最高的聚类中心
  return findMostSaturatedCentroid(centroids)
}

/**
 * 初始化K-means聚类中心
 */
function initializeCentroids(
  colors: Array<{ r: number; g: number; b: number }>,
  k: number
): Array<{ r: number; g: number; b: number }> {
  const centroids: Array<{ r: number; g: number; b: number }> = []
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor((i / k) * colors.length)
    centroids.push({ ...colors[randomIndex] })
  }
  return centroids
}

/**
 * 将颜色分配到最近的聚类中心
 */
function assignColorsToClusters(
  colors: Array<{ r: number; g: number; b: number }>,
  centroids: Array<{ r: number; g: number; b: number }>,
  k: number
): Array<Array<{ r: number; g: number; b: number }>> {
  const clusters: Array<Array<{ r: number; g: number; b: number }>> =
    Array.from({ length: k }, () => [])

  for (const color of colors) {
    const clusterIndex = findNearestCentroid(color, centroids)
    clusters[clusterIndex].push(color)
  }

  return clusters
}

/**
 * 找到最近的聚类中心索引
 */
function findNearestCentroid(
  color: { r: number; g: number; b: number },
  centroids: Array<{ r: number; g: number; b: number }>
): number {
  let minDist = Number.POSITIVE_INFINITY
  let clusterIndex = 0

  for (let i = 0; i < centroids.length; i++) {
    const dist = colorDistance(color, centroids[i])
    if (dist < minDist) {
      minDist = dist
      clusterIndex = i
    }
  }

  return clusterIndex
}

/**
 * 更新聚类中心
 */
function updateCentroids(
  centroids: Array<{ r: number; g: number; b: number }>,
  clusters: Array<Array<{ r: number; g: number; b: number }>>
): void {
  for (let i = 0; i < centroids.length; i++) {
    if (clusters[i].length > 0) {
      centroids[i] = {
        r: Math.round(
          clusters[i].reduce((sum, c) => sum + c.r, 0) / clusters[i].length
        ),
        g: Math.round(
          clusters[i].reduce((sum, c) => sum + c.g, 0) / clusters[i].length
        ),
        b: Math.round(
          clusters[i].reduce((sum, c) => sum + c.b, 0) / clusters[i].length
        ),
      }
    }
  }
}

/**
 * 找出饱和度最高的聚类中心
 */
function findMostSaturatedCentroid(
  centroids: Array<{ r: number; g: number; b: number }>
): { r: number; g: number; b: number } {
  let bestCentroid = centroids[0]
  let maxSaturation = 0

  for (const centroid of centroids) {
    const hsl = rgbToHsl(centroid.r, centroid.g, centroid.b)
    if (hsl.s > maxSaturation) {
      maxSaturation = hsl.s
      bestCentroid = centroid
    }
  }

  return bestCentroid
}

/**
 * 计算两个颜色之间的欧几里得距离
 */
function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2)
}

/**
 * 将RGB转换为HSL (内部使用，返回0-1范围)
 */
function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const diff = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

    switch (max) {
      case red: {
        h = ((green - blue) / diff + (green < blue ? 6 : 0)) / 6
        break
      }
      case green: {
        h = ((blue - red) / diff + 2) / 6
        break
      }
      case blue: {
        h = ((red - green) / diff + 4) / 6
        break
      }
      default: {
        h = 0
        break
      }
    }
  }

  return {
    h: h * 360,
    s,
    l,
  }
}

/**
 * 将RGB转换为HSL对象 (导出使用，返回百分比)
 */
function rgbToHslObject(
  r: number,
  g: number,
  b: number
): { hue: number; saturation: number; lightness: number } {
  const hsl = rgbToHsl(r, g, b)
  return {
    hue: hsl.h,
    saturation: hsl.s * 100,
    lightness: hsl.l * 100,
  }
}

/**
 * 为视频生成配色方案
 * 基于主色调生成协调的渐变色
 */
export function generateColorScheme(baseHue: number): {
  colors: Array<{ hue: number; saturation: number; lightness: number }>
} {
  // 生成三个和谐的色相值
  return {
    colors: [
      { hue: baseHue, saturation: 75, lightness: 82 },
      { hue: (baseHue + 10) % 360, saturation: 80, lightness: 78 },
      { hue: (baseHue - 5 + 360) % 360, saturation: 70, lightness: 85 },
    ],
  }
}
