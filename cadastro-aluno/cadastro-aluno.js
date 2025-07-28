// ==================================================================
// SCRIPT CORRIGIDO PARA A PÁGINA DE CADASTRO/EDIÇÃO DE ALUNO
// ==================================================================

let alunoEmEdicao = null;

document.addEventListener("DOMContentLoaded", () => {
  // Verifica se há um aluno para editar
  const alunoSalvoJSON = sessionStorage.getItem('alunoParaEditar');
  if (alunoSalvoJSON) {
    alunoEmEdicao = JSON.parse(alunoSalvoJSON);
    preencherFormularioParaEdicao(alunoEmEdicao);
  }

  // Inicializa a sidebar e configura o formulário
  setupSidebar();
  setupEventListeners();
});

// Configuração da Sidebar
function setupSidebar() {
  // Seleciona todos os itens do menu com sub-menus (accordion)
  const accordionItems = document.querySelectorAll('.accordion');

  // Adiciona o evento de clique para expandir/retrair submenus
  accordionItems.forEach(item => {
    const link = item.querySelector('a');
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Previne navegação padrão

      // Determina qual menu deve ser marcado como aberto/ativo
      if (item.classList.contains('open')) {
        item.classList.remove('open');
        item.classList.remove('active');
      } else {
        // Fecha todos os outros menus antes de abrir o atual
        accordionItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            otherItem.classList.remove('active');
          }
        });
        
        item.classList.add('open');
        item.classList.add('active');
      }
    });
  });

  // Marca o menu correto como ativo com base na página atual
  if (window.location.href.includes('cadastro-aluno')) {
    // Ativa o menu de Alunos e o submenu de Cadastro
    const alunosMenu = document.querySelector('.accordion[data-menu="alunos"]');
    if (alunosMenu) {
      alunosMenu.classList.add('open');
      alunosMenu.classList.add('active');
      
      const cadastroLink = alunosMenu.querySelector('.sub-menu a[href*="cadastro-aluno"]');
      if (cadastroLink) {
        cadastroLink.parentElement.classList.add('active');
      }
    }
  }
}

function preencherFormularioParaEdicao(aluno) {
  document.querySelector('.content-header h3').textContent = 'Editar Aluno';
  document.querySelector('.save-btn').innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
  setValue('registerName', aluno.registerName);
  setValue('socialName', aluno.socialName);
  if (aluno.birthDate) { 
    setValue('birthDate', aluno.birthDate.split('T')[0]); 
  }
  setValue('gender', aluno.gender ? aluno.gender.toLowerCase() : '');
  setValue('race', normalizeRaceForSelect(aluno.race));
  setValue('schooling', getSchoolingForSelect(aluno.schooling));
  setValue('guardianName', aluno.guardianName);
  setValue('guardianRelationship', aluno.guardianRelationship);
  setValue('guardianPhone', aluno.guardianPhone ? aluno.guardianPhone.replace('+55', '') : '');
  setValue('phone', aluno.phone ? aluno.phone.replace('+55', '') : '');
  setValue('email', aluno.email);
}

// Manipuladores de eventos do formulário
function handleFormSubmit(event) {
  event.preventDefault(); // Impede o recarregamento padrão da página
  
  const token = localStorage.getItem("authToken");
  if (!token) {
    showFeedbackMessage("Você precisa estar logado para cadastrar alunos.", "error");
    return;
  }

  if (alunoEmEdicao) {
    handleUpdateStudent();
  } else {
    handleCreateStudent();
  }
}

async function handleCreateStudent() {
  const novoAluno = {
    userRole: "1", // Usando "1" como no arquivo funcional
    registerName: getValue("registerName"),
    socialName: getValue("socialName"),
    birthDate: getValue("birthDate"),
    guardianName: getValue("guardianName"),
    guardianRelationship: getValue("guardianRelationship"),
    guardianPhone: formatPhone(getValue("guardianPhone")),
    gender: normalizeGender(getValue("gender")),
    race: normalizeRace(getValue("race")),
    phone: formatPhone(getValue("phone")),
    email: getValue("email"),
    schooling: getSchoolingEnum(getValue("schooling"))
  };

  if (!novoAluno.registerName || !novoAluno.birthDate) {
    showFeedbackMessage("Por favor, preencha os campos obrigatórios (Nome completo e Data de nascimento).", "error");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("https://surf-para-todes.onrender.com/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(novoAluno)
    });

    let data = null;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.warn("Resposta sem JSON válido.");
    }

    if (!response.ok) {
      const errorMessage = data?.message || response.statusText || "Erro ao cadastrar aluno.";
      console.error("Erro ao cadastrar:", data);
      showFeedbackMessage("Erro ao cadastrar: " + errorMessage, "error");
      return;
    }

    showFeedbackMessage("Aluno cadastrado com sucesso!", "success");
    document.getElementById("student-form").reset(); // Limpa o formulário
  } catch (err) {
    console.error("Erro de rede:", err);
    showFeedbackMessage("Erro ao cadastrar aluno.", "error");
  }
}

