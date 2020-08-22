import Vue from 'vue'
import VueRouter from 'vue-router'

const viewFiles = require.context('../views', false, /\.vue$/)
const keys = viewFiles.keys() || []
const routes = []

keys.forEach((key) => {
  let name = `/${key.replace(/^\.\/(.*)\.vue$/, '$1')}`

  let route = {
    path: name,
    name,
    component: viewFiles(key).default
  }
  console.log(name, route)
  routes.push(route)
})

Vue.use(VueRouter)

// const routes = [
//   {
//     path: '/',
//     name: 'home',
//     component: Home
//   },
//   {
//     path: '/parser',
//     name: 'parser',
//     component: () => import(/* webpackChunkName: "parser-example" */ '@/components/parser/example/Index.vue')
//   },
//   {
//     path: '/tinymce',
//     name: 'tinymce',
//     component: () => import(/* webpackChunkName: "tinymce-example" */ '@/components/tinymce/example/Index.vue')
//   }
// ]

const router = new VueRouter({
  routes
})

export default router
