import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'

// vuex-maps v1.3.1

export default (() => {
  let _store = {}
  let _mapsStore = {}
  let _vmGetters = {}
  let _rootGetters = {}
  let _rootState = {}
  let _foreverData = {}
  let _isPublic = false
  let _isPrivate = false
  let _mounted = {
    is: false,
    $reslove: null,
  }

  /**
   * sync callback
   */
  const callbackSync = () => {
    if (localStorage.getItem('_vmHasSync')) {
      const methodName = localStorage.getItem('_vmSyncMethodName')
      const path = localStorage.getItem('_vmSyncModulePath')
      const syncParam = localStorage.getItem('_vmSyncParam')
      const param = syncParam ? JSON.parse(syncParam) : undefined
      localStorage.removeItem('_vmHasSync')
      localStorage.removeItem('_vmSyncMethodName')
      localStorage.removeItem('_vmSyncModulePath')
      if (param !== undefined) {
        localStorage.removeItem('_vmSyncParam')
        new VuexMaps()[methodName](path, param)
      } else {
        new VuexMaps()[methodName](path, param)
      }
    }
  }

  /**
   * 建立 _mapsStore 資料
   *
   * @param {*} stateKey (string) store.state.key
   */
  const add = stateKey => {
    const curStore = _store[stateKey]
    const mapKeys = mapsKey => {
      let keys = []
      for (let k in curStore[mapsKey]) {
        keys.push(k)
      }
      return keys
    }
    const mapModules = mapsKey => {
      const isRoot = stateKey === '/'
      let keys = []
      for (let k in curStore[mapsKey]) {
        const path = isRoot ? k : `${stateKey}/${k}`
        keys.push(path)
      }
      return keys
    }
    _mapsStore[stateKey] = {}
    const mapsStore = _mapsStore[stateKey]
    mapsStore.state = curStore.state ? Object.keys(curStore.state) : []
    mapsStore.getters = mapKeys('getters')
    mapsStore.actions = mapKeys('actions')
    mapsStore.mutations = mapKeys('mutations')
    if (curStore.modules) {
      mapsStore.modules = mapModules('modules')
    }
  }

  /**
   * 取出相應的 store 模塊
   *
   * @param {*} storeModules ({ storeName: storeKeys<String>[] || ['*'] }) store module
   * @param {*} fn (Function) vuex 方法，mapState, mapActions...
   * @param {*} mapsKey (string) _mapsStore 的 key
   * @returns
   */
  const maps = (storeModules, fn, mapsKey) => {
    let keys = {}
    const recursiveMaps = (key, isSet, customData) => {
      const mapsStore = _mapsStore[key]
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
      const curModule = storeModules[k]
      let storeKeys
      let customData = []
      if (Array.isArray(curModule)) {
        storeKeys = {}
        curModule.forEach(e => {
          storeKeys[e] = true
        })
      } else {
        storeKeys = curModule
        customData = curModule[mapsKey]
      }
      recursiveMaps(k, storeKeys['*'] || storeKeys[mapsKey], customData)
    }
    return keys
  }

  /**
   * 注入要儲存的資料到 storage 裡
   */
  const setStorageData = () => {
    if (Object.keys(_foreverData).length === 0) {
      let watchState = {}
      for (let k in _store) {
        const curStore = _store[k]
        const saves = curStore.VM_SAVE
        if (Array.isArray(saves)) {
          const state = curStore.state || {}
          let newState = {}
          if (saves.length === 1 && saves[0] === '*') {
            newState = state
          } else {
            saves.forEach(k => {
              Object.defineProperty(watchState, k, {
                get() {
                  return state[k]
                },
                enumerable: true,
              })
            })
            newState = watchState
          }
          _foreverData[k] = newState
        }
      }
    }
    localStorage.setItem('_vmStorage', JSON.stringify(_foreverData))
  }

  /**
   * 將 forever 的值塞到 vuex 裡
   *
   * @param {*} data
   */
  const setData = data => {
    for (let k in data) {
      const curStore = _store[k]
      const curData = data[k]
      for (let sk in curData) {
        curStore.state[sk] = curData[sk]
      }
    }
  }

  /**
   * 刷新頁面儲存 state 資料
   */
  const saveForever = () => {
    const storageData = localStorage.getItem('_vmStorage')
    const compileData = storageData ? JSON.parse(storageData) : {}
    let setDataTimer = null
    let isSet = false
    let isFirst = true
    if (_isPrivate) {
      Object.defineProperty(_mounted, '$$is', {
        get() {
          return _mounted.is
        },
        set(reslove) {
          _mounted.$reslove = reslove
          return
        },
      })
    } else if (_isPublic) {
      _mounted.is = true
    }
    if (Object.keys(compileData).length) {
      isFirst = false
      _mounted.is = true
      setData(compileData)
      if (_isPrivate) {
        localStorage.removeItem('_vmStorage')
      }
    } else {
      localStorage.setItem('_vmCall', new Date())
      localStorage.removeItem('_vmCall')
    }
    if (_isPrivate) {
      window.addEventListener(`storage`, e => {
        if (e.key === '_vmStorage' && e.newValue !== null) {
          if (setDataTimer === null) {
            const set = () => {
              const data = JSON.parse(e.newValue)
              setData(data)
              setDataTimer = null
              isSet = false
              localStorage.removeItem('_vmStorage')
              callbackSync()
            }
            if (isFirst) {
              isFirst = false
              set()
              if (_mounted.is === false) {
                _mounted.is = true
                _mounted.$reslove()
              }
            } else {
              setDataTimer = setTimeout(set, 0)
            }
          }
        }
        if (e.key === '_vmCall') {
          if (!isSet) {
            isSet = true
            setStorageData()
          }
        }
      })
    } else if (_isPublic) {
      window.addEventListener(`storage`, e => {
        if (e.key === '_vmSyncPublic' && e.newValue !== null) {
          const storage = localStorage.getItem('_vmStorage')
          const data = storage ? JSON.parse(storage) : {}
          setData(data)
          callbackSync()
        }
      })
    }
    window.addEventListener(`beforeunload`, setStorageData)
  }

  /**
   * 轉換 path -> [modulePath, keyName]
   *
   * @param {*} path (string) "modules/值"路徑
   * @returns [modulePath, keyName]
   */
  const getPathKey = path => {
    const spath = path.split('/')
    const spathLen = spath.length
    let modulePath = '/'
    let keyName = ''
    if (spathLen === 1) {
      keyName = spath[0]
    } else {
      keyName = spath[spathLen - 1]
      spath.pop()
      modulePath = spath.join('/')
    }
    return [modulePath, keyName]
  }

  /**
   * 塞 rootGetters 值進去
   *
   * @param {*} path (string) "modules/值"路徑
   * @param {*} getters (Object) getters
   * @returns
   */
  const setRootGetters = (path, getters) => {
    const firstPath = path.split('/')[0]
    const curStore = _store[path]
    const state = curStore.state
    let curGetters = curStore.getters
    let curVmGetters = _vmGetters[firstPath]
    let vmGetters
    if (!curVmGetters) {
      _vmGetters[firstPath] = {}
    }
    vmGetters = _vmGetters[firstPath]
    for (let k in getters) {
      if (!vmGetters[k]) {
        const path = firstPath === '' ? k : `${firstPath}/${k}`
        Object.defineProperty(vmGetters, k, {
          get() {
            return curGetters[k](state, vmGetters)
          },
          enumerable: true,
        })
        Object.defineProperty(_rootGetters, path, {
          get() {
            return vmGetters[k]
          },
          enumerable: true,
        })
      } else {
        console.error(`[vuexMap] duplicate getter key: ${path}`)
      }
    }
  }

  /**
   * 塞 rootState 值進去，傳地址而已
   *
   * @param {*} moduleKey (string)
   * @param {*} state (Object)
   * @returns
   */
  const setRootState = (moduleKey, state) => {
    if (moduleKey === '/') {
      for (let k in state) {
        _rootState[k] = state[k]
      }
    } else {
      _rootState[moduleKey] = state
    }
  }

  class VuexMaps {
    /**
     * 實例化 vuex-maps
     *
     * @param {*} store (store{}) vuex store
     * @param {*} isSaveForever (String | Boolean) 是否永久儲存 'public' | 'private', default false
     */
    use(store, isSaveForever = false) {
      const { modules } = store
      const recursiveAdd = (modules, parentPath, isFirstModules) => {
        for (let k in modules) {
          const curModules = modules[k]
          if (curModules.VM_SAVE) {
            const path = parentPath === '' ? k : parentPath + '/' + k
            _store[path] = curModules
            add(path)
            setRootGetters(path, curModules.getters || {})
            if (isFirstModules) {
              setRootState(k, curModules.state || {})
            }
            if (curModules.modules) {
              recursiveAdd(curModules.modules, path, false)
            }
          }
        }
      }
      if (store.VM_SAVE) {
        _store['/'] = store
        add('/')
        setRootGetters('/', store.getters || {})
        setRootState('/', store.state || {})
      }
      recursiveAdd(modules, '', true)

      if (isSaveForever) {
        _isPrivate = isSaveForever === 'private'
        _isPublic = isSaveForever === 'public'
        saveForever()
      }
    }

    /**
     * 等到資料注入完成再渲染 vue，private 用
     *
     * @returns
     * @memberof VuexMaps
     */
    $mounted() {
      return new Promise(reslove => {
        if (_mounted.is === false) {
          _mounted.$$is = reslove
        } else {
          reslove()
        }
      })
    }

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
    }

    /**
     * 雙向綁定 vuex 數據
     *
     * @param {*} modulePath (string) modulePath
     * @returns state getter, setter
     */
    handler(path) {
      const [modulePath, keyName] = getPathKey(path)
      return {
        get() {
          return _store[modulePath].state[keyName]
        },
        set(value) {
          return (_store[modulePath].state[keyName] = value)
        },
      }
    }

    /**
     * 同步所有分頁的資料，必須啟用 saveForever
     */
    /**
     * 同步所有分頁的資料，必須啟用 saveForever
     *
     * @param {*} methodName (string) 'commit' | 'dispatch'
     * @param {*} path (string) module path
     * @param {*} param (func 以外) 不接受 function, 其他參數皆可
     * @memberof VuexMaps
     */
    sync(methodName, path, param) {
      if (methodName && path) {
        const syncParam = param ? JSON.stringify(param) : null
        localStorage.setItem('_vmHasSync', '1')
        localStorage.setItem('_vmSyncMethodName', methodName)
        localStorage.setItem('_vmSyncModulePath', path)
        if (syncParam !== null) {
          localStorage.setItem('_vmSyncParam', syncParam)
        }
      }
      if (_isPrivate || _isPublic) {
        setStorageData()
        if (_isPublic) {
          localStorage.setItem('_vmSyncPublic', '1')
          localStorage.removeItem('_vmSyncPublic')
        }
      }
    }

    /**
     * 取得 state，用法同 vuex.$store.state
     *
     * @readonly
     * @memberof VuexMaps
     */
    get state() {
      return _rootState
    }

    /**
     * 取得 getters，用法同 vuex.$store.getters
     *
     * @readonly
     * @memberof VuexMaps
     */
    get getters() {
      return _rootGetters
    }

    /**
     * 更改 state
     *
     * @param {*} path (string) "modules/值"路徑
     * @param {*} value (any) 預改變的值
     * @returns
     */
    setState(path, value) {
      const [modulePath, keyName] = getPathKey(path)
      return (_store[modulePath].state[keyName] = value)
    }

    /**
     * 同 $store.commit
     *
     * @param {*} path (string) "modules/值"路徑
     * @param {*} param (any) commit param
     * @returns
     */
    commit(path, param) {
      const [modulePath, keyName] = getPathKey(path)
      const store = _store[modulePath]
      store.mutations[keyName](store.state, param)
    }

    /**
     * 同 $store.dispatch
     *
     * @param {*} path (string) "modules/值"路徑
     * @param {*} param (any) commit param
     * @returns
     * @memberof VuexMaps
     */
    dispatch(path, param) {
      const [modulePath, keyName] = getPathKey(path)
      const store = _store[modulePath]
      const state = store.state
      const vmGetters = _vmGetters[modulePath]
      const ctx = {
        state,
        getters: vmGetters,
        commit: (path, param) => this.commit(`${modulePath}/${path}`, param),
        rootGetters: _rootGetters,
        rootState: _rootState,
      }
      return new Promise(async reslove => {
        const resData = await store.actions[keyName](ctx, param)
        reslove(resData)
      })
    }
  }

  return new VuexMaps()
})()
