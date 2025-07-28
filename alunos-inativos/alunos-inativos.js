// ==================================================================
// SCRIPT PARA A PÁGINA DE ALUNOS INATIVOS
// ==================================================================

// --- ESTADO DA PÁGINA ---
let allInactiveStudents = [];
let filteredInactiveStudents = [];
let currentPage = 1;
const rowsPerPage = 10;

const mockInactiveStudents = [
    { id: 'mock3', registerName: 'Carlos Andrade (Mock)', email: 'carlos.mock@surf.com', active: false, gender: 'Masculino' },
    { id: 'mock4', registerName: 'Mariana Costa (Mock)', email: 'mariana.mock@surf.com', active: false, gender: 'Feminino' },
    { id: 'mock5', registerName: 'Julio Paz (Mock)', email: 'julio.mock@surf.com', active: false, gender: 'Masculino' },
    { id: 'mock6', registerName: 'Tainá Silva (Mock)', email: 'taina.mock@surf.com', active: false, gender: 'Feminino' }
];

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Sempre fazer uma nova consulta ao backend quando a página é carregada
    localStorage.removeItem('cachedInactiveStudents');
    
    // Verifica se precisamos atualizar os dados (indicado pela página de ativos)
    if (localStorage.getItem('shouldRefreshInactiveStudents') === 'true') {
        console.log("Atualizando lista de alunos inativos após desativação...");
        localStorage.removeItem('shouldRefreshInactiveStudents');
    }
    
    loadAndRenderInactiveStudents();
});

async function loadAndRenderInactiveStudents() {
    console.log("Carregando alunos inativos...");
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.warn("Token não encontrado. Usando apenas dados mockados.");
            allInactiveStudents = mockInactiveStudents;
        } else {
            // Usar o endpoint específico para alunos inativos
            const response = await fetch("https://surf-para-todes.onrender.com/api/users/alunos/inativos", {
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
                throw new Error("Falha ao buscar alunos inativos: " + response.statusText);
            }
            
            const data = await response.json();
            console.log("Alunos inativos recebidos do endpoint específico:", data.length, "registros");
            
            // Não precisamos mais filtrar, pois o endpoint já retorna apenas os alunos inativos
            const realInactiveStudents = data;
            
            // Combinar alunos mockados com alunos reais inativos
            allInactiveStudents = [...mockInactiveStudents, ...realInactiveStudents];
        }
    } catch (error) {
        console.error("Erro ao buscar alunos inativos da API:", error);
        console.warn("Usando apenas dados mockados.");
        allInactiveStudents = mockInactiveStudents;
    }
    
    filteredInactiveStudents = [...allInactiveStudents];
    renderPage();
    setupEventListeners();
}

// --- RENDERIZAÇÃO ---
function renderPage() {
    renderInactiveTable(filteredInactiveStudents);
    renderPaginationControls(filteredInactiveStudents.length);
}

function createInactiveStudentRowHTML(student) {
    let genderPath = 'men';
    let randomAvatarNumber = Math.floor(Math.random() * 70);
    
    // Determina o tipo de avatar baseado no gênero
    if (student.gender === 'Feminino' || student.gender === 'feminino' || student.gender === 'Feminino') { 
        genderPath = 'women'; 
        randomAvatarNumber = Math.floor(Math.random() * 99); 
    } else if (student.gender === 'Masculino' || student.gender === 'masculino' || student.gender === 'Masculino') { 
        genderPath = 'men'; 
        randomAvatarNumber = Math.floor(Math.random() * 99); 
    } else { 
        genderPath = Math.random() < 0.5 ? 'women' : 'men'; 
        randomAvatarNumber = Math.floor(Math.random() * 99); 
    }
    
    const avatarUrl = `https://randomuser.me/api/portraits/${genderPath}/${randomAvatarNumber}.jpg`;

    return `
        <tr data-userid="${student.id}" data-username="${student.registerName}">
            <td>
                <div class="student-info">
                    <div class="student-avatar"><img src="${avatarUrl}" alt="${student.registerName}"></div>
                    <div class="student-details"><span class="student-name">${student.registerName}</span></div>
                </div>
            </td>
            <td>${student.email || 'Não informado'}</td>
            <td><span class="status-badge inactive">Inativo</span></td>
            <td>
                <div class="student-actions">
                    <button class="action-btn view-btn" title="Visualizar"><i class="fas fa-eye"></i></button>
                    <button class="action-btn activate-btn" title="Reativar Aluno"><i class="fas fa-user-check"></i></button>
                    <button class="action-btn delete-btn" title="Excluir Permanentemente"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}

function renderInactiveTable(studentsToRender) {
    const tableBody = document.getElementById('students-list');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedStudents = studentsToRender.slice(startIndex, endIndex);
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = `${studentsToRender.length} Cadastros Inativos`;

    if (paginatedStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum aluno inativo encontrado.</td></tr>`;
        return;
    }
    paginatedStudents.forEach(student => {
        tableBody.insertAdjacentHTML('beforeend', createInactiveStudentRowHTML(student));
    });
}

