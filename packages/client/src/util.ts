import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { getI18nConfigs as getClientCoreI18nConfigs } from '@atlas/client-core/src/i18n'

import translation from '../i18n/en/translation.json'

export const initialize = (): Promise<void> => {
  return new Promise((resolve) => {
    // Setup I18N
    const resources = {
      en: {
        translation
      }
    }

    const namespace = ['translation']

    const subPackageTranslations = [getClientCoreI18nConfigs()]

    for (let t of subPackageTranslations) {
      for (let key of Object.keys(t.resources)) {
        if (!resources[key]) resources[key] = t.resources[key]
        else resources[key] = { ...resources[key], ...t.resources[key] }
      }

      for (let ns of t.namespace) {
        if (!namespace.includes(ns)) namespace.push(ns)
      }
    }

    i18n.use(LanguageDetector).use(initReactI18next).init({
      fallbackLng: 'en',
      ns: namespace,
      defaultNS: 'translation',
      lng: 'en',
      resources
    })

    resolve()
  })
}

// TODO: support typed translations
// declare module 'react-i18next' {
//   // and extend them!
//   interface CustomTypeOptions {
//     // custom namespace type if you changed it
//     defaultNS: 'en';
//     // custom resources type
//     resources: ReturnType<typeof getClientCoreI18nConfigs>['resources'];
//   }
// }
