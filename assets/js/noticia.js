document.addEventListener('DOMContentLoaded', async () => {
    const dados = await fetchData();
    if (!dados) return;

    applyTheme(dados);
    carregarNoticia(dados);
});

async function carregarNoticia(dados) {
    const urlParams = new URLSearchParams(window.location.search);
    const jogoId = parseInt(urlParams.get('jogoId'));
    const jogo = dados.jogos.find(j => j.id === jogoId);
    if (!jogo) { document.getElementById('noticia-titulo').textContent = "Notícia não encontrada"; return; }

    document.getElementById('noticia-titulo').textContent = jogo.titulo;
    document.getElementById('noticia-placar').textContent = jogo.placar;
    document.getElementById('noticia-descricao').innerHTML = jogo.descricao;

    const carrosselSection = document.getElementById('carrossel');
    const slidesContainer = document.querySelector('.carrossel-slides');
    const videoLoader = document.getElementById('video-loader');
    if (!carrosselSection || !slidesContainer || !videoLoader) return;

    let allMedia = [...(jogo.midias || [])].map(m => ({ ...m, url: `assets/imagens/${m.url.split('/').pop()}` }));

    const apiVideos = await fetchAndRenderVideosWithCache();
    if (apiVideos.length > 0) {
        allMedia.push(...apiVideos);
    }
    
    if (allMedia.length > 0) {
        carrosselSection.style.display = 'block';
        slidesContainer.innerHTML = '';
        allMedia.forEach(midia => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            if (midia.tipo === 'imagem') {
                slideDiv.innerHTML = `<img src="${midia.url}" alt="Foto do jogo">`;
            } else if (midia.tipo === 'video') {
                slideDiv.innerHTML = `<video controls preload="metadata"><source src="${midia.url}#t=0.1" type="video/mp4"></video>`;
            }
            slidesContainer.appendChild(slideDiv);
        });
        mostrarSlide(0);
    }
}

async function fetchAndRenderVideosWithCache() {
    const videoLoader = document.getElementById('video-loader');
    const httpClient = new HttpClient();
    const saturday = httpClient.getPreviousSaturday(new Date());
    const cacheKey = `videos-${saturday.date}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        console.log("Vídeos carregados do CACHE para a data:", saturday.date);
        return JSON.parse(cachedData);
    } else {
        try {
            console.log("Buscando vídeos da API para a data:", saturday.date);
            videoLoader.style.display = 'block';
            await httpClient.login();
            await httpClient.postChannelId();
            const apiResponse = await httpClient.postVideos();
            localStorage.setItem(cacheKey, JSON.stringify(apiResponse.videos || []));
            return apiResponse.videos || [];
        } catch (error) {
            return [];
        } finally {
            videoLoader.style.display = 'none';
        }
    }
}