function renderPaginationControls(studentsCount) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    const totalPages = Math.ceil(studentsCount / rowsPerPage);
    paginationContainer.querySelector('span').textContent = `Mostrando ${studentsCount > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0}-${Math.min(currentPage * rowsPerPage, studentsCount)} de ${studentsCount} itens`;
    const prevButton = paginationContainer.querySelector('.page-prev');
    const nextButton = paginationContainer.querySelector('.page-next');
    prevButton.disabled = (currentPage === 1);
    nextButton.disabled = (currentPage >= totalPages);
}

// --- LÓGICA DAS AÇÕES ---
function viewUser(userId) {
    const student = allInactiveStudents.find(s => s.id == userId);
    if (!student) {
        alert("Erro: Aluno não encontrado");
        return;
    }
    
    // Formata as informações do aluno para exibição
    const studentInfo = `
Nome: ${student.registerName || 'Não informado'}
${student.socialName ? 'Nome social: ' + student.socialName : ''}
Email: ${student.email || 'Não informado'}
Data de Nascimento: ${student.birthDate ? new Date(student.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
Gênero: ${student.gender || 'Não informado'}
Telefone: ${student.phone || 'Não informado'}
Status: Inativo
    `;
    
    alert(`Visualizando dados do aluno:\n\n${studentInfo}`);
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
            alert("Você precisa estar logado para excluir alunos.");
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
        
        allInactiveStudents = allInactiveStudents.filter(student => student.id != userId);
        filteredInactiveStudents = filteredInactiveStudents.filter(student => student.id != userId);
        alert("Aluno excluído com sucesso!");
        renderPage();
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno. Detalhes: " + error.message);
    }
}

async function reactivateUser(userId) {
    if (String(userId).includes('mock')) {
        alert("Este é um usuário de demonstração e não pode ser reativado.");
        return;
    }
    
    if (confirm(`Deseja realmente reativar este aluno?`)) {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Você precisa estar logado para reativar alunos.");
                return;
            }
            
            // Vamos simplificar e enviar diretamente o que precisamos mudar
            // Sem buscar primeiro para evitar erro 403 no GET
            const payload = {
                id: userId,
                active: true
            };
            
            console.log("Enviando payload simplificado para reativação:", payload);
            
            // Envia uma requisição PUT para atualizar o status do aluno para ativo
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
                throw new Error(`Erro ao reativar: ${response.status} ${response.statusText}`);
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
            
            // Notifica à página de alunos ativos que deve atualizar sua lista
            localStorage.setItem('shouldRefreshActiveStudents', 'true');
            
            // Remove o aluno da lista de inativos após a reativação
            allInactiveStudents = allInactiveStudents.filter(student => student.id != userId);
            filteredInactiveStudents = filteredInactiveStudents.filter(student => student.id != userId);
            alert("Aluno reativado com sucesso! Ele agora aparecerá na lista de alunos ativos.");
            renderPage();
        } catch (error) {
            console.error("Erro ao reativar aluno:", error);
            alert("Erro ao reativar aluno. Por favor, tente novamente. Detalhes: " + error.message);
        }
    }
}

// --- LÓGICA DO MODAL ---
function showDeleteModal(userId, userName) {
    const modal = document.getElementById('delete-modal');
    const studentNameSpan = document.getElementById('student-name-modal');
    if (!modal || !studentNameSpan) {
        // Fallback para confirmação simples se o modal não existir
        if (confirm(`Esta é uma exclusão PERMANENTE. Deseja realmente excluir o aluno ${userName}?`)) {
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
    // Lógica da Tabela (Delegação de Eventos)
    const tableBody = document.getElementById('students-list');
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (!row) return;
            const userId = row.dataset.userid;
            const userName = row.dataset.username;

            if (event.target.closest('.view-btn')) { viewUser(userId); }
            if (event.target.closest('.activate-btn')) { reactivateUser(userId); }
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

    // Lógica da Busca
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            // Filtra a lista de alunos inativos
            filteredInactiveStudents = allInactiveStudents.filter(student =>
                (student.registerName && student.registerName.toLowerCase().includes(searchTerm)) ||
                (student.email && student.email.toLowerCase().includes(searchTerm))
            );
            currentPage = 1; // Reseta para a primeira página ao fazer uma nova busca
            renderPage(); // Re-renderiza a página com os dados filtrados
        });
    }

    // Lógica da Paginação
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (event) => {
            const totalPages = Math.ceil(filteredInactiveStudents.length / rowsPerPage);
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