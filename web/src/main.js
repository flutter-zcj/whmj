import 'uno.css'
import { createSSRApp, markRaw } from 'vue'
import { impCx } from './utils/impLibs/ImpCx'
import { impOther } from './utils/impLibs/ImpOther'

import App from './App.vue'
import store from '@/store'

export function createApp()
{
  const app = createSSRApp(App)

  uni.appVue = app
  impOther(app)
  impCx(app)

  return {
    app,
    store
  }
}
