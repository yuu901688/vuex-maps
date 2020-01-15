import Vue from 'vue'
import App from './App.vue'
import store from './store'
import vuexMaps from '../../vuex-maps.js'

Vue.config.productionTip = false
vuexMaps.use(store)
console.log('main')

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
