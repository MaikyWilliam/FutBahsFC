// Função para carregar o cabeçalho e, em seguida, executar o código
function loadHeaderAndExecuteCode() {
    $("#header").load("header.html", function () {
        // Agora que o header foi carregado, podemos lidar com o clique no botão
        $("#btn-mobile").click(function () {
            $(".menu.mobile ul").slideToggle();
        });

        // Continue com qualquer outro código que dependa do header aqui
    });
}

// Carregue o cabeçalho e o rodapé usando a função definida acima
$(document).ready(function () {
    loadHeaderAndExecuteCode();
    $("#footer").load("footer.html");
});