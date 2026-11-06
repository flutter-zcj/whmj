// 基于cesium开发GIS
// import proj4 from 'proj4'
import * as turf from '@turf/turf'
import * as lodash from 'lodash'
import qs from 'qs'
// window.proj4 = proj4
uni.turf = turf
uni._ = lodash
uni.qs = qs
// import pubUI from 'zhpub_com/srcui'
import uviewPlus from 'uview-plus'
import I18n from '../i18n.js'

export function impOther(appVue)
{
    uni.appVue.use(uviewPlus)
    uni.appVue.use(I18n)
    // #ifdef H5
    // pubUI.register(uni.appVue)
    // #endif
}
