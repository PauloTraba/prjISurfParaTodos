// ==================================================================
// SCRIPT SIMPLIFICADO PARA A PÁGINA DE ALUNOS ATIVOS - VERSÃO DE DIAGNÓSTICO
// ==================================================================

// --- ESTADO DA PÁGINA ---
let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
const rowsPerPage = 10;

const mockStudents = [
    { id: 'mock1', registerName: 'Sabrina Castro (Mock)', email: 'sabrina.mock@surf.com', active: true, gender: 'Feminino' },
    { id: 'mock2', registerName: 'Renato Sardão (Mock)', email: 'renato.mock@surf.com', active: true, gender: 'Masculino' }
];

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Sempre fazer uma nova consulta ao backend quando a página é carregada
    localStorage.removeItem('cachedActiveStudents');
    
    // Verifica se precisamos atualizar os dados (indicado pela página de inativos)
    if (localStorage.getItem('shouldRefreshActiveStudents') === 'true') {
        console.log("Atualizando lista de alunos ativos após reativação...");
        localStorage.removeItem('shouldRefreshActiveStudents');
    }
    
    loadAndRenderStudents();
});


async function loadAndRenderStudents() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.warn("Token não encontrado. Usando apenas dados mockados.");
            allStudents = mockStudents;
        } else {
            // Usar o endpoint específico para alunos ativos, se existir
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
                throw new Error("Falha ao buscar alunos: " + response.statusText);
            }
            
            const data = await response.json();
            // Filtra apenas alunos ativos (userRole = 1 para alunos)
            const realActiveStudents = data.filter(user => 
                (user.userRole === "1" || user.userRole === 1) && 
                user.active !== false
            );
            console.log("Alunos carregados da API:", realActiveStudents.length);
            
            // Combinar alunos mockados com alunos reais
            allStudents = [...mockStudents, ...realActiveStudents];
        }
    } catch (error) {
        console.error("Erro ao buscar alunos da API:", error);
        console.warn("Usando apenas dados mockados.");
        allStudents = mockStudents;
    }
    
    filteredStudents = [...allStudents];
    renderPage();
    setupEventListeners();
}

// --- RENDERIZAÇÃO (DESENHAR NA TELA) ---
function renderPage() {
    renderTable();
    renderPaginationControls();
}

function createStudentRowHTML(student) {
    let genderPath = 'lego'; 
    let randomAvatarNumber = Math.floor(Math.random() * 10);
    
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
    const statusClass = (student.active === false) ? 'inactive' : 'active';
    const statusText = (student.active === false) ? 'Inativo' : 'Ativo';

    return `
        <tr data-userid="${student.id}" data-username="${student.registerName}">
            <td>
                <div class="student-info">
                    <div class="student-avatar"><img src="${avatarUrl}" alt="${student.registerName}"></div>
                    <div class="student-details"><span class="student-name">${student.registerName}</span></div>
                </div>
            </td>
            <td>${student.email || 'Não informado'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="student-actions">
                    <button class="action-btn view-btn" title="Visualizar"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn deactivate-btn" title="Desativar"><i class="fas fa-user-slash"></i></button>
                    <button class="action-btn delete-btn" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}

function renderTable(studentsToRender = filteredStudents) {
    const tableBody = document.getElementById('students-list');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedStudents = studentsToRender.slice(startIndex, endIndex);
    const badge = document.querySelector('.badge');
    if (badge) badge.textContent = `${studentsToRender.length} Cadastros Ativos`;
    if (paginatedStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum aluno encontrado.</td></tr>`;
        return;
    }
    paginatedStudents.forEach(student => {
        tableBody.insertAdjacentHTML('beforeend', createStudentRowHTML(student));
    });
}

function renderPaginationControls(studentsCount = filteredStudents.length) {
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
    const student = allStudents.find(s => s.id == userId);
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
Status: ${student.active === false ? 'Inativo' : 'Ativo'}
    `;
    
    alert(`Visualizando dados do aluno:\n\n${studentInfo}`);
}

function editUser(userId) {
    const studentToEdit = allStudents.find(s => s.id == userId);
    if (studentToEdit) {
        sessionStorage.setItem('alunoParaEditar', JSON.stringify(studentToEdit));
        window.location.href = `../cadastro-aluno/cadastro-aluno.html`;
    }
}

async function deactivateUser(userId) {
    if (String(userId).includes('mock')) {
        alert("Este é um usuário de demonstração e não pode ser desativado.");
        return;
    }
    
    if (confirm(`Deseja realmente desativar este aluno?`)) {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                alert("Você precisa estar logado para desativar alunos.");
                return;
            }
            
            // Vamos simplificar e enviar diretamente o que precisamos mudar
            // Sem buscar primeiro para evitar erro 403 no GET
            const payload = {
                id: userId,
                active: false
            };
            
            console.log("Enviando payload simplificado para desativação:", payload);
            
            // Atualiza o aluno com o campo active = false
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
                throw new Error(`Erro ao desativar: ${response.status} ${response.statusText}`);
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
            
            // Atualiza a lista de alunos removendo o desativado
            allStudents = allStudents.filter(student => student.id != userId);
            filteredStudents = filteredStudents.filter(student => student.id != userId);
            
            // Notifica aos usuários que devem atualizar as listas de inativos
            localStorage.setItem('shouldRefreshInactiveStudents', 'true');
            
            alert("Aluno desativado com sucesso! Ele agora aparecerá na lista de alunos inativos.");
            renderPage();
        } catch (error) {
            console.error("Erro ao desativar aluno:", error);
            alert("Erro ao desativar aluno. Por favor, tente novamente. Detalhes: " + error.message);
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
        
        allStudents = allStudents.filter(student => student.id != userId);
        filteredStudents = filteredStudents.filter(student => student.id != userId);
        alert("Aluno excluído com sucesso!");
        renderPage();
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        alert("Erro ao excluir aluno. Detalhes: " + error.message);
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
    const tableBody = document.getElementById('students-list');
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (!row) return;
            const userId = row.dataset.userid;
            const userName = row.dataset.username;

            if (event.target.closest('.view-btn')) { viewUser(userId); }
            if (event.target.closest('.edit-btn')) { editUser(userId); }
            if (event.target.closest('.deactivate-btn')) { deactivateUser(userId); }
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
            filteredStudents = allStudents.filter(student =>
                (student.registerName && student.registerName.toLowerCase().includes(searchTerm)) ||
                (student.email && student.email.toLowerCase().includes(searchTerm))
            );
            currentPage = 1;
            renderPage();
        });
    }

    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (event) => {
            const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
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