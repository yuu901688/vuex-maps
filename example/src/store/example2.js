export default {
  // namespaced: true,
  state: {
    username: 'jeff',
    username2: 'jennifer',
  },
  getters: {
    hello2() {
      return 'hello'
    },
  },
  mutations: {
    myMutations2(state) {
      console.log(state.username, 'myMutations')
    },
  },
  actions: {
    myActions2(ctx) {
      console.log('myActions')
    },
  },
}
