/**
 * Módulo para gerenciamento de pedidos
 */
const Pedidos = {
    // Preços dos serviços
    precos: {
        lavar: 15.00, // preço por cesto para lavar
        secar: 15.00   // preço por cesto para secar
    },

    /**
     * Inicializa o módulo de pedidos
     */
    init() {
        // Verifica se o módulo Financeiro está disponível globalmente
        if (typeof Financeiro === 'undefined') {
            console.error('ERRO: Módulo Financeiro não encontrado! Continuando com funcionalidade limitada.');

            // Em vez de parar completamente, continua com funcionalidade limitada
            this.inicializarSemFinanceiro();
            return;
        }

        // Se o Financeiro existe, inicializa se necessário
        if (!Financeiro.inicializado) {
            console.log('Inicializando o módulo Financeiro a partir do módulo Pedidos');
            try {
                Financeiro.init();
            } catch (error) {
                console.error('Erro ao inicializar Financeiro:', error);
                this.inicializarSemFinanceiro();
                return;
            }
        }

        // Inicialização normal
        this.inicializarCompleto();
    },

    /**
     * Inicializa o módulo sem depender do Financeiro
     */
    inicializarSemFinanceiro() {
        console.log('Inicializando Pedidos com funcionalidade limitada (sem Financeiro)');

        const btnAdicionarPedido = document.getElementById('btn-adicionar-pedido');
        if (btnAdicionarPedido) {
            btnAdicionarPedido.addEventListener('click', () => {
                alert('O módulo financeiro não está disponível. Os pedidos não poderão ser registrados financeiramente.');
                this.adicionarPedidoSemFinanceiro();
            });
        }

        // Formatação de telefone
        this.inicializarFormatacaoTelefone();

        // Carrega pedidos recentes se possível
        this.carregarPedidosRecentes();
    },

    /**
     * Inicializa o módulo completo com Financeiro
     */
    inicializarCompleto() {
        console.log('Inicializando Pedidos com todas as funcionalidades');

        const btnAdicionarPedido = document.getElementById('btn-adicionar-pedido');
        if (btnAdicionarPedido) {
            btnAdicionarPedido.addEventListener('click', () => this.adicionarPedido());
        }

        // Formatação de telefone
        this.inicializarFormatacaoTelefone();

        // Carrega pedidos recentes
        this.carregarPedidosRecentes();
    },

    /**
     * Inicializa o formatador de telefone
     */
    inicializarFormatacaoTelefone() {
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function (e) {
                // Remove tudo que não for número
                let valor = e.target.value.replace(/\D/g, '');

                // Limita a 11 dígitos (incluindo DDD)
                if (valor.length > 11) {
                    valor = valor.substring(0, 11);
                }

                if (valor.length > 0) {
                    // Formato (XX) XXXXX-XXXX
                    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
                    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
                    e.target.value = valor;
                }
            });
        }
    },

    /**
     * Versão de adicionar pedido que não depende do módulo Financeiro
     */
    adicionarPedidoSemFinanceiro() {
        // Implementação básica sem integração com Financeiro
        const cliente = document.getElementById('cliente').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const cestosLavar = parseInt(document.getElementById('cestosLavar').value) || 0;
        const cestosSecar = parseInt(document.getElementById('cestosSecar').value) || 0;

        // Restante da implementação para salvar apenas localmente
        // ...
    },

    /**
     * Adiciona um novo pedido
     */
    adicionarPedido() {
        const cliente = document.getElementById('cliente').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const cestosLavar = parseInt(document.getElementById('cestosLavar').value) || 0;
        const cestosSecar = parseInt(document.getElementById('cestosSecar').value) || 0;
        const pagamento = document.getElementById('pagamento').value;

        if (!cliente || (cestosLavar <= 0 && cestosSecar <= 0)) {
            alert('Por favor, preencha o nome do cliente e pelo menos um serviço.');
            return;
        }

        // Calcula o valor total
        const valorLavar = cestosLavar * this.precos.lavar;
        const valorSecar = cestosSecar * this.precos.secar;
        const valorTotal = valorLavar + valorSecar;

        // Descrição do serviço
        let descricaoServico = [];
        if (cestosLavar > 0) {
            descricaoServico.push(`${cestosLavar} cesto(s) para lavar (R$ ${valorLavar.toFixed(2)})`);
        }
        if (cestosSecar > 0) {
            descricaoServico.push(`${cestosSecar} cesto(s) para secar (R$ ${valorSecar.toFixed(2)})`);
        }

        // Adiciona a transação financeira
        const resultado = Financeiro.adicionarTransacao({
            cliente: cliente,
            telefone: telefone || "Não informado",
            servico: descricaoServico.join(' e '),
            valor: valorTotal,
            pagamento: pagamento
        });

        if (resultado) {
            // Limpa os campos
            document.getElementById('cliente').value = '';
            document.getElementById('telefone').value = '';
            document.getElementById('cestosLavar').value = '';
            document.getElementById('cestosSecar').value = '';
            document.getElementById('pagamento').selectedIndex = 0;

            alert('Pedido registrado com sucesso!');

            // Atualiza a tabela de pedidos recentes
            this.carregarPedidosRecentes();
        }
    },

    /**
     * Carrega os pedidos recentes na tabela
     */
    carregarPedidosRecentes() {
        const tbodyPedidos = document.getElementById('tbody-pedidos');
        if (!tbodyPedidos) return;

        tbodyPedidos.innerHTML = '';

        // Obtém as transações do módulo financeiro
        const transacoes = Storage.get('transacoes', []);

        // Exibe apenas os 10 pedidos mais recentes
        const pedidosRecentes = transacoes.slice(-10).reverse();

        pedidosRecentes.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="cliente-col">${pedido.cliente}</td>
                <td class="telefone-col">${pedido.telefone || "Não informado"}</td>
                <td class="servico-col">${pedido.servico}</td>
                <td class="valor-col">R$ ${pedido.valor.toFixed(2)}</td>
                <td class="pagamento-col">${Financeiro.formatarTipoPagamento(pedido.pagamento)}</td>
                <td class="data-col">${pedido.data} ${pedido.hora ? `- ${pedido.hora}` : ''}</td>
            `;
            tbodyPedidos.appendChild(tr);
        });
    }
};