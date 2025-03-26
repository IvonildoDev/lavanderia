/**
 * Arquivo principal que inicializa a aplicação
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verifica qual página está sendo carregada
    const currentPage = window.location.pathname;

    // Inicialização específica para a página inicial
    if (currentPage.includes('index.html') || currentPage.endsWith('/lavanderia/')) {
        console.log('Página inicial carregada');
    }

    console.log('Sistema de Lavanderia inicializado com sucesso!');

    // Funcionalidade de impressão do histórico financeiro
    const btnImprimir = document.getElementById('btn-imprimir-historico');

    if (btnImprimir) {
        btnImprimir.addEventListener('click', function () {
            prepararImpressao();
        });
    }

    // Função para preparar o conteúdo a ser impresso
    function prepararImpressao() {
        // Verifica se há transações
        if (!Financeiro || !Financeiro.transacoes || Financeiro.transacoes.length === 0) {
            alert('Não há transações para imprimir.');
            return;
        }

        // Atualiza a data de impressão
        const dataImpressao = document.getElementById('data-impressao');
        if (dataImpressao) {
            const dataHora = new Date();
            dataImpressao.textContent = dataHora.toLocaleString('pt-BR');
        }

        // Limpa a tabela de impressão
        const tbodyImpressao = document.getElementById('tbody-impressao');
        if (!tbodyImpressao) return;

        tbodyImpressao.innerHTML = '';

        // Valor total para cálculo
        let valorTotal = 0;

        // Ordena as transações por data, mais recentes primeiro
        const transacoesOrdenadas = [...Financeiro.transacoes].sort((a, b) => {
            const dataA = converterParaData(a.data, a.hora);
            const dataB = converterParaData(b.data, b.hora);
            return dataB - dataA; // Ordem decrescente (mais recentes primeiro)
        });

        // Preenche a tabela de impressão
        transacoesOrdenadas.forEach(transacao => {
            // Adiciona ao valor total
            valorTotal += transacao.valor;

            // Cria a linha da tabela
            const row = document.createElement('tr');

            // Cliente
            const tdCliente = document.createElement('td');
            tdCliente.textContent = transacao.cliente || '-';
            row.appendChild(tdCliente);

            // Telefone
            const tdTelefone = document.createElement('td');
            tdTelefone.textContent = transacao.telefone || '-';
            row.appendChild(tdTelefone);

            // Serviço
            const tdServico = document.createElement('td');
            tdServico.textContent = transacao.servico || '-';
            row.appendChild(tdServico);

            // Valor
            const tdValor = document.createElement('td');
            tdValor.textContent = `R$ ${transacao.valor.toFixed(2)}`;
            row.appendChild(tdValor);

            // Método de pagamento
            const tdPagamento = document.createElement('td');
            let metodoPagamento = '-';
            switch (transacao.pagamento) {
                case 'cartao': metodoPagamento = 'Cartão'; break;
                case 'pix': metodoPagamento = 'PIX'; break;
                case 'dinheiro': metodoPagamento = 'Dinheiro'; break;
            }
            tdPagamento.textContent = metodoPagamento;
            row.appendChild(tdPagamento);

            // Data
            const tdData = document.createElement('td');
            tdData.textContent = transacao.data || '-';
            row.appendChild(tdData);

            // Hora
            const tdHora = document.createElement('td');
            tdHora.textContent = transacao.hora || '-';
            row.appendChild(tdHora);

            // Adiciona a linha à tabela
            tbodyImpressao.appendChild(row);
        });

        // Atualiza os totais
        const totalTransacoesImpressao = document.getElementById('total-transacoes-impressao');
        if (totalTransacoesImpressao) {
            totalTransacoesImpressao.textContent = transacoesOrdenadas.length;
        }

        const valorTotalImpressao = document.getElementById('valor-total-impressao');
        if (valorTotalImpressao) {
            valorTotalImpressao.textContent = valorTotal.toFixed(2);
        }

        // Exibe o conteúdo para impressão
        const conteudoImpressao = document.getElementById('conteudo-impressao');
        if (conteudoImpressao) {
            // Mostra o conteúdo antes de imprimir
            conteudoImpressao.style.display = 'block';

            // Abre a janela de impressão
            setTimeout(() => {
                window.print();
                // Oculta o conteúdo novamente após a impressão
                setTimeout(() => {
                    conteudoImpressao.style.display = 'none';
                }, 500);
            }, 300);
        }
    }

    // Função auxiliar para converter data e hora em objeto Date
    function converterParaData(dataStr, horaStr) {
        if (!dataStr) return new Date(0); // Data mínima se não houver data

        const partes = dataStr.split('/');
        if (partes.length !== 3) return new Date(0);

        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Mês em JavaScript é 0-11
        const ano = parseInt(partes[2], 10);

        // Processa a hora se disponível
        let hora = 0, minuto = 0;
        if (horaStr) {
            const partesHora = horaStr.split(':');
            if (partesHora.length >= 2) {
                hora = parseInt(partesHora[0], 10);
                minuto = parseInt(partesHora[1], 10);
            }
        }

        return new Date(ano, mes, dia, hora, minuto);
    }
});