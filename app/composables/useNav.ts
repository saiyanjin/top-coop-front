import { useTheme } from 'vuetify'
import { useToken } from '~/composables/useToken'

const drawer = ref(true)
const schemaSearch = ref('')
const activeTopTab = ref<string | undefined>(undefined)
const selectedLeftItem = ref<string[]>(['Produits'])

let lastLeftItem = ['Produits']
let lastTopTab = 'calendrier'

export const useNav = () => {
  const theme = useTheme()
  const isDark = computed(() => theme.global.name.value === 'dark')

  function toggleTheme() {
    theme.global.name.value = isDark.value ? 'light' : 'dark'
  }

  // --- Liste de données ---
  const items = [
    { title: 'Produits', value: 'Produits' },
    { title: 'Paniers', value: 'Paniers' },
    { title: 'Type de produits', value: 'Type_produits' },
    { title: 'Adhérents', value: 'Adherents' },
    { title: 'Commandes', value: 'Commandes' },
    { title: 'Participations', value: 'Participations' },
    { title: 'Créneau', value: 'Creneaux' },
  ]

  // --- Handlers de changement d'onglets ---
  const onTopTabChange = (value: any) => {
    if (value === undefined && selectedLeftItem.value.length === 0) {
      activeTopTab.value = lastTopTab
      return
    }
    if (value !== undefined) {
      lastTopTab = value
      selectedLeftItem.value = []
    }
  }

  const onLeftItemChange = (value: any) => {
    if ((!value || value.length === 0) && activeTopTab.value === undefined) {
      selectedLeftItem.value = lastLeftItem
      return
    }
    if (value && value.length > 0) {
      lastLeftItem = value
      activeTopTab.value = undefined
    }
  }

  // --- Computed ---
  const filteredItems = computed(() => {
    if (!schemaSearch.value) return items
    return items.filter(item => 
      item.title.toLowerCase().includes(schemaSearch.value.toLowerCase())
    )
  })

  // --- Actions ---
  const logout = async () => {
    useToken().setToken(null)
    await navigateTo('/connexion')
  }

  const pageActive = computed(() => {
  if (activeTopTab.value === 'calendrier') return 'Calendrier'
  if (activeTopTab.value === 'commandes') return 'GestionStock'
  return selectedLeftItem.value[0] ?? 'Produits'
})

  return {
    isDark,
    toggleTheme,
    drawer,
    schemaSearch,
    activeTopTab,
    selectedLeftItem,
    filteredItems,
    onTopTabChange,
    onLeftItemChange,
    logout,
    pageActive
  }
}