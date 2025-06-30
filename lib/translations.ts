export interface Translations {
  en: Record<string, string>
  pt: Record<string, string>
  es: Record<string, string>
  fr: Record<string, string>
}

export type Language = keyof Translations
export type TranslationKey = keyof Translations["en"]

export const translations = {
  en: {
    // Navigation
    home: "Home",
    timer: "Timer",
    progress: "Progress",
    learn: "Learn",
    recipes: "Recipes",
    profile: "Profile",
    settings: "Settings",
    login: "Login",

    // Common
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",

    // Timer
    startFasting: "Start Fasting",
    stopFasting: "Stop Fasting",
    pauseFasting: "Pause Fasting",
    resumeFasting: "Resume Fasting",
    fastingTime: "Fasting Time",
    eatingWindow: "Eating Window",

    // Progress
    weight: "Weight",
    measurements: "Measurements",
    photos: "Photos",
    statistics: "Statistics",

    // Learn
    articles: "Articles",
    tips: "Tips",
    science: "Science",

    // Recipes
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",

    // Profile
    personalInfo: "Personal Information",
    preferences: "Preferences",
    notifications: "Notifications",

    // Settings
    language: "Language",
    theme: "Theme",
    units: "Units",
    privacy: "Privacy",
  },
  pt: {
    // Navigation
    home: "Início",
    timer: "Timer",
    progress: "Progresso",
    learn: "Aprender",
    recipes: "Receitas",
    profile: "Perfil",
    settings: "Configurações",
    login: "Entrar",

    // Common
    welcome: "Bem-vindo",
    loading: "Carregando...",
    error: "Erro",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    add: "Adicionar",
    search: "Buscar",
    filter: "Filtrar",

    // Timer
    startFasting: "Iniciar Jejum",
    stopFasting: "Parar Jejum",
    pauseFasting: "Pausar Jejum",
    resumeFasting: "Retomar Jejum",
    fastingTime: "Tempo de Jejum",
    eatingWindow: "Janela Alimentar",

    // Progress
    weight: "Peso",
    measurements: "Medidas",
    photos: "Fotos",
    statistics: "Estatísticas",

    // Learn
    articles: "Artigos",
    tips: "Dicas",
    science: "Ciência",

    // Recipes
    breakfast: "Café da Manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snacks: "Lanches",

    // Profile
    personalInfo: "Informações Pessoais",
    preferences: "Preferências",
    notifications: "Notificações",

    // Settings
    language: "Idioma",
    theme: "Tema",
    units: "Unidades",
    privacy: "Privacidade",
  },
  es: {
    // Navigation
    home: "Inicio",
    timer: "Temporizador",
    progress: "Progreso",
    learn: "Aprender",
    recipes: "Recetas",
    profile: "Perfil",
    settings: "Configuración",
    login: "Iniciar Sesión",

    // Common
    welcome: "Bienvenido",
    loading: "Cargando...",
    error: "Error",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    search: "Buscar",
    filter: "Filtrar",

    // Timer
    startFasting: "Iniciar Ayuno",
    stopFasting: "Detener Ayuno",
    pauseFasting: "Pausar Ayuno",
    resumeFasting: "Reanudar Ayuno",
    fastingTime: "Tiempo de Ayuno",
    eatingWindow: "Ventana de Alimentación",

    // Progress
    weight: "Peso",
    measurements: "Medidas",
    photos: "Fotos",
    statistics: "Estadísticas",

    // Learn
    articles: "Artículos",
    tips: "Consejos",
    science: "Ciencia",

    // Recipes
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snacks: "Aperitivos",

    // Profile
    personalInfo: "Información Personal",
    preferences: "Preferencias",
    notifications: "Notificaciones",

    // Settings
    language: "Idioma",
    theme: "Tema",
    units: "Unidades",
    privacy: "Privacidad",
  },
  fr: {
    // Navigation
    home: "Accueil",
    timer: "Minuteur",
    progress: "Progrès",
    learn: "Apprendre",
    recipes: "Recettes",
    profile: "Profil",
    settings: "Paramètres",
    login: "Se Connecter",

    // Common
    welcome: "Bienvenue",
    loading: "Chargement...",
    error: "Erreur",
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    search: "Rechercher",
    filter: "Filtrer",

    // Timer
    startFasting: "Commencer le Jeûne",
    stopFasting: "Arrêter le Jeûne",
    pauseFasting: "Mettre en Pause",
    resumeFasting: "Reprendre le Jeûne",
    fastingTime: "Temps de Jeûne",
    eatingWindow: "Fenêtre Alimentaire",

    // Progress
    weight: "Poids",
    measurements: "Mesures",
    photos: "Photos",
    statistics: "Statistiques",

    // Learn
    articles: "Articles",
    tips: "Conseils",
    science: "Science",

    // Recipes
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snacks: "Collations",

    // Profile
    personalInfo: "Informations Personnelles",
    preferences: "Préférences",
    notifications: "Notifications",

    // Settings
    language: "Langue",
    theme: "Thème",
    units: "Unités",
    privacy: "Confidentialité",
  },
}

export function useTranslation() {
  // This is a placeholder - the actual implementation should use the language context
  return {
    t: (key: string) => translations.en[key as keyof typeof translations.en] || key,
  }
}

export default translations
