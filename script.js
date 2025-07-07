
document.addEventListener('DOMContentLoaded', () => {

    // 1. ESTADO DA APLICAÇÃO (STATE)

    const state = {

        apiKeyCars: 'naZsZjgceZ9FICJmgvnKvw==Mps3mLYy6NGvP64I',
        apiKeyWeather: 'b3c7ba7c8f0dc64026fc860536dedce2',
        weatherData: null,
        weatherLastFetch: 0,
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
        dataTables: { clientes: null, veiculos: null, ordens: null }
    };

    // 2. SELETORES DE ELEMENTOS DO DOM

    const dom = {
        body: document.body,
        darkModeToggle: document.getElementById('darkModeToggle'),
        logo: document.querySelector('.logo'),
        navLinks: document.querySelectorAll('.nav-link'),
        sections: document.querySelectorAll('main > section'),
        loginForm: document.getElementById('loginForm'),
        passwordInput: document.getElementById('password'),
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        closeModalBtn: document.querySelector('.close-modal'),
        carroSearchInput: document.getElementById('carroSearch'),
        carrosContainer: document.getElementById('carros-container'),
        weatherInfoCard: document.getElementById('weatherInfo'),
        climaContainer: document.getElementById('clima-container'),
    };

    // 3. FUNÇÕES DE RENDERIZAÇÃO

    function showSection(sectionId) {
        dom.sections.forEach(section => section.classList.remove('active-section'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active-section');
        }

        dom.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });

        if (sectionId === 'clima') {
            fetchWeatherData();
        }

        if (['clientes', 'veiculos', 'ordens'].includes(sectionId)) {
            renderTable(sectionId);
        }
        window.scrollTo(0, 0);
    }

    function renderTable(type) {
        const tableBody = document.getElementById(`${type}Body`);
        if (!tableBody) return;
        const dataMapper = { clientes: item => `<td>${item.id}</td><td>${item.nome}</td><td>${item.telefone}</td><td>${item.email}</td>`, veiculos: item => { const proprietario = state.clientes.find(c => c.id === item.clienteId); return `<td>${item.placa}</td><td>${item.modelo}</td><td>${item.ano}</td><td>${proprietario ? proprietario.nome : 'N/A'}</td>`; }, ordens: item => { const veiculo = state.veiculos.find(v => v.placa === item.veiculoPlaca); const cliente = veiculo ? state.clientes.find(c => c.id === veiculo.clienteId) : null; return `<td>${item.numero}</td><td>${veiculo ? `${veiculo.modelo} (${item.veiculoPlaca})` : 'N/A'}</td><td>${cliente ? cliente.nome : 'N/A'}</td><td>${item.data}</td><td><span class="status ${item.status.toLowerCase().replace(/\s/g, '-')}">${item.status}</span></td><td>${item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>`; } };
        tableBody.innerHTML = state[type].map(item => `<tr data-id="${item.id || item.placa || item.numero}">${dataMapper[type](item)}<td>${type === 'ordens' ? `<button class="btn-action detalhes" data-action="details" data-type="${type}"><i class="fas fa-info-circle"></i></button>` : ''}<button class="btn-action editar" data-action="edit" data-type="${type}"><i class="fas fa-edit"></i></button>${type !== 'ordens' ? `<button class="btn-action excluir" data-action="delete" data-type="${type}"><i class="fas fa-trash"></i></button>` : ''}</td></tr>`).join('');
        if (state.dataTables[type]) state.dataTables[type].destroy();
        state.dataTables[type] = $(`#${type}Table`).DataTable({ language: { url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json' }, destroy: true, searching: true });
    }

    function openModal(title, formHtml, onSubmitCallback) {
        dom.modalTitle.textContent = title;
        dom.modalBody.innerHTML = formHtml;
        dom.modal.style.display = 'block';
        const modalForm = dom.modalBody.querySelector('#modalForm');
        if (modalForm) { modalForm.onsubmit = (e) => { e.preventDefault(); onSubmitCallback(new FormData(modalForm)); closeModal(); }; }
    }

    function closeModal() { dom.modal.style.display = 'none'; dom.modalBody.innerHTML = ''; }

    // 4. MANIPULAÇÃO DE DADOS

    function handleMainClick(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        e.preventDefault();

        const { action, type, target: sectionTarget } = target.dataset;
        const id = target.closest('tr')?.dataset.id;
        const actionHandlers = {
            showSection: () => showSection(sectionTarget),
            goHome: () => showSection('dashboard'),
            add: () => crud.add(type),
            edit: () => crud.edit(type, id),
            delete: () => crud.remove(type, id),
            details: () => crud.details(type, id),
            searchCar: () => fetchCarData(),
            togglePassword: () => { const type = dom.passwordInput.type === 'password' ? 'text' : 'password'; dom.passwordInput.setAttribute('type', type); target.querySelector('i').classList.toggle('fa-eye-slash'); }
        };
        if (actionHandlers[action]) actionHandlers[action]();
    }

    const crud = { add(type) { const formInfo = forms[type].add(); openModal(formInfo.title, formInfo.html, (formData) => { const newItem = forms[type].process(formData); const lastId = state[type].length > 0 ? Math.max(...state[type].map(item => item.id || item.numero)) : 0; newItem.id = newItem.numero = lastId + 1; state[type].push(newItem); renderTable(type); }); }, edit(type, id) { const item = state[type].find(i => (i.id || i.placa || i.numero) == id); if (!item) return; const formInfo = forms[type].edit(item); openModal(formInfo.title, formInfo.html, (formData) => { const updatedData = forms[type].process(formData, item); Object.assign(item, updatedData); renderTable(type); }); }, remove(type, id) { if (confirm(`Tem certeza que deseja excluir este item?`)) { state[type] = state[type].filter(i => (i.id || i.placa) != id); renderTable(type); } }, details(type, id) { const os = state.ordens.find(o => o.numero == id); if (!os) return; const veiculo = state.veiculos.find(v => v.placa === os.veiculoPlaca); const cliente = veiculo ? state.clientes.find(c => c.id === veiculo.clienteId) : null; const detailsHtml = `<div class="os-details"><p><strong>Veículo:</strong> ${veiculo?.modelo || 'N/A'} (${os.veiculoPlaca})</p><p><strong>Cliente:</strong> ${cliente?.nome || 'N/A'}</p><p><strong>Data:</strong> ${os.data}</p><p><strong>Status:</strong> <span class="status ${os.status.toLowerCase().replace(/\s/g, '-')}">${os.status}</span></p><p><strong>Valor:</strong> ${os.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><h3>Serviços:</h3><ul>${os.servicos.map(s => `<li>${s}</li>`).join('')}</ul><h3>Peças:</h3><ul>${os.pecas.map(p => `<li>${p}</li>`).join('')}</ul></div>`; openModal(`Detalhes da OS #${os.numero}`, detailsHtml, () => { }); } };
    const forms = { _clienteSelect: (selectedId = '') => state.clientes.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.nome}</option>`).join(''), _veiculoSelect: (selectedPlaca = '') => state.veiculos.map(v => `<option value="${v.placa}" ${v.placa === selectedPlaca ? 'selected' : ''}>${v.modelo} (${v.placa})</option>`).join(''), clientes: { add: () => ({ title: 'Adicionar Cliente', html: forms._clienteForm() }), edit: (c) => ({ title: 'Editar Cliente', html: forms._clienteForm(c) }), process: (fd) => ({ nome: fd.get('nome'), telefone: fd.get('telefone'), email: fd.get('email') }) }, veiculos: { add: () => ({ title: 'Adicionar Veículo', html: forms._veiculoForm() }), edit: (v) => ({ title: 'Editar Veículo', html: forms._veiculoForm(v) }), process: (fd, item) => ({ placa: item ? item.placa : fd.get('placa'), modelo: fd.get('modelo'), ano: parseInt(fd.get('ano')), clienteId: parseInt(fd.get('clienteId')) }) }, _clienteForm: (c = {}) => `<form id="modalForm"><div class="form-group"><label>Nome:</label><input type="text" name="nome" value="${c.nome || ''}" required></div><div class="form-group"><label>Telefone:</label><input type="text" name="telefone" value="${c.telefone || ''}"></div><div class="form-group"><label>E-mail:</label><input type="email" name="email" value="${c.email || ''}"></div><div class="form-actions"><button type="submit" class="btn">Salvar</button></div></form>`, _veiculoForm: (v = {}) => `<form id="modalForm"><div class="form-group"><label>Placa:</label><input type="text" name="placa" value="${v.placa || ''}" ${v.placa ? 'readonly' : 'required'}></div><div class="form-group"><label>Modelo:</label><input type="text" name="modelo" value="${v.modelo || ''}" required></div><div class="form-group"><label>Ano:</label><input type="number" name="ano" value="${v.ano || ''}" required></div><div class="form-group"><label>Proprietário:</label><select name="clienteId" required><option value="">Selecione...</option>${forms._clienteSelect(v.clienteId)}</select></div><div class="form-actions"><button type="submit" class="btn">Salvar</button></div></form>` };

    // 5. APIs EXTERNAS

    function renderFullWeatherData(data) {
        const { name, main, weather } = data;
        const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

        dom.climaContainer.innerHTML = `
            <div class="clima-header">
                <h3>${name}</h3>
            </div>
            <div class="clima-main">
                <img src="${iconUrl}" alt="Ícone do tempo">
                <div class="temperatura">${main.temp.toFixed(0)}&deg;C</div>
            </div>
        `;
    }

    async function fetchWeatherData() {
        const now = Date.now();
        if (state.weatherData && (now - state.weatherLastFetch < 600000)) {
            renderFullWeatherData(state.weatherData);
            return;
        }

        dom.climaContainer.innerHTML = `<div class="loading-message">Carregando dados do clima...</div>`;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=Sao%20Paulo,br&units=metric&lang=pt_br&appid=${state.apiKeyWeather}`;
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        try {
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            state.weatherData = data;
            state.weatherLastFetch = Date.now();

            if (dom.weatherInfoCard) {
                dom.weatherInfoCard.innerHTML = `${data.main.temp.toFixed(1)}°C - ${data.weather[0].description}`;
            }
            renderFullWeatherData(data);

        } catch (error) {
            console.error("Erro ao buscar clima:", error);
            dom.climaContainer.innerHTML = `<div class="error-message">Falha ao buscar dados: ${error.message}</div>`;
        }
    }

    async function fetchCarData() {
        const model = dom.carroSearchInput.value.trim();

        if (!model) {
            dom.carrosContainer.innerHTML = '<p class="error-message">Por favor, digite o modelo de um carro para pesquisar.</p>';
            return;
        }

        // Exibe mensagem de carregamento
        dom.carrosContainer.innerHTML = '<div class="loading-message">Pesquisando...</div>';

        const url = `https://api.api-ninjas.com/v1/cars?model=${encodeURIComponent(model)}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Api-Key': state.apiKeyCars
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na busca do veículo. Status: ${response.status}`);
            }

            const data = await response.json();
            renderCarData(data);

        } catch (error) {
            console.error("Erro ao buscar dados do carro:", error);
            dom.carrosContainer.innerHTML = `<div class="error-message">Falha ao buscar dados: ${error.message}. Verifique se a chave da API está correta e tente novamente.</div>`;
        }
    }

    /**
     Renderiza os cartões com as informações dos carros encontrados.
    @param {Array} cars
     */
    function renderCarData(cars) {
        if (cars.length === 0) {
            dom.carrosContainer.innerHTML = '<p class="info-message">Nenhum carro encontrado para o modelo pesquisado.</p>';
            return;
        }

        const carsHtml = cars.map(car => `
            <div class="car-card">
                <h3>${car.make.toUpperCase()} ${car.model}</h3>
                <ul>
                    <li><strong>Ano:</strong> ${car.year}</li>
                    <li><strong>Transmissão:</strong> ${car.transmission === 'a' ? 'Automática' : 'Manual'}</li>
                    <li><strong>Combustível:</strong> ${car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)}</li>
                    <li><strong>Cilindros:</strong> ${car.cylinders || 'N/A'}</li>
                    <li><strong>Consumo (Cidade):</strong> ${car.city_mpg} MPG</li>
                    <li><strong>Consumo (Estrada):</strong> ${car.highway_mpg} MPG</li>
                </ul>
            </div>
        `).join('');

        dom.carrosContainer.innerHTML = carsHtml;
    }

    // 6. TEMA

    function init() {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            dom.darkModeToggle.querySelector('i').className = 'fas fa-sun';
        }
        dom.darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            dom.darkModeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        });
        dom.loginForm?.addEventListener('submit', (e) => { e.preventDefault(); showSection('dashboard'); });
        dom.navLinks.forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); showSection(e.target.closest('a').getAttribute('href').substring(1)); }); });
        dom.closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === dom.modal) closeModal(); });
        document.addEventListener('click', handleMainClick);
        fetchWeatherData().catch(console.error);
        showSection('login');
    }

    init();
});