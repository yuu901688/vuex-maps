import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

export default (() => {
  let _store = {}
  let _MAPS_STORE_ = {
    _allState: {},
  }
  /**
   * 建立 _MAPS_STORE_ 資料
   *
   * @param {*} stateKey (string) store.state.key
   */
  const add = stateKey => {
    const currentStore = _store[stateKey]
    const mapKeys = mapsKey => {
      let keys = []
      for (let k in currentStore[mapsKey]) {
        keys.push(k)
      }
      return keys
    }
    const mapModules = mapsKey => {
      let keys = []
      for (let k in currentStore[mapsKey]) {
        keys.push(`${stateKey}/${k}`)
      }
      return keys
    }
    const mapStateLocalKey = stateKey => {
      for (let k in currentStore.state) {
        if (!_MAPS_STORE_._allState[k]) {
          _MAPS_STORE_._allState[k] = []
          _MAPS_STORE_._allState[k].push(stateKey)
        } else {
          _MAPS_STORE_._allState[k].push(stateKey)
        }
      }
    }
    _MAPS_STORE_[stateKey] = {}
    const mapsStore = _MAPS_STORE_[stateKey]
    mapStateLocalKey(stateKey)
    mapsStore.state = currentStore.state ? Object.keys(currentStore.state) : []
    mapsStore.getters = mapKeys('getters')
    mapsStore.actions = mapKeys('actions')
    mapsStore.mutations = mapKeys('mutations')
    if (currentStore.modules) {
      mapsStore.modules = mapModules('modules')
    }
  }

  /**
   * 取出相應的 store 模塊
   *
   * @param {*} storeModules ({ storeName: storeKeys<String>[] || ['*'] }) store module
   * @param {*} fn (Function) vuex 方法，mapState, mapActions...
   * @param {*} mapsKey (string) _MAPS_STORE_ 的 key
   * @returns
   */
  const maps = storeModules => fn => mapsKey => {
    let keys = {}
    const storeKeys = {}
    const recursiveMaps = (key, isSet) => {
      const mapsStore = _MAPS_STORE_[key]
      if (isSet) {
        keys = {
          ...keys,
          ...fn(key, mapsStore[mapsKey]),
        }
      }
      if (mapsStore.modules) {
        mapsStore.modules.forEach(path => {
          recursiveMaps(path, isSet)
        })
      }
    }
    for (let k in storeModules) {
      storeModules[k].forEach(e => {
        storeKeys[e] = true
      })
      recursiveMaps(k, storeKeys['*'] || storeKeys[mapsKey])
    }
    return keys
  }
  /**
   * 刷新頁面儲存 state 資料
   *
   * @param {*} extensions ({ reloadSave?: String })
   */
  const reloadSave = extensions => {
    const saveStorage = extensions.reloadSave
    if (saveStorage) {
      const storage =
        saveStorage === 'cookie' ? document.cookie : window[saveStorage]
      /**
       * 注入 state 並移除 storage data
       *
       * @param {*} jpData (string) JSON.stringify data
       * @param {*} key (string) state key
       * @param {*} removeCallback (Function) clear storage data
       */
      const setState = jpData => key => removeCallback => {
        const currentStore = _store[key]
        if (currentStore) {
          const saveState = JSON.parse(jpData)
          for (let sk in saveState) {
            if (saveState[sk] !== undefined) {
              currentStore.state[sk] = saveState[sk]
            }
          }
          removeCallback()
        }
      }
      if (saveStorage === 'cookie') {
        const cookieArr = storage.split('; ')
        cookieArr.forEach(e => {
          if (/=\{/.test(e)) {
            const splitValue = e.split('=')
            const key = splitValue[0]
            const data = splitValue[1]
            setState(data)(key)(
              () =>
                (document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`),
            )
          }
        })
      } else {
        for (let k in storage) {
          setState(storage[k])(k)(() => storage.removeItem(k))
        }
      }
      window.addEventListener(`beforeunload`, () => {
        for (let k in _store) {
          const currentStore = _store[k]
          if (saveStorage === 'cookie') {
            document.cookie = `${k}=${JSON.stringify(currentStore.state)}`
          } else {
            storage.setItem(k, JSON.stringify(currentStore.state))
          }
        }
      })
    }
  }

  return {
    /**
     * 實例化 vuex-maps
     *
     * @param {*} store (store{}) vuex store
     * @param {*} extensions ({ reloadSave?: String }) 額外擴充功能
     */
    use({ modules }, extensions = {}) {
      const recursiveAdd = (modules, parentPath) => {
        for (let k in modules) {
          const childModules = modules[k].modules
          if (!parentPath) {
            _store[k] = modules[k]
            add(k)
          }
          if (childModules) {
            for (let mk in childModules) {
              const path =
                parentPath === '' ? `${k}/${mk}` : `${parentPath}/${mk}`
              _store[path] = childModules[mk]
              add(path)
              recursiveAdd(childModules, path)
            }
          }
        }
      }
      recursiveAdd(modules, '')
      reloadSave(extensions)
    },

    /**
     * 需要混合的 store module name
     *
     * @param {*} storeModules ({ storeName: storeKeys<String>[] || ['*'] }) store module
     * @returns mixinsData
     */
    mixins(storeModules) {
      return {
        computed: {
          ...maps(storeModules)(mapState)('state'),
          ...maps(storeModules)(mapGetters)('getters'),
        },
        methods: {
          ...maps(storeModules)(mapMutations)('mutations'),
          ...maps(storeModules)(mapActions)('actions'),
        },
      }
    },

    /**
     * 雙向綁定 vuex 數據
     *
     * @param {*} stateKey (string) 要綁定的 vuex state key 名稱
     * @returns state getter, setter
     */
    handler(stateKey) {
      const stateLocalKey = _MAPS_STORE_._allState[stateKey][0]
      return {
        get() {
          return _store[stateLocalKey].state[stateKey]
        },
        set(v) {
          return (_store[stateLocalKey].state[stateKey] = v)
        },
      }
    },
  }
})()
