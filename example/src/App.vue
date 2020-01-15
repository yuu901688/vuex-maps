<template>
  <div id="app">
    <example></example>
  </div>
</template>

<script>
import Example from './Example.vue'

export default {
  name: 'app',
  components: { Example },
}
</script>

<style>
body {
  background: #1b1b1b;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  margin-top: 60px;
}
</style>
