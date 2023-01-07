import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import ('../views/HomepageView.vue')
  },
  {
    path: '/timetable',
    name: 'Timetable',
    component: () => import ('../views/TimetableView.vue')
  },
  {
    path: '/homework',
    name: 'Homework',
    component: () => import ('../views/HomeworkView.vue')
  },
  {
    path: '/grades',
    name: 'Grades',
    component: () => import ('../views/GradesView.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import ('../views/NewsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import ('../views/SettingsView.vue')
  },
]

const loginRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import ('../views/login/LoginSetup.vue')
  }
]

// push for each login route
loginRoutes.forEach(route => routes.push(route))

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  if (localStorage.loggedIn !== "true" && to.name !== 'Login') {
    return { name: 'Login' }
  }
})

export default router
