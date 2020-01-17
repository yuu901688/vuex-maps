<template>
  <div>
    <h1>vuex-maps</h1>
    <a href="https://github.com/yuu901688/vuex-maps">https://github.com/yuu901688/vuex-maps</a>
    <div style="line-height: 1.8;">
      <h2>state & getters</h2>
      <h4>$store.state.example.ex1State</h4>
      ｛｛ {{ex1State}} ｝｝
      <br />
      <br />

      <h4>$store.getters['example/ex1Getter']</h4>
      ｛｛ {{ex1Getter}} ｝｝
      <br />
      <br />

      <h4>$store.state.example.ex1Father.ex1Child.ex1ChildState</h4>
      ｛｛ {{ex1ChildState}} ｝｝
      <br />
      <br />

      <!-- 
        "ex2Getter" is not defined，因為 example2 mixins 只有取出 'state'，所以取得不到 example2 state 以外的值

        "ex2Getter" is not defined, because example2 mixins only fetch 'state', so it cannot get a value other than example2 state.

        {{ex2Getter}}
      -->

      <h2>v-model vuex state</h2>
      <p>
        雙向綁定 vuex state 數據，此處綁定的 state 是 ex1ChildState
        <br />
        Two-way binding vuex state data, where the bound state is "ex1ChildState".
      </p>
      <input
        type="text"
        v-model="ex1ChildStateVModel"
      >

      <br />
      <br />

      <h2>mutations & actions</h2>
      <h4>$store.commit('example/ex1Mutation')</h4>
      <button @click="ex1Mutation">執行 example mutation(Run example mutation)</button>

      <br />
      <br />

      <h4>$store.dispatch('example/EX1_ACTION')</h4>
      <button @click="EX1_ACTION">執行 example action(Run example action)</button>

      <br />
      <br />

      <h4>$store.commit('example/ex1Father/ex1Child/ex1ChildMutation')</h4>
      <button @click="ex1ChildMutation">執行 ex1Chilld mutation(Run ex1Chilld mutation)</button>

      <br />
      <br />
      <br />
      <br />
    </div>
  </div>
</template>
<script>
import vuexMaps from '../../vuex-maps.js'

export default {
  name: 'example',
  mixins: [
    vuexMaps.mixins({
      example: ['*'],
      example2: ['state'],
    }),
  ],
  // components: {},
  // props: {},
  // data() {return {}},
  computed: {
    ex1ChildStateVModel: vuexMaps.handler('ex1ChildState'),
  },
  // watch: {},
  // created() {},
  // mounted() {},
  // beforeDestroy() {},
  // methods: {},
}
</script>