import Vue from 'vue'
// 1. import vuex, vuexMaps
import Vuex from 'vuex'
import vuexMaps from 'vuex-maps'
import example from './example'
import example2 from './example2'

Vue.use(Vuex)

const store = {
  // 2. 必須使用 modules (Must use modules)
  modules: {
    example,
    example2,
  },
}
/* 
  3. vuexMaps.use(store{}, { reloadSave?: string })
      注入 store 後即可開始使用 mixins，參閱 src/Example.vue
      You can start using mixins after injecting into the store, see src/Example.vue.

    reloadSave: 'localStorage' || 'sessionStorage' || 'cookie'
      可選參數：刷新儲存 vuex state 資料，可自行選擇刷新暫存的地方
      Optional parameters: refresh vuex state data, you can choose to refresh the temporary storage location
*/
vuexMaps.use(store)
// vuexMaps.use(store, { reloadSave: 'cookie' })

export default new Vuex.Store(store)
