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

  - [<button class="codepen-button"><span>Edit on </span></button>](https://codepen.io/yuu901688/pen/WNvbpQz)

- **Multiple modules**

  - [<button class="codepen-button"><span>Edit on </span></button>](https://codepen.io/yuu901688/pen/bGdNWGz)

- **Complex application**

  - [<button class="codepen-button"><span>Edit on </span></button>](https://codepen.io/yuu901688/pen/bGdNWNz)

- **Refresh save**
  - [<button class="codepen-button"><span>Edit on </span></button>](https://codepen.io/yuu901688/pen/wvaBeJW)

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

<style>
@-webkit-keyframes button-hover-animation{0%,to{background-image:linear-gradient(115deg,#4fcf70,#fad648,#a767e5,#12bcfe)}25%{background-image:linear-gradient(115deg,#fad648,#a767e5,#12bcfe,#4fcf70)}50%{background-image:linear-gradient(115deg,#a767e5,#12bcfe,#4fcf70,#fad648)}75%{background-image:linear-gradient(115deg,#12bcfe,#4fcf70,#fad648,#a767e5)}}@keyframes button-hover-animation{0%,to{background-image:linear-gradient(115deg,#4fcf70,#fad648,#a767e5,#12bcfe)}25%{background-image:linear-gradient(115deg,#fad648,#a767e5,#12bcfe,#4fcf70)}50%{background-image:linear-gradient(115deg,#a767e5,#12bcfe,#4fcf70,#fad648)}75%{background-image:linear-gradient(115deg,#12bcfe,#4fcf70,#fad648,#a767e5)}}
.codepen-button {
  display: inline-block;
  border: 0;
  border-radius: 6px;
  padding: 2px;
  color: #fff;
  background-image: linear-gradient(115deg,#4fcf70,#fad648,#a767e5,#12bcfe,#44ce7b);
  margin: 0 auto;
  font-weight: 300;
  font-size: 15px;
  cursor: pointer;
  user-select: none;
  outline: none;
}
.codepen-button:focus, .codepen-button:hover {
  -webkit-animation: button-hover-animation .5s linear infinite;
  animation: button-hover-animation .5s linear infinite;
}
.codepen-button span {
  display: block;
  padding: 5px 15px;
  border-radius: 6px;
  background: #000;
}
.codepen-button span::after {
  content: '';
  background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/605192/codepen-logo.svg);
  width: 80px;
  height: 15px;
  display: inline-block;
  position: relative;
  top: 2px;
}
</style>
