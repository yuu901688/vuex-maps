<template>
  <div>
    Example vuex-maps
    <div>
      {{username}}
      <input
        type="text"
        v-model="storeUsername"
      >
      {{m1}}
      <input
        type="text"
        v-model="storeM1"
      >
    </div>
  </div>
</template>
<script>
import vuexMaps from '../../vuex-maps.js'

export default {
  name: 'example',
  mixins: [vuexMaps.mixins({ example: ['*'] })],
  // components: {},
  // props: {},
  // data() {return {}},
  computed: {
    storeUsername: vuexMaps.handler('username'),
    storeM1: vuexMaps.handler('m1'),
  },
  // watch: {},
  created() {
    // console.log(this.$store)
    this.mmm()
    console.log(this.m1, this.$store.state.example.yee.m1)
    this.ggg()
  },
  // mounted() {},
  // beforeDestroy() {},
  // methods: {},
}
</script>