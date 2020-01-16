export default {
  namespaced: true,
  state: {
    username: 'frank',
  },
  getters: {
    hello() {
      return 'hello'
    },
  },
  mutations: {
    myMutations(state) {
      console.log(state.username, 'myMutations')
    },
  },
  actions: {
    myActions(ctx) {
      console.log('myActions')
    },
  },
  modules: {
    yee: {
      namespaced: true,
      state: {
        m1: 'm1',
      },
      mutations: {
        mmm() {
          console.log('mmm')
        },
      },
      modules: {
        egg: {
          namespaced: true,
          state: {
            g1: 'g1',
          },
          mutations: {
            ggg() {
              console.log('ggg')
            },
          },
        },
      },
    },
  },
}
