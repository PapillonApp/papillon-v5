<script>
import { defineComponent, ref } from "vue";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { app } from "@/main";

export default defineComponent({
  name: "ExtensionView",
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
  },
  data() {
    return {
      html: "",
    };
  },
  setup() {
    
    const extensions = app.config.globalProperties.$localRepo.getExtensions();

    console.log(window.location.pathname.split("/"));
    const extension = extensions.find(
      (extension) =>
        extension.name.replace(/[^a-zA-Z0-9]/g, "") ==
        window.location.pathname.split("/")[1]
    );
    console.log("chargement de l'extension " + extension.name);
    const extensionTab = extension.tabs.find(
      (tab) =>
        tab.path.replace(/[^a-zA-Z0-9]/g, "") ==
        window.location.pathname.split("/")[2]
    );
    console.log("chargement de l'onglet " + extensionTab);
    return {
      extension,
      extensionTab,
    };
  },
  mounted() {
    console.log(this.extension.rootUrl + this.extensionTab.html);
    fetch(this.extension.rootUrl + this.extensionTab.html)
      .then((response) => response.text())
      .then((html) => {
        this.html = html;

        
      });
  },
  watch: {
    html() {
      this.$nextTick(() => {
        this.$refs.html.querySelectorAll("script").forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
      });
    },
  },
});
</script>

<template>
  <ion-page ref="page">
    <IonHeader class="AppHeader" collapse="fade" translucent>
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">{{ extension.name }}</ion-title>
        </IonToolbar>
      </IonHeader>

    <ion-content :fullscreen="true">
      <div :innerHTML="html" ref="html"></div>
    </ion-content>
  </ion-page>
</template>

<style scoped></style>
