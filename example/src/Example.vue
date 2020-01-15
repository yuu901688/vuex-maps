<template>
  <div>
    Example vuex-maps
    <div>
      {{username}}
      <input
        type="text"
        v-model="storeUsername"
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
  },
  // watch: {},
  // created() {},
  // mounted() {},
  // beforeDestroy() {},
  // methods: {},
}
</script>