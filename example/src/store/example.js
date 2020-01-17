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
      // modules: {
      //   egg: {
      //     namespaced: true,
      //     state: {
      //       g1: 'g1',
      //     },
      //     mutations: {
      //       ggg() {
      //         console.log('ggg')
      //       },
      //     },
      //   },
      //   egg2: {
      //     namespaced: true,
      //     state: {
      //       g1: 'g1',
      //     },
      //     mutations: {
      //       ggg() {
      //         console.log('ggg')
      //       },
      //     },
      //   },
      // },
    },
    yee2: {
      namespaced: true,
      state: {
        yee2State: 'yee2State',
      },
      mutations: {
        yee2Mutations() {
          console.log('yee2Mutations')
        },
      },
      modules: {
        egg2: {
          namespaced: true,
          state: {
            g2: 'g2',
          },
          mutations: {
            ggg2() {
              console.log('ggg2')
            },
          },
          modules: {
            egg2: {
              namespaced: true,
              state: {
                g22: 'g2',
              },
              mutations: {
                ggg22() {
                  console.log('ggg2')
                },
              },
            },
          },
        },
      },
    },
  },
}
