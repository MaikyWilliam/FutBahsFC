document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Função para gerar o hash de uma string (deve ser idêntica à do gerador_hash.html)
    async function textToHash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const senhaDigitada = passwordInput.value;

        try {
            // Busca os dados do JSON para pegar o hash salvo
            const response = await fetch('dados.json?cache_bust=' + new Date().getTime());
            if (!response.ok) throw new Error('Não foi possível carregar os dados de autenticação.');
            const dados = await response.json();
            
            // Pega o hash do primeiro administrador salvo no arquivo
            const adminUser = dados.administradores[0];
            if (!adminUser) throw new Error('Nenhum administrador configurado.');
            
            const hashSalvo = adminUser.senhaHash;
            const hashDigitado = await textToHash(senhaDigitada);

            if (hashDigitado === hashSalvo) {
                // Senha correta: marca o usuário como "logado" e redireciona
                sessionStorage.setItem('loggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                // Senha incorreta
                errorMessage.textContent = 'Senha incorreta.';
            }
        } catch (error) {
            errorMessage.textContent = `Erro: ${error.message}`;
            console.error(error);
        }
    });
});