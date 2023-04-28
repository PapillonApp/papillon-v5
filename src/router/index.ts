import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

type Routes = RouteRecordRaw[]

const loginRoutes: Routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import ('../views/login/LoginSetup.vue')
  }
]

const routes: Routes = [
  ...loginRoutes,
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import ('../views/homepage/HomepageSetup.vue')
  },
  {
    path: '/timetable',
    name: 'Timetable',
    component: () => import ('../views/timetable/TimetableSetup.vue')
  },
  {
    path: '/homework',
    name: 'Homework',
    component: () => import ('../views/homework/HomeworkView.vue')
  },
  {
    path: '/homework/hw/:hw?',
    props: true,
    name: 'HomeworkItem',
    component: () => import ('../views/homework/HomeworkItemView.vue')
  },
  {
    path: '/grades',
    name: 'Grades',
    component: () => import ('../views/grades/GradesView.vue')
  },
  {
    path: '/grades/:markID',
    props: true,
    name: 'Mark',
    component: () => import ('../views/grades/MarkView.vue')
  },
  {
    path: '/schoollife',
    name: 'Schoollife',
    component: () => import ('../views/SchoollifeView.vue')
  },
  {
    path: '/conversations',
    name: 'Conversations',
    component: () => import ('../views/chat/ChatView.vue')
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
    component: () => import ('../views/news/NewsView.vue')
  },
  {
    path: '/news/info/:urlNews',
    props: true,
    name: 'Info',
    component: () => import ('../views/news/InfoView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import ('../views/settings/SettingsSetup.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (localStorage.loggedIn !== "true" && to.name !== 'Login') {
    return { name: 'Login' }
  }
})

export default router
