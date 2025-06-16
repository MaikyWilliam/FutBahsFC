/**
 * index.js
 * Script responsável por carregar e exibir todo o conteúdo dinâmico da página inicial.
 */

//================================================
// PONTO DE ENTRADA
//================================================

document.addEventListener('DOMContentLoaded', inicializarPagina);

/**
 * Função principal que orquestra o carregamento e a renderização de todos os componentes da página.
 */
async function inicializarPagina() {
    const dados = await fetchData();
    if (!dados) {
        // Opcional: Exibir uma mensagem de erro para o usuário se os dados não carregarem.
        console.error("Não foi possível carregar os dados do site. A página pode não ser exibida corretamente.");
        return;
    }

    applyTheme(dados);

    // Renderiza os componentes estáticos da página
    carregarHeaderDestaque(dados.proximoJogo);
    carregarDestaques(dados.jogadores);
    carregarCardsUltimosJogos(dados.jogos.slice(0, 3), 'ultimos-jogos-grid');
    carregarElenco(dados.jogadores);
    renderizarBotaoHistorico(dados.jogos);

    // Configura os componentes interativos
    configurarOrdenacaoRanking(dados.jogadores);
}


//================================================
// FUNÇÕES DE RENDERIZAÇÃO DE CONTEÚDO
//================================================

/**
 * Carrega as informações do próximo jogo no cabeçalho de destaque.
 * @param {object} proximoJogo - O objeto contendo as informações do próximo jogo.
 */
function carregarHeaderDestaque(proximoJogo) {
    const header = document.getElementById('header-destaque');
    if (header && proximoJogo) {
        header.innerHTML = `
            <div class="container">
                <h2>Próximo Jogo</h2>
                <p><strong>${proximoJogo.data}</strong></p>
                <p>Local: ${proximoJogo.local}</p>
                <p class="expectativa">"${proximoJogo.expectativa}"</p>
            </div>`;
    }
}

/**
 * Carrega o card de destaques do ranking (Top 3 e Bottom 3).
 * @param {Array<object>} jogadores - A lista de todos os jogadores.
 */
function carregarDestaques(jogadores) {
    const destaquesGrid = document.getElementById('destaques-grid');
    if (!destaquesGrid) return;
    
    destaquesGrid.innerHTML = '';
    const jogadoresOrdenados = [...jogadores].sort((a, b) => b.pontos - a.pontos || b.gols - a.gols);
    const tags = calcularTagsDestaque(jogadoresOrdenados);

    const destaquesTop3 = jogadoresOrdenados.slice(0, 3).map(j => {
        const tagHtml = tags.has(j.id) ? `<span class="tag-destaque">${tags.get(j.id)}</span>` : '';
        return `<li>${j.nome} ${tagHtml}</li>`;
    }).join('');

    const destaquesBottom3 = jogadoresOrdenados.slice(-3).reverse().map(j => {
        const tagHtml = tags.has(j.id) ? `<span class="tag-destaque">${tags.get(j.id)}</span>` : '';
        return `<li>${j.nome} ${tagHtml}</li>`;
    }).join('');

    const cardDestaques = document.createElement('div');
    cardDestaques.className = 'card destaques-ranking';
    cardDestaques.innerHTML = `
        <div class="card-conteudo">
            <h3>Destaques do Ranking</h3>
            <p><strong>Na Briga pelo Pódio:</strong></p>
            <ul>${destaquesTop3}</ul>
            <br>
            <p><strong>Zona de Risco:</strong></p>
            <ul>${destaquesBottom3}</ul>
        </div>`;
    
    destaquesGrid.appendChild(cardDestaques);
}

/**
 * Renderiza os cards dos jogadores no elenco.
 * @param {Array<object>} jogadores - A lista de todos os jogadores.
 */
function carregarElenco(jogadores) {
    const container = document.getElementById('elenco-container');
    if (!container) return;

    container.innerHTML = '';
    const jogadoresOrdenados = [...jogadores].sort((a, b) => a.nome.localeCompare(b.nome));

    jogadoresOrdenados.forEach(jogador => {
        const card = document.createElement('div');
        card.className = 'elenco-card';
        const fotoSrc = jogador.foto ? `assets/imagens/elenco/${jogador.foto}` : 'assets/imagens/placeholder.png';
        const estrelasHTML = jogador.titulos > 0 ? '★'.repeat(jogador.titulos) : '&nbsp;';

        card.innerHTML = `
            <img src="${fotoSrc}" alt="Foto de ${jogador.nome}" class="elenco-foto">
            <h4 class="elenco-nome">${jogador.nome}</h4>
            <p class="elenco-info">Posição: ${jogador.posicao}</p>
            <p class="elenco-info">Número: ${jogador.numero || 'N/A'}</p>
            <div class="elenco-estrelas">${estrelasHTML}</div>`;
        container.appendChild(card);
    });
}

/**
 * Renderiza os cards dos últimos jogos.
 * @param {Array<object>} jogos - A lista de jogos a serem exibidos.
 * @param {string} gridId - O ID do elemento grid onde os cards serão inseridos.
 */
