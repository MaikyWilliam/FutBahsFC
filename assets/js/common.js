/**
 * main.js
 * Contém as funções e lógicas comuns a todas as páginas do site.
 * - Carrega componentes compartilhados (navbar, footer).
 * - Controla interações de UI (menu, carrossel).
 * - Fornece funções utilitárias para buscar dados.
 */

//================================================
// FLUXO PRINCIPAL
//================================================

document.addEventListener('DOMContentLoaded', inicializarSite);

/**
 * Função principal que orquestra a inicialização dos componentes e lógicas do site.
 */
async function inicializarSite() {
    await carregarComponentesCompartilhados();
    inicializarCarrossel();
    // A função fetchData() e applyTheme() são utilitárias e serão chamadas
    // pelos scripts específicos de cada página quando necessário.
}


//================================================
// CARREGAMENTO DE COMPONENTES (NAVBAR/FOOTER)
//================================================

/**
 * Busca e injeta o conteúdo do navbar.html e footer.html nos locais apropriados.
 */
async function carregarComponentesCompartilhados() {
    const navbarPlaceholder = document.querySelector('.navbar');
    const footerPlaceholder = document.querySelector('.footer');
    const cacheBust = `?v=${new Date().getTime()}`;

    try {
        // Carrega o Navbar
        if (navbarPlaceholder) {
            const navResponse = await fetch(`navbar.html${cacheBust}`);
            if (navResponse.ok) {
                navbarPlaceholder.innerHTML = await navResponse.text();
                // A lógica do menu só pode ser ativada após o HTML ser injetado.
                configurarMenuHamburger();
            }
        }

        // Carrega o Footer
        if (footerPlaceholder) {
            const footerResponse = await fetch(`footer.html${cacheBust}`);
            if (footerResponse.ok) {
                footerPlaceholder.innerHTML = await footerResponse.text();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar componentes compartilhados:', error);
    }
}


//================================================
// COMPONENTES DE UI (INTERFACE DO USUÁRIO)
//================================================

/**
 * Ativa a funcionalidade de clique para o menu hambúrguer em dispositivos móveis.
 */
function configurarMenuHamburger() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

/**
 * Inicializa a lógica do carrossel de imagens.
 */
function inicializarCarrossel() {
    let slideIndex = 0;
    const slides = document.getElementsByClassName("slide");
    const carrosselContainer = document.querySelector('.carrossel-slides');

    if (!slides.length || !carrosselContainer) return;

    function mostrarSlide(index) {
        if (index >= slides.length) {
            slideIndex = 0; // Volta para o primeiro
        } else if (index < 0) {
            slideIndex = slides.length - 1; // Vai para o último
        } else {
            slideIndex = index;
        }
        carrosselContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
    }

    // Expõe a função de controle para ser usada pelos botões no HTML (onclick).
    window.mudarSlide = (n) => {
        mostrarSlide(slideIndex + n);
    };

    // Garante que o primeiro slide seja exibido ao carregar a página.
    mostrarSlide(slideIndex);
}


//================================================
// API DE DADOS DO SITE (FUNÇÕES UTILITÁRIAS)
//================================================

/**
 * Busca e retorna os dados principais do site a partir do arquivo dados.json.
 * @returns {Promise<object|null>} O objeto com os dados do site ou null em caso de erro.
 */
async function fetchData() {
    try {
        const response = await fetch('dados.json?cache_bust=' + new Date().getTime());
        if (!response.ok) {
            throw new Error('Arquivo dados.json não encontrado ou inacessível.');
        }
        return await response.json();
    } catch (error) {
        console.error("Erro fatal ao carregar os dados do site:", error);
        // Em um site real, poderíamos exibir uma mensagem de erro na tela aqui.
        return null;
    }
}

/**
 * Aplica uma classe de tema ao body com base no resultado do último jogo.
 * @param {object} dados O objeto de dados do site contendo a lista de jogos.
 */
function applyTheme(dados) {
    if (!dados || !dados.jogos || dados.jogos.length === 0) {
        return;
    }

    const ultimoJogo = dados.jogos[0];
    if (ultimoJogo && ultimoJogo.temaVencedor && ultimoJogo.temaVencedor !== 'nenhum') {
        document.body.className = `tema-${ultimoJogo.temaVencedor}`;
    }
}