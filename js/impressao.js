/**
 * Script para impressão do histórico financeiro com opção de exportar para PDF
 */

// Definir a função no escopo global primeiro
let abrirNovaJanelaImpressao;

document.addEventListener('DOMContentLoaded', function () {
    console.log('Script de impressão carregado');

    // Identificar o botão de impressão
    const btnImprimirHistorico = document.getElementById('btn-imprimir-historico');

    if (btnImprimirHistorico) {
        console.log('Botão de impressão encontrado');

        // Adicionar evento de clique
        btnImprimirHistorico.addEventListener('click', function () {
            console.log('Botão de impressão clicado');
            abrirNovaJanelaImpressao();
        });
    } else {
        console.error('Botão de impressão não encontrado!');
    }

    // Função para converter strings de data e hora para um objeto Date
    function converterDataHoraParaDate(dataStr, horaStr) {
        if (!dataStr) return new Date(0);

        const partesData = dataStr.split('/');
        if (partesData.length !== 3) return new Date(0);

        const dia = parseInt(partesData[0], 10);
        const mes = parseInt(partesData[1], 10) - 1; // Meses em JS são 0-11
        const ano = parseInt(partesData[2], 10);

        // Configurar hora se disponível
        let hora = 0, minuto = 0;
        if (horaStr) {
            const partesHora = horaStr.split(':');
            if (partesHora.length >= 2) {
                hora = parseInt(partesHora[0], 10);
                minuto = parseInt(partesHora[1], 10);
            }
        }

        return new Date(ano, mes, dia, hora, minuto, 0);
    }

    // Função para abrir janela popup e imprimir
    abrirNovaJanelaImpressao = function () {
        // Verificar se temos transações para imprimir
        if (typeof Financeiro === 'undefined' || !Financeiro.transacoes || Financeiro.transacoes.length === 0) {
            alert('Não há transações para imprimir.');
            return;
        }

        console.log('Preparando impressão de', Financeiro.transacoes.length, 'transações');

        // Ordenar transações por data (mais recentes primeiro)
        const transacoesOrdenadas = [...Financeiro.transacoes].sort((a, b) => {
            // Converter datas para objetos Date
            const dataA = converterDataHoraParaDate(a.data, a.hora);
            const dataB = converterDataHoraParaDate(b.data, b.hora);
            return dataB - dataA;
        });

        // Calcular valor total
        let valorTotal = 0;
        transacoesOrdenadas.forEach(transacao => {
            valorTotal += transacao.valor;
        });

        // Criar o conteúdo HTML com as linhas da tabela
        const agora = new Date();
        const dataFormatada = agora.toLocaleString('pt-BR');

        // Criar as linhas da tabela
        let linhasTabela = '';
        transacoesOrdenadas.forEach(transacao => {
            let metodoPagamento = '-';
            switch (transacao.pagamento) {
                case 'cartao': metodoPagamento = 'Cartão'; break;
                case 'pix': metodoPagamento = 'PIX'; break;
                case 'dinheiro': metodoPagamento = 'Dinheiro'; break;
                default: metodoPagamento = transacao.pagamento || '-';
            }

            linhasTabela += `
                <tr>
                    <td>${transacao.cliente || '-'}</td>
                    <td>${transacao.telefone || '-'}</td>
                    <td>${transacao.servico || '-'}</td>
                    <td style="text-align: right;">R$ ${transacao.valor.toFixed(2)}</td>
                    <td style="text-align: center;">${metodoPagamento}</td>
                    <td style="text-align: center;">${transacao.data || '-'}</td>
                    <td style="text-align: center;">${transacao.hora || '-'}</td>
                </tr>
            `;
        });

        // Criar o HTML completo com estilos inline (para máxima compatibilidade)
        let htmlCompleto = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Jorge Lavanderia - Relatório Financeiro - ${agora.toLocaleDateString('pt-BR')}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.5;
        }
        h1, h2 {
            text-align: center;
            color: #333;
        }
        .data-impressao {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        /* Estilos melhorados para a tabela */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            table-layout: fixed; /* Ajuda a manter colunas uniformes */
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center; /* Centralizar cabeçalhos */
            padding: 10px 8px;
            border: 1px solid #ddd;
        }
        td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left; /* Alinhar texto à esquerda */
            vertical-align: middle; /* Centralizar verticalmente */
        }
        /* Larguras específicas para colunas */
        th:nth-child(1), td:nth-child(1) { width: 18%; } /* Cliente */
        th:nth-child(2), td:nth-child(2) { width: 12%; } /* Telefone */
        th:nth-child(3), td:nth-child(3) { width: 20%; } /* Serviço */
        th:nth-child(4), td:nth-child(4) { width: 10%; text-align: right; } /* Valor - alinhado à direita */
        th:nth-child(5), td:nth-child(5) { width: 12%; text-align: center; } /* Pagamento - centralizado */
        th:nth-child(6), td:nth-child(6) { width: 12%; text-align: center; } /* Data - centralizado */
        th:nth-child(7), td:nth-child(7) { width: 10%; text-align: center; } /* Hora - centralizado */
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .resumo {
            margin: 25px 0;
            padding: 15px;
            background-color: #f2f2f2;
            border-radius: 5px;
            font-weight: bold;
        }
        .rodape {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .botoes {
            text-align: center;
            margin: 20px 0;
        }
        .botao {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 5px;
        }
        .botao:hover {
            background-color: #2980b9;
        }
        @media print {
            .botoes, .instrucoes {
                display: none;
            }
            /* Garantir que a tabela caiba na página impressa */
            table {
                page-break-inside: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            thead {
                display: table-header-group;
            }
        }
        .instrucoes {
            margin: 20px auto;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 3px solid #3498db;
            max-width: 600px;
        }
        .instrucoes h3 {
            margin-top: 0;
            color: #3498db;
        }
    </style>
</head>
<body>
    <h1>Jorge Lavanderia</h1>
    <h2>Histórico Financeiro Completo</h2>
    <p class="data-impressao">Data de impressão: ${dataFormatada}</p>
  
    
    <table>
        <thead>
            <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Serviço</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Data</th>
                <th>Hora</th>
            </tr>
        </thead>
        <tbody>
            ${linhasTabela}
        </tbody>
    </table>
    
    <div class="resumo">
        <p>Total de transações: ${transacoesOrdenadas.length}</p>
        <p>Valor total: R$ ${valorTotal.toFixed(2)}</p>
    </div>
    
    <div class="rodape">
        <p>Jorge Lavanderia - Limpeza com qualidade</p>
        <p>Contato: (11) 99999-9999 | contato@jorgelavanderia.com.br</p>
    </div>
    
    <script>
        (function() {
            // Configurar botões IMEDIATAMENTE
            document.getElementById('botaoImprimir').onclick = function() {
                window.print();
            };
            
            document.getElementById('botaoVoltar').onclick = function() {
                window.close();
            };
            
            // Adicionar atalho de teclado "P" para imprimir
            document.addEventListener('keydown', function(e) {
                if (e.key === 'p' || e.key === 'P') {
                    window.print();
                }
            });
            
            // Repetir configuração nos eventos de carregamento como backup
            window.addEventListener('load', function() {
                document.getElementById('botaoImprimir').onclick = function() {
                    window.print();
                };
            });
            
            // Backup para o botão de impressão como link direto
            if (!document.getElementById('botaoImprimirLink')) {
                var link = document.createElement('a');
                link.id = 'botaoImprimirLink';
                link.href = 'javascript:void(0);';
                link.innerText = 'Imprimir (Link Alternativo)';
                link.style.display = 'block';
                link.style.textAlign = 'center';
                link.style.marginTop = '10px';
                link.onclick = function() {
                    window.print();
                    return false;
                };
                document.querySelector('.botoes').appendChild(link);
            }
        })();
    </script>
</body>
</html>
        `;

        // Abrir nova janela com o documento HTML
        let janela = window.open('', '_blank', 'width=1000,height=700');

        if (janela) {
            janela.document.open();
            janela.document.write(htmlCompleto);
            janela.document.close();

            // Verificar se a janela foi aberta corretamente
            if (!janela.document.body || janela.document.body.innerHTML === '') {
                alert('Erro ao abrir janela de impressão. Verifique se o bloqueador de pop-ups está ativo.');
                return;
            }

            // Tentar configurar o botão novamente após o carregamento completo
            janela.onload = function () {
                try {
                    if (janela.document && janela.document.getElementById('botaoImprimir')) {
                        janela.document.getElementById('botaoImprimir').onclick = function () {
                            janela.print();
                        };
                    }
                } catch (err) {
                    console.error('Erro ao configurar botão na nova janela:', err);
                }
            };

            console.log('Janela de impressão aberta com sucesso');
        } else {
            // Se falhar ao abrir a janela, oferecer uma alternativa na mesma página
            console.error('Falha ao abrir janela de impressão. Bloqueador de pop-ups ativo?');
            alert('Não foi possível abrir a janela de impressão. Seu navegador pode estar bloqueando pop-ups.');
        }
    };
});

// Exportar a versão clássica do prepararImpressaoHistorico para compatibilidade
window.prepararImpressaoHistorico = function (isExportPDF) {
    if (typeof abrirNovaJanelaImpressao === 'function') {
        abrirNovaJanelaImpressao();
    } else {
        console.error('Função abrirNovaJanelaImpressao não está definida ou não está pronta');
        alert('Erro ao preparar a impressão. Tente novamente em alguns instantes.');
    }
};

// Garantir que a função esteja disponível globalmente
window.abrirNovaJanelaImpressao = abrirNovaJanelaImpressao;