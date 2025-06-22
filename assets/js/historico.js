document.addEventListener('DOMContentLoaded', async () => {
    const dados = await fetchData();
    if (!dados) return;

    applyTheme(dados);
    carregarPaginaHistorico(dados);
});

function carregarPaginaHistorico(dados) {
    const gridContainer = document.getElementById('historico-jogos-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    dados.jogos.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'card card-ultimo-jogo';
        const imagemDestaque = jogo.imagem_destaque ? `${jogo.imagem_destaque}` : 'https://source.unsplash.com/400x300/?soccer';
        const descricaoHtml = jogo.descricao || '';
        const descricaoTexto = descricaoHtml.replace(/<[^>]*>/g, '').substring(0, 120);
        card.innerHTML = `<a href="noticia.html?jogoId=${jogo.id}"><div class="card-imagem-container"><img src="${imagemDestaque}" alt="Imagem do jogo ${jogo.titulo}"><span class="card-data">${jogo.data || ''}</span></div><div class="card-conteudo-noticia"><h3>${jogo.titulo}</h3><p>${descricaoTexto}...</p><span class="card-saiba-mais">Saiba Mais...</span></div></a>`;
        gridContainer.appendChild(card);
    });
}