async function handleUpdateStudent() {
  const dadosAtualizados = {
    userRole: "1", // Mantendo consistente com o cadastro
    registerName: getValue("registerName"),
    socialName: getValue("socialName"),
    birthDate: getValue("birthDate"),
    guardianName: getValue("guardianName"),
    guardianRelationship: getValue("guardianRelationship"),
    guardianPhone: formatPhone(getValue("guardianPhone")),
    gender: normalizeGender(getValue("gender")),
    race: normalizeRace(getValue("race")),
    phone: formatPhone(getValue("phone")),
    email: getValue("email"),
    schooling: getSchoolingEnum(getValue("schooling"))
  };

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`https://surf-para-todes.onrender.com/api/users/${alunoEmEdicao.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dadosAtualizados)
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {}
      
      const errorMessage = errorData?.message || response.statusText || "Erro ao atualizar aluno.";
      showFeedbackMessage(errorMessage, "error");
      return;
    }

    showFeedbackMessage("Aluno atualizado com sucesso!", "success");
    sessionStorage.removeItem('alunoParaEditar');
    setTimeout(() => { 
      window.location.href = '../alunos-ativos/alunos-ativos.html'; 
    }, 1500);
  } catch (err) {
    console.error("Erro de rede:", err);
    showFeedbackMessage("Erro ao atualizar aluno.", "error");
  }
}

// Funções auxiliares
function getValue(id) {
  return document.getElementById(id)?.value?.trim() || null;
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && value) {
    element.value = value;
  }
}

function formatPhone(phone) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `+55${digits}` : null;
}

function normalizeGender(gender) {
  const g = gender?.toLowerCase();
  if (g === "masculino") return "Masculino";
  if (g === "feminino") return "Feminino";
  if (g === "outro") return "Outro";
  return null;
}

function normalizeRace(race) {
  const r = race?.toLowerCase();
  if (r === "branca") return "Branco";
  if (r === "preta") return "Negro";
  if (r === "parda") return "Pardo";
  if (r === "amarela") return "Outro";
  if (r === "indigena") return "Indígena";
  return "Outro";
}

function normalizeRaceForSelect(race) {
  if (!race) return "";
  const mapping = {
    "Branco": "branca",
    "Negro": "preta",
    "Pardo": "parda",
    "Indígena": "indigena",
    "Outro": "outro"
  };
  
  for (const [key, value] of Object.entries(mapping)) {
    if (race === key) return value;
  }
  return "";
}

function getSchoolingEnum(value) {
  const map = {
    "INFANTIL": "FUNDAMENTAL_INCOMPLETO",
    "FUNDAMENTAL": "FUNDAMENTAL_CONCLUIDO",
    "MEDIO": "MEDIO_CONCLUIDO",
    "SUPERIOR": "SUPERIOR_CONCLUIDO",
    "NAO_SE_APLICA": "FUNDAMENTAL_INCOMPLETO"
  };
  return map[value] || null;
}

function getSchoolingForSelect(value) {
  const map = {
    "FUNDAMENTAL_INCOMPLETO": "INFANTIL",
    "FUNDAMENTAL_CONCLUIDO": "FUNDAMENTAL",
    "MEDIO_CONCLUIDO": "MEDIO",
    "SUPERIOR_CONCLUIDO": "SUPERIOR"
  };
  return map[value] || "";
}

function showFeedbackMessage(message, type = "success") {
  const msg = document.createElement("div");
  msg.className = `feedback-message ${type}`;
  msg.textContent = message;
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.opacity = "0";
    msg.style.transform = "translateX(50px)";
    msg.style.transition = "all 0.4s ease";
    setTimeout(() => msg.remove(), 400);
  }, 3000);
}

function setupEventListeners() {
  // Submissão do formulário
  const studentForm = document.getElementById("student-form");
  if (studentForm) {
    studentForm.addEventListener("submit", handleFormSubmit);
  }

  // Lógica das abas
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const activeTab = document.querySelector(".tab-btn.active");
      const activeContent = document.querySelector(".tab-content.active");
      
      if (activeTab) activeTab.classList.remove("active");
      if (activeContent) activeContent.classList.remove("active");
      
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}