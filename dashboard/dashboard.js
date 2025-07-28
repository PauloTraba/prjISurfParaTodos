// "Auth Guard" - A primeira coisa que o script faz é verificar se o usuário está logado.
(function authGuard() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Acesso não autorizado. Por favor, faça o login.");
        window.location.href = '../login/';
    }
})();

// O resto do código só é executado depois que o HTML da página foi carregado.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Surf Para Todos - Dashboard loaded!");

    // ==================================================================
    // 1. LÓGICA DO GRÁFICO 
    // ==================================================================
    const ctx = document.getElementById("attendanceChart").getContext("2d");
    const labels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"];
    // Dados iniciais
    const initialStudentData = [30, 25, 35, 30, 22, 25];
    const initialVolunteerData = [18, 15, 20, 18, 12, 15];
    const studentGradient = ctx.createLinearGradient(0, 0, 0, 200);
    studentGradient.addColorStop(0, "rgba(16, 185, 129, 0.5)");
    studentGradient.addColorStop(1, "rgba(16, 185, 129, 0)");
    const volunteerGradient = ctx.createLinearGradient(0, 0, 0, 200);
    volunteerGradient.addColorStop(0, "rgba(99, 102, 241, 0.5)");
    volunteerGradient.addColorStop(1, "rgba(99, 102, 241, 0)");

    const attendanceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Alunos", data: initialStudentData, borderColor: "#10b981", backgroundColor: studentGradient, tension: 0.4, pointBackgroundColor: "#ffffff", pointBorderColor: "#10b981", pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, fill: true },
                { label: "Voluntários", data: initialVolunteerData, borderColor: "#6366f1", backgroundColor: volunteerGradient, tension: 0.4, pointBackgroundColor: "#ffffff", pointBorderColor: "#6366f1", pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, fill: true }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false, backgroundColor: "#ffffff", titleColor: "#333333", bodyColor: "#666666", borderColor: "#e0e0e0", borderWidth: 1, padding: 10, displayColors: true } },
            scales: { x: { display: false, grid: { display: false } }, y: { display: false, min: 0, grid: { display: false } } },
            elements: { line: { borderWidth: 2 } }
        }
    });
    
    // **CÓDIGO RESTAURADO: Funcionalidade dos botões do relatório**
    const reportNavBtns = document.querySelectorAll(".report-nav-btn");
    reportNavBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            reportNavBtns.forEach((b) => b.classList.remove("active"));
            this.classList.add("active");
            
            // Simula a troca de dados do gráfico
            const reportType = this.textContent.toLowerCase();
            switch (reportType) {
                case "idade": updateChartData([25, 28, 22, 26, 30, 28], [15, 18, 14, 13, 16, 17]); break;
                case "renda": updateChartData([20, 25, 35, 30, 20, 25], [12, 15, 22, 18, 14, 16]); break;
                case "atividades": updateChartData([35, 30, 25, 28, 32, 30], [20, 18, 15, 17, 19, 18]); break;
                case "engajamento": updateChartData([15, 25, 35, 30, 25, 20], [10, 15, 20, 18, 15, 12]); break;
                default: updateChartData(initialStudentData, initialVolunteerData); break;
            }
        });
    });
    
    // Função para atualizar os dados do gráfico
    function updateChartData(newStudentData, newVolunteerData) {
        attendanceChart.data.datasets[0].data = newStudentData;
        attendanceChart.data.datasets[1].data = newVolunteerData;
        attendanceChart.update();
    }


    // ==================================================================
    // 2. LÓGICA DO MENU E LOGOUT
    // ==================================================================
    const accordionItems = document.querySelectorAll(".accordion");
    accordionItems.forEach(item => {
        item.querySelector(".accordion-toggle").addEventListener("click", (e) => {
            e.preventDefault();
            item.classList.toggle("open");
        });
    });

    const logoutLink = document.querySelector('.logout a');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('authToken');
            alert("Você foi desconectado.");
            window.location.href = '../login/';
        });
    }

    // ==================================================================
    // 3. CARREGAMENTO DE DADOS (COM LÓGICA DE MOCK)
    // ==================================================================
    const mockUsers = [
        { id: 1, registerName: 'Ana Silva (Mock)', email: 'ana.mock@email.com', active: true },
        { id: 2, registerName: 'Bruno Souza (Mock)', email: 'bruno.mock@email.com', active: true },
        { id: 3, registerName: 'Carla Dias (Mock)', email: 'carla.mock@email.com', active: false }
    ];

    async function loadDashboardData() {
        try {
            const response = await api.get('/api/users');
            let users = response.data && response.data.length > 0 ? response.data : mockUsers;
            populateSummaryCards(users);
            populateRecentStudentsTable(users);
        } catch (error) {
            console.error('Erro ao carregar dados da API. Usando dados mockados.', error);
            populateSummaryCards(mockUsers);
            populateRecentStudentsTable(mockUsers);
        }
    }

    function populateSummaryCards(users) {
        const activeUsersCount = users.filter(user => user.active).length;
        const activeStatValue = document.querySelector('.stat-card .stat-value');
        if(activeStatValue) {
            activeStatValue.textContent = activeUsersCount;
        }
    }

    function populateRecentStudentsTable(users) {
    const tableBody = document.querySelector('.recent-students-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const recentUsers = users.slice(0, 5); // Pega os 5 primeiros para exibir

    recentUsers.forEach(user => {
        const statusClass = user.active ? 'active' : 'inactive';
        const statusText = user.active ? 'Ativo' : 'Inativo';

        // --- LÓGICA DO AVATAR ADICIONADA AQUI ---
        const genderForAvatar = (Math.random() < 0.5 ? 'women' : 'men');
        const randomAvatarNumber = Math.floor(Math.random() * 70) + 1;
        const avatarUrl = `https://randomuser.me/api/portraits/${genderForAvatar}/${randomAvatarNumber}.jpg`;
        // --- FIM DA LÓGICA DO AVATAR ---

        const rowHTML = `
            <tr data-userid="${user.id}">
                <td class="student-info">
                    <img src="${avatarUrl}" alt="${user.registerName || 'Usuário'}">
                    <div class="student-name">${user.registerName || 'Nome não disponível'}</div>
                </td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions">
                    <button class="action-btn edit-btn" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Excluir"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

    // ==================================================================
    // 4. DELEGAÇÃO DE EVENTOS PARA A TABELA
    // ==================================================================
    const studentsTable = document.querySelector('.recent-students-table');
    if(studentsTable) {
        studentsTable.addEventListener('click', function(event) {
            const editButton = event.target.closest('.edit-btn');
            if (editButton) {
                const userId = editButton.closest('tr').dataset.userid;
                alert(`Ação: Editar usuário com ID: ${userId}.`);
                // Futuramente: window.location.href = `cadastro_aluno.html?id=${userId}`;
            }

            const deleteButton = event.target.closest('.delete-btn');
            if (deleteButton) {
                const userId = deleteButton.closest('tr').dataset.userid;
                if (confirm(`Tem certeza que deseja excluir o usuário com ID: ${userId}?`)) {
                    alert(`Ação: Excluir usuário com ID: ${userId}.`);
                    // Futuramente: deleteUser(userId);
                }
            }
        });
    }
    
    // Inicia o carregamento dos dados
    loadDashboardData();
});