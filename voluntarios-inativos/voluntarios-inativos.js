// ==================================================================
// SCRIPT SIMPLIFICADO PARA A PÁGINA DE VOLUNTÁRIOS INATIVOS - VERSÃO DE DIAGNÓSTICO
// ==================================================================

// --- ESTADO DA PÁGINA ---
let allVolunteers = [];
let filteredVolunteers = [];
let currentPage = 1;
const rowsPerPage = 10;

const mockVolunteers = [
    { id: 'mock-inativo1', registerName: 'Pedro Souza (Mock)', email: 'pedro.mock@surf.com', active: false, gender: 'Masculino', userRole: "2" },
    { id: 'mock-inativo2', registerName: 'Maria Lima (Mock)', email: 'maria.mock@surf.com', active: false, gender: 'Feminino', userRole: "2" }
];

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Sempre fazer uma nova consulta ao backend quando a página é carregada
    localStorage.removeItem('cachedInactiveVolunteers');
    
    // Verifica se precisamos atualizar os dados (indicado pela página de ativos)
    if (localStorage.getItem('shouldRefreshInactiveVolunteers') === 'true') {
        console.log("Atualizando lista de voluntários inativos após desativação...");
        localStorage.removeItem('shouldRefreshInactiveVolunteers');
    }
    
    loadAndRenderVolunteers();
});


async function loadAndRenderVolunteers() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.warn("Token não encontrado. Usando apenas dados mockados.");
            allVolunteers = mockVolunteers;
        } else {
            // Usar o endpoint específico para voluntários inativos, se existir
            // Caso contrário, usar o endpoint geral e filtrar
            const response = await fetch("https://surf-para-todes.onrender.com/api/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                // Adicionar um timestamp para evitar cache
                cache: "no-store"
            });
            
            if (!response.ok) {
                throw new Error("Falha ao buscar voluntários: " + response.statusText);
            }
            
            const data = await response.json();
            // Filtra apenas voluntários inativos (userRole = 2 para voluntários)
            const realInactiveVolunteers = data.filter(user => 
                (user.userRole === "2" || user.userRole === 2) && 
                user.active === false
            );
            console.log("Voluntários inativos carregados da API:", realInactiveVolunteers.length);
            
            // Combinar voluntários mockados com voluntários reais
            allVolunteers = [...mockVolunteers, ...realInactiveVolunteers];
        }
    } catch (error) {
        console.error("Erro ao buscar voluntários da API:", error);
        console.warn("Usando apenas dados mockados.");
        allVolunteers = mockVolunteers;
    }
    
    filteredVolunteers = [...allVolunteers];
    renderPage();
    setupEventListeners();
}

// --- RENDERIZAÇÃO (DESENHAR NA TELA) ---
function renderPage() {
    renderTable();
    renderPaginationControls();
}

function createVolunteerRowHTML(volunteer) {
    let genderPath = 'lego'; 
    let randomAvatarNumber = Math.floor(Math.random() * 10);
    
    // Determina o tipo de avatar baseado no gênero
    if (volunteer.gender === 'Feminino' || volunteer.gender === 'feminino' || volunteer.gender === 'Feminino') { 
        genderPath = 'women'; 
        randomAvatarNumber = Math.floor(Math.random() * 99); 
    } else if (volunteer.gender === 'Masculino' || volunteer.gender === 'masculino' || volunteer.gender === 'Masculino') { 
        genderPath = 'men'; 
        randomAvatarNumber = Math.floor(Math.random() * 99); 
    } else { 
        genderPath = Math.random() < 0.5 ? 'women' : 'men'; 
        randomAvatarNumber = Math.floor(Math.random() * 99); 
    }
    
    const avatarUrl = `https://randomuser.me/api/portraits/${genderPath}/${randomAvatarNumber}.jpg`;
    const statusClass = 'inactive';
    const statusText = 'Inativo';

    return `
        <tr data-userid="${volunteer.id}" data-username="${volunteer.registerName}">
            <td>
                <div class="student-info">
                    <div class="student-avatar"><img src="${avatarUrl}" alt="${volunteer.registerName}"></div>
                    <div class="student-details"><span class="student-name">${volunteer.registerName}</span></div>
                </div>
            </td>
            <td>${volunteer.email || 'Não informado'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="student-actions">
                    <button class="action-btn view-btn" title="Visualizar"><i class="fas fa-eye"></i></button>
                    <button class="action-btn activate-btn" title="Reativar"><i class="fas fa-user-check"></i></button>
                    <button class="action-btn delete-btn" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}

function renderTable(volunteersToRender = filteredVolunteers) {
    const tableBody = document.getElementById('students-list');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedVolunteers = volunteersToRender.slice(startIndex, endIndex);
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = `${volunteersToRender.length} Cadastros Inativos`;
    if (paginatedVolunteers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum voluntário encontrado.</td></tr>`;
        return;
    }
    paginatedVolunteers.forEach(volunteer => {
        tableBody.insertAdjacentHTML('beforeend', createVolunteerRowHTML(volunteer));
    });
}

function renderPaginationControls(volunteersCount = filteredVolunteers.length) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    const totalPages = Math.ceil(volunteersCount / rowsPerPage);
    paginationContainer.querySelector('span').textContent = `Mostrando ${volunteersCount > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0}-${Math.min(currentPage * rowsPerPage, volunteersCount)} de ${volunteersCount} itens`;
    const prevButton = paginationContainer.querySelector('.page-prev');
    const nextButton = paginationContainer.querySelector('.page-next');
    prevButton.disabled = (currentPage === 1);
    nextButton.disabled = (currentPage >= totalPages);
}

