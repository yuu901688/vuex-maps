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
}
