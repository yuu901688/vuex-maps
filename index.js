import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

// vuex-maps v1.2.4

export default (() => {
  let _store = {}
  let _MAPS_STORE_ = {}
  let _IS_REFRESH_SAVE_ = false
  let _vue = () => {}

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
  const setStorageData = (isRemove = true) => {
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
    if (isRemove) {
      localStorage.removeItem('_VM_STORAGE_', JSON.stringify(result))
    }
  }

  /**
   * 刷新頁面儲存 state 資料
   *
   * @param {*} isRefreshSave (Boolean)
   * @param {*} isSaveForever (Boolean)
   */
  const refreshSave = (isRefreshSave, isSaveForever) => {
    if (isRefreshSave) {
      const storageData = localStorage.getItem('_VM_STORAGE_')
      const compileData = storageData ? JSON.parse(storageData) : {}
      const setData = data => {
        for (let k in data) {
          setState(data[k], k)
        }
      }
      const setState = (data, key) => {
        const currentStore = _store[key]
        for (let sk in data) {
          currentStore.state[sk] = data[sk]
        }
      }
      let setDataTimer = null
      let isSet = false
      let isFirst = true
      if (Object.keys(compileData).length) {
        isFirst = false
        setData(compileData)
        setTimeout(() => _vue(), 0)
        if (isSaveForever) {
          localStorage.removeItem('_VM_STORAGE_')
        }
      } else {
        localStorage.setItem('_VM_CALL_', new Date())
        localStorage.removeItem('_VM_CALL_')
      }
      _IS_REFRESH_SAVE_ = true
      window.addEventListener(`storage`, e => {
        if (e.key === '_VM_STORAGE_' && e.newValue !== null) {
          if (setDataTimer === null) {
            const set = () => {
              const data = JSON.parse(e.newValue)
              setData(data)
              setDataTimer = null
              isSet = false
              if (isSaveForever) {
                localStorage.removeItem('_VM_STORAGE_')
              }
            }
            if (isFirst) {
              isFirst = false
              set()
              _vue()
            } else {
              setDataTimer = setTimeout(set, 0)
            }
          }
        }
        if (e.key === '_VM_CALL_') {
          if (!isSet) {
            isSet = true
            setStorageData()
          }
        }
      })
      window.addEventListener(`beforeunload`, () =>
        setStorageData(!isSaveForever),
      )
    }
  }

  return {
    /**
     * 實例化 vuex-maps
     *
     * @param {*} store (store{}) vuex store
     * @param {*} isRefreshSave (Boolean) 是否刷新儲存
     * @param {*} isSaveForever (Boolean) 是否永久儲存(全部頁面關閉再開啟仍要有資料 ? true : false)
     */
    use({ modules }, isRefreshSave = false, isSaveForever = false) {
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
      refreshSave(isRefreshSave, isSaveForever)
    },

    /**
     * 等到資料注入完成再渲染 vue
     *
     * @param {*} callbackVue (Function: Vue)
     * @returns
     */
    $mounted(callbackVue) {
      return (_vue = callbackVue)
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
