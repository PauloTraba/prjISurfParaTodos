// /dashboard/dashboard_global.js - VERSÃO FINAL E CORRIGIDA

// "Auth Guard" - Protege todas as páginas da dashboard
(function authGuard() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Acesso não autorizado. Por favor, faça o login.");
        window.location.href = '../login/'; 
    }
})();

// Adiciona a lógica comum depois que o HTML da página carregar
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DO MENU SANFONA (ACCORDION) - VERSÃO ROBUSTA ---
    const accordionItems = document.querySelectorAll(".nav-menu .accordion");

    accordionItems.forEach(itemClicado => {
        const toggle = itemClicado.querySelector(".accordion-toggle");
        
        if (toggle) {
            toggle.addEventListener("click", (e) => {
                e.preventDefault();

                // Verifica se o item clicado já está aberto
                const estaAberto = itemClicado.classList.contains("open");

                // Passo 1: Fecha TODOS os outros itens do menu
                accordionItems.forEach(item => {
                    item.classList.remove("open");
                });

                // Passo 2: Se o item clicado NÃO estava aberto, ele o abre.
                // Se já estava aberto, o passo anterior já o fechou.
                if (!estaAberto) {
                    itemClicado.classList.add("open");
                }
            });
        }
    });

    // --- LÓGICA DE LOGOUT ---
    const logoutLink = document.querySelector('.logout a');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('authToken');
            alert("Você foi desconectado.");
            window.location.href = '../login/';
        });
    }
});