export default {
  namespaced: true,
  state: {
    ex2State: 'ex2State',
  },
  getters: {
    ex2Getter() {
      return 'ex2Getter'
    },
  },
  mutations: {
    ex2Mutation(state) {
      console.log(state.ex2State, 'ex2Mutation')
    },
  },
  actions: {
    EX2_ACTION(ctx) {
      console.log(ctx, 'EX2_ACTION')
    },
  },
}
