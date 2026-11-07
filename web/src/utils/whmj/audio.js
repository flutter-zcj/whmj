/**
 * 麻将音效管理
 * 统一管理背景音乐与操作音效，音效按 key 建小对象池以支持快速连续播放
 */
import { ASSET_BASE, tileName } from './const.js'

/** 每个音效的并发实例数 */
const VOICE_COUNT = 3

/**
 * 音效清单，key 与 audio 目录下文件名一致
 * 音频均取自原版 APK 的 FSB5 资源，经 vgmstream 解码后转码
 */
export const SOUND_KEYS = [
  'bgm',
  'click',
  'select',
  'discard',
  'draw',
  'fapai',
  'peng',
  'gang',
  'chi',
  'hu',
  'zimo',
  'win',
  'lose',
  'guo',
  'ting',
  'dice',
  'windy',
  'dingque',
  'countdown'
]

/** 音效管理器 */
class MahjongAudio
{
  constructor()
  {
    this.pool = {}
    this.cursor = {}
    this.bgm = null
    this.voice = null
    this.voiceTimer = null
    this.enabled = true
    this.bgmEnabled = true
  }

  /**
   * 预创建音频实例，需在用户首次交互后调用，避免浏览器自动播放限制
   * @param {String[]} [keys] 需要预热的音效，默认全部
   */
  init(keys)
  {
    const list = keys || SOUND_KEYS.filter((key) => key !== 'bgm')

    list.forEach((key) =>
    {
      if (this.pool[key])
      {
        return
      }

      const voices = []

      for (let i = 0; i < VOICE_COUNT; i++)
      {
        const ctx = uni.createInnerAudioContext()

        ctx.src = `${ASSET_BASE}/audio/${key}.mp3`
        ctx.volume = 0.85
        voices.push(ctx)
      }

      this.pool[key] = voices
      this.cursor[key] = 0
    })
  }

  /**
   * 播放一次性音效
   * @param {String} key 音效名
   */
  play(key)
  {
    if (!this.enabled || !key)
    {
      return
    }

    if (!this.pool[key])
    {
      this.init([key])
    }

    const voices = this.pool[key]

    if (!voices || !voices.length)
    {
      return
    }

    const index = this.cursor[key] % voices.length
    const ctx = voices[index]

    this.cursor[key] = index + 1

    try
    {
      ctx.stop()
      ctx.seek(0)
      ctx.play()
    }
    catch (e)
    {
      console.warn('[whmj] 音效播放失败', key, e)
    }
  }

  /**
   * 播报别人刚打出的牌名，与拍牌音效错开 140ms 避免混音
   * 仅对手出牌时调用，自己出牌不播报，避免打断摸牌节奏
   * @param {Number} tile 牌编码 1..28
   */
  playTile(tile)
  {
    if (!this.enabled || !tile || tile < 1 || tile > 28)
    {
      return
    }

    if (this.voiceTimer)
    {
      clearTimeout(this.voiceTimer)
    }

    this.voiceTimer = setTimeout(() =>
    {
      if (!this.enabled)
      {
        return
      }

      if (!this.voice)
      {
        this.voice = uni.createInnerAudioContext()
        this.voice.volume = 1
      }

      try
      {
        this.voice.stop()
        this.voice.src = `${ASSET_BASE}/audio/voice/t${tile}.mp3`
        this.voice.play()
      }
      catch (e)
      {
        this.speakTile(tile)
      }
    }, 140)
  }

  /**
   * 语音文件不可用时用系统中文 TTS 兜底
   * @param {Number} tile 牌编码 1..28
   */
  speakTile(tile)
  {
    if (typeof window === 'undefined' || !window.speechSynthesis)
    {
      return
    }

    try
    {
      const utter = new window.SpeechSynthesisUtterance(tileName(tile))

      utter.lang = 'zh-CN'
      utter.rate = 1.1
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    }
    catch (e)
    {
      console.warn('[whmj] 报牌语音失败', tile, e)
    }
  }

  /**
   * 开始循环播放背景音乐
   */
  playBgm()
  {
    if (!this.bgmEnabled)
    {
      return
    }

    if (!this.bgm)
    {
      this.bgm = uni.createInnerAudioContext()
      this.bgm.src = `${ASSET_BASE}/audio/bgm.mp3`
      this.bgm.loop = true
      this.bgm.volume = 0.32
    }

    try
    {
      this.bgm.play()
    }
    catch (e)
    {
      console.warn('[whmj] 背景音乐播放失败', e)
    }
  }

  /** 暂停背景音乐 */
  pauseBgm()
  {
    if (this.bgm)
    {
      this.bgm.pause()
    }
  }

  /**
   * 开关全部音效
   * @param {Boolean} enabled 是否启用
   */
  setEnabled(enabled)
  {
    this.enabled = !!enabled

    if (!this.enabled)
    {
      if (this.voiceTimer)
      {
        clearTimeout(this.voiceTimer)
        this.voiceTimer = null
      }

      if (this.voice)
      {
        try
        {
          this.voice.stop()
        }
        catch (e)
        {
          console.warn('[whmj] 停止报牌失败', e)
        }
      }

      this.pauseBgm()
    }
    else
    {
      this.playBgm()
    }
  }

  /**
   * 开关背景音乐
   * @param {Boolean} enabled 是否启用
   */
  setBgmEnabled(enabled)
  {
    this.bgmEnabled = !!enabled

    if (this.bgmEnabled)
    {
      this.playBgm()
    }
    else
    {
      this.pauseBgm()
    }
  }

  /** 释放全部音频资源 */
  destroy()
  {
    if (this.voiceTimer)
    {
      clearTimeout(this.voiceTimer)
      this.voiceTimer = null
    }

    if (this.voice)
    {
      try
      {
        this.voice.destroy()
      }
      catch (e)
      {
        console.warn('[whmj] 释放报牌语音失败', e)
      }

      this.voice = null
    }

    Object.keys(this.pool).forEach((key) =>
    {
      this.pool[key].forEach((ctx) =>
      {
        try
        {
          ctx.destroy()
        }
        catch (e)
        {
          console.warn('[whmj] 释放音效失败', e)
        }
      })
    })

    this.pool = {}
    this.cursor = {}

    if (this.bgm)
    {
      try
      {
        this.bgm.destroy()
      }
      catch (e)
      {
        console.warn('[whmj] 释放背景音乐失败', e)
      }

      this.bgm = null
    }
  }
}

/** 全局单例，音效与背景音乐共用一套实例 */
export const audio = new MahjongAudio()

export default audio
