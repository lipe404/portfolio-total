document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const portfolioGrid = document.getElementById("portfolio-grid");
  const classificationFilter = document.getElementById("filtro-classificacao");
  const techFilter = document.getElementById("filtro-tecnologia");
  const loadingScreen = document.getElementById("loading-screen");
  const projectModal = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.getElementById("close-modal");

  let allProjects = [];
  let currentCarousels = {};

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
                    <i class="fas fa-search text-cyan-400 text-4xl mb-4"></i>
                    <p class="text-cyan-400 text-lg">Nenhum projeto encontrado</p>
                </div>
            `;
      return;
    }

    projects.forEach((project, index) => {
      const hasMultipleImages = project.imagens && project.imagens.length > 1;

      const projectCard = `
                <div class="cyber-card rounded-lg p-6 cursor-pointer" onclick="openProjectModal(${index})">
                    <div class="relative mb-4">
                        ${
                          hasMultipleImages
                            ? createCarousel(project, index)
                            : createSingleImage(project)
                        }
                    </div>
                    
                    <h3 class="text-xl font-bold text-cyan-400 mb-3 font-mono">
                        <i class="fas fa-code mr-2"></i>${project.titulo}
                    </h3>
                    
                    <p class="text-gray-300 text-sm mb-3 line-clamp-2">
                        ${
                          project.descricao ||
                          "Projeto desenvolvido com tecnologias modernas."
                        }
                    </p>
                    
                    <div class="flex items-center mb-3">
                        <i class="fas fa-layer-group mr-2 text-pink-400"></i>
                        <span class="text-pink-400 font-mono text-sm">${
                          project.classificacao
                        }</span>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${project.tecnologias
                          .map(
                            (tech) =>
                              `<span class="tech-tag px-2 py-1 rounded text-xs">${tech}</span>`
                          )
                          .join("")}
                    </div>
                    
                    <div class="flex gap-2">
                        <a href="${project.link}"  rel="noopener noreferrer" 
                           class="cyber-button flex-1 py-2 px-4 rounded text-center text-sm"
                           onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt mr-2"></i>VER PROJETO
                        </a>
                        ${
                          project.repositorio
                            ? `
                            <a href="${project.repositorio}"  rel="noopener noreferrer"
                               class="cyber-button py-2 px-3 rounded text-sm"
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

    // Inicializar carrosséis
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
                             class="carousel-slide object-cover w-full">
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
                    <h2 class="text-2xl font-bold text-cyan-400 mb-4 font-mono">
                        ${project.titulo}
                    </h2>
                    <p class="text-gray-300 mb-4">
                        ${project.descricao || "Descrição não disponível."}
                    </p>
                    <div class="mb-4">
                        <h3 class="text-lg text-pink-400 mb-2">Tipo:</h3>
                        <span class="tech-tag px-3 py-1 rounded">${
                          project.classificacao
                        }</span>
                    </div>
                    <div class="mb-6">
                        <h3 class="text-lg text-pink-400 mb-2">Tecnologias:</h3>
                        <div class="flex flex-wrap gap-2">
                            ${project.tecnologias
                              .map(
                                (tech) =>
                                  `<span class="tech-tag px-2 py-1 rounded text-sm">${tech}</span>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <a href="${project.link}"  rel="noopener noreferrer"
                           class="cyber-button py-3 px-6 rounded">
                            <i class="fas fa-external-link-alt mr-2"></i>Ver Projeto
                        </a>
                        ${
                          project.repositorio
                            ? `
                            <a href="${project.repositorio}"  rel="noopener noreferrer"
                               class="cyber-button py-3 px-6 rounded">
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

  // Carregar projetos
  loadProjects();
});
