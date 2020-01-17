export default {
  namespaced: true, // 必要 (required)
  state: {
    ex1State: 'ex1State',
  },
  getters: {
    ex1Getter() {
      return 'ex1Getter'
    },
  },
  mutations: {
    ex1Mutation(state) {
      state.ex1State = 'example mutation done.'
      console.log(state.ex1State, 'ex1Mutation')
    },
  },
  actions: {
    EX1_ACTION(ctx) {
      alert('example action done.')
      console.log(ctx, 'EX1_ACTION')
    },
  },
  modules: {
    ex1Father: {
      namespaced: true, // 必要 (required)
      modules: {
        ex1Child: {
          namespaced: true, // 必要 (required)
          state: {
            ex1ChildState: 'ex1Child',
          },
          mutations: {
            ex1ChildMutation(state) {
              console.log(state.ex1ChildState, 'ex1ChildMutation')
            },
          },
        },
      },
    },
  },
}
