document.addEventListener('DOMContentLoaded', () => {
    const formNovaSenha = document.getElementById('form-nova-senha');
    if (formNovaSenha) {
        formNovaSenha.addEventListener('submit', (e) => {
            e.preventDefault();
            // AQUI entraria a lógica de API para trocar a senha
            alert("Senha alterada com sucesso!");
            // Redireciona para a página de login
            window.location.href = '../login/';
        });
    }
});