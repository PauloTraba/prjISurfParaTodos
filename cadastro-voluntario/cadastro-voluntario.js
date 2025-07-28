// ==================================================================
// SCRIPT PARA A PÁGINA DE CADASTRO DE VOLUNTÁRIO - VERSÃO SIMPLIFICADA
// ==================================================================

let voluntarioEmEdicao = null;

document.addEventListener("DOMContentLoaded", () => {
  // Verifica se há um voluntário para editar
  const voluntarioSalvoJSON = sessionStorage.getItem('voluntarioParaEditar');
  if (voluntarioSalvoJSON) {
    voluntarioEmEdicao = JSON.parse(voluntarioSalvoJSON);
    preencherFormularioParaEdicao(voluntarioEmEdicao);
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
  if (window.location.href.includes('cadastro-voluntario')) {
    // Ativa o menu de Voluntários e o submenu de Cadastro
    const voluntariosMenu = document.querySelector('.accordion[data-menu="voluntarios"]');
    if (voluntariosMenu) {
      voluntariosMenu.classList.add('open');
      voluntariosMenu.classList.add('active');
      
      const cadastroLink = voluntariosMenu.querySelector('.sub-menu a[href*="cadastro-voluntario"]');
      if (cadastroLink) {
        cadastroLink.parentElement.classList.add('active');
      }
    }
  }
}

// Preenche o formulário com dados do voluntário para edição
function preencherFormularioParaEdicao(voluntario) {
  document.querySelector('.content-header h3').textContent = 'Editar Voluntário';
  document.querySelector('.save-btn').innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
  
  // Preenche campos básicos
  setValue('registerName', voluntario.registerName);
  setValue('socialName', voluntario.socialName);
  if (voluntario.birthDate) {
    setValue('birthDate', voluntario.birthDate.split('T')[0]);
  }
  setValue('gender', voluntario.gender ? voluntario.gender.toLowerCase() : '');
  setValue('race', normalizeRaceForSelect(voluntario.race));
  setValue('phone', voluntario.phone ? voluntario.phone.replace('+55', '') : '');
  setValue('email', voluntario.email);
  setValue('experience', voluntario.experience || '');

  // Preenche disponibilidade e interesses (se existirem)
  if (voluntario.availability) {
    setValue('availability', voluntario.availability);
  }
  
  // Preenche habilidades (checkboxes)
  if (voluntario.skills && Array.isArray(voluntario.skills)) {
    voluntario.skills.forEach(skill => {
      const checkbox = document.querySelector(`input[name="skills"][value="${skill}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }
}

// Manipuladores de eventos do formulário
function handleFormSubmit(event) {
  event.preventDefault(); // Impede o recarregamento padrão da página
  
  const token = localStorage.getItem("authToken");
  if (!token) {
    showFeedbackMessage("Você precisa estar logado para cadastrar voluntários.", "error");
    return;
  }

  if (voluntarioEmEdicao) {
    handleUpdateVolunteer();
  } else {
    handleCreateVolunteer();
  }
}

async function handleCreateVolunteer() {
  // Coleta os dados do formulário
  const novoVoluntario = {
    userRole: "2", // Valor 2 para voluntários conforme confirmado pelo usuário
    registerName: getValue("registerName"),
    socialName: getValue("socialName"),
    birthDate: getValue("birthDate"),
    gender: normalizeGender(getValue("gender")),
    race: normalizeRace(getValue("race")),
    phone: formatPhone(getValue("phone")),
    email: getValue("email"),
    availability: getValue("disponibilidade")
  };

  // Adicionando campos extras específicos para formulário
  const comoConheceu = getValue("como-conheceu");
  const renda = getValue("renda");
  if (comoConheceu) novoVoluntario.howKnew = comoConheceu;
  if (renda) novoVoluntario.income = renda;

  // Validação básica
  if (!novoVoluntario.registerName || !novoVoluntario.email) {
    showFeedbackMessage("Por favor, preencha os campos obrigatórios (Nome completo e E-mail).", "error");
    return;
  }

  console.log("Enviando voluntário com dados:", JSON.stringify(novoVoluntario));

  try {
    // Usar a instância de API configurada
    const response = await api.post("/api/users", novoVoluntario);
    console.log("Resposta de sucesso:", response.data);
    
    showFeedbackMessage("Voluntário cadastrado com sucesso!", "success");
    document.getElementById("volunteer-form").reset(); // Limpa o formulário
  } catch (err) {
    console.error("Erro completo:", err);
    
    // Extrair mensagem de erro da resposta, se disponível
    const errorMessage = err.response?.data?.message || 
                         err.response?.statusText || 
                         err.message || 
                         "Erro desconhecido ao cadastrar voluntário";
    
    const statusCode = err.response?.status ? ` (Status: ${err.response.status})` : '';
    
    console.error("Detalhes do erro:", errorMessage, statusCode);
    showFeedbackMessage(`Erro ao cadastrar: ${errorMessage}${statusCode}`, "error");
  }
}

async function handleUpdateVolunteer() {
  // Coleta os dados atualizados
  const dadosAtualizados = {
    userRole: "2", // Valor 2 para voluntários conforme confirmado pelo usuário
    registerName: getValue("registerName"),
    socialName: getValue("socialName"),
    birthDate: getValue("birthDate"),
    gender: normalizeGender(getValue("gender")),
    race: normalizeRace(getValue("race")),
    phone: formatPhone(getValue("phone")),
    email: getValue("email"),
    availability: getValue("disponibilidade")
  };

  // Adicionando campos extras específicos para formulário
  const comoConheceu = getValue("como-conheceu");
  const renda = getValue("renda");
  if (comoConheceu) dadosAtualizados.howKnew = comoConheceu;
  if (renda) dadosAtualizados.income = renda;

  console.log("Atualizando voluntário com dados:", JSON.stringify(dadosAtualizados));

  try {
    // Usar a instância de API configurada para atualizações
    const response = await api.put(`/api/users/${voluntarioEmEdicao.id}`, dadosAtualizados);
    console.log("Resposta de atualização bem-sucedida:", response.data);

    showFeedbackMessage("Voluntário atualizado com sucesso!", "success");
    sessionStorage.removeItem('voluntarioParaEditar');
    setTimeout(() => { 
      window.location.href = '../voluntarios-ativos/voluntarios-ativos.html'; 
    }, 1500);
  } catch (err) {
    console.error("Erro completo na atualização:", err);
    
    // Extrair mensagem de erro da resposta, se disponível
    const errorMessage = err.response?.data?.message || 
                         err.response?.statusText || 
                         err.message || 
                         "Erro desconhecido ao atualizar voluntário";
    
    const statusCode = err.response?.status ? ` (Status: ${err.response.status})` : '';
    
    console.error("Detalhes do erro na atualização:", errorMessage, statusCode);
    showFeedbackMessage(`Erro ao atualizar: ${errorMessage}${statusCode}`, "error");
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

function getSelectedSkills() {
  const checkboxes = document.querySelectorAll('input[name="skills"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
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
  const volunteerForm = document.getElementById("volunteer-form");
  if (volunteerForm) {
    volunteerForm.addEventListener("submit", handleFormSubmit);
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

  // Manipulação da imagem
  const uploadBtn = document.querySelector('.upload-btn');
  const deleteBtn = document.querySelector('.delete-btn');
  const profileImg = document.querySelector('.image-upload-container img');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
          profileImg.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      profileImg.src = '/assets/placeholder.png';
      fileInput.value = '';
    });
  }
}