// --- LÓGICA DAS AÇÕES ---
function viewUser(userId) {
    const volunteer = allVolunteers.find(v => v.id == userId);
    if (!volunteer) {
        alert("Erro: Voluntário não encontrado");
        return;
    }
    
    // Formata as informações do voluntário para exibição
    const volunteerInfo = `
Nome: ${volunteer.registerName || 'Não informado'}
${volunteer.socialName ? 'Nome social: ' + volunteer.socialName : ''}
Email: ${volunteer.email || 'Não informado'}
Data de Nascimento: ${volunteer.birthDate ? new Date(volunteer.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
Gênero: ${volunteer.gender || 'Não informado'}
Telefone: ${volunteer.phone || 'Não informado'}
Status: Inativo
    `;
    
    alert(`Visualizando dados do voluntário:\n\n${volunteerInfo}`);
}

async function activateUser(userId) {
    if (String(userId).includes('mock')) {
        alert("Este é um usuário de demonstração e não pode ser ativado.");
        return;
    }
    
    if (confirm(`Deseja realmente reativar este voluntário?`)) {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Você precisa estar logado para ativar voluntários.");
                return;
            }
            
            // Vamos simplificar e enviar diretamente o que precisamos mudar
            const payload = {
                id: userId,
                active: true
            };
            
            console.log("Enviando payload simplificado para ativação:", payload);
            
            // Atualiza o voluntário com o campo active = true
            const response = await fetch(`https://surf-para-todes.onrender.com/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            // Adicionando log da resposta completa para diagnóstico
            const responseText = await response.text();
            console.log("Resposta completa do servidor:", responseText);
            
            if (!response.ok) {
                throw new Error(`Erro ao ativar: ${response.status} ${response.statusText}`);
            }
            
            // Tentar interpretar a resposta se for JSON
            try {
                if (responseText) {
                    const responseData = JSON.parse(responseText);
                    console.log("Resposta do servidor (parsed):", responseData);
                }
            } catch (e) {
                console.log("A resposta não é JSON válido");
            }
            
            // Atualiza a lista de voluntários removendo o ativado
            allVolunteers = allVolunteers.filter(volunteer => volunteer.id != userId);
            filteredVolunteers = filteredVolunteers.filter(volunteer => volunteer.id != userId);
            
            // Notifica aos usuários que devem atualizar as listas de ativos
            localStorage.setItem('shouldRefreshActiveVolunteers', 'true');
            
            alert("Voluntário reativado com sucesso! Ele agora aparecerá na lista de voluntários ativos.");
            renderPage();
        } catch (error) {
            console.error("Erro ao ativar voluntário:", error);
            alert("Erro ao ativar voluntário. Por favor, tente novamente. Detalhes: " + error.message);
        }
    }
}

async function deleteUser(userId) {
    hideDeleteModal();
    
    if (String(userId).includes('mock')) {
        alert("Este é um usuário de demonstração e não pode ser excluído.");
        return;
    }
    
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Você precisa estar logado para excluir voluntários.");
            return;
        }
        
        const response = await fetch(`https://surf-para-todes.onrender.com/api/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error("Resposta do servidor:", await response.text());
            throw new Error(`Erro ao excluir: ${response.status} ${response.statusText}`);
        }
        
        allVolunteers = allVolunteers.filter(volunteer => volunteer.id != userId);
        filteredVolunteers = filteredVolunteers.filter(volunteer => volunteer.id != userId);
        alert("Voluntário excluído com sucesso!");
        renderPage();
    } catch (error) {
        console.error("Erro ao excluir voluntário:", error);
        alert("Erro ao excluir voluntário. Detalhes: " + error.message);
    }
}

// --- LÓGICA DO MODAL ---
function showDeleteModal(userId, userName) {
    const modal = document.getElementById('delete-modal');
    const studentNameSpan = document.getElementById('student-name-modal');
    if (!modal || !studentNameSpan) {
        // Fallback para confirmação simples se o modal não existir
        if (confirm(`Esta é uma exclusão PERMANENTE. Deseja realmente excluir o voluntário ${userName}?`)) {
            deleteUser(userId);
        }
        return;
    }
    
    studentNameSpan.textContent = userName;
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; modal.querySelector('.modal-box').style.transform = 'scale(1)'; }, 10);
    modal.dataset.userIdToDelete = userId;
}

function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.style.opacity = '0';
    if (modal.querySelector('.modal-box')) {
        modal.querySelector('.modal-box').style.transform = 'scale(0.95)';
    }
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    const tableBody = document.getElementById('students-list');
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (!row) return;
            const userId = row.dataset.userid;
            const userName = row.dataset.username;

            if (event.target.closest('.view-btn')) { viewUser(userId); }
            if (event.target.closest('.activate-btn')) { activateUser(userId); }
            if (event.target.closest('.delete-btn')) {
                showDeleteModal(userId, userName);
            }
        });
    }

    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const modalOverlay = document.getElementById('delete-modal');
    if (confirmDeleteBtn && cancelDeleteBtn && modalOverlay) {
        confirmDeleteBtn.addEventListener('click', () => {
            const userId = modalOverlay.dataset.userIdToDelete;
            deleteUser(userId);
        });
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) { hideDeleteModal(); }
        });
    }

    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            filteredVolunteers = allVolunteers.filter(volunteer =>
                (volunteer.registerName && volunteer.registerName.toLowerCase().includes(searchTerm)) ||
                (volunteer.email && volunteer.email.toLowerCase().includes(searchTerm))
            );
            currentPage = 1;
            renderPage();
        });
    }

    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (event) => {
            const totalPages = Math.ceil(filteredVolunteers.length / rowsPerPage);
            if (event.target.closest('.page-next') && currentPage < totalPages) {
                currentPage++;
                renderPage();
            }
            if (event.target.closest('.page-prev') && currentPage > 1) {
                currentPage--;
                renderPage();
            }
        });
    }
}