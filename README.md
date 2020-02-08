# vuex-maps

[npm](https://www.npmjs.com/package/vuex-maps)、[github](https://github.com/yuu901688/vuex-maps)

最輕便好用的 vuex 庫。

> The lightest and easy-to-use vuex library.

## Install

```javascript
npm i vuex-maps
```

## Start

|             | use      | mixins         | handler       | sync                 |
| ----------- | -------- | -------------- | ------------- | -------------------- |
| File        | store.js | mixins         | computed      | methods              |
| Description | init     | get store data | v-model state | data synchronization |

- **Simple example**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/WNvbpQz)

- **Multiple modules**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/bGdNWGz)

- **Complex application**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/bGdNWNz)

- **Refresh save**
  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/wvaBeJW)

```javascript
/*
  ✨ vuexMaps.use(storeModules, option)
  Example. (store.js)
*/
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
vuexMaps.use(Vuex, modules)
/*
  If you want to save state during refresh, third value must be true
*/
vuexMaps.use(modules, true)
export default new Vuex.Store(modules)

/*
  ✨ vuexMaps.mixins(option)
  Example. (*.vue)
*/
export default {
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
      // ✨ Data synchronization, vuexMaps.use second value must be true.
      vuexMaps.sync()
    },
  },
}
```
