document.addEventListener('DOMContentLoaded', function () {
    // 1. Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    darkModeToggle.addEventListener('click', toggleDarkMode);

    async function fetchWeatherData() {
        try {
            // API gratuita do OpenWeatherMap (substitua pela sua chave API)
            const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5/weather?q=Sao%20Paulo,br&units=metric&lang=pt_br&appid=3441da70a794390072c55bb0b7e8eaa6');

            if (!response.ok) throw new Error('Erro ao obter dados do clima');

            const data = await response.json();

            // Atualiza o card do clima
            const weatherInfo = document.getElementById('weatherInfo');
            weatherInfo.innerHTML = `
            ${data.main.temp.toFixed(1)}°C<br>
            ${data.weather[0].description}
        `;

            // Muda o ícone de acordo com o clima
            const weatherIcon = document.querySelector('#weatherCard i');
            if (data.weather[0].main === 'Clear') {
                weatherIcon.className = 'fas fa-sun';
            } else if (data.weather[0].main === 'Rain') {
                weatherIcon.className = 'fas fa-cloud-rain';
            } else if (data.weather[0].main === 'Clouds') {
                weatherIcon.className = 'fas fa-cloud';
            }

        } catch (error) {
            console.error('Erro ao buscar dados do clima:', error);
            document.getElementById('weatherInfo').textContent = 'Dados indisponíveis';
        }
    }

    // Chame esta função no DOMContentLoaded, junto com as outras inicializações
    document.addEventListener('DOMContentLoaded', function () {
        // ... (código existente)

        // Adicione esta linha para carregar os dados do clima
        fetchWeatherData();

    });

    // Verificar preferência ao carregar
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // 2. Controle de Seções
    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('.nav-link');

    function showSection(sectionId) {
        // Esconder todas as seções
        sections.forEach(section => {
            section.classList.remove('active-section');
        });

        // Mostrar seção selecionada
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active-section');
        }

        // Atualizar menu ativo
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Rolar para o topo
        window.scrollTo(0, 0);
    }

    // 3. Sistema de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            showSection('dashboard');
            updateDashboard();
        });
    }

    // 4. Toggle de Senha
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // 5. Navegação pelo Menu
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);

            // Carregar dados específicos da seção
            if (targetSection === 'clientes') {
                loadClientes();
            } else if (targetSection === 'veiculos') {
                loadVeiculos();
            } else if (targetSection === 'ordens') {
                loadOrdens();
            }
        });
    });

    // 6. Botão de Logout no Logo
    document.getElementById('logoButton').addEventListener('click', function () {
        const confirmar = confirm("Deseja sair do sistema e voltar para a tela de login?");

        if (confirmar) {
            // Esconder todas as seções
            document.querySelectorAll('main > section').forEach(section => {
                section.classList.remove('active-section');
            });

            // Mostrar apenas a tela de login
            document.getElementById('login').classList.add('active-section');

            // Resetar o menu ativo
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            // Limpar campos de login
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password').type = 'password';
            if (document.getElementById('togglePassword').querySelector('.fa-eye-slash')) {
                document.getElementById('togglePassword').querySelector('i').classList.remove('fa-eye-slash');
            }

            // Rolar para o topo
            window.scrollTo(0, 0);
        }
    });

    // 7. Modal
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close-modal');

    function openModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        modal.style.display = 'block';
    }

    function closeModalFunc() {
        modal.style.display = 'none';
    }

    closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // 8. Dados do Sistema
    let sistema = {
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
            {
                numero: 1001,
                veiculoPlaca: "ABC1D23",
                data: "15/03/2023",
                status: "Concluído",
                valor: 850.00,
                servicos: ["Troca de óleo", "Revisão geral"],
                pecas: ["Óleo motor", "Filtro de óleo"]
            },
            {
                numero: 1002,
                veiculoPlaca: "XYZ4E56",
                data: "20/03/2023",
                status: "Em andamento",
                valor: 1200.00,
                servicos: ["Reparo motor", "Troca de freios"],
                pecas: ["Pastilhas de freio", "Líquido de freio"]
            }
        ]
    };

    // 9. Funções para carregar dados
    function loadClientes() {
        const tbody = document.getElementById('clientesBody');
        tbody.innerHTML = '';

        sistema.clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.email}</td>
                <td>
                    <button class="btn-action editar" data-id="${cliente.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action excluir" data-id="${cliente.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Inicializar DataTable
        $('#clientesTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
            },
            destroy: true // Para poder reinicializar
        });

        // Implementar busca de clientes
        document.getElementById('searchClient').addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#clientesBody tr');

            rows.forEach(row => {
                const nome = row.cells[1].textContent.toLowerCase();
                const telefone = row.cells[2].textContent.toLowerCase();

                if (nome.includes(searchTerm) || telefone.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    function loadVeiculos() {
        const tbody = document.getElementById('veiculosBody');
        tbody.innerHTML = '';

        sistema.veiculos.forEach(veiculo => {
            const cliente = sistema.clientes.find(c => c.id === veiculo.clienteId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${veiculo.placa}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.ano}</td>
                <td>${cliente ? cliente.nome : 'Não encontrado'}</td>
                <td>
                    <button class="btn-action editar" data-placa="${veiculo.placa}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action excluir" data-placa="${veiculo.placa}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        $('#veiculosTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
            },
            destroy: true
        });

        // Implementar busca de veículos
        document.getElementById('searchVehicle').addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#veiculosBody tr');

            rows.forEach(row => {
                const modelo = row.cells[1].textContent.toLowerCase();
                const placa = row.cells[0].textContent.toLowerCase();

                if (modelo.includes(searchTerm) || placa.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    function loadOrdens() {
        const tbody = document.getElementById('ordensBody');
        tbody.innerHTML = '';

        sistema.ordens.forEach(os => {
            const veiculo = sistema.veiculos.find(v => v.placa === os.veiculoPlaca);
            const cliente = sistema.clientes.find(c => c.id === veiculo?.clienteId);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${os.numero}</td>
                <td>${veiculo?.modelo || 'Veículo não encontrado'} (${os.veiculoPlaca})</td>
                <td>${cliente?.nome || 'Cliente não encontrado'}</td>
                <td>${os.data}</td>
                <td><span class="status ${os.status.toLowerCase().replace(' ', '-')}">${os.status}</span></td>
                <td>R$ ${os.valor.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn-action detalhes" data-os="${os.numero}">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn-action editar" data-os="${os.numero}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        $('#ordensTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
            },
            destroy: true
        });
    }

    // 10. Atualizar Dashboard
    function updateDashboard() {
        document.getElementById('totalClients').textContent = sistema.clientes.length;
        document.getElementById('totalVehicles').textContent = sistema.veiculos.length;

        const ordensAbertas = sistema.ordens.filter(os => os.status !== 'Concluído').length;
        document.getElementById('openOrders').textContent = ordensAbertas;

        const faturamento = sistema.ordens.reduce((total, os) => total + os.valor, 0);
        document.getElementById('monthlyRevenue').textContent =
            faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // 11. Botões de Adicionar
    document.getElementById('addCliente')?.addEventListener('click', function () {
        openModal('Adicionar Cliente', `
            <form id="modalForm">
                <div class="form-group">
                    <label for="modalNome">Nome:</label>
                    <input type="text" id="modalNome" required>
                </div>
                <div class="form-group">
                    <label for="modalTelefone">Telefone:</label>
                    <input type="text" id="modalTelefone" required>
                </div>
                <div class="form-group">
                    <label for="modalEmail">E-mail:</label>
                    <input type="email" id="modalEmail" required>
                </div>
                <div class="form-actions">
                    <button type="reset" class="btn btn-secondary">Limpar</button>
                    <button type="submit" class="btn">Salvar</button>
                </div>
            </form>
        `);

        document.getElementById('modalForm')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const newId = sistema.clientes.length > 0 ?
                Math.max(...sistema.clientes.map(c => c.id)) + 1 : 1;

            sistema.clientes.push({
                id: newId,
                nome: document.getElementById('modalNome').value,
                telefone: document.getElementById('modalTelefone').value,
                email: document.getElementById('modalEmail').value
            });

            closeModalFunc();
            loadClientes();
            updateDashboard();
        });
    });

    document.getElementById('addVeiculo')?.addEventListener('click', function () {
        openModal('Adicionar Veículo', `
            <form id="modalForm">
                <div class="form-group">
                    <label for="modalPlaca">Placa:</label>
                    <input type="text" id="modalPlaca" required>
                </div>
                <div class="form-group">
                    <label for="modalModelo">Modelo:</label>
                    <input type="text" id="modalModelo" required>
                </div>
                <div class="form-group">
                    <label for="modalAno">Ano:</label>
                    <input type="number" id="modalAno" required>
                </div>
                <div class="form-group">
                    <label for="modalCliente">Proprietário:</label>
                    <select id="modalCliente" required>
                        <option value="">Selecione um cliente</option>
                        ${sistema.clientes.map(cliente =>
            `<option value="${cliente.id}">${cliente.nome}</option>`
        ).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="reset" class="btn btn-secondary">Limpar</button>
                    <button type="submit" class="btn">Salvar</button>
                </div>
            </form>
        `);

        document.getElementById('modalForm')?.addEventListener('submit', function (e) {
            e.preventDefault();

            sistema.veiculos.push({
                placa: document.getElementById('modalPlaca').value,
                modelo: document.getElementById('modalModelo').value,
                ano: document.getElementById('modalAno').value,
                clienteId: parseInt(document.getElementById('modalCliente').value)
            });

            closeModalFunc();
            loadVeiculos();
            updateDashboard();
        });
    });

    document.getElementById('addOrdem')?.addEventListener('click', function () {
        openModal('Adicionar Ordem de Serviço', `
            <form id="modalForm">
                <div class="form-group">
                    <label for="modalVeiculo">Veículo:</label>
                    <select id="modalVeiculo" required>
                        <option value="">Selecione um veículo</option>
                        ${sistema.veiculos.map(veiculo =>
            `<option value="${veiculo.placa}">${veiculo.modelo} (${veiculo.placa})</option>`
        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="modalData">Data:</label>
                    <input type="text" id="modalData" value="${new Date().toLocaleDateString('pt-BR')}" required>
                </div>
                <div class="form-group">
                    <label for="modalStatus">Status:</label>
                    <select id="modalStatus" required>
                        <option value="Orçamento">Orçamento</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Aguardando peças">Aguardando peças</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="modalValor">Valor (R$):</label>
                    <input type="number" step="0.01" id="modalValor" required>
                </div>
                <div class="form-group">
                    <label for="modalServicos">Serviços (separados por vírgula):</label>
                    <textarea id="modalServicos" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="modalPecas">Peças (separadas por vírgula):</label>
                    <textarea id="modalPecas" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="reset" class="btn btn-secondary">Limpar</button>
                    <button type="submit" class="btn">Salvar</button>
                </div>
            </form>
        `);

        document.getElementById('modalForm')?.addEventListener('submit', function (e) {
            e.preventDefault();
            const newNumero = sistema.ordens.length > 0 ?
                Math.max(...sistema.ordens.map(os => os.numero)) + 1 : 1001;

            sistema.ordens.push({
                numero: newNumero,
                veiculoPlaca: document.getElementById('modalVeiculo').value,
                data: document.getElementById('modalData').value,
                status: document.getElementById('modalStatus').value,
                valor: parseFloat(document.getElementById('modalValor').value),
                servicos: document.getElementById('modalServicos').value.split(',').map(s => s.trim()),
                pecas: document.getElementById('modalPecas').value.split(',').map(p => p.trim())
            });

            closeModalFunc();
            loadOrdens();
            updateDashboard();
        });
    });

    // 12. API Ninjas (Carros)
    document.getElementById('searchCarro')?.addEventListener('click', async function () {
        const query = document.getElementById('carroSearch').value.trim();
        if (!query) {
            alert('Por favor, digite um modelo de carro para buscar');
            return;
        }

        const carrosContainer = document.getElementById('carros-container');
        carrosContainer.innerHTML = '<p>Buscando informações...</p>';

        try {
            const response = await fetch(`https://api.api-ninjas.com/v1/cars?model=${encodeURIComponent(query)}&limit=10`, {
                headers: {
                    'X-Api-Key': 'naZsZjgceZ9FICJmgvnKvw==Mps3mLYy6NGvP64I' // Substitua pela sua chave
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();

            if (data.length === 0) {
                carrosContainer.innerHTML = '<p>Nenhum carro encontrado com este modelo. Tente outro termo.</p>';
                return;
            }

            carrosContainer.innerHTML = '';

            data.forEach(carro => {
                const card = document.createElement('div');
                card.className = 'carro-card';
                card.innerHTML = `
                <h3>${carro.make} ${carro.model} (${carro.year})</h3>
                <div class="carro-info">
                    <p><strong>Combustível:</strong> ${carro.drive || 'N/A'}</p>
                    <p><strong>Transmissão:</strong> ${carro.transmission || 'N/A'}</p>
                    <p><strong>Cilindros:</strong> ${carro.cylinders || 'N/A'}</p>
                    <p><strong>Tipo:</strong> ${carro.class || 'N/A'}</p>
                    <p><strong>Consumo cidade:</strong> ${carro.city_mpg || 'N/A'} mpg</p>
                    <p><strong>Consumo estrada:</strong> ${carro.highway_mpg || 'N/A'} mpg</p>
                    <p><strong>Combinação:</strong> ${carro.combination_mpg || 'N/A'} mpg</p>
                </div>
            `;
                carrosContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Erro ao buscar carros:', error);
            carrosContainer.innerHTML = `<p class="error">Erro ao buscar carros: ${error.message}</p>`;
        }
    });

    // 13. Event Delegation para botões de ação
    document.addEventListener('click', function (e) {
        // Editar Cliente
        if (e.target.closest('.btn-action.editar[data-id]')) {
            const id = parseInt(e.target.closest('.btn-action').getAttribute('data-id'));
            const cliente = sistema.clientes.find(c => c.id === id);

            if (cliente) {
                openModal('Editar Cliente', `
                    <form id="modalForm">
                        <div class="form-group">
                            <label for="modalNome">Nome:</label>
                            <input type="text" id="modalNome" value="${cliente.nome}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalTelefone">Telefone:</label>
                            <input type="text" id="modalTelefone" value="${cliente.telefone}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalEmail">E-mail:</label>
                            <input type="email" id="modalEmail" value="${cliente.email}" required>
                        </div>
                        <div class="form-actions">
                            <button type="reset" class="btn btn-secondary">Limpar</button>
                            <button type="submit" class="btn">Salvar</button>
                        </div>
                    </form>
                `);

                document.getElementById('modalForm')?.addEventListener('submit', function (e) {
                    e.preventDefault();
                    cliente.nome = document.getElementById('modalNome').value;
                    cliente.telefone = document.getElementById('modalTelefone').value;
                    cliente.email = document.getElementById('modalEmail').value;

                    closeModalFunc();
                    loadClientes();
                });
            }
        }

        // Excluir Cliente
        if (e.target.closest('.btn-action.excluir[data-id]')) {
            const id = parseInt(e.target.closest('.btn-action').getAttribute('data-id'));
            const confirmar = confirm(`Tem certeza que deseja excluir o cliente ID ${id}?`);

            if (confirmar) {
                sistema.clientes = sistema.clientes.filter(c => c.id !== id);
                loadClientes();
                updateDashboard();
            }
        }

        // Editar Veículo
        if (e.target.closest('.btn-action.editar[data-placa]')) {
            const placa = e.target.closest('.btn-action').getAttribute('data-placa');
            const veiculo = sistema.veiculos.find(v => v.placa === placa);

            if (veiculo) {
                openModal('Editar Veículo', `
                    <form id="modalForm">
                        <div class="form-group">
                            <label for="modalPlaca">Placa:</label>
                            <input type="text" id="modalPlaca" value="${veiculo.placa}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalModelo">Modelo:</label>
                            <input type="text" id="modalModelo" value="${veiculo.modelo}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalAno">Ano:</label>
                            <input type="number" id="modalAno" value="${veiculo.ano}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalCliente">Proprietário:</label>
                            <select id="modalCliente" required>
                                ${sistema.clientes.map(cliente =>
                    `<option value="${cliente.id}" ${cliente.id === veiculo.clienteId ? 'selected' : ''}>
                                        ${cliente.nome}
                                    </option>`
                ).join('')}
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="reset" class="btn btn-secondary">Limpar</button>
                            <button type="submit" class="btn">Salvar</button>
                        </div>
                    </form>
                `);

                document.getElementById('modalForm')?.addEventListener('submit', function (e) {
                    e.preventDefault();
                    veiculo.modelo = document.getElementById('modalModelo').value;
                    veiculo.ano = document.getElementById('modalAno').value;
                    veiculo.clienteId = parseInt(document.getElementById('modalCliente').value);

                    closeModalFunc();
                    loadVeiculos();
                });
            }
        }

        // Excluir Veículo
        if (e.target.closest('.btn-action.excluir[data-placa]')) {
            const placa = e.target.closest('.btn-action').getAttribute('data-placa');
            const confirmar = confirm(`Tem certeza que deseja excluir o veículo ${placa}?`);

            if (confirmar) {
                sistema.veiculos = sistema.veiculos.filter(v => v.placa !== placa);
                loadVeiculos();
                updateDashboard();
            }
        }

        // Detalhes da OS
        if (e.target.closest('.btn-action.detalhes[data-os]')) {
            const numero = parseInt(e.target.closest('.btn-action').getAttribute('data-os'));
            const os = sistema.ordens.find(o => o.numero === numero);

            if (os) {
                const veiculo = sistema.veiculos.find(v => v.placa === os.veiculoPlaca);
                const cliente = sistema.clientes.find(c => c.id === veiculo?.clienteId);

                openModal(`Detalhes da OS #${os.numero}`, `
                    <div class="os-details">
                        <p><strong>Veículo:</strong> ${veiculo?.modelo || 'Não encontrado'} (${os.veiculoPlaca})</p>
                        <p><strong>Cliente:</strong> ${cliente?.nome || 'Não encontrado'}</p>
                        <p><strong>Data:</strong> ${os.data}</p>
                        <p><strong>Status:</strong> <span class="status ${os.status.toLowerCase().replace(' ', '-')}">${os.status}</span></p>
                        <p><strong>Valor:</strong> R$ ${os.valor.toFixed(2).replace('.', ',')}</p>
                        
                        <h3>Serviços realizados:</h3>
                        <ul>
                            ${os.servicos.map(servico => `<li>${servico}</li>`).join('')}
                        </ul>
                        
                        <h3>Peças utilizadas:</h3>
                        <ul>
                            ${os.pecas.map(peca => `<li>${peca}</li>`).join('')}
                        </ul>
                    </div>
                `);
            }
        }

        // Editar OS
        if (e.target.closest('.btn-action.editar[data-os]')) {
            const numero = parseInt(e.target.closest('.btn-action').getAttribute('data-os'));
            const os = sistema.ordens.find(o => o.numero === numero);

            if (os) {
                openModal(`Editar OS #${os.numero}`, `
                    <form id="modalForm">
                        <div class="form-group">
                            <label for="modalVeiculo">Veículo:</label>
                            <select id="modalVeiculo" required>
                                ${sistema.veiculos.map(veiculo =>
                    `<option value="${veiculo.placa}" ${veiculo.placa === os.veiculoPlaca ? 'selected' : ''}>
                                        ${veiculo.modelo} (${veiculo.placa})
                                    </option>`
                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="modalData">Data:</label>
                            <input type="text" id="modalData" value="${os.data}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalStatus">Status:</label>
                            <select id="modalStatus" required>
                                <option value="Orçamento" ${os.status === 'Orçamento' ? 'selected' : ''}>Orçamento</option>
                                <option value="Em andamento" ${os.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                                <option value="Aguardando peças" ${os.status === 'Aguardando peças' ? 'selected' : ''}>Aguardando peças</option>
                                <option value="Concluído" ${os.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="modalValor">Valor (R$):</label>
                            <input type="number" step="0.01" id="modalValor" value="${os.valor}" required>
                        </div>
                        <div class="form-group">
                            <label for="modalServicos">Serviços (separados por vírgula):</label>
                            <textarea id="modalServicos" rows="3">${os.servicos.join(', ')}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="modalPecas">Peças (separadas por vírgula):</label>
                            <textarea id="modalPecas" rows="3">${os.pecas.join(', ')}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="reset" class="btn btn-secondary">Limpar</button>
                            <button type="submit" class="btn">Salvar</button>
                        </div>
                    </form>
                `);

                document.getElementById('modalForm')?.addEventListener('submit', function (e) {
                    e.preventDefault();
                    os.veiculoPlaca = document.getElementById('modalVeiculo').value;
                    os.data = document.getElementById('modalData').value;
                    os.status = document.getElementById('modalStatus').value;
                    os.valor = parseFloat(document.getElementById('modalValor').value);
                    os.servicos = document.getElementById('modalServicos').value.split(',').map(s => s.trim());
                    os.pecas = document.getElementById('modalPecas').value.split(',').map(p => p.trim());

                    closeModalFunc();
                    loadOrdens();
                    updateDashboard();
                });
            }
        }
    });

    // 14. Cards do Dashboard clicáveis
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('click', function () {
            const target = this.getAttribute('data-target');
            if (target) {
                showSection(target);

                if (target === 'clientes') {
                    loadClientes();
                } else if (target === 'veiculos') {
                    loadVeiculos();
                } else if (target === 'ordens') {
                    loadOrdens();
                }
            }
        });
    });

    // 15. Inicialização
    updateDashboard();
});