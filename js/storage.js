/**
 * Módulo de armazenamento local
 */
const Storage = {
    /**
     * Salva dados no localStorage
     * @param {string} key - Chave para armazenamento
     * @param {any} data - Dados a serem salvos
     */
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    /**
     * Recupera dados do localStorage
     * @param {string} key - Chave para recuperação
     * @param {any} defaultValue - Valor padrão caso não exista dados
     * @returns {any} Dados recuperados ou valor padrão
     */
    get(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    },

    /**
     * Remove dados do localStorage
     * @param {string} key - Chave para remoção
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Limpa todos os dados do localStorage
     */
    clear() {
        localStorage.clear();
    }
};