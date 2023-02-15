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
    component: () => import ('../views/NewsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import ('../views/settings/SettingsView.vue')
  },
]

const loginRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import ('../views/login/LoginSetup.vue')
  }
]

const extensionRoutes : Array<RouteRecordRaw> = []

const extensions = JSON.parse(localStorage.getItem('extensions') || '[]')
extensions.forEach((extension: any) => {
  console.log("Chargement de l'extension dans le router: " + extension.name)
  extension.tabs.forEach((tab: any) => {
    console.log("Chargement de l'onglet " + tab.name + " dans le router")
    // create component vue for each tab


    extensionRoutes.push({ // replace special characters in path
      path: "/" + extension.name.replace(/[^a-zA-Z0-9]/g, "") + "/" + tab.path.replace(/[^a-zA-Z0-9]/g, ""),
      name: tab.name,
      component: () => import("../views/ExtensionView.vue")
    })
  })
})


// push for each login route
loginRoutes.forEach(route => routes.push(route))

// push for each extension route
extensionRoutes.forEach(route => routes.push(route))


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
