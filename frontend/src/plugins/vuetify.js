import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

const modernAltiplanoTheme = {
    dark: false,
    colors: {
        primary: '#85341f', // Terracotta
        'primary-container': '#a44b34',
        secondary: '#3b6934', // Deep Valley Green
        'secondary-container': '#b9eeab',
        tertiary: '#694700', // Gold/Yellow
        'tertiary-container': '#ffdfb3',
        error: '#ba1a1a', // Bolivian Red
        'error-container': '#ffdad6',
        background: '#fcf9f4', // Fine Paper
        surface: '#ffffff',
        'surface-variant': '#e5e2dd',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-surface': '#1c1c19',
        'on-background': '#1c1c19',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f6f3ee',
        'surface-container': '#ebe8e3',
        'surface-container-high': '#ebe8e3',
        'surface-container-highest': '#e5e2dd',
        'outline-variant': '#dbc1ba',
    },
}

export default createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'modernAltiplanoTheme',
        themes: {
            modernAltiplanoTheme,
        },
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
})
