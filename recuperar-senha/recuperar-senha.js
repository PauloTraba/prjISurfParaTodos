document.addEventListener('DOMContentLoaded', () => {
    const formRecuperar = document.getElementById('form-recuperar-senha');
    if (formRecuperar) {
        formRecuperar.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Simulação: E-mail de recuperação seria enviado.");
            // Redireciona para a página de nova senha
            window.location.href = '../nova-senha/';
        });
    }
});