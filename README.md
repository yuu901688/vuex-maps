# vuex-maps

以下英文來自 Google 翻譯：

> The following English translation from Google:

vuex 取值庫，快速取出 state, getters, mutations, actions 的值，並支援雙向綁定及刷新存值功能。

> vuex value library, quickly get the value of state, getters, mutations, actions, and supports two-way binding and refresh stored value functions.

## 快速開始

> Quick start

### 安裝

> Install

```javascript
npm i vuex-maps
```

### 使用

> use

[Demo page]()

| use                                       | mixins                            | handler                   |
| ----------------------------------------- | --------------------------------- | ------------------------- |
| 實例化 store (Instantiate store)          | 取值 (get value)                  | 雙向綁定 (v-model)        |
| vuexMaps.use(store)                       | vuexMaps.mixins({example: ['*']}) | vuexMaps.handler('state') |
| vuexMaps.use(store, { reloadSave: true }) |                                   |                           |

### 簡略版

> Short description

```javascript
// store.js
import vuexMaps from 'vuex-maps'
const store = {
  modules: {
    example,
    // ...
  },
}
vuexMaps.use(store)

// example.js (store.module)
export default {
  namespaced: true, // 必要 (required)
  state: {
    // ...
  },
  getters: {
    // ...
  },
  mutations: {
    // ...
  },
  actions: {
    // ...
  },
}

// *.vue
import vuexMaps from 'vuex-maps'
export default {
  mixins: [vuexMaps.mixins({ example: ['*'] })],
}
```

---

### store.js

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
// 1. import vuexMaps
import vuexMaps from 'vuex-maps'
import example from './example'
import example2 from './example2'

Vue.use(Vuex)

const store = {
  // 2. 必須使用 modules (Must use modules)
  modules: {
    example,
    example2,
  },
}
/* 
  1. vuexMaps.use(store{}, { reloadSave?: string })
      注入 store 後即可開始使用 mixins，參閱 src/Example.vue
      You can start using mixins after injecting into the store, see src/Example.vue.

    reloadSave: 'localStorage' || 'sessionStorage' || 'cookie'
      可選參數：刷新儲存 vuex state 資料，可自行選擇刷新暫存的地方
      Optional parameters: refresh vuex state data, you can choose to refresh the temporary storage location
*/
vuexMaps.use(store)
// vuexMaps.use(store, { reloadSave: 'cookie' })

export default new Vuex.Store(store)
```

### \*.vue

```javascript
// 1. import vuexMaps
import vuexMaps from 'vuex-maps'

export default {
  name: 'example',
  mixins: [
    /* 
      2. vuexMaps.mixins 取出 store 資料
      {
        // example: 
        //    store/index.js modules 入口名稱
        //    store/index.js modules entry name

        // ['*']
        //    取出 state, getters, actions, mutations 值
        //    get state, getters, actions, mutations value
        //    ['*'] === ['state', 'getters', 'actions', 'mutations']

        example: ['*'],
      }
    */
    vuexMaps.mixins({
      example: ['*'],
      example2: ['state'],
    }),
  ],
  computed: {
    ex1ChildStateVModel: vuexMaps.handler('ex1ChildState'),
  },
}
```

### example.js

```javascript
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
```
