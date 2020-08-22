import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import '@/styles/index.scss'
import '@/icons'
import Tinymce from '@/components/tinymce/index.vue'

Vue.component('richText', Tinymce)

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
