// Por enquanto, este arquivo pode conter lógicas específicas da home,
// como por exemplo, a ação do botão "ENTRE EM CONTATO".
document.addEventListener('DOMContentLoaded', () => {
    const contatoBtn = document.querySelector('.btn-secundario');
    if (contatoBtn) {
        contatoBtn.addEventListener('click', () => {
            alert('Ação de contato ainda a ser definida! Pode ser um scroll para um rodapé ou um modal.');
            // Ex: window.scrollTo(0, document.body.scrollHeight); para rolar até o fim da página.
        });
    }
});