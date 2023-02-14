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
    const extensions = JSON.parse(localStorage.getItem("extensions") || "[]"); // [{"name":"Démo","author":"andronedev","authorDisplayName":"Papillon","description":"Test Plugin Papillon","icon":"more","version":"1.0.0","javascript":["test.js"],"css":[],"tabs":[{"name":"Notifications","icon":"notifications","path":"dev.androne.notifications","html":"settings.html"}],"manifestUrl":"","rootUrl":"https://raw.githubusercontent.com/andronedev/papillon_extension_demo/master/"}]
    //http://localhost:8080/D%C3%A9mo/dev.androne.notifications
    // name = Démo
    // tab path = dev.androne.notifications
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
      console.log("html chargé");
      this.$nextTick(() => {
        console.log("nextTick");
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
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>

        <IonTitle>{{ extension.name }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <ion-content :fullscreen="true">
      <div :innerHTML="html" ref="html"></div>
    </ion-content>
  </ion-page>
</template>

<style scoped></style>
