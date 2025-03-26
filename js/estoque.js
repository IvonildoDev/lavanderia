/**
 * Módulo para gerenciamento de estoque
 */
const Estoque = {
    produtos: [],

    /**
     * Inicializa o módulo de estoque
     */
    init() {
        this.produtos = Storage.get('produtos', []);
        this.atualizarTabela();

        const btnAdicionar = document.getElementById('btn-adicionar-produto');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', () => this.adicionarProduto());
        }
    },

    /**
     * Adiciona um produto ao estoque
     */
    adicionarProduto() {
        const nomeProduto = document.getElementById('produto').value.trim();
        const quantidade = parseInt(document.getElementById('quantidade').value);

        if (!nomeProduto || isNaN(quantidade) || quantidade <= 0) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        // Verifica se o produto já existe
        const produtoExistente = this.produtos.findIndex(p => p.nome.toLowerCase() === nomeProduto.toLowerCase());

        if (produtoExistente >= 0) {
            this.produtos[produtoExistente].quantidade += quantidade;
        } else {
            this.produtos.push({
                id: Date.now().toString(),
                nome: nomeProduto,
                quantidade: quantidade
            });
        }

        Storage.save('produtos', this.produtos);
        this.atualizarTabela();

        // Limpa os campos
        document.getElementById('produto').value = '';
        document.getElementById('quantidade').value = '';
    },

    /**
     * Remove um produto do estoque
     * @param {string} id - ID do produto a ser removido
     */
    removerProduto(id) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            this.produtos = this.produtos.filter(produto => produto.id !== id);
            Storage.save('produtos', this.produtos);
            this.atualizarTabela();
        }
    },

    /**
     * Atualiza a tabela de estoque na interface
     */
    atualizarTabela() {
        const tbody = document.getElementById('tbody-estoque');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>
                    <button class="btn-danger" onclick="Estoque.removerProduto('${produto.id}')">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
};