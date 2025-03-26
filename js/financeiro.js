/**
 * Módulo para gerenciamento financeiro
 */
const Financeiro = {
    transacoes: [],
    inicializado: false, // Nova propriedade para rastrear o estado
    resumoFinanceiro: {
        total: 0,
        totalHoje: 0,
        totalMes: 0,
        cartao: 0,
        pix: 0,
        dinheiro: 0,
        ticketMedio: 0,
        maiorVenda: 0,
        clientesRecorrentes: 0,
        ultimaAtualizacao: null
    },

    /**
     * Inicializa o módulo financeiro
     */
    init() {
        // Marca o módulo como inicializado no início do método
        this.inicializado = true;
        console.log('Financeiro.init() executado - módulo marcado como inicializado');

        // Marca o módulo como inicializado
        this.inicializado = true;

        // Carrega transações do localStorage
        this.transacoes = Storage.get('transacoes', []);

        // Carrega resumo financeiro do localStorage ou recalcula se necessário
        this.carregarResumoFinanceiro();

        this.atualizarTabela();
        this.atualizarResumo();

        // Adiciona eventos aos botões de filtro se estiverem na página
        const btnFiltrar = document.getElementById('btn-filtrar');
        const btnLimparFiltro = document.getElementById('btn-limpar-filtro');
        const btnClientesHoje = document.getElementById('btn-clientes-hoje');
        const btnFecharClientes = document.getElementById('btn-fechar-clientes');
        const btnExportarClientes = document.getElementById('btn-exportar-clientes');
        const btnRemoverFiltro = document.getElementById('btn-remover-filtro');

        if (btnFiltrar) {
            btnFiltrar.addEventListener('click', () => this.filtrarPorData());
        }

        if (btnLimparFiltro) {
            btnLimparFiltro.addEventListener('click', () => this.limparFiltro());
        }

        if (btnClientesHoje) {
            btnClientesHoje.addEventListener('click', () => this.mostrarClientesHoje());
        }

        if (btnFecharClientes) {
            btnFecharClientes.addEventListener('click', () => {
                document.getElementById('clientes-hoje-container').style.display = 'none';
            });
        }

        if (btnExportarClientes) {
            btnExportarClientes.addEventListener('click', () => this.exportarClientesHoje());
        }

        if (btnRemoverFiltro) {
            btnRemoverFiltro.addEventListener('click', () => this.limparFiltro());
        }

        // Destaca transações de hoje na tabela principal
        this.destacarTransacoesHoje();

        // Inicializa o rodapé
        this.atualizarRodapeTabela();

        console.log('Módulo financeiro inicializado com sucesso!');
    },

    /**
     * Carrega o resumo financeiro do localStorage ou recalcula se necessário
     */
    carregarResumoFinanceiro() {
        // Tenta carregar o resumo do localStorage
        const resumoSalvo = Storage.get('resumoFinanceiro', null);

        // Verifica se há um resumo salvo e se ele ainda é válido (do mesmo dia)
        const hoje = new Date().toLocaleDateString();

        if (resumoSalvo && resumoSalvo.ultimaAtualizacao === hoje) {
            this.resumoFinanceiro = resumoSalvo;
            console.log('Resumo financeiro carregado do localStorage');
        } else {
            // Se não existir resumo ou se for de outro dia, recalcula
            this.calcularResumoFinanceiro();
            console.log('Resumo financeiro recalculado');
        }
    },

    /**
     * Calcula o resumo financeiro com base em todas as transações
     */
    calcularResumoFinanceiro() {
        // Data atual
        const dataHoje = new Date().toLocaleDateString();
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Contagem de clientes (para calcular recorrentes)
        const clientesMap = new Map();

        // Valores iniciais
        let somaTotal = 0;
        let somaCartao = 0;
        let somaPix = 0;
        let somaDinheiro = 0;
        let somaTotalHoje = 0;
        let somaTotalMes = 0;
        let valorMaior = 0;

        // Processa todas as transações
        this.transacoes.forEach(transacao => {
            // Soma total
            somaTotal += transacao.valor;

            // Soma por método de pagamento
            switch (transacao.pagamento) {
                case 'cartao': somaCartao += transacao.valor; break;
                case 'pix': somaPix += transacao.valor; break;
                case 'dinheiro': somaDinheiro += transacao.valor; break;
            }

            // Maior valor
            if (transacao.valor > valorMaior) {
                valorMaior = transacao.valor;
            }

            // Soma de hoje
            if (transacao.data === dataHoje) {
                somaTotalHoje += transacao.valor;
            }

            // Verifica se é do mês atual
            const partes = transacao.data.split('/');
            if (partes.length === 3) {
                const transacaoData = new Date(partes[2], partes[1] - 1, partes[0]);
                if (transacaoData.getMonth() === mesAtual && transacaoData.getFullYear() === anoAtual) {
                    somaTotalMes += transacao.valor;
                }
            }

            // Contagem de clientes
            if (transacao.cliente) {
                const clienteNormalizado = transacao.cliente.toLowerCase().trim();
                const countAtual = clientesMap.get(clienteNormalizado) || 0;
                clientesMap.set(clienteNormalizado, countAtual + 1);
            }
        });

        // Cálculo de estatísticas
        const ticketMedio = this.transacoes.length > 0 ? somaTotal / this.transacoes.length : 0;
        const recorrentes = Array.from(clientesMap.values()).filter(count => count > 1).length;

        // Atualiza o objeto de resumo
        this.resumoFinanceiro = {
            total: somaTotal,
            totalHoje: somaTotalHoje,
            totalMes: somaTotalMes,
            cartao: somaCartao,
            pix: somaPix,
            dinheiro: somaDinheiro,
            ticketMedio: ticketMedio,
            maiorVenda: valorMaior,
            clientesRecorrentes: recorrentes,
            ultimaAtualizacao: dataHoje
        };

        // Salva no localStorage
        Storage.save('resumoFinanceiro', this.resumoFinanceiro);
    },

    /**
     * Adiciona uma nova transação financeira
     * @param {Object} transacao - Detalhes da transação
     */
    adicionarTransacao(transacao) {
        const dataAtual = new Date();
        const horaAtual = dataAtual.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Adiciona a transação com data, hora e ID
        const novaTransacao = {
            ...transacao,
            id: Date.now().toString(),
            data: dataAtual.toLocaleDateString(),
            hora: horaAtual
        };

        this.transacoes.push(novaTransacao);

        // Salva as transações
        Storage.save('transacoes', this.transacoes);

        // Atualiza o resumo financeiro
        this.atualizarResumoComNovaTransacao(novaTransacao);

        // Atualiza a interface se estiver na página financeira
        const tabelaFinanceiro = document.getElementById('tabelaFinanceiro');
        if (tabelaFinanceiro) {
            this.atualizarTabela();
            this.atualizarResumo();
        }

        return true;
    },

    /**
     * Atualiza o resumo financeiro quando uma nova transação é adicionada
     * @param {Object} transacao - Nova transação adicionada
     */
    atualizarResumoComNovaTransacao(transacao) {
        // Data atual
        const dataHoje = new Date().toLocaleDateString();
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Atualiza todos os totais
        this.resumoFinanceiro.total += transacao.valor;

        // Método de pagamento
        switch (transacao.pagamento) {
            case 'cartao': this.resumoFinanceiro.cartao += transacao.valor; break;
            case 'pix': this.resumoFinanceiro.pix += transacao.valor; break;
            case 'dinheiro': this.resumoFinanceiro.dinheiro += transacao.valor; break;
        }

        // Verifica se é maior venda
        if (transacao.valor > this.resumoFinanceiro.maiorVenda) {
            this.resumoFinanceiro.maiorVenda = transacao.valor;
        }

        // Atualiza total de hoje se for hoje
        if (transacao.data === dataHoje) {
            this.resumoFinanceiro.totalHoje += transacao.valor;
        }

        // Verifica se é do mês atual
        const partes = transacao.data.split('/');
        if (partes.length === 3) {
            const transacaoData = new Date(partes[2], partes[1] - 1, partes[0]);
            if (transacaoData.getMonth() === mesAtual && transacaoData.getFullYear() === anoAtual) {
                this.resumoFinanceiro.totalMes += transacao.valor;
            }
        }

        // Recalcula ticket médio
        this.resumoFinanceiro.ticketMedio = this.transacoes.length > 0 ?
            this.resumoFinanceiro.total / this.transacoes.length : 0;

        // Para clientes recorrentes, precisamos recalcular completamente
        // já que não sabemos se este cliente já existia
        this.calcularClientesRecorrentes();

        // Atualiza data da última atualização
        this.resumoFinanceiro.ultimaAtualizacao = dataHoje;

        // Salva no localStorage
        Storage.save('resumoFinanceiro', this.resumoFinanceiro);
    },

    /**
     * Calcula clientes recorrentes
     */
    calcularClientesRecorrentes() {
        const clientesMap = new Map();

        this.transacoes.forEach(transacao => {
            if (transacao.cliente) {
                const clienteNormalizado = transacao.cliente.toLowerCase().trim();
                const countAtual = clientesMap.get(clienteNormalizado) || 0;
                clientesMap.set(clienteNormalizado, countAtual + 1);
            }
        });

        this.resumoFinanceiro.clientesRecorrentes =
            Array.from(clientesMap.values()).filter(count => count > 1).length;
    },

    /**
     * Atualiza o resumo financeiro na interface
     */
    atualizarResumo() {
        // Elementos do DOM - Total e resumos principais
        const totalRecebido = document.getElementById('totalRecebido');
        const totalHoje = document.getElementById('totalHoje');
        const totalMes = document.getElementById('totalMes');

        // Elementos dos métodos de pagamento
        const totalCartao = document.getElementById('totalCartao');
        const totalPix = document.getElementById('totalPix');
        const totalDinheiro = document.getElementById('totalDinheiro');

        // Elementos das barras de progresso nos cards
        const barraProgressoCartao = document.getElementById('barra-progresso-cartao');
        const barraProgressoPix = document.getElementById('barra-progresso-pix');
        const barraProgressoDinheiro = document.getElementById('barra-progresso-dinheiro');

        // Elementos de porcentagem nos cards
        const porcentagemCartao = document.getElementById('porcentagem-cartao');
        const porcentagemPix = document.getElementById('porcentagem-pix');
        const porcentagemDinheiro = document.getElementById('porcentagem-dinheiro');

        // Elementos das estatísticas
        const mediaValor = document.getElementById('mediaValor');
        const maiorValor = document.getElementById('maiorValor');
        const clientesRecorrentes = document.getElementById('clientesRecorrentes');

        // Se não encontrar o elemento principal, sai da função
        if (!totalRecebido) return;

        // Obtém os valores do resumo
        const { total, totalHoje: hoje, totalMes: mes, cartao, pix, dinheiro,
            ticketMedio, maiorVenda, clientesRecorrentes: recorrentes } = this.resumoFinanceiro;

        // Porcentagens para gráficos
        const percCartao = total > 0 ? (cartao / total) * 100 : 0;
        const percPix = total > 0 ? (pix / total) * 100 : 0;
        const percDinheiro = total > 0 ? (dinheiro / total) * 100 : 0;

        // Atualiza os elementos na interface - valores principais
        totalRecebido.textContent = total.toFixed(2);
        if (totalHoje) totalHoje.textContent = hoje.toFixed(2);
        if (totalMes) totalMes.textContent = mes.toFixed(2);

        // Atualiza valores dos métodos de pagamento
        if (totalCartao) totalCartao.textContent = cartao.toFixed(2);
        if (totalPix) totalPix.textContent = pix.toFixed(2);
        if (totalDinheiro) totalDinheiro.textContent = dinheiro.toFixed(2);

        // Atualiza barras de progresso e porcentagens nos cards
        if (barraProgressoCartao) barraProgressoCartao.style.width = `${percCartao}%`;
        if (barraProgressoPix) barraProgressoPix.style.width = `${percPix}%`;
        if (barraProgressoDinheiro) barraProgressoDinheiro.style.width = `${percDinheiro}%`;

        if (porcentagemCartao) porcentagemCartao.textContent = `${percCartao.toFixed(1)}%`;
        if (porcentagemPix) porcentagemPix.textContent = `${percPix.toFixed(1)}%`;
        if (porcentagemDinheiro) porcentagemDinheiro.textContent = `${percDinheiro.toFixed(1)}%`;

        // Estatísticas adicionais
        if (mediaValor) mediaValor.textContent = ticketMedio.toFixed(2);
        if (maiorValor) maiorValor.textContent = maiorVenda.toFixed(2);
        if (clientesRecorrentes) clientesRecorrentes.textContent = recorrentes;

        // Atualiza gráficos horizontais
        this.atualizarGraficosPagamentos(cartao, pix, dinheiro, total);

        console.log('Resumo financeiro atualizado na interface');
    },

    /**
     * Atualiza os gráficos de pagamentos se existirem
     * @param {number} cartao - Total em cartão
     * @param {number} pix - Total em PIX 
     * @param {number} dinheiro - Total em dinheiro
     * @param {number} total - Valor total
     */
    atualizarGraficosPagamentos(cartao, pix, dinheiro, total) {
        // Calcula as porcentagens
        const percCartao = total > 0 ? (cartao / total) * 100 : 0;
        const percPix = total > 0 ? (pix / total) * 100 : 0;
        const percDinheiro = total > 0 ? (dinheiro / total) * 100 : 0;

        // Atualiza as barras do gráfico
        const barraCartao = document.getElementById('barra-cartao');
        const barraPix = document.getElementById('barra-pix');
        const barraDinheiro = document.getElementById('barra-dinheiro');

        if (barraCartao) {
            barraCartao.style.width = `${percCartao}%`;
            barraCartao.setAttribute('data-valor', `${percCartao.toFixed(1)}%`);
        }

        if (barraPix) {
            barraPix.style.width = `${percPix}%`;
            barraPix.setAttribute('data-valor', `${percPix.toFixed(1)}%`);
        }

        if (barraDinheiro) {
            barraDinheiro.style.width = `${percDinheiro}%`;
            barraDinheiro.setAttribute('data-valor', `${percDinheiro.toFixed(1)}%`);
        }

        // Atualiza textos de valores
        const valorCartao = document.getElementById('valor-cartao');
        const valorPix = document.getElementById('valor-pix');
        const valorDinheiro = document.getElementById('valor-dinheiro');

        if (valorCartao) valorCartao.textContent = `R$ ${cartao.toFixed(2)} (${percCartao.toFixed(1)}%)`;
        if (valorPix) valorPix.textContent = `R$ ${pix.toFixed(2)} (${percPix.toFixed(1)}%)`;
        if (valorDinheiro) valorDinheiro.textContent = `R$ ${dinheiro.toFixed(2)} (${percDinheiro.toFixed(1)}%)`;
    },

    /**
     * Atualiza a tabela financeira na interface
     * @param {Array} dados - Dados a serem exibidos (opcional)
     */
    atualizarTabela(dados = null) {
        const tbody = document.getElementById('tbody-financeiro');
        const totalTransacoes = document.getElementById('total-transacoes');
        const totalValor = document.getElementById('total-valor');
        const semResultados = document.getElementById('sem-resultados');
        const filtroAtivo = document.getElementById('filtro-ativo');

        if (!tbody) return;

        tbody.innerHTML = '';

        const transacoesParaExibir = dados || this.transacoes;
        const dataHoje = new Date().toLocaleDateString();

        // Verifica se há resultados
        if (transacoesParaExibir.length === 0) {
            if (semResultados) {
                semResultados.style.display = 'block';
            }

            if (totalTransacoes) totalTransacoes.textContent = '0';
            if (totalValor) totalValor.textContent = 'R$ 0,00';
            return;
        } else if (semResultados) {
            semResultados.style.display = 'none';
        }

        // Exibe indicador de filtro ativo
        if (dados && filtroAtivo) {
            const dataFiltro = document.getElementById('filtroData').value;
            if (dataFiltro) {
                const dataFormatada = this.formatarDataParaExibicao(dataFiltro);
                document.getElementById('filtro-descricao').textContent =
                    `Exibindo transações de ${dataFormatada}`;
                filtroAtivo.style.display = 'flex';
            }
        } else if (filtroAtivo) {
            filtroAtivo.style.display = 'none';
        }

        // Calcula totais
        let somaValor = 0;

        transacoesParaExibir.forEach(transacao => {
            somaValor += transacao.valor;

            const tr = document.createElement('tr');

            // Adiciona classe para destacar transações de hoje
            if (transacao.data === dataHoje) {
                tr.classList.add('hoje');
            }

            // Determina a classe CSS para o valor (alto, médio, baixo)
            let valorClass = '';
            if (transacao.valor >= 50) {
                valorClass = 'valor-alto';
            } else if (transacao.valor < 20) {
                valorClass = 'valor-baixo';
            }

            // Classe para o tipo de pagamento
            const pagamentoClass = `pagamento-${transacao.pagamento}`;

            tr.innerHTML = `
                <td class="cliente-col">${transacao.cliente}</td>
                <td class="telefone-col">${transacao.telefone || "Não informado"}</td>
                <td class="servico-col">${transacao.servico}</td>
                <td class="valor-col ${valorClass}">R$ ${transacao.valor.toFixed(2)}</td>
                <td class="pagamento-col">
                    <span class="pagamento-badge ${pagamentoClass}">
                        ${this.formatarTipoPagamento(transacao.pagamento)}
                    </span>
                </td>
                <td class="data-col">${transacao.data} ${transacao.hora ? `às ${transacao.hora}` : ''}</td>
            `;
            tbody.appendChild(tr);
        });

        // Atualiza o rodapé
        if (totalTransacoes) totalTransacoes.textContent = transacoesParaExibir.length;
        if (totalValor) totalValor.textContent = `R$ ${somaValor.toFixed(2)}`;
    },

    /**
     * Destaca transações de hoje na tabela
     */
    destacarTransacoesHoje() {
        const dataHoje = new Date().toLocaleDateString();
        const tbody = document.getElementById('tbody-financeiro');

        if (!tbody) return;

        const linhas = tbody.querySelectorAll('tr');
        linhas.forEach(linha => {
            const colunaData = linha.querySelector('td:last-child');
            if (colunaData && colunaData.textContent.includes(dataHoje)) {
                linha.classList.add('hoje');
            }
        });
    },

    /**
     * Mostra os clientes atendidos hoje
     */
    mostrarClientesHoje() {
        const dataHoje = new Date().toLocaleDateString();
        const clientesHoje = this.transacoes.filter(t => t.data === dataHoje);

        const container = document.getElementById('clientes-hoje-container');
        const tbody = document.getElementById('tbody-clientes-hoje');
        const totalClientes = document.getElementById('total-clientes');
        const valorTotalHoje = document.getElementById('valor-total-hoje');

        if (!container || !tbody) return;

        // Limpa a tabela
        tbody.innerHTML = '';

        // Se não houver clientes hoje
        if (clientesHoje.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum cliente atendido hoje</td></tr>`;
            totalClientes.textContent = '0';
            valorTotalHoje.textContent = '0.00';
        } else {
            // Ordena por hora (mais recente primeiro)
            clientesHoje.sort((a, b) => {
                if (!a.hora) return 1;
                if (!b.hora) return -1;
                return b.hora.localeCompare(a.hora);
            });

            // Adiciona cada cliente à tabela
            let valorTotal = 0;

            clientesHoje.forEach(cliente => {
                valorTotal += cliente.valor;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cliente.cliente}</td>
                    <td>${cliente.telefone || "Não informado"}</td>
                    <td>${cliente.servico}</td>
                    <td>R$ ${cliente.valor.toFixed(2)}</td>
                    <td>${this.formatarTipoPagamento(cliente.pagamento)}</td>
                    <td>${cliente.hora || "N/A"}</td>
                `;
                tbody.appendChild(tr);
            });

            // Atualiza os totais
            totalClientes.textContent = clientesHoje.length;
            valorTotalHoje.textContent = valorTotal.toFixed(2);
        }

        // Mostra o container
        container.style.display = 'block';
    },

    /**
     * Exporta a lista de clientes de hoje
     */
    exportarClientesHoje() {
        // Opção 1: Imprimir
        window.print();
    },

    /**
     * Filtra as transações por data
     */
    filtrarPorData() {
        const filtroData = document.getElementById('filtroData').value;

        if (!filtroData) {
            alert('Selecione uma data para filtrar.');
            return;
        }

        // Converte a data do filtro para o formato dd/mm/aaaa para comparação
        const dataFormatada = this.formatarDataParaBusca(filtroData);

        const transacoesFiltradas = this.transacoes.filter(transacao =>
            transacao.data === dataFormatada
        );

        this.atualizarTabela(transacoesFiltradas);
    },

    /**
     * Limpa o filtro de data e mostra todas as transações
     */
    limparFiltro() {
        document.getElementById('filtroData').value = '';
        document.getElementById('filtro-ativo').style.display = 'none';
        this.atualizarTabela();
    },

    /**
     * Atualiza o rodapé da tabela com totais
     */
    atualizarRodapeTabela() {
        const totalTransacoes = document.getElementById('total-transacoes');
        const totalValor = document.getElementById('total-valor');

        if (!totalTransacoes || !totalValor) return;

        let somaValor = 0;
        this.transacoes.forEach(transacao => {
            somaValor += transacao.valor;
        });

        totalTransacoes.textContent = this.transacoes.length;
        totalValor.textContent = `R$ ${somaValor.toFixed(2)}`;
    },

    /**
     * Formata o tipo de pagamento para exibição
     * @param {string} tipo - Tipo de pagamento
     * @returns {string} Tipo formatado
     */
    formatarTipoPagamento(tipo) {
        const formatos = {
            'cartao': 'Cartão',
            'pix': 'PIX',
            'dinheiro': 'Dinheiro'
        };

        return formatos[tipo] || tipo;
    },

    /**
     * Formata uma data no formato ISO para exibição
     * @param {string} dataISO - Data no formato ISO (yyyy-mm-dd)
     * @returns {string} Data formatada para exibição
     */
    formatarDataParaExibicao(dataISO) {
        if (!dataISO) return '';

        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    },

    /**
     * Formata uma data no formato ISO para busca
     * @param {string} dataISO - Data no formato ISO (yyyy-mm-dd)
     * @returns {string} Data formatada para busca
     */
    formatarDataParaBusca(dataISO) {
        if (!dataISO) return '';

        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }
};