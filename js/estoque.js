/**
 * Módulo para gerenciamento de estoque
 */
const Estoque = {
    produtos: [],

    /**
     * Inicializa o módulo de estoque
     */
    init() {
        console.log('Inicializando módulo de estoque');

        // Carregar produtos do localStorage
        this.carregarProdutos();

        // Configurar eventos dos botões
        this.configurarEventos();

        // Renderizar tabela inicial
        this.atualizarTabela();
    },

    /**
     * Carrega os produtos do armazenamento local
     */
    carregarProdutos() {
        try {
            const produtosArmazenados = localStorage.getItem('estoque');
            this.produtos = produtosArmazenados ? JSON.parse(produtosArmazenados) : [];
            console.log('Produtos carregados:', this.produtos.length);
        } catch (erro) {
            console.error('Erro ao carregar produtos:', erro);
            this.produtos = [];
        }
    },

    /**
     * Configura os eventos dos botões e formulários
     */
    configurarEventos() {
        const btnAdicionar = document.getElementById('btn-adicionar-produto');
        const formEstoque = document.getElementById('form-estoque');

        if (btnAdicionar) {
            console.log('Botão de adicionar produto encontrado');
            btnAdicionar.addEventListener('click', (e) => {
                e.preventDefault();
                this.adicionarProduto();
            });
        } else {
            console.error('Botão de adicionar produto não encontrado');
        }

        if (formEstoque) {
            formEstoque.addEventListener('submit', (e) => {
                e.preventDefault();
                this.adicionarProduto();
            });
        }
    },

    /**
     * Adiciona um produto ao estoque
     */
    adicionarProduto() {
        console.log('Tentando adicionar produto...');

        // Capturar o elemento do produto e depois obter seu valor
        const produtoInput = document.getElementById('produto');
        if (!produtoInput) {
            console.error('Elemento de input para produto não encontrado!');
            this.mostrarMensagem('Erro no formulário. Por favor, recarregue a página.', 'error');
            return;
        }

        // Capturar e processar todos os valores dos campos
        const nomeProduto = produtoInput.value ? produtoInput.value.trim() : '';
        const quantidade = parseInt(document.getElementById('quantidade')?.value || '0');
        const precoUnitario = parseFloat(document.getElementById('precoUnitario')?.value || '0');

        // Log detalhado para depuração
        console.log('Dados do produto para adição:', {
            nomeProduto,
            tipoNome: typeof nomeProduto,
            tamanhoNome: nomeProduto.length,
            valorOriginal: produtoInput.value,
            quantidade,
            precoUnitario
        });

        // Verificação mais robusta do nome do produto
        if (!nomeProduto || nomeProduto === '') {
            // this.mostrarMensagem('Por favor, informe o nome do produto.', 'error');
            // Focar no campo para facilitar a correção
            produtoInput.focus();
            return;
        }

        // Resto do código permanece o mesmo...
        if (isNaN(quantidade) || quantidade <= 0) {
            this.mostrarMensagem('Por favor, informe uma quantidade válida.', 'error');
            return;
        }

        // Verifica se o produto já existe
        const produtoExistente = this.produtos.findIndex(p =>
            p.nome.toLowerCase() === nomeProduto.toLowerCase());

        if (produtoExistente >= 0) {
            // Atualiza o produto existente
            this.produtos[produtoExistente].quantidade += quantidade;
            if (!isNaN(precoUnitario) && precoUnitario > 0) {
                this.produtos[produtoExistente].precoUnitario = precoUnitario;
            }
        } else {
            // Adiciona novo produto
            this.produtos.push({
                id: Date.now().toString(),
                nome: nomeProduto,
                quantidade: quantidade,
                precoUnitario: !isNaN(precoUnitario) && precoUnitario > 0 ? precoUnitario : 0
            });
        }

        // Salva no localStorage
        this.salvarProdutos();

        // Atualiza a tabela
        this.atualizarTabela();

        // Mostra mensagem de sucesso
        this.mostrarMensagem(`${quantidade} unidades de ${nomeProduto} adicionadas ao estoque.`, 'success');

        // Limpa os campos
        produtoInput.value = '';
        if (document.getElementById('quantidade')) {
            document.getElementById('quantidade').value = '';
        }
        if (document.getElementById('precoUnitario')) {
            document.getElementById('precoUnitario').value = '';
        }
    },

    /**
     * Salva os produtos no localStorage
     */
    salvarProdutos() {
        try {
            localStorage.setItem('estoque', JSON.stringify(this.produtos));
            console.log('Produtos salvos com sucesso');
        } catch (erro) {
            console.error('Erro ao salvar produtos:', erro);
        }
    },

    /**
     * Remove um produto do estoque
     * @param {string} id - ID do produto a ser removido
     */
    removerProduto(id) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            this.produtos = this.produtos.filter(produto => produto.id !== id);
            this.salvarProdutos();
            this.atualizarTabela();
        }
    },

    /**
     * Atualiza a tabela de estoque na interface
     */
    atualizarTabela() {
        const tbody = document.getElementById('tbody-estoque');
        if (!tbody) {
            console.error('Elemento tbody-estoque não encontrado');
            return;
        }

        tbody.innerHTML = '';

        if (this.produtos.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="3" class="empty-message">Nenhum produto no estoque</td>';
            tbody.appendChild(tr);
            return;
        }

        this.produtos.forEach((produto, index) => {
            const tr = document.createElement('tr');

            // Adicionando atributos data-label para responsividade em dispositivos móveis
            tr.innerHTML = `
                <td data-label="Produto">${produto.nome}</td>
                <td data-label="Quantidade">${produto.quantidade}</td>
                <td class="acoes">
                    <button class="btn-retirar-item" data-index="${index}">
                        <i class="fas fa-minus-circle"></i> Retirar
                    </button>
                    <button class="btn-remover" data-id="${produto.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Adicionar eventos aos botões
        this.configurarBotoesTabela();
    },

    /**
     * Configura os botões da tabela de estoque
     */
    configurarBotoesTabela() {
        // Configurar botões de remoção
        const botoesRemover = document.querySelectorAll('.btn-remover');
        botoesRemover.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.removerProduto(id);
            });
        });

        // Configurar botões de retirada
        const botoesRetirar = document.querySelectorAll('.btn-retirar-item');
        botoesRetirar.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                this.retirarItem(index);
            });
        });
    },

    /**
     * Retirar um item específico
     */
    retirarItem(index) {
        if (!this.produtos[index]) {
            this.mostrarMensagem('Item não encontrado!', 'error');
            return false;
        }

        if (this.produtos[index].quantidade <= 0) {
            this.mostrarMensagem('Este item já está com quantidade zero!', 'warning');
            return false;
        }

        // Reduzir a quantidade em 1
        this.produtos[index].quantidade -= 1;

        // Se a quantidade chegou a zero, perguntar se deseja remover o item
        if (this.produtos[index].quantidade === 0) {
            if (confirm(`O item "${this.produtos[index].nome}" agora está zerado. Deseja removê-lo do estoque?`)) {
                this.produtos.splice(index, 1);
            }
        }

        // Salvar e atualizar
        this.salvarProdutos();
        this.atualizarTabela();

        // Mostrar mensagem de sucesso
        this.mostrarMensagem('Item retirado com sucesso!', 'success');
        return true;
    },

    /**
     * Mostra uma mensagem na interface
     */
    mostrarMensagem(texto, tipo) {
        // Verificar se existe um elemento para mensagens
        let mensagemDiv = document.getElementById('mensagem-alerta');

        // Se não existir, criar um
        if (!mensagemDiv) {
            mensagemDiv = document.createElement('div');
            mensagemDiv.id = 'mensagem-alerta';
            const section = document.querySelector('.section');
            if (section) {
                section.appendChild(mensagemDiv);
            } else {
                document.body.appendChild(mensagemDiv);
            }
        }

        // Definir a classe baseada no tipo
        mensagemDiv.className = `alerta ${tipo}`;
        mensagemDiv.textContent = texto;

        // Mostrar a mensagem
        mensagemDiv.style.display = 'block';

        // Esconder após 3 segundos
        setTimeout(() => {
            mensagemDiv.style.display = 'none';
        }, 3000);
    }
};

// Inicializar o módulo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    Estoque.init();
});