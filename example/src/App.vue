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
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #333333;
  margin-top: 60px;
}

h1 {
  font-size: 45px;
}

h2 {
  font-size: 27px;
}

h1,
h2,
h3,
h4,
h5 {
  color: #000;
}

h2 {
  border: 2px solid #000;
}
</style>
