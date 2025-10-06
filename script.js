document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
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

  let allProjects = [];
  let currentCarousels = {};
  let currentTheme = localStorage.getItem("portfolio-theme") || "cyberpunk";

  // Inicializar tema
  initializeTheme();

  // Sistema de Temas
  function initializeTheme() {
    body.setAttribute("data-theme", currentTheme);
    updateThemeMenu();
    updateThemeToggleIcon();
  }

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
    };

    themeToggle.innerHTML = `<i class="${themeIcons[currentTheme]}"></i>`;
  }

  function changeTheme(newTheme) {
    currentTheme = newTheme;
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    updateThemeMenu();
    updateThemeToggleIcon();

    // Adicionar efeito de transição
    body.style.transition = "all 0.5s ease";
    setTimeout(() => {
      body.style.transition = "";
    }, 500);
  }

  // Event Listeners para temas
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

  // Fechar menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (!themeMenu.contains(e.target) && !themeToggle.contains(e.target)) {
      themeMenu.classList.remove("active");
    }
  });

  // Simular loading screen
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }, 2000);

  // Carregar projetos
  async function loadProjects() {
    try {
      const response = await fetch("portfolio.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allProjects = await response.json();
      populateFilters(allProjects);
      renderProjects(allProjects);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      portfolioGrid.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <p class="text-red-400 text-lg">Erro ao carregar projetos</p>
                </div>
            `;
    }
  }

  // Renderizar projetos
  function renderProjects(projects) {
    portfolioGrid.innerHTML = "";

    if (projects.length === 0) {
      portfolioGrid.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <i class="fas fa-search text-4xl mb-4 opacity-50"></i>
                    <p class="text-lg opacity-75">Nenhum projeto encontrado</p>
                </div>
            `;
      return;
    }

    projects.forEach((project, index) => {
      const hasMultipleImages = project.imagens && project.imagens.length > 1;

      const projectCard = `
                <div class="project-card cursor-pointer" onclick="openProjectModal(${index})">
                    <div class="relative mb-4">
                        ${
                          hasMultipleImages
                            ? createCarousel(project, index)
                            : createSingleImage(project)
                        }
                    </div>

                    <h3 class="text-xl font-bold mb-3">
                        <i class="fas fa-code mr-2"></i>${project.titulo}
                    </h3>

                    <p class="text-sm mb-3 opacity-75 line-clamp-2">
                        ${
                          project.descricao ||
                          "Projeto desenvolvido com tecnologias modernas."
                        }
                    </p>

                    <div class="flex items-center mb-3">
                        <i class="fas fa-layer-group mr-2"></i>
                        <span class="text-sm">${project.classificacao}</span>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                        ${project.tecnologias
                          .map(
                            (tech) => `<span class="tech-tag">${tech}</span>`
                          )
                          .join("")}
                    </div>

                    <div class="flex gap-2">
                        <a href="${project.link}"  rel="noopener noreferrer" 
                           class="flex-1 py-2 px-4 rounded text-center text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                           onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt mr-2"></i>VER PROJETO
                        </a>
                        ${
                          project.repositorio
                            ? `
                            <a href="${project.repositorio}"  rel="noopener noreferrer"
                               class="py-2 px-3 rounded text-sm bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                               onclick="event.stopPropagation()">
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

    initializeCarousels();
  }

  // Criar carrossel para múltiplas imagens
  function createCarousel(project, index) {
    const images = project.imagens || [project.imagem];
    return `
            <div class="carousel-container" data-carousel="${index}">
                <div class="carousel-track">
                    ${images
                      .map(
                        (img) => `
                        <img src="${img}" alt="${project.titulo}"
                             class="carousel-slide object-cover w-full h-48 rounded">
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
                `
                    : ""
                }
            </div>
        `;
  }

  // Criar imagem única
  function createSingleImage(project) {
    return `
            <img src="${project.imagem}" alt="${project.titulo}"
                 class="w-full h-48 object-cover rounded">
        `;
  }

  // Inicializar carrosséis
  function initializeCarousels() {
    document.querySelectorAll(".carousel-nav").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const carouselId = button.dataset.carousel;
        const direction = button.dataset.direction;
        moveCarousel(carouselId, direction);
      });
    });
  }

  // Mover carrossel
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

    const translateX = -currentCarousels[carouselId] * 100;
    track.style.transform = `translateX(${translateX}%)`;
  }

  // Abrir modal do projeto
  window.openProjectModal = function (index) {
    const project = allProjects[index];
    const images = project.imagens || [project.imagem];

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
                        ${project.titulo}
                    </h2>
                    <p class="mb-4 opacity-75">
                        ${project.descricao || "Descrição não disponível."}
                    </p>
                    <div class="mb-4">
                        <h3 class="text-lg mb-2">Tipo:</h3>
                        <span class="tech-tag px-3 py-1 rounded">${
                          project.classificacao
                        }</span>
                    </div>
                    <div class="mb-6">
                        <h3 class="text-lg mb-2">Tecnologias:</h3>
                        <div class="flex flex-wrap gap-2">
                            ${project.tecnologias
                              .map(
                                (tech) =>
                                  `<span class="tech-tag">${tech}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <a href="${project.link}"  rel="noopener noreferrer"
                           class="py-3 px-6 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
                            <i class="fas fa-external-link-alt mr-2"></i>Ver Projeto
                        </a>
                        ${
                          project.repositorio
                            ? `
                            <a href="${project.repositorio}"  rel="noopener noreferrer"
                               class="py-3 px-6 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
                                <i class="fab fa-github mr-2"></i>Código Fonte
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
  };

  // Fechar modal
  closeModal.addEventListener("click", () => {
    projectModal.classList.remove("active");
  });

  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) {
      projectModal.classList.remove("active");
    }
  });

  // Popular filtros
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

  // Aplicar filtros
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
  }

  // Event listeners
  classificationFilter.addEventListener("change", applyFilters);
  techFilter.addEventListener("change", applyFilters);

  // Atalhos de teclado para temas
  document.addEventListener("keydown", (e) => {
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
      }
    }
  });

  // Carregar projetos
  loadProjects();

  // Easter eggs para o tema glitch
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
      }
    }
  });

  // Efeitos especiais por tema
  function addThemeEffects() {
    const theme = currentTheme;

    // Remover efeitos anteriores
    document.querySelectorAll(".theme-effect").forEach((el) => el.remove());

    switch (theme) {
      case "psychedelic":
        // Adicionar partículas flutuantes
        createFloatingParticles();
        break;
      case "medieval":
        // Adicionar efeito de pergaminho
        createParchmentEffect();
        break;
      case "brazilian":
        // Adicionar confetes
        createConfetti();
        break;
      case "glitch":
        // Adicionar texto aleatório
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

  // Adicionar animações CSS para os efeitos
  const style = document.createElement("style");
  style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
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
    `;
  document.head.appendChild(style);

  // Observar mudanças de tema para aplicar efeitos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
      ) {
        setTimeout(addThemeEffects, 100);
      }
    });
  });

  observer.observe(document.body, { attributes: true });

  // Aplicar efeitos iniciais
  setTimeout(addThemeEffects, 1000);
});
