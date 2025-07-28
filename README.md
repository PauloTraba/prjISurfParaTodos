# Projeto Surf Para Todos (Front-End) 🏄

> **Status:** Concluído para apresentação de final de curso.

### **🌊 Sobre o Projeto**

O "Surf Para Todos" nasceu de uma necessidade real observada em uma ONG parceira, que se dedica a oferecer aulas de surf para a comunidade. O controle de alunos, voluntários e turmas era realizado de forma manual através de formulários do Google/Microsoft e planilhas, um método que frequentemente resultava na perda de dados e dificultava a gestão e a geração de relatórios.

Esta aplicação foi criada para solucionar esse problema, oferecendo um sistema de gerenciamento centralizado e intuitivo. O objetivo final, após a conclusão do projeto, é disponibilizar o sistema de forma gratuita para a ONG, com a visão de, no futuro, adaptá-lo como uma base para outras organizações com necessidades semelhantes, alterando apenas a identidade visual.

O projeto não está 100% finalizado, faltando a implementação de recursos como b

### **🔗 Links Importantes**

* **Repositório do Back-End (API):** [https://github.com/lubcarv/surfparatodosap-](https://github.com/lubcarv/surfparatodosap-)
* **API Online (Render):** [https://surf-para-todes.onrender.com](https://surf-para-todes.onrender.com)
* **Documentação da API (Swagger):** [https://surf-para-todes.onrender.com/swagger-ui/index.html](https://surf-para-todes.onrender.com/swagger-ui/index.html)

---

### **✨ Funcionalidades Implementadas**

#### **Autenticação e Segurança**
* **Login de Usuário:** Sistema de login funcional que se comunica com a API, obtém um `token JWT` e o armazena para autenticar requisições futuras.
* **Proteção de Rotas:** As páginas do painel administrativo são protegidas; usuários não logados são redirecionados para a tela de login.
* **Logout:** Funcionalidade para desconectar o usuário e limpar o token de autenticação.

#### **Painel Administrativo (Dashboard)**
* **Tela Principal:** Apresenta um resumo visual com cards e gráficos.
    * **Cards de Resumo:** O card "Cadastros Ativos" é alimentado em tempo real pela API. Os demais cards são visuais, com dados estáticos para demonstração.
    * **Gráfico de Frequência:** O gráfico é um componente visual com dados estáticos para demonstrar o conceito da funcionalidade de relatórios.

#### **Gestão de Alunos (CRUD)**
* ✅ **Criação (Create):** Formulário completo para cadastro de novos alunos, com envio dos dados para a API (`POST /api/users`).
* ✅ **Leitura (Read):** Listagem e paginação de alunos ativos e inativos com dados buscados em tempo real da API, incluindo busca por nome/email.
* 🔄 **Atualização (Update):** Fluxo de edição simulado. Ao clicar em editar, o sistema redireciona para o formulário preenchido com os dados disponíveis e realiza uma chamada real à API (`PUT /api/users/{id}`). *A funcionalidade completa aguarda a implementação do endpoint `GET /api/users/{id}` no back-end.*
* ✅ **Exclusão (Delete):** Exclusão permanente de usuários com modal de confirmação personalizado. Ação funcional que chama a API (`DELETE /api/users/{id}`) e requer permissão de `ADMIN`.

#### **Gestão de Voluntários (CRUD Parcial)**
* ✅ **Criação (Create):** Formulário funcional para cadastro de novos voluntários.
* *(As telas de listagem e edição de voluntários seguem o mesmo padrão e podem ser implementadas a seguir).*

---

### **🗺️ Próximos Passos e Melhorias Futuras**

O projeto foi entregue com as funcionalidades essenciais para a apresentação, mas possui um roteiro claro para futuras implementações que o tornariam um sistema completo para gestão de ONGs.

#### **Gestão de Usuários (Melhorias no CRUD)**
* **Edição Completa (Update):** Implementar o fluxo de edição de forma completa, o que depende da criação do endpoint `GET /api/users/{id}` no back-end para buscar os dados completos de um usuário antes de preencher o formulário.
* **Funcionalidade de Desativar/Reativar:** Conectar os botões de "Desativar" e "Reativar" a um endpoint (`PUT` ou `PATCH`) no back-end para alterar o status `active` de um usuário, em vez de apenas excluí-lo. Isso também depende do endpoint `GET /api/users/{id}`.
* **Upload de Imagem de Perfil:** Implementar a funcionalidade de upload de arquivos no front-end e criar um endpoint correspondente no back-end para armazenar e servir as fotos de perfil dos usuários.

#### **Gestão de Turmas e Horários (Funcionalidades Novas)**
* **CRUD de Turmas:** Criar uma nova seção no painel para o gerenciamento completo de turmas (`/api/classrooms`), permitindo criar, visualizar, editar e excluir turmas.
* **CRUD de Horários:** Criar uma interface para gerenciar os horários das aulas (`/api/schedules`).
* **Associações:** Implementar a interface para associar voluntários (professores) e alunos a turmas específicas, e associar turmas a horários, utilizando os endpoints de junção já existentes na API.

#### **Relatórios Dinâmicos**
* **Gráficos com Dados Reais:** Conectar o gráfico da dashboard a novos endpoints de relatórios (a serem criados no back-end) para exibir dados dinâmicos e agregados (ex: número de alunos por mês, frequência, etc.).
* **Página de Relatórios:** Desenvolver a página de relatórios com filtros avançados (por data, por turma, por voluntário) e a funcionalidade de exportação de dados (CSV, PDF).

#### **Melhorias Gerais de Experiência do Usuário (UX)**
* **Modal de Visualização:** Substituir o `alert()` do botão "Visualizar" por um modal rico e bem formatado, exibindo todos os detalhes de um aluno ou voluntário.
* **Filtros Avançados:** Implementar a funcionalidade do botão "Filtros" nas telas de listagem, com suporte do back-end para buscas mais complexas.

---

### **🚀 Tecnologias Utilizadas**

#### **Front-End**
* HTML5
* CSS3 (com Variáveis CSS)
* JavaScript (ES6+) (Vanilla JS)
* **Axios:** Para realizar as requisições HTTP à API.
* **Chart.js:** Para a renderização dos gráficos na dashboard.
* **Font Awesome:** Para a biblioteca de ícones.

#### **Back-End**
* Java & Spring Boot Framework
* PostgreSQL (Banco de Dados)
* Spring Security & JWT
* Render (Plataforma de deploy da API)
* Swagger (Open API)

---

### **⚙️ Como Executar e Testar a Aplicação**

#### **Opção 1: Executando a Interface do Usuário (Recomendado)**

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/PauloTraba/prjISurfParaTodos.git](https://github.com/PauloTraba/prjISurfParaTodos.git)
    ```
2.  **Abra a pasta** em um editor de código como o VS Code.
3.  **Use a extensão "Live Server"** (ou um servidor local similar) para abrir o arquivo `index.html`. Isso é importante para que as requisições à API funcionem corretamente.
4.  Na tela de login, utilize as seguintes credenciais de teste para acessar o painel:
    * **Email:** `teste@teste.com`
    * **Senha:** `123456`
5.  Pronto! O sistema de login do front-end fará a chamada à API e cuidará da autenticação automaticamente.

#### **Opção 2: Interagindo Diretamente com a API (Para Desenvolvedores)**

Se você deseja testar os endpoints do back-end diretamente através da documentação interativa, siga estes passos:

1.  Acesse a documentação da API: **[Swagger UI](https://surf-para-todes.onrender.com/swagger-ui/index.html#/)**.
2.  Vá até a seção **`authentication-controller`** e expanda o endpoint **`POST /auth/login`**.
3.  Clique em **"Try it out"**.
4.  No corpo da requisição (Request body), edite o JSON de exemplo, substituindo "string" pelas credenciais:
    ```json
    {
      "email": "teste@teste.com",
      "password": "123456"
    }
    ```
5.  Clique em **"Execute"**. A API retornará um `token` de autenticação no corpo da resposta (Response body). Copie este token.
6.  No topo da página, clique no botão verde **"Authorize"**.
7.  Na janela que se abrir, cole o `token` que você copiou no campo "Value" (não se esqueça de incluir a palavra `Bearer` antes do token, ex: `Bearer seu_token_aqui`).
8.  Clique em **"Authorize"** e depois em "Close". Agora você está autenticado no Swagger e pode testar os endpoints protegidos.

---

### **🤝 Contribuidores**

* [Paulo Traba](https://github.com/PauloTraba) - Front-End
* [Luíza Bau](https://github.com/lubcarv) - Back-End
* [Andressa Ataídes](https://github.com/Dessa28882847) - Prototipação e design Figma
* [Well Sousa](https://github.com/wellonlywell) - Prototipação e design Figma
