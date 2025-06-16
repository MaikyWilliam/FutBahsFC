# ⚽ Portal do FutBah's F.C.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 📖 Descrição

Este é o portal completo para o time de futebol amador de sábado, **FutBah's F.C.** O site serve como um hub central para jogadores e torcedores acompanharem os resultados, o ranking de atletas, as notícias das partidas e o elenco completo do time.

O projeto foi construído com HTML, CSS e JavaScript puros, sem a necessidade de frameworks, e é totalmente gerenciado através de um painel de administração local que atualiza um arquivo central de dados (`dados.json`).

➡️ **Acesse o site ao vivo:** `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/` *(Substitua pelo seu link do GitHub Pages)*

---

## ✨ Funcionalidades Implementadas

O portal conta com uma vasta gama de funcionalidades dinâmicas e interativas:

#### Funcionalidades do Site Principal:
- **Temas Dinâmicos:** A identidade visual do site (cores de títulos, menu e destaques) muda automaticamente para azul, vermelho ou um tema neutro, com base no time vencedor da última partida.
- **Cabeçalho Informativo:** O topo do site exibe dinamicamente as informações da próxima partida, como data, local e uma chamada para o jogo.
- **Ranking Interativo:** A tabela de ranking geral pode ser ordenada pelos cabeçalhos de **Pontos**, **Gols** e **Assistências**.
- **Destaques Automáticos:** Um card na página inicial destaca automaticamente o **Líder**, **Lanterna**, **Artilheiro** e **Garçom** (líder de assistências) do campeonato.
- **Notícias com Mídia:** Os cards de notícia na página inicial e no histórico exibem uma imagem de destaque, data, título e um resumo da matéria.
- **Página de Histórico:** Uma seção dedicada para listar todos os jogos já cadastrados, garantindo que a página inicial mostre apenas os 3 mais recentes.
- **Galeria de Mídia:** Cada página de notícia possui um carrossel que exibe fotos (adicionadas pelo admin) e vídeos.
- **Integração com API Externa:** Os vídeos das partidas são buscados dinamicamente da API do `meulance.net.br`, baseando-se na data do último sábado.
- **Cache Inteligente:** Os vídeos buscados da API são salvos no `localStorage` do navegador para evitar requisições repetidas e acelerar o carregamento.
- **Seção de Elenco:** Uma galeria horizontal e rolável apresenta todos os jogadores com foto, posição, número e estrelas que representam os títulos de campeonatos vencidos.
- **Design Responsivo:** O site é totalmente adaptado para telas de celular e tablets, com um menu "hambúrguer" funcional.

#### Funcionalidades do Painel de Admin (`admin.html`):
- **Gerenciamento Completo de Jogadores (CRUD):** Interface para Adicionar, Editar (com formulário em modal) e Remover jogadores.
- **Interface de "Dia de Jogo":**
  - **Montagem de Times com Drag and Drop:** Uma forma visual e intuitiva de arrastar jogadores da lista de disponíveis para as colunas do Time Azul e Time Vermelho.
  - **Registro de Resultados:** Seleção do time vencedor ou empate para cálculo automático dos pontos.
  - **Registro de Estatísticas:** Campos para adicionar os gols e assistências de cada jogador na partida.
- **Editor de Texto Rico:** Um editor de texto completo (SunEditor) para criar notícias com formatação (negrito, itálico, listas, parágrafos, etc.).
- **Geração de JSON Automatizada:** Ao final do processo, o painel gera e baixa um arquivo `dados.json` atualizado, pronto para ser enviado ao GitHub.

---

## 📂 Estrutura do Projeto

O projeto foi refatorado para ter uma estrutura de arquivos limpa e modular:

```
/
|-- index.html, noticia.html, historico.html, admin.html, dados.json
|
|-- /assets/
|   |-- /css/
|   |   |-- style.css      (Estilos de todo o site principal)
|   |   `-- admin.css      (Estilos exclusivos do painel de admin)
|   |
|   |-- /js/
|   |   |-- /lib/
|   |   |   `-- httpClient.js  (Classe para a API de vídeos)
|   |   |-- script.js      (Lógica de todo o site principal)
|   |   `-- admin.js       (Lógica do painel de admin)
|   |
|   `-- /imagens/
|       |-- (Todas as imagens do site)
```

---

## 🚀 Como Rodar o Projeto Localmente

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
    ```
2.  **Abra no VS Code:** Navegue até a pasta do projeto.
3.  **Use o Live Server:** Para uma experiência sem erros (especialmente para o `admin.html`), instale a extensão **Live Server** no VS Code. Clique com o botão direito em `index.html` ou `admin.html` e selecione "Open with Live Server".

---

## 🔄 Como Atualizar o Conteúdo

Existem duas formas de manter o site atualizado:

#### 1. Via Painel de Admin (Método Recomendado)
1.  Abra o arquivo `admin.html` usando o **Live Server**.
2.  Gerencie os jogadores na primeira seção (adicione, edite ou remova).
3.  Na seção "Dia de Jogo", arraste os jogadores para os times, defina o resultado, preencha os stats e crie a notícia com o editor de texto.
4.  Clique em "Gerar e Baixar JSON".
5.  Substitua o arquivo `dados.json` antigo no seu repositório pelo novo arquivo que foi baixado.
6.  Faça o `commit` e o `push` das alterações para o GitHub. A atualização no site é automática em alguns minutos.

#### 2. Edição Rápida pelo Celular
1.  Use o **aplicativo oficial do GitHub** no seu celular.
2.  Navegue até o arquivo `dados.json`.
3.  Use a função de edição do app para fazer alterações rápidas (ex: mudar os pontos de um jogador).
4.  Faça o "commit" diretamente pelo aplicativo.

---

### ⚠️ Aviso de Segurança

O arquivo `assets/js/lib/httpClient.js` contém um e-mail e senha inseridos diretamente no código para acessar a API de vídeos. Em um projeto público, **isso é um risco de segurança grave.**

- **Ação Imediata:** Altere a senha associada a este e-mail em todos os serviços que a utilizam.
- **Ação Futura:** Verifique se a API `meulance.net.br` oferece um método de autenticação mais seguro para aplicações de front-end, como chaves de API com permissões restritas.

---

## 🏆 Agradecimentos

Um agradecimento especial a todos os membros do **FutBah's F.C.** que inspiraram a criação deste portal. Este projeto foi uma jornada de desenvolvimento iterativo, construído passo a passo com foco na funcionalidade e na experiência do usuário.