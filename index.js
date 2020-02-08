import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

// vuex-maps v1.0.0

export default (() => {
  let _store = {}
  let _MAPS_STORE_ = {}
  let _IS_REFRESH_SAVE_ = false

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
   * 注入要儲存的資料到 storage 裡
   */
  const setStorageData = () => {
    const result = {}
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
        result[k] = newState
      }
    }
    localStorage.setItem('_VM_STORAGE_', JSON.stringify(result))
    sessionStorage.setItem('_VM_STORAGE_', JSON.stringify(result))
  }

  /**
   * 刷新頁面儲存 state 資料
   *
   * @param {*} isRefreshSave (Boolean)
   */
  const refreshSave = isRefreshSave => {
    if (isRefreshSave) {
      const setState = (data, key) => {
        const currentStore = _store[key]
        if (currentStore) {
          for (let sk in data) {
            if (data[sk] !== undefined) {
              if (!_store[`${key}/${sk}`]) {
                currentStore.state[sk] = data[sk]
              }
            }
          }
        }
      }
      const setData = (isWatching = false) => {
        const set = storageName => {
          const storage = window[storageName]
          const storageData = storage.getItem('_VM_STORAGE_')
          const compileData = storageData ? JSON.parse(storageData) : {}
          for (let k in compileData) {
            setState(compileData[k], k)
          }
          storage.removeItem('_VM_STORAGE_')
        }
        set('localStorage')
        if (!isWatching) {
          set('sessionStorage')
        }
      }
      setData()
      _IS_REFRESH_SAVE_ = true
      window.addEventListener(`storage`, e => {
        if (e.key === '_VM_STORAGE_' && e.newValue) {
          setData(true)
        }
      })
      window.addEventListener(`beforeunload`, setStorageData)
    }
  }

  return {
    /**
     * 實例化 vuex-maps
     *
     * @param {*} store (store{}) vuex store
     * @param {*} isRefreshSave (Boolean) 是否刷新儲存
     */
    use({ modules }, isRefreshSave = false) {
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
      refreshSave(isRefreshSave)
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

    /**
     * 同步所有分頁的資料，必須啟用 refreshSave
     */
    sync() {
      if (_IS_REFRESH_SAVE_) {
        setStorageData()
      }
    },
  }
})()
