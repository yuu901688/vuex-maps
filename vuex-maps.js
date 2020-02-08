import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

export default (() => {
  let _store = {}
  let _MAPS_STORE_ = {}
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
    _MAPS_STORE_[stateKey] = {}
    const mapsStore = _MAPS_STORE_[stateKey]
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
  const maps = (storeModules, fn, mapsKey) => {
    let keys = {}
    const recursiveMaps = (key, isSet, customData) => {
      const mapsStore = _MAPS_STORE_[key]
      const mapsStoreModules = mapsStore.modules
      if (mapsStore) {
        if (isSet) {
          const customLen = customData.length
          const mapsData =
            customLen && customData[0] !== '*' ? customData : mapsStore[mapsKey]
          keys = {
            ...keys,
            ...fn(key, mapsData),
          }
          if (mapsStoreModules && customLen === 0) {
            mapsStoreModules.forEach(path => {
              recursiveMaps(path, isSet, customData)
            })
          }
        }
      }
    }
    for (let k in storeModules) {
      const currentModule = storeModules[k]
      let storeKeys
      let customData = []
      if (Array.isArray(currentModule)) {
        storeKeys = {}
        currentModule.forEach(e => {
          storeKeys[e] = true
        })
      } else {
        storeKeys = currentModule
        customData = currentModule[mapsKey]
      }
      recursiveMaps(k, storeKeys['*'] || storeKeys[mapsKey], customData)
    }
    return keys
  }
  /**
   * 刷新頁面儲存 state 資料
   *
   * @param {*} storageName (string)
   */
  const refreshSave = storageName => {
    if (storageName) {
      const storage =
        storageName === 'cookie' ? document.cookie : window[storageName]
      /**
       * 注入 state 並移除 storage data
       *
       * @param {*} jpData (string) JSON.stringify data
       * @param {*} key (string) state key
       * @param {*} removeCallback (Function) clear storage data
       */
      const setState = (jpData, key, removeCallback) => {
        const currentStore = _store[key]
        if (currentStore) {
          const saveState = JSON.parse(jpData)
          for (let sk in saveState) {
            if (saveState[sk] !== undefined) {
              if (!_store[`${key}/${sk}`]) {
                currentStore.state[sk] = saveState[sk]
              }
            }
          }
          removeCallback()
        }
      }
      if (storageName === 'cookie') {
        const cookieArr = storage.split('; ')
        cookieArr.forEach(e => {
          if (/=\{/.test(e)) {
            const splitValue = e.split('=')
            const key = splitValue[0]
            const data = splitValue[1]
            setState(
              data,
              key,
              () =>
                (document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`),
            )
          }
        })
      } else {
        for (let k in storage) {
          setState(storage[k], k, () => storage.removeItem(k))
        }
      }
      window.addEventListener(`beforeunload`, () => {
        for (let k in _store) {
          const currentStore = _store[k]
          const saves = currentStore.VM_SAVE
          if (Array.isArray(saves)) {
            const state = currentStore.state || {}
            let newState = {}
            if (saves.length === 1 && saves[0] === '*') {
              newState = state
            } else {
              saves.forEach(k => {
                newState[k] = state[k]
              })
            }
            if (storageName === 'cookie') {
              document.cookie = `${k}=${JSON.stringify(newState)}`
            } else {
              storage.setItem(k, JSON.stringify(newState))
            }
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
     * @param {*} refreshSaveStorage (String) 是否刷新儲存
     */
    use({ modules }, refreshSaveStorage = '') {
      const recursiveAdd = (modules, parentPath) => {
        for (let k in modules) {
          const currentModules = modules[k]
          if (currentModules.VM_SAVE) {
            const path = parentPath === '' ? k : parentPath + '/' + k
            _store[path] = currentModules
            add(path)
            if (currentModules.modules) {
              recursiveAdd(currentModules.modules, path)
            }
          }
        }
      }
      recursiveAdd(modules, '')
      refreshSave(refreshSaveStorage)
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
          ...maps(storeModules, mapState, 'state'),
          ...maps(storeModules, mapGetters, 'getters'),
        },
        methods: {
          ...maps(storeModules, mapMutations, 'mutations'),
          ...maps(storeModules, mapActions, 'actions'),
        },
      }
    },

    /**
     * 雙向綁定 vuex 數據
     *
     * @param {*} modulePath (string) 要綁定的 vuex state modulePath
     * @param {*} stateKey (string) 要綁定的 vuex state keyName
     * @returns state getter, setter
     */
    handler(modulePath, stateKey) {
      return {
        get() {
          return _store[modulePath].state[stateKey]
        },
        set(value) {
          return (_store[modulePath].state[stateKey] = value)
        },
      }
    },
  }
})()
