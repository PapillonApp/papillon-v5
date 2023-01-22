import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/timetable'
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
    path: '/schoollife',
    name: 'Schoollife',
    component: () => import ('../views/SchoollifeView.vue')
  },
  {
    path: '/conversations',
    name: 'Conversations',
    component: () => import ('../views/chat/ChatController.vue')
  },
  {
    path: '/chat/:conversationID',
    props: true,
    name: 'chat',
    component: () => import ('../views/chat/ConversationView.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import ('../views/NewsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import ('../views/settings/SettingsController.vue')
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