function carregarCardsUltimosJogos(jogos, gridId) {
    const gridContainer = document.getElementById(gridId);
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    jogos.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'card card-ultimo-jogo';
        const imagemDestaque = jogo.imagem_destaque ? `assets/imagens/${jogo.imagem_destaque}` : 'assets/imagens/placeholder-noticia.jpg';
        const descricaoTexto = jogo.descricao ? jogo.descricao.replace(/<[^>]*>/g, '').substring(0, 120) : "Sem descrição disponível.";

        card.innerHTML = `
            <a href="noticia.html?jogoId=${jogo.id}">
                <div class="card-imagem-container">
                    <img src="${imagemDestaque}" alt="Imagem do jogo ${jogo.titulo}">
                    <span class="card-data">${jogo.data || ''}</span>
                </div>
                <div class="card-conteudo-noticia">
                    <h3>${jogo.titulo}</h3>
                    <p>${descricaoTexto}...</p>
                    <span class="card-saiba-mais">Saiba Mais...</span>
                </div>
            </a>`;
        gridContainer.appendChild(card);
    });
}

/**
 * Renderiza o botão "Ver Histórico Completo" se houver mais de 3 jogos.
 * @param {Array<object>} jogos - A lista de todos os jogos.
 */
function renderizarBotaoHistorico(jogos) {
    const containerBotao = document.getElementById('container-botao-historico');
    if (containerBotao && jogos.length > 3) {
        containerBotao.innerHTML = `<a href="historico.html" class="btn-ver-historico">Ver Histórico Completo</a>`;
    }
}


//================================================
// COMPONENTES INTERATIVOS
//================================================

/**
 * Configura a tabela de ranking com ordenação interativa nas colunas.
 * @param {Array<object>} jogadores - A lista de todos os jogadores.
 */
function configurarOrdenacaoRanking(jogadores) {
    const rankingBody = document.getElementById('ranking-body');
    if (!rankingBody) return;

    let sortState = { column: 'pontos', direction: 'desc' };

    function renderizarRanking() {
        const sortedJogadores = [...jogadores].sort((a, b) => {
            const valA = a[sortState.column] || 0;
            const valB = b[sortState.column] || 0;

            if (sortState.direction === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                // Critério de desempate: pontos
                if (valA === valB && sortState.column !== 'pontos') {
                    return (b.pontos || 0) - (a.pontos || 0);
                }
                return valB > valA ? 1 : -1;
            }
        });

        rankingBody.innerHTML = sortedJogadores.map((jogador, index) => `
            <tr>
                <td>${index + 1}º</td>
                <td>${jogador.nome}</td>
                <td>${jogador.pontos || 0}</td>
                <td>${jogador.gols || 0}</td>
                <td>${jogador.assistencias || 0}</td>
            </tr>
        `).join('');
    }

    document.querySelectorAll('th[data-sort]').forEach(headerCell => {
        headerCell.addEventListener('click', () => {
            const column = headerCell.dataset.sort;
            if (sortState.column === column) {
                sortState.direction = sortState.direction === 'desc' ? 'asc' : 'desc';
            } else {
                sortState.column = column;
                sortState.direction = 'desc';
            }

            document.querySelectorAll('th[data-sort]').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
            headerCell.classList.add(`sort-${sortState.direction}`);
            
            renderizarRanking();
        });
    });

    renderizarRanking(); // Renderização inicial
}


//================================================
// LÓGICA DE NEGÓCIO (HELPERS)
//================================================

/**
 * Calcula e atribui tags de destaque (Líder, Lanterna, Artilheiro, Garçom) aos jogadores.
 * @param {Array<object>} jogadoresOrdenados - A lista de jogadores já ordenada por pontos.
 * @returns {Map<number, string>} Um mapa com o ID do jogador e sua(s) tag(s).
 */
function calcularTagsDestaque(jogadoresOrdenados) {
    const tags = new Map();
    if (jogadoresOrdenados.length === 0) return tags;

    // Define Líder e Lanterna
    tags.set(jogadoresOrdenados[0].id, 'Líder');
    if (jogadoresOrdenados.length > 1) {
        tags.set(jogadoresOrdenados[jogadoresOrdenados.length - 1].id, 'Lanterna');
    }

    // Encontra Artilheiro(s)
    const maxGols = Math.max(...jogadoresOrdenados.map(j => j.gols || 0));
    if (maxGols > 0) {
        jogadoresOrdenados.filter(j => j.gols === maxGols).forEach(j => {
            tags.set(j.id, tags.has(j.id) ? `${tags.get(j.id)} & Artilheiro` : 'Artilheiro');
        });
    }

    // Encontra Garçom(ns)
    const maxAssist = Math.max(...jogadoresOrdenados.map(j => j.assistencias || 0));
    if (maxAssist > 0) {
        jogadoresOrdenados.filter(j => j.assistencias === maxAssist).forEach(j => {
            tags.set(j.id, tags.has(j.id) ? `${tags.get(j.id)} & Garçom` : 'Garçom');
        });
    }

    return tags;
}