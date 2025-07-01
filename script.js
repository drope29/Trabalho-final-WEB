/**
 * AutoGest - Sistema de Gestão para Oficinas
 * Versão Refatorada
 */
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // 1. ESTADO DA APLICAÇÃO (STATE)
    // ==========================================================
    const state = {
        apiKey: 'naZsZjgceZ9FICJmgvnKvw==Mps3mLYy6NGvP64I', // <-- SUBSTITUA PELA SUA CHAVE REAL DA API-NINJAS
        clientes: [
            { id: 1, nome: "João Silva", telefone: "(11) 9999-8888", email: "joao@email.com" },
            { id: 2, nome: "Maria Santos", telefone: "(11) 9777-6666", email: "maria@email.com" },
            { id: 3, nome: "Carlos Oliveira", telefone: "(11) 9555-4444", email: "carlos@email.com" }
        ],
        veiculos: [
            { placa: "ABC1D23", modelo: "Fiat Uno", ano: 2018, clienteId: 1 },
            { placa: "XYZ4E56", modelo: "Volkswagen Gol", ano: 2020, clienteId: 2 },
            { placa: "DEF7G89", modelo: "Ford Ka", ano: 2019, clienteId: 3 }
        ],
        ordens: [
            { numero: 1001, veiculoPlaca: "ABC1D23", data: "15/03/2025", status: "Concluído", valor: 850.00, servicos: ["Troca de óleo", "Revisão geral"], pecas: ["Óleo motor", "Filtro de óleo"] },
            { numero: 1002, veiculoPlaca: "XYZ4E56", data: "20/03/2025", status: "Em andamento", valor: 1200.00, servicos: ["Reparo motor", "Troca de freios"], pecas: ["Pastilhas de freio", "Líquido de freio"] }
        ],
        dataTables: {
            clientes: null,
            veiculos: null,
            ordens: null
        }
    };

    // ==========================================================
    // 2. SELETORES DE ELEMENTOS DO DOM
    // ==========================================================
    const dom = {
        body: document.body,
        darkModeToggle: document.getElementById('darkModeToggle'),
        logoButton: document.getElementById('logoButton'),
        navLinks: document.querySelectorAll('.nav-link'),
        sections: document.querySelectorAll('main > section'),
        loginForm: document.getElementById('loginForm'),
        passwordInput: document.getElementById('password'),
        // Modal
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        closeModalBtn: document.querySelector('.close-modal'),
        // Seção Carros API
        carroSearchInput: document.getElementById('carroSearch'),
        carrosContainer: document.getElementById('carros-container'),
        // Seção Clima API
        weatherInfo: document.getElementById('weatherInfo'),
        weatherCardIcon: document.querySelector('#weatherCard i'),
    };

    // ==========================================================
    // 3. RENDERIZAÇÃO DA UI (Interface do Usuário)
    // ==========================================================

    /**
     * Alterna a visibilidade das seções principais
     * @param {string} sectionId - O ID da seção a ser mostrada
     */
    function showSection(sectionId) {
        dom.sections.forEach(section => section.classList.remove('active-section'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active-section');
        }

        dom.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });

        // Carrega os dados da tabela correspondente, se houver
        if (['clientes', 'veiculos', 'ordens'].includes(sectionId)) {
            renderTable(sectionId);
        }
        window.scrollTo(0, 0);
    }

    /**
     * Renderiza ou atualiza uma tabela com dados
     * @param {string} type - O tipo de dados ('clientes', 'veiculos', 'ordens')
     */
    function renderTable(type) {
        const tableBody = document.getElementById(`${type}Body`);
        if (!tableBody) return;
        
        // Mapeia os dados para linhas da tabela (HTML)
        const dataMapper = {
            clientes: item => `
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td>${item.telefone}</td>
                <td>${item.email}</td>`,
            veiculos: item => {
                const proprietario = state.clientes.find(c => c.id === item.clienteId);
                return `
                    <td>${item.placa}</td>
                    <td>${item.modelo}</td>
                    <td>${item.ano}</td>
                    <td>${proprietario ? proprietario.nome : 'Não encontrado'}</td>`;
            },
            ordens: item => {
                const veiculo = state.veiculos.find(v => v.placa === item.veiculoPlaca);
                const cliente = veiculo ? state.clientes.find(c => c.id === veiculo.clienteId) : null;
                return `
                    <td>${item.numero}</td>
                    <td>${veiculo ? `${veiculo.modelo} (${item.veiculoPlaca})` : 'Não encontrado'}</td>
                    <td>${cliente ? cliente.nome : 'Não encontrado'}</td>
                    <td>${item.data}</td>
                    <td><span class="status ${item.status.toLowerCase().replace(/\s/g, '-')}">${item.status}</span></td>
                    <td>${item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>`;
            }
        };
        
        // Gera o HTML para o corpo da tabela
        tableBody.innerHTML = state[type].map(item => `
            <tr data-id="${item.id || item.placa || item.numero}">
                ${dataMapper[type](item)}
                <td>
                    ${type === 'ordens' ? `<button class="btn-action detalhes" data-action="details" data-type="${type}"><i class="fas fa-info-circle"></i></button>` : ''}
                    <button class="btn-action editar" data-action="edit" data-type="${type}"><i class="fas fa-edit"></i></button>
                    ${type !== 'ordens' ? `<button class="btn-action excluir" data-action="delete" data-type="${type}"><i class="fas fa-trash"></i></button>` : ''}
                </td>
            </tr>
        `).join('');

        // Inicializa ou atualiza a DataTable
        if (state.dataTables[type]) {
            state.dataTables[type].destroy();
        }
        state.dataTables[type] = $(`#${type}Table`).DataTable({
            language: { url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json' },
            destroy: true
        });
    }

    /**
     * Abre o modal com um título, formulário e define a função a ser chamada ao submeter
     * @param {string} title - Título do modal
     * @param {string} formHtml - O HTML do formulário a ser inserido
     * @param {function} onSubmitCallback - Função a ser executada no submit
     */
    function openModal(title, formHtml, onSubmitCallback) {
        dom.modalTitle.textContent = title;
        dom.modalBody.innerHTML = formHtml;
        dom.modal.style.display = 'block';

        const modalForm = dom.modalBody.querySelector('#modalForm');
        if (modalForm) {
            modalForm.onsubmit = (e) => {
                e.preventDefault();
                onSubmitCallback(new FormData(modalForm));
                closeModal();
            };
        }
    }

    function closeModal() {
        dom.modal.style.display = 'none';
        dom.modalBody.innerHTML = '';
    }

    // ==========================================================
    // 4. HANDLERS DE EVENTOS PRINCIPAIS
    // ==========================================================
    
    function handleMainClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const { action, type } = target.dataset;
        const id = target.closest('tr')?.dataset.id;

        const actionHandlers = {
            add: () => crud.add(type),
            edit: () => crud.edit(type, id),
            delete: () => crud.remove(type, id),
            details: () => crud.details(type, id),
            searchCar: () => fetchCarData(),
            logout: handleLogout,
            togglePassword: handleTogglePassword
        };
        
        if (actionHandlers[action]) {
            actionHandlers[action]();
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        showSection('dashboard');
    }

    function handleLogout() {
        if (confirm("Deseja sair do sistema e voltar para a tela de login?")) {
            showSection('login');
            dom.loginForm?.reset();
        }
    }
    
    function handleTogglePassword() {
        const type = dom.passwordInput.type === 'password' ? 'text' : 'password';
        dom.passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye-slash');
    }

    function toggleDarkMode() {
        dom.body.classList.toggle('dark-mode');
        const isDarkMode = dom.body.classList.contains('dark-mode');
        this.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    }

    // ==========================================================
    // 5. LÓGICA DE CRUD (Criar, Ler, Atualizar, Excluir)
    // ==========================================================

    const crud = {
        add(type) {
            const formInfo = forms[type].add();
            openModal(formInfo.title, formInfo.html, (formData) => {
                const newItem = forms[type].process(formData);
                const lastId = state[type].length > 0 ? Math.max(...state[type].map(item => item.id || item.numero)) : 0;
                newItem.id = newItem.numero = lastId + 1; // Atribui novo ID ou Número

                state[type].push(newItem);
                renderTable(type);
            });
        },
        edit(type, id) {
            const item = state[type].find(i => (i.id || i.placa || i.numero) == id);
            if (!item) return;

            const formInfo = forms[type].edit(item);
            openModal(formInfo.title, formInfo.html, (formData) => {
                const updatedData = forms[type].process(formData, item);
                Object.assign(item, updatedData); // Atualiza o objeto no estado
                renderTable(type);
            });
        },
        remove(type, id) {
            if (confirm(`Tem certeza que deseja excluir este item?`)) {
                state[type] = state[type].filter(i => (i.id || i.placa) != id);
                renderTable(type);
            }
        },
        details(type, id) {
            const os = state.ordens.find(o => o.numero == id);
            if (!os) return;

            const veiculo = state.veiculos.find(v => v.placa === os.veiculoPlaca);
            const cliente = veiculo ? state.clientes.find(c => c.id === veiculo.clienteId) : null;
            
            const detailsHtml = `
                <div class="os-details">
                    <p><strong>Veículo:</strong> ${veiculo?.modelo || 'N/A'} (${os.veiculoPlaca})</p>
                    <p><strong>Cliente:</strong> ${cliente?.nome || 'N/A'}</p>
                    <p><strong>Data:</strong> ${os.data}</p>
                    <p><strong>Status:</strong> <span class="status ${os.status.toLowerCase().replace(/\s/g, '-')}">${os.status}</span></p>
                    <p><strong>Valor:</strong> ${os.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <h3>Serviços:</h3>
                    <ul>${os.servicos.map(s => `<li>${s}</li>`).join('')}</ul>
                    <h3>Peças:</h3>
                    <ul>${os.pecas.map(p => `<li>${p}</li>`).join('')}</ul>
                </div>`;
            
            openModal(`Detalhes da OS #${os.numero}`, detailsHtml, () => {});
        }
    };
    
    // ==========================================================
    // 6. FORMULÁRIOS PARA O MODAL
    // ==========================================================
    const forms = {
        _clienteSelect: (selectedId = '') => state.clientes.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.nome}</option>`).join(''),
        _veiculoSelect: (selectedPlaca = '') => state.veiculos.map(v => `<option value="${v.placa}" ${v.placa === selectedPlaca ? 'selected' : ''}>${v.modelo} (${v.placa})</option>`).join(''),
        
        clientes: {
            add: () => ({ title: 'Adicionar Cliente', html: forms._clienteForm() }),
            edit: (c) => ({ title: 'Editar Cliente', html: forms._clienteForm(c) }),
            process: (fd) => ({ nome: fd.get('nome'), telefone: fd.get('telefone'), email: fd.get('email') })
        },
        veiculos: {
            add: () => ({ title: 'Adicionar Veículo', html: forms._veiculoForm() }),
            edit: (v) => ({ title: 'Editar Veículo', html: forms._veiculoForm(v) }),
            process: (fd, item) => ({ 
                placa: item ? item.placa : fd.get('placa'), // Placa não pode ser editada
                modelo: fd.get('modelo'),
                ano: parseInt(fd.get('ano')),
                clienteId: parseInt(fd.get('clienteId'))
            })
        },
        ordens: {
            // Lógica para adicionar/editar ordens pode ser implementada aqui
        },

        // Templates de formulário
        _clienteForm: (c = {}) => `
            <form id="modalForm">
                <div class="form-group"><label for="nome">Nome:</label><input type="text" name="nome" value="${c.nome || ''}" required></div>
                <div class="form-group"><label for="telefone">Telefone:</label><input type="text" name="telefone" value="${c.telefone || ''}"></div>
                <div class="form-group"><label for="email">E-mail:</label><input type="email" name="email" value="${c.email || ''}"></div>
                <div class="form-actions"><button type="submit" class="btn">Salvar</button></div>
            </form>`,
        _veiculoForm: (v = {}) => `
            <form id="modalForm">
                <div class="form-group"><label for="placa">Placa:</label><input type="text" name="placa" value="${v.placa || ''}" ${v.placa ? 'readonly' : 'required'}></div>
                <div class="form-group"><label for="modelo">Modelo:</label><input type="text" name="modelo" value="${v.modelo || ''}" required></div>
                <div class="form-group"><label for="ano">Ano:</label><input type="number" name="ano" value="${v.ano || ''}" required></div>
                <div class="form-group"><label for="clienteId">Proprietário:</label><select name="clienteId" required><option value="">Selecione...</option>${forms._clienteSelect(v.clienteId)}</select></div>
                <div class="form-actions"><button type="submit" class="btn">Salvar</button></div>
            </form>`
    };

    // ==========================================================
    // 7. APIs EXTERNAS
    // ==========================================================

    async function fetchCarData() {
        const query = dom.carroSearchInput.value.trim();
        if (!query) return alert('Digite um modelo para buscar.');
        if (state.apiKey === 'SUA_CHAVE_API_AQUI') return dom.carrosContainer.innerHTML = `<p class="error">Erro: Insira sua chave da API-Ninjas no .</p>`;
        
        dom.carrosContainer.innerHTML = '<p>Buscando...</p>';
        const url = `https://api.api-ninjas.com/v1/cars?model=${encodeURIComponent(query)}&limit=10`;
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        try {
            const response = await fetch(proxyUrl, { headers: { 'X-Api-Key': state.apiKey } });
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
            const data = await response.json();

            if (data.length === 0) return dom.carrosContainer.innerHTML = '<p>Nenhum carro encontrado.</p>';
            
            dom.carrosContainer.innerHTML = data.map(carro => `
                <div class="carro-card">
                    <h3>${carro.make} ${carro.model} (${carro.year})</h3>
                    <div class="carro-info">
                        <p><strong>Tipo:</strong> ${carro.class || 'N/A'}</p>
                        <p><strong>Combustível:</strong> ${carro.fuel_type || 'N/A'}</p>
                        <p><strong>Tração:</strong> ${carro.drive || 'N/A'}</p>
                        <p><strong>Transmissão:</strong> ${carro.transmission === 'a' ? 'Automática' : 'Manual'}</p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erro ao buscar carros:', error);
            dom.carrosContainer.innerHTML = `<p class="error">Falha ao buscar dados. ${error.message}</p>`;
        }
    }
    
    async function fetchWeatherData() {
       // Função de clima permanece a mesma, pois já era funcional
       try {
            const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5/weather?q=Sao%20Paulo,br&units=metric&lang=pt_br&appid=3441da70a794390072c55bb0b7e8eaa6');
            if (!response.ok) throw new Error('Dados do clima indisponíveis');
            const data = await response.json();
            if (dom.weatherInfo) dom.weatherInfo.innerHTML = `${data.main.temp.toFixed(1)}°C<br>${data.weather[0].description}`;
        } catch (error) {
            if (dom.weatherInfo) dom.weatherInfo.textContent = 'Dados indisponíveis';
            console.error(error);
        }
    }

    // ==========================================================
    // 8. INICIALIZAÇÃO
    // ==========================================================
    function init() {
        // Configura o dark mode inicial
        if (localStorage.getItem('darkMode') === 'enabled') {
            dom.body.classList.add('dark-mode');
            dom.darkModeToggle.querySelector('i').className = 'fas fa-sun';
        }
        
        // Configura os listeners de eventos
        dom.darkModeToggle.addEventListener('click', toggleDarkMode);
        dom.loginForm?.addEventListener('submit', handleLogin);
        dom.navLinks.forEach(link => link.addEventListener('click', (e) => showSection(e.target.closest('a').getAttribute('href').substring(1))));
        dom.closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === dom.modal) closeModal(); });
        document.addEventListener('click', handleMainClick); // Listener principal para ações
        
        // Busca dados iniciais de APIs
        fetchWeatherData();
        
        // Exibe a tela de login
        showSection('login');
    }

    // Inicia a aplicação
    init();
});