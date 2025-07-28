document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    // Objeto de dados com a chave 'password' corrigida
    const loginData = {
        email: event.target.email.value,
        password: event.target.senha.value 
    };

    try {
        // Usamos nossa instância 'api' que já tem o baseURL e os headers corretos
        const response = await api.post('/auth/login', loginData);

        alert('Login realizado com sucesso!');
        localStorage.setItem('authToken', response.data.token);
        window.location.href = '../dashboard/index.html';

    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao fazer login.';
        alert(`Erro: ${errorMessage}`);
    }
}