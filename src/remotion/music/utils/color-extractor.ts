// @ts-nocheck
import analyze from 'rgbaster'

// 正则表达式常量，用于解析 rgb 字符串
const RGB_REGEX = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/

/**
 * RGB 颜色类型
 */
export type RGBColor = {
  r: number
  g: number
  b: number
}

/**
 * 从图片URL中提取主色调
 * 使用 rgbaster 库分析图片并提取主色，直接返回 RGB 值
 */
export const extractDominantColor = async (
  imageUrl: string
): Promise<RGBColor> => {
  try {
    // 使用 rgbaster 分析图片
    // scale: 0.6 用于加快处理速度，同时保持较好的准确度
    // ignore: 忽略纯白色和纯黑色
    const result = await analyze(imageUrl, {
      scale: 0.6,
      ignore: ['rgb(255,255,255)', 'rgb(0,0,0)'],
    })

    if (!result || result.length === 0) {
      // 返回默认颜色（柔和的蓝色）
      return { r: 100, g: 150, b: 200 }
    }

    // 找到饱和度最高的颜色作为主色
    let bestColor = result[0]
    let maxSaturation = 0

    for (const item of result.slice(0, 10)) {
      // 只检查前10个主要颜色
      const rgb = parseRgbString(item.color)
      if (!rgb) {
        continue
      }

      // 计算颜色的饱和度（使用简化的方法）
      const saturation = calculateSaturation(rgb.r, rgb.g, rgb.b)
      const lightness = calculateLightness(rgb.r, rgb.g, rgb.b)

      // 跳过太亮或太暗的颜色
      if (lightness < 25 || lightness > 240) {
        continue
      }

      // 选择饱和度最高的颜色
      if (saturation > maxSaturation) {
        maxSaturation = saturation
        bestColor = item
      }
    }

    // 解析最终选择的颜色
    const rgb = parseRgbString(bestColor.color)
    if (!rgb) {
      return { r: 100, g: 150, b: 200 }
    }

    console.log('提取的主色调 RGB:', rgb)

    return rgb
  } catch (error) {
    console.error('Failed to extract dominant color:', error)
    // 返回默认颜色
    return { r: 100, g: 150, b: 200 }
  }
}

/**
 * 解析 rgb(r, g, b) 字符串
 */
function parseRgbString(rgbString: string): {
  r: number
  g: number
  b: number
} | null {
  const match = rgbString.match(RGB_REGEX)
  if (!match) {
    return null
  }

  return {
    r: Number.parseInt(match[1], 10),
    g: Number.parseInt(match[2], 10),
    b: Number.parseInt(match[3], 10),
  }
}

/**
 * 计算颜色的饱和度（0-255范围）
 * 使用简化方法：max - min
 */
function calculateSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max - min
}

/**
 * 计算颜色的亮度（0-255范围）
 * 使用简化方法：(max + min) / 2
 */
function calculateLightness(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return (max + min) / 2
}

/**
 * 为视频生成配色方案
 * 基于主色调 RGB 生成协调的渐变色
 */
export function generateColorScheme(baseColor: RGBColor): {
  colors: RGBColor[]
} {
  // 生成三个和谐的颜色变体
  // 方法：通过调整亮度和饱和度来创建渐变效果

  const color1 = lightenColor(baseColor, 0.1) // 稍微变亮
  const color2 = baseColor // 原色
  const color3 = lightenColor(baseColor, 0.2) // 更亮

  return {
    colors: [color1, color2, color3],
  }
}

/**
 * 调整颜色亮度
 * @param color 原始颜色
 * @param factor 调整因子（-1 到 1，负值变暗，正值变亮）
 */
function lightenColor(color: RGBColor, factor: number): RGBColor {
  const adjust = (value: number) => {
    if (factor > 0) {
      // 变亮：向 255 靠近
      return Math.round(value + (255 - value) * factor)
    }
    // 变暗：向 0 靠近
    return Math.round(value * (1 + factor))
  }

  return {
    r: Math.max(0, Math.min(255, adjust(color.r))),
    g: Math.max(0, Math.min(255, adjust(color.g))),
    b: Math.max(0, Math.min(255, adjust(color.b))),
  }
}

/**
 * 将 RGB 颜色转换为 CSS 字符串
 */
export function rgbToString(color: RGBColor): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}
