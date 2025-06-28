// Verifica se o usuário está "logado" antes de carregar o resto da página.
if (sessionStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {

    //================================================
    // ESTADO GLOBAL E CONSTANTES
    //================================================

    let dadosDoSite = null;
    let novasMidias = [];
    let editorDeNoticia = null;

    // --- Elementos do DOM ---
    const loadingMessage = document.getElementById('loading-message');
    const mainContent = document.getElementById('main-content');
    const addPlayerForm = document.getElementById('add-player-form');
    const playerManagementList = document.getElementById('player-management-list');
    const salvarJogadoresBtn = document.getElementById('salvar-jogadores-btn');
    const confirmarPresencaList = document.getElementById('confirmar-presenca-list');
    const sortearTimesBtn = document.getElementById('sortear-times-btn');
    const timesSorteadosContainer = document.getElementById('times-sorteados-container');
    const sorteioAzulList = document.getElementById('sorteio-azul-list');
    const sorteioVermelhoList = document.getElementById('sorteio-vermelho-list');
    const salvarSorteioBtn = document.getElementById('salvar-sorteio-btn');
    const dropZones = document.querySelectorAll('.drop-zone');
    const disponiveisList = document.getElementById('disponiveis-list');
    const confirmarTimesBtn = document.getElementById('confirmar-times-btn');
    const finalSteps = document.getElementById('final-steps');
    const statsBody = document.getElementById('stats-body');
    const gerarNoticiaBtn = document.getElementById('gerar-noticia-btn');
    const midiasInput = document.getElementById('midias');
    const imagePreview = document.getElementById('image-preview');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-player-form');
    const closeModalBtn = document.querySelector('.close-modal');


    //================================================
    // INICIALIZAÇÃO
    //================================================

    /**
     * Carrega os dados iniciais do arquivo JSON e inicializa o painel.
     */
    async function carregarDadosEInicializar() {
        try {
            const response = await fetch('./dados.json?cache_bust=' + new Date().getTime());
            if (!response.ok) throw new Error('Arquivo dados.json não encontrado.');
            dadosDoSite = await response.json();
            inicializarPainel();
        } catch (error) {
            loadingMessage.textContent = `ERRO: ${error.message}. Verifique o console ou se está usando um servidor local.`;
        }
    }

    /**
     * Prepara e exibe o conteúdo principal do painel administrativo.
     */
    function inicializarPainel() {
        loadingMessage.style.display = 'none';
        mainContent.classList.remove('hidden');
        
        inicializarAbas();
        atualizarListasDeJogadores();
        inicializarEditorDeNoticia();
        adicionarEventListenersGlobais();
    }

    /**
     * Adiciona a lógica para alternar entre as abas do painel.
     */
    function inicializarAbas() {
        const tabContainer = document.querySelector('.admin-tabs');
        if (!tabContainer) return;

        tabContainer.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab-btn');
            if (!clickedTab) return;

            // Desativa todas as abas e conteúdos
            tabContainer.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

            // Ativa a aba e o conteúdo correspondente
            clickedTab.classList.add('active');
            const targetContent = document.getElementById(clickedTab.dataset.target);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    }

    /**
     * Configura todos os event listeners globais da aplicação.
     */
    function adicionarEventListenersGlobais() {
        addPlayerForm.addEventListener('submit', handleAddPlayer);
        playerManagementList.addEventListener('click', handleManagePlayerClick);
        editForm.addEventListener('submit', handleSaveEditPlayer);
        sortearTimesBtn.addEventListener('click', handleSortearTimes);
        salvarJogadoresBtn.addEventListener('click', handleSalvarJogadores);
        salvarSorteioBtn.addEventListener('click', handleSalvarSorteio);
        confirmarTimesBtn.addEventListener('click', handleConfirmarTimesDragDrop);
        midiasInput.addEventListener('change', handleMidiasChange);
        gerarNoticiaBtn.addEventListener('click', handleGerarNoticia);

        // Event listeners do Modal
        closeModalBtn.addEventListener('click', () => editModal.classList.add('hidden'));
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) editModal.classList.add('hidden');
        });
    }

    /**
     * Inicializa o editor de texto rico SUNEDITOR.
     */
    function inicializarEditorDeNoticia() {
        if (typeof SUNEDITOR !== 'undefined' && SUNEDITOR_LANG['pt_br']) {
            editorDeNoticia = SUNEDITOR.create('descricao', {
                buttonList: [['undo', 'redo'], ['bold', 'italic', 'underline'], ['list'], ['link']]
            });
        }
    }
    
    /**
     * Função auxiliar para atualizar todas as listas de jogadores na interface.
     */
    function atualizarListasDeJogadores() {
        renderizarGerenciadorJogadores();
        renderizarConfirmacaoPresenca();
        inicializarDragAndDrop();
    }

    //================================================
    // MANIPULADORES DE EVENTOS (HANDLERS)
    //================================================

    function handleAddPlayer(e) {
        e.preventDefault();
        const novoJogador = {
            id: dadosDoSite.jogadores.length > 0 ? Math.max(...dadosDoSite.jogadores.map(j => j.id)) + 1 : 1,
            nome: document.getElementById('new-player-name').value,
            posicao: document.getElementById('new-player-pos').value,
            numero: parseInt(document.getElementById('new-player-numero').value) || 0,
            titulos: parseInt(document.getElementById('new-player-titulos').value) || 0,
            nota: parseInt(document.getElementById('new-player-nota').value) || 5,
            foto: document.getElementById('new-player-foto').value,
            pontos: 0,
            gols: 0,
            assistencias: 0
        };
        dadosDoSite.jogadores.push(novoJogador);
        atualizarListasDeJogadores();
        addPlayerForm.reset();
        alert('Jogador adicionado!');
    }

    function handleManagePlayerClick(e) {
        const targetId = e.target.dataset.id;
        if (!targetId) return;

        const id = parseInt(targetId);

        if (e.target.classList.contains('btn-remover')) {
            if (confirm('Tem certeza que deseja remover este jogador?')) {
                dadosDoSite.jogadores = dadosDoSite.jogadores.filter(p => p.id !== id);
                atualizarListasDeJogadores();
            }
        }

        if (e.target.classList.contains('btn-editar')) {
            const jogador = dadosDoSite.jogadores.find(p => p.id === id);
            if (jogador) {
                document.getElementById('edit-player-id').value = jogador.id;
                document.getElementById('edit-player-name').value = jogador.nome;
                document.getElementById('edit-player-pos').value = jogador.posicao;
                document.getElementById('edit-player-numero').value = jogador.numero;
                document.getElementById('edit-player-titulos').value = jogador.titulos;
                document.getElementById('edit-player-nota').value = jogador.nota;
                document.getElementById('edit-player-foto').value = jogador.foto;
                editModal.classList.remove('hidden');
            }
        }
    }

    function handleSaveEditPlayer(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-player-id').value);
        const jogador = dadosDoSite.jogadores.find(p => p.id === id);

        if (jogador) {
            jogador.nome = document.getElementById('edit-player-name').value;
            jogador.posicao = document.getElementById('edit-player-pos').value;
            jogador.numero = parseInt(document.getElementById('edit-player-numero').value) || jogador.numero;
            jogador.titulos = parseInt(document.getElementById('edit-player-titulos').value) || jogador.titulos;
            jogador.nota = parseInt(document.getElementById('edit-player-nota').value) || jogador.nota;
            jogador.foto = document.getElementById('edit-player-foto').value;
        }
        
        atualizarListasDeJogadores();
        editModal.classList.add('hidden');
    }

    function handleSalvarJogadores() {
        gerarEBaixarJSON(dadosDoSite, "Isso irá gerar um novo 'dados.json' com as alterações na lista de jogadores.");
    }

    function handleSortearTimes() {
        const jogadoresPresentesIds = Array.from(document.querySelectorAll('.presenca-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
        let jogadoresPresentes = [...dadosDoSite.jogadores.filter(p => jogadoresPresentesIds.includes(p.id))];

        if (jogadoresPresentes.length < 2) {
            alert('Selecione pelo menos 2 jogadores para o sorteio.');
            return;
        }

        sortearTimes(jogadoresPresentes);
        timesSorteadosContainer.classList.remove('hidden');
    }

    function handleSalvarSorteio() {
        const timeAzulSorteado = Array.from(document.querySelectorAll('#sorteio-azul-list .player-item-sorteado')).map(el => parseInt(el.dataset.id));
        const timeVermelhoSorteado = Array.from(document.querySelectorAll('#sorteio-vermelho-list .player-item-sorteado')).map(el => parseInt(el.dataset.id));

        if (timeAzulSorteado.length === 0 && timeVermelhoSorteado.length === 0) {
            alert('Não há times sorteados para salvar.');
            return;
        }

        if (!dadosDoSite.timesSorteados) dadosDoSite.timesSorteados = {};
        dadosDoSite.timesSorteados = {
            azul: timeAzulSorteado,
            vermelho: timeVermelhoSorteado
        };

        gerarEBaixarJSON(dadosDoSite, "Isso irá salvar a composição dos times sorteados no arquivo 'dados.json'.");
    }

    function handleConfirmarTimesDragDrop() {
        const jogadoresDaPartidaIds = [...document.querySelectorAll('#azul-list-drag .player-item, #vermelho-list-drag .player-item')].map(el => parseInt(el.dataset.id));

        if (jogadoresDaPartidaIds.length === 0) {
            alert("Arraste os jogadores para os times para poder registrar a partida.");
            return;
        }

        renderizarTabelaDeStats(jogadoresDaPartidaIds);
        finalSteps.classList.remove('hidden');
    }
    
    function handleMidiasChange(event) {
        imagePreview.innerHTML = '';
        novasMidias = [];

        Array.from(event.target.files).forEach((file, index) => {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-image-container';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            previewContainer.appendChild(img);
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'imagem_destaque_selecao';
            radio.value = file.name;
            if (index === 0) radio.checked = true; // Marca a primeira imagem como padrão
            previewContainer.appendChild(radio);

            imagePreview.appendChild(previewContainer);
            novasMidias.push({ tipo: 'imagem', url: `assets/imagens/${file.name}` });
        });
    }

    function handleGerarNoticia() {
        const dadosParaSalvar = JSON.parse(JSON.stringify(dadosDoSite));
        const resultado = document.getElementById('resultado-geral').value;
        const timeAzulIds = Array.from(document.querySelectorAll('#azul-list-drag .player-item')).map(el => parseInt(el.dataset.id));
        const timeVermelhoIds = Array.from(document.querySelectorAll('#vermelho-list-drag .player-item')).map(el => parseInt(el.dataset.id));

        if (timeAzulIds.length === 0 && timeVermelhoIds.length === 0) {
            alert("Não há times no fluxo de 'Registrar Jogo' para salvar.");
            return;
        }

        // Atualiza pontos
        if (resultado === 'empate') {
            [...timeAzulIds, ...timeVermelhoIds].forEach(id => {
                const p = dadosParaSalvar.jogadores.find(j => j.id === id);
                if(p) p.pontos += 1;
            });
        } else if (resultado === 'azul') {
            timeAzulIds.forEach(id => {
                const p = dadosParaSalvar.jogadores.find(j => j.id === id);
                if(p) p.pontos += 3;
            });
        } else if (resultado === 'vermelho') {
            timeVermelhoIds.forEach(id => {
                const p = dadosParaSalvar.jogadores.find(j => j.id === id);
                if(p) p.pontos += 3;
            });
        }
        
        // Atualiza gols e assistências
        document.querySelectorAll('.gols-input').forEach(input => {
            const jogador = dadosParaSalvar.jogadores.find(j => j.id === parseInt(input.dataset.id));
            if (jogador) jogador.gols += parseInt(input.value) || 0;
        });
        document.querySelectorAll('.assist-input').forEach(input => {
            const jogador = dadosParaSalvar.jogadores.find(j => j.id === parseInt(input.dataset.id));
            if (jogador) jogador.assistencias += parseInt(input.value) || 0;
        });

        // Cria a notícia
        const titulo = document.getElementById('titulo').value;
        const dataJogo = document.getElementById('data-jogo').value;
        if (!titulo || !dataJogo) {
            alert("Título e Data do Jogo são obrigatórios para criar uma notícia.");
            return;
        }
        
        const imagemDestaqueSelecionada = document.querySelector('input[name="imagem_destaque_selecao"]:checked');
        const imagemDestaqueUrl = imagemDestaqueSelecionada ? `${imagemDestaqueSelecionada.value}` : (novasMidias.length > 0 ? novasMidias[0].url : "");
        
        const novaNoticia = {
            id: dadosParaSalvar.jogos.length > 0 ? Math.max(...dadosParaSalvar.jogos.map(j => j.id)) + 1 : 1,
            data: new Date(dataJogo + 'T00:00:00').toLocaleDateString('pt-BR'),
            titulo,
            placar: document.getElementById('placar').value,
            descricao: (editorDeNoticia ? editorDeNoticia.getContents(true) : document.getElementById('descricao').value),
            imagem_destaque: imagemDestaqueUrl,
            midias: novasMidias,
            temaVencedor: resultado
        };
        dadosParaSalvar.jogos.unshift(novaNoticia);
        
        gerarEBaixarJSON(dadosParaSalvar, "Isso irá registrar a partida, atualizar os stats dos jogadores e criar uma nova notícia.", true);
    }

    //================================================
    // FUNÇÕES DE RENDERIZAÇÃO
    //================================================

    function renderizarGerenciadorJogadores() {
        playerManagementList.innerHTML = '';
        dadosDoSite.jogadores
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .forEach(p => {
                const li = document.createElement('li');
                li.className = 'player-list-item';
                li.innerHTML = `
                    <div class="player-info">
                        <strong class="player-name">${p.nome}</strong>
                        <small class="player-details">Posição: ${p.posicao} / Nota: ${p.nota}</small>
                    </div>
                    <div class="player-actions">
                        <button class="btn-small btn-editar" data-id="${p.id}">Editar</button>
                        <button class="btn-small btn-remover" data-id="${p.id}">Remover</button>
                    </div>`;
                playerManagementList.appendChild(li);
            });
    }

    function renderizarConfirmacaoPresenca() {
        confirmarPresencaList.innerHTML = '';
        dadosDoSite.jogadores
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .forEach(p => {
                const div = document.createElement('div');
                div.innerHTML = `<label><input type="checkbox" class="presenca-checkbox" data-id="${p.id}" checked> ${p.nome}</label>`;
                confirmarPresencaList.appendChild(div);
            });
    }

    function renderizarTimeSorteado(element, nomeTime, time, notaTotal) {
        const ordemPosicao = ["Goleiro", "Zagueiro", "Volante", "Meia", "Atacante", "Gandula"];
        time.sort((a, b) => ordemPosicao.indexOf(a.posicao) - ordemPosicao.indexOf(b.posicao));
        
        element.innerHTML = `<h4>${nomeTime} (Índice Total: ${notaTotal.toFixed(1)})</h4>`;
        time.forEach(p => {
            const div = document.createElement('div');
            div.className = 'player-item-sorteado';
            div.dataset.id = p.id;
            div.innerHTML = `${p.nome} <small>(${p.posicao})</small>`;
            element.appendChild(div);
        });
    }
    
    function renderizarTabelaDeStats(jogadoresIds) {
        statsBody.innerHTML = '';
        jogadoresIds
            .sort((a,b) => {
                const nomeA = dadosDoSite.jogadores.find(j => j.id === a).nome;
                const nomeB = dadosDoSite.jogadores.find(j => j.id === b).nome;
                return nomeA.localeCompare(nomeB);
            })
            .forEach(id => {
                const jogador = dadosDoSite.jogadores.find(j => j.id === id);
                if (jogador) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${jogador.nome}</td>
                        <td><input type="number" class="gols-input" data-id="${id}" value="0" min="0"></td>
                        <td><input type="number" class="assist-input" data-id="${id}" value="0" min="0"></td>`;
                    statsBody.appendChild(row);
                }
            });
    }

    //================================================
    // LÓGICA DE NEGÓCIO
    //================================================

    function sortearTimes(jogadoresPresentes) {
        let timeAzul = [], timeVermelho = [];
        let notaAzul = 0, notaVermelha = 0;

        const PESO_NOTA = 0.7;
        const PESO_PONTOS = 0.3;
        const FATOR_SORTE = 1.5;

        // Calcula um índice de habilidade para cada jogador
        const jogadoresComIndice = jogadoresPresentes.map(p => {
            const indiceBase = (p.nota * PESO_NOTA) + ((p.pontos / 5) * PESO_PONTOS);
            const indiceFinal = indiceBase + (Math.random() * FATOR_SORTE);
            return { ...p, indice: indiceFinal };
        });

        // Garante que cada posição seja distribuída
        const posicoesUnicas = [...new Set(jogadoresComIndice.map(p => p.posicao))];
        posicoesUnicas.forEach(posicao => {
            const jogadoresDaPosicao = jogadoresComIndice
                .filter(p => p.posicao === posicao)
                .sort((a, b) => b.indice - a.indice); // Ordena os melhores da posição
            
            // Distribui os jogadores daquela posição entre os times
            jogadoresDaPosicao.forEach(jogador => {
                if (notaAzul <= notaVermelha) {
                    timeAzul.push(jogador);
                    notaAzul += jogador.indice;
                } else {
                    timeVermelho.push(jogador);
                    notaVermelha += jogador.indice;
                }
            });
        });

        renderizarTimeSorteado(sorteioAzulList, 'Time Azul', timeAzul, notaAzul);
        renderizarTimeSorteado(sorteioVermelhoList, 'Time Vermelho', timeVermelho, notaVermelha);
    }
    
    function inicializarDragAndDrop() {
    disponiveisList.innerHTML = '<h4>Disponíveis</h4>';
    document.querySelectorAll('#azul-list-drag .player-item, #vermelho-list-drag .player-item').forEach(item => item.remove());

    dadosDoSite.jogadores.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(p => {
        const playerEl = document.createElement('div');
        playerEl.className = 'player-item';
        playerEl.draggable = true;
        playerEl.textContent = p.nome;
        playerEl.dataset.id = p.id;
        disponiveisList.appendChild(playerEl);
    });

    const playerItems = document.querySelectorAll('.player-item');
    let draggedItem = null;

    // --- Eventos de Mouse (Desktop) ---
    playerItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', (e) => {
            e.currentTarget.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            if (draggedItem) {
                e.currentTarget.appendChild(draggedItem);
            }
        });
    });

    // --- Eventos de Toque (Mobile/Tablet) ---
    let touchDraggedItem = null;
    playerItems.forEach(item => {
        item.addEventListener('touchstart', (e) => {
            touchDraggedItem = e.target;
            touchDraggedItem.classList.add('dragging');
        }, { passive: true });

        item.addEventListener('touchend', () => {
            if (touchDraggedItem) {
                 touchDraggedItem.classList.remove('dragging');
                 touchDraggedItem = null;
                 document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
            }
        });
    });

    document.body.addEventListener('touchmove', (e) => {
        if (touchDraggedItem) {
            e.preventDefault();
            const touch = e.touches[0];
            const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropZoneUnderTouch = elementUnderTouch ? elementUnderTouch.closest('.drop-zone') : null;

            document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));

            if (dropZoneUnderTouch) {
                dropZoneUnderTouch.classList.add('drag-over');
                dropZoneUnderTouch.appendChild(touchDraggedItem);
            }
        }
    }, { passive: false });
}

    //================================================
    // UTILITÁRIOS
    //================================================

    /**
     * Gera um arquivo JSON para download com os dados fornecidos.
     * @param {object} dados O objeto de dados a ser convertido em JSON.
     * @param {string} mensagemConfirmacao Mensagem para exibir no prompt de confirmação.
     * @param {boolean} deveRecarregar Se a página deve ser recarregada após o download.
     */
    function gerarEBaixarJSON(dados, mensagemConfirmacao, deveRecarregar = false) {
        if (confirm(mensagemConfirmacao + "\nDeseja continuar?")) {
            const dadosString = JSON.stringify(dados, null, 2);
            const blob = new Blob([dadosString], { type: 'application/json' });
            const a = document.createElement('a');

            a.href = URL.createObjectURL(blob);
            a.download = 'dados.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);

            alert('Arquivo "dados.json" gerado com sucesso! Faça o upload para o servidor.');

            if (deveRecarregar) {
                setTimeout(() => location.reload(), 500);
            }
        }
    }
    
    //================================================
    // PONTO DE ENTRADA
    //================================================
    carregarDadosEInicializar();
});