import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

interface iStore {
  [key: string]: any
}

interface iMapsStoreAllState {
  [key: string]: string[]
}

interface iMapsStoreOther {
  state?: string[]
  getters?: string[]
  actions?: string[]
  mutations?: string[]
}

interface iMapsStore {
  _allState: iMapsStoreAllState
  [key: string]: iMapsStoreOther
}

export default (() => {
  let _store: iStore = {}
  let _MAPS_STORE_: iMapsStore = {
    _allState: {},
  }

  /**
   * 建立 _MAPS_STORE_ 資料
   *
   * @param {*} stateKey store.state.key
   */
  const add = (stateKey: string) => {
    const mapKeys = (mapsKey: string) => {
      let keys = []
      for (let k in _store[mapsKey]) {
        const namespacedKey = `${stateKey}/`
        if (k.indexOf(namespacedKey) !== -1) {
          keys.push(k.replace(namespacedKey, ''))
        }
      }
      return keys
    }
    const mapStateLocalKey = (stateKey: string) => {
      for (let k in _store.state[stateKey]) {
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
    _MAPS_STORE_[stateKey].state = Object.keys(_store.state[stateKey])
    _MAPS_STORE_[stateKey].getters = mapKeys('getters')
    _MAPS_STORE_[stateKey].actions = mapKeys('_actions')
    _MAPS_STORE_[stateKey].mutations = mapKeys('_mutations')
  }

  /**
   * 取出相應的 store 模塊
   *
   * @param {*} storeModules store module { storeName: storeKeys<string>[] || ['*'] }
   * @param {*} fn vuex 方法，mapState, mapActions...
   * @param {*} mapsKey _MAPS_STORE_ 的 key
   * @returns
   */
  const maps = (storeModules: { [key: string]: string[] }) => {
    return (fn: Function) => (mapsKey: string) => {
      let keys = {}
      for (let k in storeModules) {
        const storeKeys: { [key: string]: boolean } = {}
        storeModules[k].forEach(e => {
          storeKeys[e] = true
        })
        if (storeKeys['*'] || storeKeys[mapsKey]) {
          keys = {
            ...keys,
            ...fn(k, (_MAPS_STORE_[k] as any)[mapsKey]),
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
   * @param {*} extensions { refreshSave?: string }
   */
  const refreshSave = (extensions: { refreshSave?: string }) => {
    const saveStorage = extensions.refreshSave
    if (saveStorage) {
      interface asStorage {
        [key: string]: any
      }
      const storage: string | asStorage =
        saveStorage === 'cookie' ? document.cookie : window[saveStorage as any]
      /**
       * 注入 state 並移除 storage data
       *
       * @param {*} jpData JSON.stringify data
       * @param {*} key state key
       * @param {*} removeCallback clear storage data
       */
      const setState = (
        jpData: string,
        key: string,
        removeCallback: Function,
      ) => {
        if (_store.state[key]) {
          const saveState = JSON.parse(jpData)
          for (let sk in saveState) {
            _store.state[key][sk] = saveState[sk]
          }
          removeCallback()
        }
      }
      if (saveStorage === 'cookie') {
        const cookieText = storage as string
        const cookieArr = cookieText.split('; ')
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
        const windowStorage: asStorage = storage as asStorage
        for (let k in windowStorage) {
          setState(windowStorage[k], k, () => windowStorage.removeItem(k))
        }
      }
      window.addEventListener(`beforeunload`, () => {
        for (let k in _store.state) {
          if (saveStorage === 'cookie') {
            document.cookie = `${k}=${JSON.stringify(_store.state[k])}`
          } else {
            ;(storage as asStorage).setItem(k, JSON.stringify(_store.state[k]))
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
     * @param {*} extensions 額外擴充功能 { refreshSave?: string }
     */
    use(store: iStore, extensions = {}) {
      _store = store
      for (let k in store.state) {
        add(k)
      }
      refreshSave(extensions)
    },

    /**
     * 需要混合的 store module name
     *
     * @param {*} storeModules store module { storeName: storeKeys<string>[] || ['*'] }
     * @returns
     */
    mixins(storeModules: { [key: string]: string[] }) {
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
    handler(stateKey: string) {
      const stateLocalKey = _MAPS_STORE_._allState[stateKey][0]
      return {
        get() {
          return _store.state[stateLocalKey][stateKey]
        },
        set(v: string) {
          return (_store.state[stateLocalKey][stateKey] = v)
        },
      }
    },
  }
})()
