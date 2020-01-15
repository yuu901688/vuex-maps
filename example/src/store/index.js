import Vue from 'vue'
import Vuex from 'vuex'
import vuexMaps from '../../../vuex-maps'
import example from './example'
import example2 from './example2'

Vue.use(Vuex)

const store = {
  modules: {
    example,
    example2,
  },
}
vuexMaps.use(store, { refreshSave: 'cookie' })

export default new Vuex.Store(store)
