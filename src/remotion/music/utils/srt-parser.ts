export type LyricLine = {
  index: number
  startTime: number // 秒
  endTime: number // 秒
  text: string
}

/**
 * 将 SRT 时间格式转换为秒
 * @param timeString - SRT 时间格式字符串 (例如: "00:00:25,850")
 * @returns 秒数
 */
function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(',')
  const time = parts[0]
  const milliseconds = parts[1]
  const timeParts = time.split(':').map(Number)
  const hours = timeParts[0]
  const minutes = timeParts[1]
  const seconds = timeParts[2]

  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
}

// 时间轴正则表达式,定义在顶层
const TIME_PATTERN =
  /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/

/**
 * 创建歌词行对象
 */
function createLyricLine(
  index: number,
  startTime: number,
  endTime: number,
  text: string
): LyricLine | null {
  if (!text) {
    return null
  }
  return {
    index,
    startTime,
    endTime,
    text: text.trim(),
  }
}

/**
 * 解析时间轴行
 */
function parseTimeLine(
  line: string
): { startTime: number; endTime: number } | null {
  const timeMatch = line.match(TIME_PATTERN)
  if (timeMatch) {
    return {
      startTime: parseTimeToSeconds(timeMatch[1]),
      endTime: parseTimeToSeconds(timeMatch[2]),
    }
  }
  return null
}

type ParserState = {
  index: number
  startTime: number
  endTime: number
  text: string
  state: 'index' | 'time' | 'text'
}

/**
 * 保存当前字幕块到结果数组
 */
function saveLyricBlock(parserState: ParserState, lyrics: LyricLine[]): void {
  const lyricLine = createLyricLine(
    parserState.index,
    parserState.startTime,
    parserState.endTime,
    parserState.text
  )
  if (lyricLine) {
    lyrics.push(lyricLine)
  }
}

/**
 * 处理空行(字幕块结束)
 */
function handleEmptyLine(parserState: ParserState, lyrics: LyricLine[]): void {
  saveLyricBlock(parserState, lyrics)
  parserState.text = ''
  parserState.state = 'index'
}

/**
 * 处理索引行
 */
function handleIndexLine(line: string, parserState: ParserState): void {
  parserState.index = Number.parseInt(line, 10)
  parserState.state = 'time'
}

/**
 * 处理时间行
 */
function handleTimeLine(line: string, parserState: ParserState): void {
  const timeParsed = parseTimeLine(line)
  if (timeParsed) {
    parserState.startTime = timeParsed.startTime
    parserState.endTime = timeParsed.endTime
    parserState.state = 'text'
  }
}

/**
 * 处理文本行
 */
function handleTextLine(line: string, parserState: ParserState): void {
  parserState.text += (parserState.text ? '\n' : '') + line
}

/**
 * 解析 SRT 字幕文件内容
 * @param srtContent - SRT 文件的文本内容
 * @returns 歌词行数组
 */
export function parseSRT(srtContent: string): LyricLine[] {
  const lines = srtContent.trim().split('\n')
  const lyrics: LyricLine[] = []

  const parserState: ParserState = {
    index: 0,
    startTime: 0,
    endTime: 0,
    text: '',
    state: 'index',
  }

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === '') {
      handleEmptyLine(parserState, lyrics)
      continue
    }

    if (parserState.state === 'index') {
      handleIndexLine(trimmedLine, parserState)
      continue
    }

    if (parserState.state === 'time') {
      handleTimeLine(trimmedLine, parserState)
      continue
    }

    handleTextLine(trimmedLine, parserState)
  }

  // 处理最后一个字幕块
  saveLyricBlock(parserState, lyrics)

  return lyrics
}

/**
 * 根据当前时间获取应该显示的歌词
 * @param lyrics - 歌词行数组
 * @param currentTime - 当前时间(秒)
 * @returns 当前应该显示的歌词行,如果没有则返回 null
 */
export function getCurrentLyric(
  lyrics: LyricLine[],
  currentTime: number
): LyricLine | null {
  return (
    lyrics.find(
      (lyric) => currentTime >= lyric.startTime && currentTime <= lyric.endTime
    ) ?? null
  )
}

/**
 * 获取下一句歌词
 * @param lyrics - 歌词行数组
 * @param currentTime - 当前时间(秒)
 * @returns 下一句歌词,如果没有则返回 null
 */
export function getNextLyric(
  lyrics: LyricLine[],
  currentTime: number
): LyricLine | null {
  return lyrics.find((lyric) => lyric.startTime > currentTime) ?? null
}
