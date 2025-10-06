document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENTOS DO DOM =====
  const portfolioGrid = document.getElementById("portfolio-grid");
  const classificationFilter = document.getElementById("filtro-classificacao");
  const techFilter = document.getElementById("filtro-tecnologia");
  const loadingScreen = document.getElementById("loading-screen");
  const projectModal = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.getElementById("close-modal");

  // Elementos do sistema de temas
  const themeToggle = document.getElementById("theme-toggle");
  const themeMenu = document.getElementById("theme-menu");
  const themeOptions = document.querySelectorAll(".theme-option");
  const body = document.body;

  // Elementos de gamificação
  const gamificationToggle = document.getElementById("gamification-toggle");
  const gamificationMenu = document.getElementById("gamification-menu");
  const xpDisplay = document.getElementById("xp-display");
  const currentLevelDisplay = document.getElementById("current-level");
  const headerLevelDisplay = document.getElementById("header-level");
  const xpProgress = document.getElementById("xp-progress");
  const achievementsList = document.getElementById("achievements-list");
  const achievementPopup = document.getElementById("achievement-popup");

  // Elementos de idioma
  const languageToggle = document.getElementById("language-toggle");
  const languageMenu = document.getElementById("language-menu");
  const languageOptions = document.querySelectorAll(".language-option");

  // Elementos do customizador
  const themeCustomizer = document.getElementById("theme-customizer");
  const closeCustomizer = document.getElementById("close-customizer");
  const primaryColorInput = document.getElementById("primary-color");
  const secondaryColorInput = document.getElementById("secondary-color");
  const accentColorInput = document.getElementById("accent-color");
  const fontFamilySelect = document.getElementById("font-family");
  const animationSpeedInput = document.getElementById("animation-speed");
  const speedValueDisplay = document.getElementById("speed-value");
  const saveCustomThemeBtn = document.getElementById("save-custom-theme");
  const resetCustomThemeBtn = document.getElementById("reset-custom-theme");

  // Elementos PWA
  const pwaInstall = document.getElementById("pwa-install");
  const pwaInstallBtn = document.getElementById("pwa-install-btn");
  const offlineIndicator = document.getElementById("offline-indicator");

  // ===== VARIÁVEIS GLOBAIS =====
  let allProjects = [];
  let currentCarousels = {};
  let currentTheme = localStorage.getItem("portfolio-theme") || "cyberpunk";
  let currentLanguage = localStorage.getItem("portfolio-language") || "pt-BR";
  let deferredPrompt = null;
  let isOnline = navigator.onLine;

  // Imagem padrão para projetos
  const DEFAULT_PROJECT_IMAGE =
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80";

  // ===== SISTEMA DE GAMIFICAÇÃO =====
  const achievementSystem = {
    achievements: [
      {
        id: "explorer",
        name: "Explorador",
        nameEn: "Explorer",
        nameEs: "Explorador",
        desc: "Visitou todos os temas",
        descEn: "Visited all themes",
        descEs: "Visitó todos los temas",
        icon: "fa-compass",
        xp: 100,
        condition: () => achievementSystem.userProgress.themesUsed.size >= 10,
      },
      {
        id: "collector",
        name: "Colecionador",
        nameEn: "Collector",
        nameEs: "Coleccionista",
        desc: "Viu todos os projetos",
        descEn: "Viewed all projects",
        descEs: "Vio todos los proyectos",
        icon: "fa-trophy",
        xp: 150,
        condition: () =>
          achievementSystem.userProgress.visitedProjects.size >=
          allProjects.length,
      },
      {
        id: "speedster",
        name: "Velocista",
        nameEn: "Speedster",
        nameEs: "Velocista",
        desc: "Navegou por 10 projetos em 1 minuto",
        descEn: "Browsed 10 projects in 1 minute",
        descEs: "Navegó por 10 proyectos en 1 minuto",
        icon: "fa-bolt",
        xp: 75,
        condition: () => false, // Implementado separadamente
      },
      {
        id: "night_owl",
        name: "Coruja",
        nameEn: "Night Owl",
        nameEs: "Búho Nocturno",
        desc: "Visitou entre 00:00 e 06:00",
        descEn: "Visited between 00:00 and 06:00",
        descEs: "Visitó entre 00:00 y 06:00",
        icon: "fa-moon",
        xp: 50,
        condition: () => {
          const hour = new Date().getHours();
          return hour >= 0 && hour < 6;
        },
      },
      {
        id: "easter_hunter",
        name: "Caçador de Ovos",
        nameEn: "Easter Hunter",
        nameEs: "Cazador de Huevos",
        desc: "Encontrou 5 easter eggs",
        descEn: "Found 5 easter eggs",
        descEs: "Encontró 5 easter eggs",
        icon: "fa-egg",
        xp: 200,
        condition: () =>
          achievementSystem.userProgress.easterEggsFound.size >= 5,
      },
      {
        id: "theme_master",
        name: "Mestre dos Temas",
        nameEn: "Theme Master",
        nameEs: "Maestro de Temas",
        desc: "Criou um tema personalizado",
        descEn: "Created a custom theme",
        descEs: "Creó un tema personalizado",
        icon: "fa-paint-brush",
        xp: 125,
        condition: () =>
          localStorage.getItem("custom-theme-created") === "true",
      },
      {
        id: "polyglot",
        name: "Poliglota",
        nameEn: "Polyglot",
        nameEs: "Políglota",
        desc: "Testou todos os idiomas",
        descEn: "Tested all languages",
        descEs: "Probó todos los idiomas",
        icon: "fa-globe",
        xp: 75,
        condition: () => {
          const usedLanguages = JSON.parse(
            localStorage.getItem("used-languages") || "[]"
          );
          return usedLanguages.length >= 3;
        },
      },
    ],
    userProgress: {
      xp: parseInt(localStorage.getItem("user-xp") || "0"),
      level: parseInt(localStorage.getItem("user-level") || "1"),
      unlockedAchievements: JSON.parse(
        localStorage.getItem("unlocked-achievements") || "[]"
      ),
      visitedProjects: new Set(
        JSON.parse(localStorage.getItem("visited-projects") || "[]")
      ),
      themesUsed: new Set(
        JSON.parse(localStorage.getItem("used-themes") || "[]")
      ),
      easterEggsFound: new Set(
        JSON.parse(localStorage.getItem("easter-eggs") || "[]")
      ),
      projectViewTimes: JSON.parse(
        localStorage.getItem("project-view-times") || "[]"
      ),
    },

    addXP(amount, reason = "") {
      this.userProgress.xp += amount;
      const newLevel = Math.floor(this.userProgress.xp / 100) + 1;

      if (newLevel > this.userProgress.level) {
        this.userProgress.level = newLevel;
        this.showLevelUp(newLevel);
      }

      this.saveProgress();
      this.updateUI();

      console.log(`+${amount} XP gained: ${reason}`);
    },

    unlockAchievement(achievementId) {
      if (this.userProgress.unlockedAchievements.includes(achievementId)) {
        return false;
      }

      const achievement = this.achievements.find((a) => a.id === achievementId);
      if (!achievement) return false;

      this.userProgress.unlockedAchievements.push(achievementId);
      this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
      this.showAchievementPopup(achievement);
      this.saveProgress();
      this.updateUI();

      return true;
    },

    checkAchievements() {
      this.achievements.forEach((achievement) => {
        if (!this.userProgress.unlockedAchievements.includes(achievement.id)) {
          if (achievement.condition()) {
            this.unlockAchievement(achievement.id);
          }
        }
      });
    },

    showAchievementPopup(achievement) {
      const popup = achievementPopup;
      const title = popup.querySelector(".achievement-title");
      const description = popup.querySelector(".achievement-description");
      const xpGained = popup.querySelector(".xp-gained");

      const name =
        achievement[
          `name${currentLanguage
            .replace("-", "")
            .replace("BR", "")
            .replace("US", "")
            .replace("ES", "")}`
        ] || achievement.name;
      const desc =
        achievement[
          `desc${currentLanguage
            .replace("-", "")
            .replace("BR", "")
            .replace("US", "")
            .replace("ES", "")}`
        ] || achievement.desc;

      title.textContent = name;
      description.textContent = desc;
      xpGained.textContent = achievement.xp;

      popup.classList.add("show");

      setTimeout(() => {
        popup.classList.remove("show");
      }, 4000);
    },

    showLevelUp(newLevel) {
      // Criar popup de level up
      const levelUpPopup = document.createElement("div");
      levelUpPopup.className = "achievement-popup show";
      levelUpPopup.innerHTML = `
                <div class="achievement-popup-content">
                    <div class="achievement-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="achievement-info">
                        <h3 class="achievement-title">LEVEL UP!</h3>
                        <p class="achievement-description">Você alcançou o nível ${newLevel}!</p>
                        <div class="achievement-xp">Novo nível desbloqueado!</div>
                    </div>
                </div>
            `;

      document.body.appendChild(levelUpPopup);

      setTimeout(() => {
        levelUpPopup.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(levelUpPopup);
        }, 500);
      }, 3000);
    },

    saveProgress() {
      localStorage.setItem("user-xp", this.userProgress.xp.toString());
      localStorage.setItem("user-level", this.userProgress.level.toString());
      localStorage.setItem(
        "unlocked-achievements",
        JSON.stringify(this.userProgress.unlockedAchievements)
      );
      localStorage.setItem(
        "visited-projects",
        JSON.stringify([...this.userProgress.visitedProjects])
      );
      localStorage.setItem(
        "used-themes",
        JSON.stringify([...this.userProgress.themesUsed])
      );
      localStorage.setItem(
        "easter-eggs",
        JSON.stringify([...this.userProgress.easterEggsFound])
      );
      localStorage.setItem(
        "project-view-times",
        JSON.stringify(this.userProgress.projectViewTimes)
      );
    },

    updateUI() {
      // Atualizar displays de XP e nível
      xpDisplay.textContent = `${this.userProgress.xp} XP`;
      currentLevelDisplay.textContent = this.userProgress.level;
      headerLevelDisplay.textContent = this.userProgress.level;

      // Atualizar barra de progresso
      const xpForCurrentLevel = (this.userProgress.level - 1) * 100;
      const xpForNextLevel = this.userProgress.level * 100;
      const progressPercent =
        ((this.userProgress.xp - xpForCurrentLevel) /
          (xpForNextLevel - xpForCurrentLevel)) *
        100;
      xpProgress.style.width = `${Math.min(progressPercent, 100)}%`;

      // Atualizar lista de conquistas
      this.renderAchievements();
    },

    renderAchievements() {
      achievementsList.innerHTML = "";

      this.achievements.forEach((achievement) => {
        const isUnlocked = this.userProgress.unlockedAchievements.includes(
          achievement.id
        );
        const name =
          achievement[
            `name${currentLanguage
              .replace("-", "")
              .replace("BR", "")
              .replace("US", "")
              .replace("ES", "")}`
          ] || achievement.name;
        const desc =
          achievement[
            `desc${currentLanguage
              .replace("-", "")
              .replace("BR", "")
              .replace("US", "")
              .replace("ES", "")}`
          ] || achievement.desc;

        const achievementElement = document.createElement("div");
        achievementElement.className = `achievement-item ${
          isUnlocked ? "unlocked" : "locked"
        }`;
        achievementElement.innerHTML = `
                    <div class="achievement-icon">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <div class="achievement-details">
                        <h4>${name}</h4>
                        <p>${desc}</p>
                        <small>${achievement.xp} XP</small>
                    </div>
                `;

        achievementsList.appendChild(achievementElement);
      });
    },

    trackProjectView(projectIndex) {
      this.userProgress.visitedProjects.add(projectIndex);
      this.userProgress.projectViewTimes.push(Date.now());

      // Verificar conquista de velocista
      const recentViews = this.userProgress.projectViewTimes.filter(
        (time) => Date.now() - time < 60000 // 1 minuto
      );

      if (recentViews.length >= 10) {
        this.unlockAchievement("speedster");
      }

      this.addXP(5, "Project viewed");
      this.checkAchievements();
    },

    trackThemeChange(theme) {
      this.userProgress.themesUsed.add(theme);
      this.addXP(10, "Theme changed");
      this.checkAchievements();
    },

    findEasterEgg(eggId) {
      if (!this.userProgress.easterEggsFound.has(eggId)) {
        this.userProgress.easterEggsFound.add(eggId);
        this.addXP(25, "Easter egg found");
        this.checkAchievements();
      }
    },
  };

  // ===== SISTEMA DE INTERNACIONALIZAÇÃO =====
  const i18n = {
    languages: {
      "pt-BR": {
        loading: "INICIALIZANDO SISTEMA...",
        header: "PORTFÓLIO",
        subtitle: "Felipe Toledo - Desenvolvedor Full Stack",
        filters: "FILTROS DE BUSCA",
        "project-type": "Tipo de Projeto:",
        technology: "Tecnologia:",
        "all-types": "Todos os Tipos",
        "all-technologies": "Todas as Tecnologias",
        "view-project": "VER PROJETO",
        "source-code": "CÓDIGO FONTE",
        "choose-language": "Escolha o Idioma",
        "choose-theme": "Escolha seu Tema",
        "customize-theme": "🎨 Personalize seu Tema",
        "primary-color": "Cor Primária:",
        "secondary-color": "Cor Secundária:",
        "accent-color": "Cor de Destaque:",
        "font-family": "Fonte:",
        "animation-speed": "Velocidade das Animações:",
        "save-theme": "Salvar Tema",
        "reset-theme": "Resetar",
        custom: "Personalizado",
        achievements: "Conquistas",
        level: "Nível",
        "achievement-unlocked": "ACHIEVEMENT UNLOCKED",
        "install-app": "Instalar App",
        "offline-mode": "Modo Offline Ativo",
      },
      "en-US": {
        loading: "INITIALIZING SYSTEM...",
        header: "PORTFOLIO",
        subtitle: "Felipe Toledo - Full Stack Developer",
        filters: "SEARCH FILTERS",
        "project-type": "Project Type:",
        technology: "Technology:",
        "all-types": "All Types",
        "all-technologies": "All Technologies",
        "view-project": "VIEW PROJECT",
        "source-code": "SOURCE CODE",
        "choose-language": "Choose Language",
        "choose-theme": "Choose your Theme",
        "customize-theme": "🎨 Customize your Theme",
        "primary-color": "Primary Color:",
        "secondary-color": "Secondary Color:",
        "accent-color": "Accent Color:",
        "font-family": "Font:",
        "animation-speed": "Animation Speed:",
        "save-theme": "Save Theme",
        "reset-theme": "Reset",
        custom: "Custom",
        achievements: "Achievements",
        level: "Level",
        "achievement-unlocked": "ACHIEVEMENT UNLOCKED",
        "install-app": "Install App",
        "offline-mode": "Offline Mode Active",
      },
      "es-ES": {
        loading: "INICIALIZANDO SISTEMA...",
        header: "PORTAFOLIO",
        subtitle: "Felipe Toledo - Desarrollador Full Stack",
        filters: "FILTROS DE BÚSQUEDA",
        "project-type": "Tipo de Proyecto:",
        technology: "Tecnología:",
        "all-types": "Todos los Tipos",
        "all-technologies": "Todas las Tecnologías",
        "view-project": "VER PROYECTO",
        "source-code": "CÓDIGO FUENTE",
        "choose-language": "Elegir Idioma",
        "choose-theme": "Elige tu Tema",
        "customize-theme": "🎨 Personaliza tu Tema",
        "primary-color": "Color Primario:",
        "secondary-color": "Color Secundario:",
        "accent-color": "Color de Acento:",
        "font-family": "Fuente:",
        "animation-speed": "Velocidad de Animaciones:",
        "save-theme": "Guardar Tema",
        "reset-theme": "Resetear",
        custom: "Personalizado",
        achievements: "Logros",
        level: "Nivel",
        "achievement-unlocked": "LOGRO DESBLOQUEADO",
        "install-app": "Instalar App",
        "offline-mode": "Modo Offline Activo",
      },
    },

    translate(key) {
      return (
        this.languages[currentLanguage]?.[key] ||
        this.languages["pt-BR"][key] ||
        key
      );
    },

    updatePage() {
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        element.textContent = this.translate(key);
      });

      // Atualizar HTML lang
      document.documentElement.lang = currentLanguage;

      // Atualizar conquistas
      achievementSystem.renderAchievements();
    },
  };

  // ===== SISTEMA PWA =====
  const pwaFeatures = {
    installPrompt: null,

    init() {
      this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupOfflineDetection();
    },

    registerServiceWorker() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration);

            // Verificar atualizações
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  this.showUpdateNotification();
                }
              });
            });
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      }
    },

    setupInstallPrompt() {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        pwaInstall.classList.remove("hidden");
      });

      pwaInstallBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;

          if (result.outcome === "accepted") {
            console.log("PWA installed");
            achievementSystem.findEasterEgg("pwa-install");
          }

          deferredPrompt = null;
          pwaInstall.classList.add("hidden");
        }
      });

      window.addEventListener("appinstalled", () => {
        console.log("PWA was installed");
        pwaInstall.classList.add("hidden");
        achievementSystem.addXP(50, "PWA installed");
      });
    },

    setupOfflineDetection() {
      window.addEventListener("online", () => {
        isOnline = true;
        offlineIndicator.classList.remove("show");
        this.syncOfflineData();
      });

      window.addEventListener("offline", () => {
        isOnline = false;
        offlineIndicator.classList.add("show");
      });

      // Verificar status inicial
      if (!navigator.onLine) {
        offlineIndicator.classList.add("show");
      }
    },

    showUpdateNotification() {
      const notification = document.createElement("div");
      notification.className = "update-notification";
      notification.innerHTML = `
                <div class="update-content">
                    <i class="fas fa-download mr-2"></i>
                    <span>Nova versão disponível!</span>
                    <button onclick="location.reload()" class="update-btn">Atualizar</button>
                </div>
            `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("show");
      }, 100);
    },

    syncOfflineData() {
      // Sincronizar dados offline quando voltar online
      if (
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register("analytics-sync");
        });
      }
    },
  };

  // ===== INICIALIZAÇÃO =====
  function init() {
    initializeTheme();
    initializeLanguage();
    initializeGamefication();
    initializeCustomizer();
    pwaFeatures.init();
    setupEventListeners();

    // Verificar conquista de coruja
    if (
      achievementSystem.achievements
        .find((a) => a.id === "night_owl")
        .condition()
    ) {
      achievementSystem.unlockAchievement("night_owl");
    }

    loadProjects();
  }

  function initializeTheme() {
    body.setAttribute("data-theme", currentTheme);
    updateThemeMenu();
    updateThemeToggleIcon();
    achievementSystem.trackThemeChange(currentTheme);
  }

  function initializeLanguage() {
    updateLanguageMenu();
    i18n.updatePage();

    // Rastrear idiomas usados
    const usedLanguages = JSON.parse(
      localStorage.getItem("used-languages") || "[]"
    );
    if (!usedLanguages.includes(currentLanguage)) {
      usedLanguages.push(currentLanguage);
      localStorage.setItem("used-languages", JSON.stringify(usedLanguages));
    }
  }

  function initializeGamefication() {
    achievementSystem.updateUI();
    achievementSystem.checkAchievements();
  }

  function initializeCustomizer() {
    // Carregar tema personalizado se existir
    const customTheme = JSON.parse(
      localStorage.getItem("custom-theme") || "null"
    );
    if (customTheme) {
      applyCustomTheme(customTheme);
    }

    // Setup dos controles
    animationSpeedInput.addEventListener("input", (e) => {
      speedValueDisplay.textContent = `${e.target.value}x`;
    });
  }

  // ===== FUNÇÕES DE TEMA =====
  function updateThemeMenu() {
    themeOptions.forEach((option) => {
      option.classList.toggle("active", option.dataset.theme === currentTheme);
    });
  }

  function updateThemeToggleIcon() {
    const themeIcons = {
      cyberpunk: "fas fa-robot",
      vaporwave: "fas fa-sun",
      y2k: "fas fa-compact-disc",
      dark: "fas fa-moon",
      rock: "fas fa-guitar",
      psychedelic: "fas fa-eye",
      medieval: "fas fa-crown",
      brazilian: "fas fa-flag",
      arcane: "fas fa-magic",
      glitch: "fas fa-bug",
      custom: "fas fa-paint-brush",
    };

    themeToggle.innerHTML = `<i class="${themeIcons[currentTheme]}"></i>`;
  }

  function changeTheme(newTheme) {
    currentTheme = newTheme;
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    updateThemeMenu();
    updateThemeToggleIcon();
    achievementSystem.trackThemeChange(newTheme);

    // Efeito de transição
    body.style.transition = "all 0.5s ease";
    setTimeout(() => {
      body.style.transition = "";
    }, 500);

    // Mostrar customizador se tema personalizado
    if (newTheme === "custom") {
      themeCustomizer.classList.add("active");
    }
  }

  // ===== FUNÇÕES DE IDIOMA =====
  function updateLanguageMenu() {
    languageOptions.forEach((option) => {
      option.classList.toggle(
        "active",
        option.dataset.lang === currentLanguage
      );
    });
  }

  function changeLanguage(newLanguage) {
    currentLanguage = newLanguage;
    localStorage.setItem("portfolio-language", newLanguage);
    updateLanguageMenu();
    i18n.updatePage();

    // Rastrear idiomas usados
    const usedLanguages = JSON.parse(
      localStorage.getItem("used-languages") || "[]"
    );
    if (!usedLanguages.includes(newLanguage)) {
      usedLanguages.push(newLanguage);
      localStorage.setItem("used-languages", JSON.stringify(usedLanguages));
      achievementSystem.checkAchievements();
    }

    achievementSystem.addXP(5, "Language changed");
  }

  // ===== FUNÇÕES DO CUSTOMIZADOR =====
  function applyCustomTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty("--custom-primary", theme.primary);
    root.style.setProperty("--custom-secondary", theme.secondary);
    root.style.setProperty("--custom-accent", theme.accent);
    root.style.setProperty("--custom-font", theme.font);
    root.style.setProperty("--animation-speed", `${theme.animationSpeed}s`);

    // Atualizar controles
    primaryColorInput.value = theme.primary;
    secondaryColorInput.value = theme.secondary;
    accentColorInput.value = theme.accent;
    fontFamilySelect.value = theme.font;
    animationSpeedInput.value = theme.animationSpeed;
    speedValueDisplay.textContent = `${theme.animationSpeed}x`;
  }

  function saveCustomTheme() {
    const customTheme = {
      primary: primaryColorInput.value,
      secondary: secondaryColorInput.value,
      accent: accentColorInput.value,
      font: fontFamilySelect.value,
      animationSpeed: parseFloat(animationSpeedInput.value),
    };

    localStorage.setItem("custom-theme", JSON.stringify(customTheme));
    localStorage.setItem("custom-theme-created", "true");
    applyCustomTheme(customTheme);

    achievementSystem.unlockAchievement("theme_master");
    achievementSystem.addXP(25, "Custom theme saved");

    // Fechar customizador
    themeCustomizer.classList.remove("active");

    // Mostrar feedback
    const feedback = document.createElement("div");
    feedback.className = "achievement-popup show";
    feedback.innerHTML = `
            <div class="achievement-popup-content">
                <div class="achievement-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="achievement-info">
                    <h3 class="achievement-title">Tema Salvo!</h3>
                    <p class="achievement-description">Seu tema personalizado foi aplicado com sucesso.</p>
                </div>
            </div>
        `;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.remove("show");
      setTimeout(() => document.body.removeChild(feedback), 500);
    }, 2000);
  }

  function resetCustomTheme() {
    localStorage.removeItem("custom-theme");

    // Resetar para valores padrão
    const defaultTheme = {
      primary: "#ff00ff",
      secondary: "#00ffff",
      accent: "#8a2be2",
      font: "Share Tech Mono",
      animationSpeed: 1,
    };

    applyCustomTheme(defaultTheme);
  }

  // ===== FUNÇÕES DE PROJETOS =====
  function getValidImageUrl(imageUrl, fallbackUrl = DEFAULT_PROJECT_IMAGE) {
    return new Promise((resolve) => {
      if (!imageUrl) {
        resolve(fallbackUrl);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(imageUrl);
      img.onerror = () => {
        console.warn(
          `Imagem não encontrada: ${imageUrl}. Usando imagem padrão.`
        );
        resolve(fallbackUrl);
      };
      img.src = imageUrl;
    });
  }

  async function processProjectImages(project) {
    project.imagem = await getValidImageUrl(project.imagem);

    if (project.imagens && Array.isArray(project.imagens)) {
      const processedImages = await Promise.all(
        project.imagens.map((img) => getValidImageUrl(img))
      );
      project.imagens = processedImages;
    } else {
      project.imagens = [project.imagem];
    }

    return project;
  }

  async function loadProjects() {
    try {
      const response = await fetch("portfolio.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawProjects = await response.json();

      allProjects = await Promise.all(
        rawProjects.map((project) => processProjectImages(project))
      );

      populateFilters(allProjects);
      renderProjects(allProjects);

      // Simular loading screen
      setTimeout(() => {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
          loadingScreen.style.display = "none";
        }, 500);
      }, 2000);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      portfolioGrid.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <p class="text-red-400 text-lg">Erro ao carregar projetos</p>
                    <p class="text-sm opacity-75 mt-2">Verifique sua conexão e tente novamente</p>
                </div>
            `;
    }
  }

  function renderProjects(projects) {
    portfolioGrid.innerHTML = "";

    if (projects.length === 0) {
      portfolioGrid.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <i class="fas fa-search text-4xl mb-4 opacity-50"></i>
                    <p class="text-lg opacity-75">Nenhum projeto encontrado</p>
                    <p class="text-sm opacity-50 mt-2">Tente ajustar os filtros de busca</p>
                </div>
            `;
      return;
    }

    projects.forEach((project, index) => {
      const hasMultipleImages = project.imagens && project.imagens.length > 1;

      const classificationIcons = {
        "Front-end": "fas fa-palette",
        "Back-end": "fas fa-server",
        "Full-stack": "fas fa-layer-group",
        "Game Development": "fas fa-gamepad",
        Mobile: "fas fa-mobile-alt",
        Automation: "fas fa-cogs",
      };

      const icon = classificationIcons[project.classificacao] || "fas fa-code";

      const projectCard = `
                <div class="project-card cursor-pointer fade-in" onclick="openProjectModal(${index})" style="animation-delay: ${
        index * 0.1
      }s">
                    <div class="relative mb-4">
                        ${
                          hasMultipleImages
                            ? createCarousel(project, index)
                            : createSingleImage(project)
                        }
                        <div class="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                            <i class="${icon} text-white text-sm"></i>
                        </div>
                    </div>

                    <h3 class="text-xl font-bold mb-3">
                        <i class="fas fa-code mr-2"></i>${project.titulo}
                    </h3>

                    <p class="text-sm mb-3 opacity-75 line-clamp-3">
                        ${
                          project.descricao ||
                          "Projeto desenvolvido com tecnologias modernas."
                        }
                    </p>

                    <div class="flex items-center mb-3">
                        <i class="${icon} mr-2"></i>
                        <span class="text-sm">${project.classificacao}</span>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                        ${project.tecnologias
                          .slice(0, 4)
                          .map(
                            (tech) => `<span class="tech-tag">${tech}</span>`
                          )
                          .join("")}
                        ${
                          project.tecnologias.length > 4
                            ? `<span class="tech-tag opacity-75">+${
                                project.tecnologias.length - 4
                              }</span>`
                            : ""
                        }
                    </div>

                    <div class="flex gap-2">
                        <a href="${project.link}"  rel="noopener noreferrer" 
                           class="flex-1 py-2 px-4 rounded text-center text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                           onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt mr-2"></i><span data-i18n="view-project">VER PROJETO</span>
                        </a>
                        ${
                          project.repositorio
                            ? `
                            <a href="${project.repositorio}"  rel="noopener noreferrer"
                               class="py-2 px-3 rounded text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                               onclick="event.stopPropagation()"
                               title="Ver código fonte">
                                <i class="fab fa-github"></i>
                            </a>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;
      portfolioGrid.innerHTML += projectCard;
    });

    // Atualizar textos traduzidos
    i18n.updatePage();
    initializeCarousels();
  }

  // ===== FUNÇÕES DE CARROSSEL =====
  function createCarousel(project, index) {
    const images = project.imagens || [project.imagem];
    return `
            <div class="carousel-container" data-carousel="${index}">
                <div class="carousel-track">
                    ${images
                      .map(
                        (img) => `
                        <img src="${img}" alt="${project.titulo}"
                             class="carousel-slide object-cover w-full h-48 rounded"
                             loading="lazy">
                    `
                      )
                      .join("")}
                </div>
                ${
                  images.length > 1
                    ? `
                    <button class="carousel-nav carousel-prev" data-carousel="${index}" data-direction="prev">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-nav carousel-next" data-carousel="${index}" data-direction="next">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        ${images
                          .map(
                            (_, i) => `
                            <div class="w-2 h-2 rounded-full bg-white bg-opacity-50 carousel-dot" data-slide="${i}"></div>
                        `
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  function createSingleImage(project) {
    return `
            <img src="${project.imagem}" alt="${project.titulo}"
                 class="w-full h-48 object-cover rounded"
                 loading="lazy">
        `;
  }

  function initializeCarousels() {
    document.querySelectorAll(".carousel-nav").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const carouselId = button.dataset.carousel;
        const direction = button.dataset.direction;
        moveCarousel(carouselId, direction);
      });
    });

    document.querySelectorAll(".carousel-dot").forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        const carouselContainer = dot.closest(".carousel-container");
        const carouselId = carouselContainer.dataset.carousel;
        const slideIndex = parseInt(dot.dataset.slide);
        goToSlide(carouselId, slideIndex);
      });
    });
  }

  function moveCarousel(carouselId, direction) {
    const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
    const track = carousel.querySelector(".carousel-track");
    const slides = track.querySelectorAll(".carousel-slide");

    if (!currentCarousels[carouselId]) {
      currentCarousels[carouselId] = 0;
    }

    if (direction === "next") {
      currentCarousels[carouselId] =
        (currentCarousels[carouselId] + 1) % slides.length;
    } else {
      currentCarousels[carouselId] =
        currentCarousels[carouselId] === 0
          ? slides.length - 1
          : currentCarousels[carouselId] - 1;
    }

    updateCarouselPosition(carouselId);
  }

  function goToSlide(carouselId, slideIndex) {
    currentCarousels[carouselId] = slideIndex;
    updateCarouselPosition(carouselId);
  }

  function updateCarouselPosition(carouselId) {
    const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
    const track = carousel.querySelector(".carousel-track");
    const dots = carousel.querySelectorAll(".carousel-dot");

    const translateX = -currentCarousels[carouselId] * 100;
    track.style.transform = `translateX(${translateX}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        "bg-opacity-100",
        index === currentCarousels[carouselId]
      );
      dot.classList.toggle(
        "bg-opacity-50",
        index !== currentCarousels[carouselId]
      );
    });
  }

  // ===== MODAL DE PROJETO =====
  window.openProjectModal = function (index) {
    const project = allProjects[index];
    const images = project.imagens || [project.imagem];

    const classificationIcons = {
      "Front-end": "fas fa-palette",
      "Back-end": "fas fa-server",
      "Full-stack": "fas fa-layer-group",
      "Game Development": "fas fa-gamepad",
      Mobile: "fas fa-mobile-alt",
      Automation: "fas fa-cogs",
    };

    const icon = classificationIcons[project.classificacao] || "fas fa-code";

    modalBody.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    ${
                      images.length > 1
                        ? createCarousel(project, `modal-${index}`)
                        : createSingleImage(project)
                    }
                </div>
                <div>
                    <h2 class="text-2xl font-bold mb-4">
                        <i class="${icon} mr-3"></i>${project.titulo}
                    </h2>
                    <p class="mb-4 opacity-75 leading-relaxed">
                        ${project.descricao || "Descrição não disponível."}
                    </p>
                    <div class="mb-4">
                        <h3 class="text-lg mb-2 flex items-center">
                            <i class="fas fa-tag mr-2"></i>Tipo:
                        </h3>
                        <span class="tech-tag px-3 py-1 rounded">${
                          project.classificacao
                        }</span>
                    </div>
                    <div class="mb-6">
                        <h3 class="text-lg mb-2 flex items-center">
                            <i class="fas fa-tools mr-2"></i>Tecnologias:
                        </h3>
                        <div class="flex flex-wrap gap-2">
                            ${project.tecnologias
                              .map(
                                (tech) =>
                                  `<span class="tech-tag">${tech}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="flex gap-3 flex-wrap">
                        <a href="${project.link}"  rel="noopener noreferrer"
                           class="py-3 px-6 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center">
                            <i class="fas fa-external-link-alt mr-2"></i><span data-i18n="view-project">Ver Projeto</span>
                        </a>
                        ${
                          project.repositorio
                            ? `
                            <a href="${project.repositorio}"  rel="noopener noreferrer"
                               class="py-3 px-6 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all flex items-center">
                                <i class="fab fa-github mr-2"></i><span data-i18n="source-code">Código Fonte</span>
                            </a>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `;

    projectModal.classList.add("active");
    initializeCarousels();
    i18n.updatePage();

    // Rastrear visualização do projeto
    achievementSystem.trackProjectView(index);
  };

  // ===== FILTROS =====
  function populateFilters(projects) {
    const classifications = [...new Set(projects.map((p) => p.classificacao))];
    classifications.forEach((c) => {
      const option = document.createElement("option");
      option.value = c;
      option.textContent = c;
      classificationFilter.appendChild(option);
    });

    const technologies = [
      ...new Set(projects.flatMap((p) => p.tecnologias)),
    ].sort();
    technologies.forEach((tech) => {
      const option = document.createElement("option");
      option.value = tech;
      option.textContent = tech;
      techFilter.appendChild(option);
    });
  }

  function applyFilters() {
    const selectedClassification = classificationFilter.value;
    const selectedTech = techFilter.value;

    let filteredProjects = allProjects;

    if (selectedClassification !== "todos") {
      filteredProjects = filteredProjects.filter(
        (p) => p.classificacao === selectedClassification
      );
    }

    if (selectedTech !== "todas") {
      filteredProjects = filteredProjects.filter((p) =>
        p.tecnologias.includes(selectedTech)
      );
    }

    renderProjects(filteredProjects);
    achievementSystem.addXP(2, "Filter applied");
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Tema
    themeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle("active");
    });

    themeOptions.forEach((option) => {
      option.addEventListener("click", () => {
        changeTheme(option.dataset.theme);
        themeMenu.classList.remove("active");
      });
    });

    // Idioma
    languageToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      languageMenu.classList.toggle("active");
    });

    languageOptions.forEach((option) => {
      option.addEventListener("click", () => {
        changeLanguage(option.dataset.lang);
        languageMenu.classList.remove("active");
      });
    });

    // Gamificação
    gamificationToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      gamificationMenu.classList.toggle("active");
    });

    // Customizador
    closeCustomizer.addEventListener("click", () => {
      themeCustomizer.classList.remove("active");
    });

    saveCustomThemeBtn.addEventListener("click", saveCustomTheme);
    resetCustomThemeBtn.addEventListener("click", resetCustomTheme);

    // Modal
    closeModal.addEventListener("click", () => {
      projectModal.classList.remove("active");
    });

    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove("active");
      }
    });

    // Filtros
    classificationFilter.addEventListener("change", applyFilters);
    techFilter.addEventListener("change", applyFilters);

    // Fechar menus ao clicar fora
    document.addEventListener("click", (e) => {
      if (!themeMenu.contains(e.target) && !themeToggle.contains(e.target)) {
        themeMenu.classList.remove("active");
      }
      if (
        !languageMenu.contains(e.target) &&
        !languageToggle.contains(e.target)
      ) {
        languageMenu.classList.remove("active");
      }
      if (
        !gamificationMenu.contains(e.target) &&
        !gamificationToggle.contains(e.target)
      ) {
        gamificationMenu.classList.remove("active");
      }
    });

    // Atalhos de teclado
    document.addEventListener("keydown", handleKeyboardShortcuts);

    // Easter eggs
    setupEasterEggs();
  }

  // ===== ATALHOS DE TECLADO =====
  function handleKeyboardShortcuts(e) {
    // Fechar modal com ESC
    if (e.key === "Escape") {
      if (projectModal.classList.contains("active")) {
        projectModal.classList.remove("active");
      }
      if (themeCustomizer.classList.contains("active")) {
        themeCustomizer.classList.remove("active");
      }
    }

    // Atalhos de tema (Ctrl/Cmd + número)
    if (e.ctrlKey || e.metaKey) {
      const themeKeys = {
        1: "cyberpunk",
        2: "vaporwave",
        3: "y2k",
        4: "dark",
        5: "rock",
        6: "psychedelic",
        7: "medieval",
        8: "brazilian",
        9: "arcane",
        0: "glitch",
      };

      if (themeKeys[e.key]) {
        e.preventDefault();
        changeTheme(themeKeys[e.key]);
        achievementSystem.findEasterEgg("keyboard-shortcuts");
      }

      // Atalho para customizador (Ctrl + C)
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        changeTheme("custom");
        achievementSystem.findEasterEgg("customizer-shortcut");
      }

      // Atalho para conquistas (Ctrl + A)
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        gamificationMenu.classList.toggle("active");
        achievementSystem.findEasterEgg("achievements-shortcut");
      }
    }

    // Konami Code
    konamiCode.handleInput(e.keyCode);
  }

  // ===== EASTER EGGS =====
  const konamiCode = {
    sequence: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], // ↑↑↓↓←→←→BA
    userInput: [],

    handleInput(keyCode) {
      this.userInput.push(keyCode);

      if (this.userInput.length > this.sequence.length) {
        this.userInput.shift();
      }

      if (this.userInput.length === this.sequence.length) {
        if (
          this.userInput.every((key, index) => key === this.sequence[index])
        ) {
          this.activate();
        }
      }
    },

    activate() {
      achievementSystem.findEasterEgg("konami-code");
      this.createMatrixRain();

      // Resetar sequência
      this.userInput = [];
    },

    createMatrixRain() {
      const matrixContainer = document.createElement("div");
      matrixContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                overflow: hidden;
            `;

      for (let i = 0; i < 50; i++) {
        const column = document.createElement("div");
        column.style.cssText = `
                    position: absolute;
                    top: -100%;
                    left: ${Math.random() * 100}%;
                    color: #00ff00;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    animation: matrixFall ${
                      3 + Math.random() * 3
                    }s linear infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;

        const chars =
          "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
        let text = "";
        for (let j = 0; j < 20; j++) {
          text += chars[Math.floor(Math.random() * chars.length)] + "<br>";
        }
        column.innerHTML = text;

        matrixContainer.appendChild(column);
      }

      document.body.appendChild(matrixContainer);

      // Remover após 10 segundos
      setTimeout(() => {
        document.body.removeChild(matrixContainer);
      }, 10000);
    },
  };

  function setupEasterEggs() {
    // Double click no logo
    const logo = document.querySelector(".header-text");
    let clickCount = 0;
    let clickTimer = null;

    logo.addEventListener("click", () => {
      clickCount++;

      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 500);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        achievementSystem.findEasterEgg("logo-double-click");
        createNyanCat();
      }
    });

    // Long press no botão de tema
    let longPressTimer = null;

    themeToggle.addEventListener("mousedown", () => {
      longPressTimer = setTimeout(() => {
        achievementSystem.findEasterEgg("theme-long-press");
        activateDiscoMode();
      }, 2000);
    });

    themeToggle.addEventListener("mouseup", () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    });

    // Triple click em qualquer projeto
    portfolioGrid.addEventListener("click", (e) => {
      if (e.target.closest(".project-card")) {
        const card = e.target.closest(".project-card");
        if (!card.clickCount) card.clickCount = 0;
        card.clickCount++;

        setTimeout(() => {
          if (card.clickCount >= 3) {
            achievementSystem.findEasterEgg("project-triple-click");
            showProjectStats();
          }
          card.clickCount = 0;
        }, 1000);
      }
    });
  }

  function createNyanCat() {
    const nyanCat = document.createElement("div");
    nyanCat.innerHTML = "🐱‍🏍️";
    nyanCat.style.cssText = `
            position: fixed;
            top: 50%;
            left: -100px;
            font-size: 3rem;
            z-index: 10000;
            animation: nyanFly 3s linear;
        `;

    document.body.appendChild(nyanCat);

    setTimeout(() => {
      document.body.removeChild(nyanCat);
    }, 3000);
  }

  function activateDiscoMode() {
    const discoOverlay = document.createElement("div");
    discoOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            animation: discoColors 0.5s infinite;
        `;

    document.body.appendChild(discoOverlay);

    setTimeout(() => {
      document.body.removeChild(discoOverlay);
    }, 5000);
  }

  function showProjectStats() {
    const stats = {
      totalProjects: allProjects.length,
      totalTechnologies: [...new Set(allProjects.flatMap((p) => p.tecnologias))]
        .length,
      mostUsedTech: getMostUsedTechnology(),
      projectTypes: [...new Set(allProjects.map((p) => p.classificacao))]
        .length,
    };

    const statsModal = document.createElement("div");
    statsModal.className = "modal active";
    statsModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="text-center">
                    <h2 class="text-2xl font-bold mb-6">📊 Estatísticas do Portfólio</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white bg-opacity-10 p-4 rounded">
                            <div class="text-3xl font-bold text-cyan-400">${stats.totalProjects}</div>
                            <div class="text-sm opacity-75">Projetos Totais</div>
                        </div>
                        <div class="bg-white bg-opacity-10 p-4 rounded">
                            <div class="text-3xl font-bold text-pink-400">${stats.totalTechnologies}</div>
                            <div class="text-sm opacity-75">Tecnologias</div>
                        </div>
                        <div class="bg-white bg-opacity-10 p-4 rounded">
                            <div class="text-3xl font-bold text-yellow-400">${stats.projectTypes}</div>
                            <div class="text-sm opacity-75">Tipos de Projeto</div>
                        </div>
                        <div class="bg-white bg-opacity-10 p-4 rounded">
                            <div class="text-lg font-bold text-green-400">${stats.mostUsedTech}</div>
                            <div class="text-sm opacity-75">Tech Mais Usada</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(statsModal);
  }

  function getMostUsedTechnology() {
    const techCount = {};
    allProjects.forEach((project) => {
      project.tecnologias.forEach((tech) => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });

    return Object.keys(techCount).reduce((a, b) =>
      techCount[a] > techCount[b] ? a : b
    );
  }

  // ===== EFEITOS ESPECIAIS =====
  function addThemeEffects() {
    const theme = currentTheme;

    // Remover efeitos anteriores
    document.querySelectorAll(".theme-effect").forEach((el) => el.remove());

    switch (theme) {
      case "psychedelic":
        createFloatingParticles();
        break;
      case "medieval":
        createParchmentEffect();
        break;
      case "brazilian":
        createConfetti();
        break;
      case "glitch":
        createGlitchText();
        break;
    }
  }

  function createFloatingParticles() {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "theme-effect";
      particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ff1493, #00ff7f, #ff4500);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                animation: psychedelicFloat ${
                  3 + Math.random() * 4
                }s ease-in-out infinite;
            `;
      document.body.appendChild(particle);
    }
  }

  function createParchmentEffect() {
    const parchment = document.createElement("div");
    parchment.className = "theme-effect";
    parchment.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
        `;
    document.body.appendChild(parchment);
  }

  function createConfetti() {
    for (let i = 0; i < 15; i++) {
      const confetti = document.createElement("div");
      confetti.className = "theme-effect";
      const colors = ["#009739", "#fedd00", "#002776"];
      confetti.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: ${
                  colors[Math.floor(Math.random() * colors.length)]
                };
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * 100}vw;
                top: -10px;
                animation: confettiFall ${
                  2 + Math.random() * 3
                }s linear infinite;
            `;
      document.body.appendChild(confetti);
    }
  }

  function createGlitchText() {
    const glitchTexts = [
      "ERROR",
      "404",
      "NULL",
      "UNDEFINED",
      "???",
      "!!!",
      "000",
      "111",
    ];
    for (let i = 0; i < 5; i++) {
      const glitch = document.createElement("div");
      glitch.className = "theme-effect";
      glitch.textContent =
        glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
      glitch.style.cssText = `
                position: fixed;
                color: #ff0000;
                font-family: 'Courier New', monospace;
                font-size: ${10 + Math.random() * 20}px;
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                animation: glitchText 0.5s infinite;
                opacity: 0.7;
            `;
      document.body.appendChild(glitch);

      setTimeout(() => glitch.remove(), 2000);
    }
  }

  // ===== ANIMAÇÕES CSS DINÂMICAS =====
  function addDynamicStyles() {
    const style = document.createElement("style");
    style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
            }

            @keyframes nyanFly {
                from {
                    left: -100px;
                    transform: translateY(-50%);
                }
                to {
                    left: calc(100vw + 100px);
                    transform: translateY(-50%);
                }
            }

            @keyframes discoColors {
                0% { background: rgba(255, 0, 0, 0.3); }
                16% { background: rgba(255, 165, 0, 0.3); }
                33% { background: rgba(255, 255, 0, 0.3); }
                50% { background: rgba(0, 255, 0, 0.3); }
                66% { background: rgba(0, 0, 255, 0.3); }
                83% { background: rgba(75, 0, 130, 0.3); }
                100% { background: rgba(238, 130, 238, 0.3); }
            }

            @keyframes matrixFall {
                to {
                    transform: translateY(100vh);
                }
            }

            .carousel-container {
                position: relative;
                overflow: hidden;
                border-radius: 8px;
            }

            .carousel-track {
                display: flex;
                transition: transform 0.5s ease;
            }

            .carousel-slide {
                min-width: 100%;
                height: 200px;
            }

            .carousel-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.3);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .carousel-nav:hover {
                background: rgba(255, 255, 255, 0.5);
                transform: translateY(-50%) scale(1.1);
            }

            .carousel-prev {
                left: 10px;
            }

            .carousel-next {
                right: 10px;
            }

            .update-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                background: linear-gradient(45deg, #4caf50, #45a049);
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                transition: transform 0.3s ease;
            }

            .update-notification.show {
                transform: translateX(-50%) translateY(0);
            }

            .update-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .update-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .update-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        `;
    document.head.appendChild(style);
  }

  // ===== OBSERVADORES =====
  function setupObservers() {
    // Observar mudanças de tema para aplicar efeitos
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          setTimeout(addThemeEffects, 100);
        }
      });
    });

    themeObserver.observe(document.body, { attributes: true });

    // Intersection Observer para animações de entrada
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          achievementSystem.addXP(1, "Card viewed");
        }
      });
    }, observerOptions);

    // Observar cards quando forem criados
    const gridObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList.contains("project-card")) {
            cardObserver.observe(node);
          }
        });
      });
    });

    gridObserver.observe(portfolioGrid, { childList: true });
  }

  // ===== INICIALIZAÇÃO FINAL =====
  addDynamicStyles();
  setupObservers();
  init();

  // Easter egg para cliques excessivos no tema glitch
  let glitchCounter = 0;
  document.addEventListener("click", () => {
    if (currentTheme === "glitch") {
      glitchCounter++;
      if (glitchCounter > 10) {
        document.body.style.filter = "invert(1) hue-rotate(180deg)";
        setTimeout(() => {
          document.body.style.filter = "";
          glitchCounter = 0;
        }, 1000);
        achievementSystem.findEasterEgg("glitch-madness");
      }
    }
  });

  // Aplicar efeitos iniciais
  setTimeout(addThemeEffects, 1000);

  console.log("🚀 Portfolio System Initialized!");
  console.log("🎮 Gamification Active!");
  console.log("🌍 Multi-language Support Ready!");
  console.log("🎨 Theme Customization Available!");
  console.log("📱 PWA Features Enabled!");
});
