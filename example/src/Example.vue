<template>
  <div>
    Example vuex-maps
    <div>
      {{username}}
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
  // computed: {},
  // watch: {},
  // created() {},
  // mounted() {},
  // beforeDestroy() {},
  // methods: {},
}
</script>