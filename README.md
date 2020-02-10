# vuex-maps

[npm](https://www.npmjs.com/package/vuex-maps)、[github](https://github.com/yuu901688/vuex-maps)

最輕量好用的 vuex 庫。

> The lightest and easy-to-use vuex library.

## Install

```javascript
npm i vuex-maps
```

## Start

|             | use      | $mounted                    | mixins          | handler           | sync                 |
| ----------- | -------- | --------------------------- | --------------- | ----------------- | -------------------- |
| File        | store.js | main.js                     | \*.vue (mixins) | \*.vue (computed) | \*.vue (methods)     |
| Description | init     | data is loaded and rendered | get store data  | v-model state     | data synchronization |

- **Simple example**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/WNvbpQz)

- **Multiple modules**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/bGdNWGz)

- **Complex application**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/bGdNWNz)

- **Refresh save**
  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/wvaBeJW)

```javascript
const exampleModule = {
  namespaced: true, // required
  VM_SAVE: true, // (required), if you want to record in vuexMaps
  /*
    (What state is saved when refreshing)
    VM_SAVE: ['stateName', ...]
    VM_SAVE: ['*'] save all state
  */
  state: {},
  getters: {},
  mutations: {},
  actions: {},
}
const modules = {
  modules: {
    example: exampleModule,
  },
}
/*
  ✨ vuexMaps.use(storeModules, option)
  Example. (store.js)
*/
vuexMaps.use(Vuex, modules)
/*
  If you want to save state during refresh, second value must be true.
  If all pages are closed and reopened, there is still data, write true, default is false. (third value)
*/
vuexMaps.use(modules, true, true)
export default new Vuex.Store(modules)

/*
  ✨ vuexMaps.$mounted(() => new Vue({ ... })) 
  If you want to wait until the data is loaded, render vue
  Example. (main.js)
*/
vuexMaps.$mounted(() =>
  new Vue({
    store,
    render: h => h(App),
  }).$mount('#app'),
)

export default {
/*
  ✨ vuexMaps.mixins(option)
  Example. (*.vue [mixins])
*/
  mixins: [
    /*
      {
        moduleKey: string[]
      }
      ['*'] === ['state', 'getters', 'mutations', 'actions']
    */
    vuexMaps.mixins({
      example: ['*'],
      example2: ['state', 'mutations'],
      // ...
    }),
    /*
      Exact get value
    */
    vuexMaps.mixins({
      example: {
        state: ['title'],
        // ...
      },
      'example/brand/apple': {
        state: ['logo'],
        // ...
      },
    }),
  ],
  computed: {
    /*
      ✨ vuexMaps.handler(option)
      Example. (*.vue [computed])
    */
    vModelTitle: vuexMaps.handler('example', 'title'),
  },
  methods: {
    login() {
      // ✨ vuexMaps.sync() Data synchronization, vuexMaps.use second value must be true.
      vuexMaps.sync()
    },
  },
}
```
