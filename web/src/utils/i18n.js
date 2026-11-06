 /* 国际化 */
/**
 * 使用方法：1、this.$t('tabbar.b')  2、uni.vm.$t('tabbar.b')
 */
/**
 * 修改记录:
 * 2024-07-11  郑朝军          修改代码规范
 */
import Chinese from '@/locales/zh.js'
import English from '@/locales/en.js'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'cn',
  messages: {
   'cn': Chinese,
   'en': English,
  }
})

export default i18n
