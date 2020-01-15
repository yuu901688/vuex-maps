import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

export default (() => {
  let _store = null
  let _MAPS_STORE_ = {
    _allState: {},
  }
  /**
   * 建立 _MAPS_STORE_ 資料
   *
   * @param {*} key store.state.key
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
    mapStateLocalKey(stateKey)
    _MAPS_STORE_[stateKey].state = Object.keys(currentStore.state)
    _MAPS_STORE_[stateKey].getters = mapKeys('getters')
    _MAPS_STORE_[stateKey].actions = mapKeys('actions')
    _MAPS_STORE_[stateKey].mutations = mapKeys('mutations')
  }

  /**
   * 取出相應的 store 模塊
   *
   * @param {*} storeModules store module { storeName: storeKeys<String>[] || ['*'] }
   * @param {*} fn vuex 方法，mapState, mapActions...
   * @param {*} mapsKey _MAPS_STORE_ 的 key
   * @returns
   */
  const maps = storeModules => {
    return fn => mapsKey => {
      let keys = {}
      for (let k in storeModules) {
        const storeKeys = {}
        storeModules[k].forEach(e => {
          storeKeys[e] = true
        })
        if (storeKeys['*'] || storeKeys[mapsKey]) {
          keys = {
            ...keys,
            ...fn(k, _MAPS_STORE_[k][mapsKey]),
          }
        } else {
          continue
        }
      }
      return keys
    }
  }
  /**
   * 刷新頁面儲存 state 資料
   *
   * @param {*} extensions { refreshSave?: String }
   */
  const refreshSave = extensions => {
    const saveStorage = extensions.refreshSave
    if (saveStorage) {
      const storage =
        saveStorage === 'cookie' ? document.cookie : window[saveStorage]
      /**
       * 注入 state 並移除 storage data
       *
       * @param {*} jpData JSON.stringify data
       * @param {*} key state key
       * @param {*} removeCallback clear storage data
       */
      const setState = jpData => key => removeCallback => {
        const currentStore = _store[key]
        if (currentStore) {
          const saveState = JSON.parse(jpData)
          for (let sk in saveState) {
            currentStore.state[sk] = saveState[sk]
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
     * @param {*} store vuex store
     * @param {*} extensions 額外擴充功能 { refreshSave?: String }
     */
    use({ modules }, extensions = {}) {
      _store = modules
      for (let k in modules) {
        add(k)
      }
      refreshSave(extensions)
    },

    /**
     * 需要混合的 store module name
     *
     * @param {*} storeModules store module { storeName: storeKeys<String>[] || ['*'] }
     * @returns
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
     * @param {*} stateKey 要綁定的 vuex state key 名稱
     * @returns
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
