<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar color="tertiary" class="no-shadow" flat>
        <q-btn flat @click="leftDrawerOpen = !leftDrawerOpen">
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          Polaris Wrangler
          <div slot="subtitle"> {{ subtitle }}</div>
        </q-toolbar-title>

        <q-btn v-if="router.history.current.path == '/config'"
        flat @click="router.push('/')"
        >
          <q-icon name="home" />
        </q-btn>
        <q-btn v-if="router.history.current.path !== '/config'"
        flat @click="router.push('/config')"
        >
          <q-icon name="settings" />
        </q-btn>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-2"
      class="text-tertiary"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-list-header>Thanks for using Polaris Wrangler</q-list-header>
        <q-item-separator />
        <q-item dense class="text-weight-light">
          <small>
          If you have problems, questions or feature suggestions please contact:
          </small>
        </q-item>
        <q-item dense class="text-weight-light">
          <small>
            Vance Cole &lt;<b>vcole@midcolumbialibraries.org</b>&gt;
          </small>
        </q-item>
        <q-item-separator />

        <q-item
          :class="router.history.current.path == '/' ? 'active' : ''"
          @click.native="router.push('/')"
        >
          <q-item-side icon="home" />
          <q-item-main label="Home" sublabel="Back to where it all started." />
        </q-item>
        <q-item
          :class="router.history.current.path == '/series-wrangler' ? 'active' : ''"
          @click.native="router.push('/series-wrangler')"
        >
          <q-item-side icon="more" />
          <q-item-main label="Series Wrangler" sublabel="Find series missing items." />
        </q-item>
        <q-item
          :class="router.history.current.path == '/nyt-wrangler' ? 'active' : ''"
          @click.native="router.push('/nyt-wrangler')"
        >
          <q-item-side icon="star" />
          <q-item-main label="NYT Wrangler"
            sublabel="Find missing bestsellers." />
        </q-item>
        <q-item-separator />
        <q-item
          @click.native="openURL('http://quasar-framework.org')"
        >
          <q-item-side icon="school" />
          <q-item-main label="Help" sublabel="How does this even work??" />
        </q-item>
        <q-item
          :class="router.history.current.path == '/config' ? 'active' : ''"
          @click.native="router.push('/config')"
        >
          <q-item-side icon="settings" />
          <q-item-main label="Config" sublabel="It's nice to have control." />
        </q-item>
        <q-item-separator />
        <q-item @click.native="leftDrawerOpen = !leftDrawerOpen">
          <q-item-side icon="close" />
          <q-item-main label="Close Sidebar" sublabel="Go away, Sidebar! Shoo!" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar';

export default {
  name: 'LayoutDefault',
  data() {
    return {
      router: this.$router,
      leftDrawerOpen: this.$q.platform.is.desktop,
      subtitle: 'Let\'s wrangle some Polarises',
      actionsSize: 'wide',
    };
  },
  methods: {
    openURL,
  },
};
</script>

<style lang="stylus">
@import '~variables'
.actions
  width: 200px
  padding-top: 50px
  &.narrow
    width: 64px
.q-layout
  background-color: $secondary;
  color: $neutral;
a
  text-decoration: none;
  color: #333;
</style>
