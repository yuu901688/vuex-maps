# vuex-maps

[npm](https://www.npmjs.com/package/vuex-maps)、[github](https://github.com/yuu901688/vuex-maps)

最輕量好用的 vuex 庫。

> The lightest and easy-to-use vuex library.

## Install

```javascript
npm i vuex-maps
```

or

```javascript
yarn add vuex-maps
```

## Examples

- **Simple**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/WNvbpQz)

- **Multiple modules**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/bGdNWGz)

- **Complex application**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/bGdNWNz)

- **Refresh save**

  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/wvaBeJW)

- **Store anywhere**
  - [![edit on codepen](https://raw.githubusercontent.com/yuu901688/my-readme-resources/master/codepen-button.png)](https://codepen.io/yuu901688/pen/KKpVdMw?editors=1000)

## Apis

- **use**

  - **File**: store.js
  - **Description**: init
  - **params**: (storeData, isForeverSave)
  - **example**:

  ```js
  const store = {
    state: {
      global: 'global',
    },
    modules: {
      user,
    },
  }
  vuexMaps.use(store)
  vuexMaps.use(store, 'private')
  vuexMaps.use(store, 'public')
  ```

- **\$mounted**

  - **File**: \*.vue (created | mounted)
  - **Description**: data is loaded and rendered
  - **example**:

  ```js
  async created() {
    await vuexMaps.$mounted()
    // ...
  }

  // or

  Vue.mixins({
    methods: {
      watting() {
        return vuexMaps.$mounted() // promise
      }
    }
  })

  async created() {
    await this.watting()
    // ...
  }
  ```

- **mixins**

  - **File**: \*.vue (mixins)
  - **Description**: get store data
  - **params**: ({} | [])
  - **example**:

  ```js
  vuexMaps.mixins('product', ['*'])
  vuexMaps.mixins('product', ['state', 'mutations', 'getters', 'actions'])
  vuexMaps.mixins('product', {
    state: ['*'],
    mutations: ['GET_PRODUCTS'],
  })
  ```

- **handler**

  - **File**: \*.vue (computed)
  - **Description**: v-model state
  - **params**: (path)
  - **example**:

  ```js
  // template
  // <input type="text" v-model="productName">

  computed: {
    productName: vuexMaps.handler('product/name')
  }
  ```

- **sync**

  - **File**: \*.vue (methods)
  - **Description**: data synchronization
  - **params**: (methodName, path, params)
  - **example**:

  ```js
  // template
  // <input type="text" v-model="productName">

  methods: {
    login() {
      vuexMaps.sync()
    },
    callbackLogin() {
      // callback
      vuexMaps.sync('commit', 'user/logout', {
        id: 0,
        name: '',
        token: '',
      })
    },
  }
  ```

- **state**

  - **File**: \*.[vue/js]
  - **Description**: \$store.state
  - **example**:

  ```js
  // @readonly
  // user.js (store)
  export default {
    state: {
      name: 'Frank',
    },
  }
  // test.js
  vuexMaps.state.user.name // Frank
  ```

* **getters**

  - **File**: \*.[vue/js]
  - **Description**: \$store.getters
  - **example**:

  ```js
  // @readonly
  // user.js (store)
  export default {
    state: {
      firstName: 'Jiahao',
      lastName: 'Wu',
    },
    getters: {
      space() {
        return ' '
      },
      funllName(state, getters) {
        return state.firstName + getters.space + state.lastName
      },
    },
  }
  // test.js
  vuexMaps.getters.user.fullName // Jiahao Wu
  ```

- **setState**

  - **File**: \*.[vue/js]
  - **Description**: change state
  - **params**: (path, value)
  - **example**:

  ```js
  // user.js (store)
  export default {
    state: {
      name: 'Frank',
    },
  }
  // test.js
  vuexMaps.state.user.name // Frank
  vuexMaps.setState('user/name', 'Jeff')
  vuexMaps.state.user.name // Jeff
  }
  ```

- **commit**

  - **File**: \*.[vue/js]
  - **Description**: \$store.commit
  - **params**: (path, param)
  - **example**:

  ```js
  // user.js (store)
  export default {
    state: {
      name: 'Frank',
    },
    mutations: {
      SET_NAME(state) {
        state.name = 'Jeff'
      }
    }
  }
  // test.js
  vuexMaps.state.user.name // Frank
  vuexMaps.commit('user/SET_NAME', 'Jeff')
  vuexMaps.state.user.name // Jeff
  }
  ```

- **dispatch**

  - **File**: \*.[vue/js]
  - **Description**: \$store.dispatch
  - **params**: (path, param)
  - **example**:

  ```js
  // user.js (store)
  export default {
    state: {
      name: 'Frank',
    },
    actions: {
      GET_USERNAME(state, id) {
        return new Promise(reslove => {
          fetch('/user/' + id).then(res => {
            reslove(res.json())
          })
        })
      },
    },
  }
  // test.js
  ;async () => {
    const name = await vuexMaps.dispatch('user/GET_USERNAME', 6)
  }
  ```
