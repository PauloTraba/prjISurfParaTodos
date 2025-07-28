document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', handleCadastro);
    }
});

async function handleCadastro(event) {
    event.preventDefault();
    if (event.target.senha.value !== event.target.senha_confirm.value) {
        alert('As senhas não coincidem!');
        return;
    }

    const cadastroData = {
        fullName: event.target.fullName.value,
        email: event.target.email.value,
        password: event.target.senha.value,
        role: 'USER'
    };

    try {
        // Usamos nossa instância 'api' e apenas o caminho do endpoint.
        // O 'baseURL' já está configurado no api.js.
        await api.post('/auth/register', cadastroData);

        alert('Cadastro realizado com sucesso! Você será redirecionado para a tela de login.');
        
        // Redireciona para a página de login
        window.location.href = '../login/';

    } catch (error) {
        // O mesmo tratamento de erro elegante que usamos no login.
        const errorMessage = error.response?.data?.message || error.message || 'Não foi possível realizar o cadastro.';
        alert(`Erro: ${errorMessage}`);
    }
}