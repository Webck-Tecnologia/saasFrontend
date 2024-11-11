export const getStatusLabel = (status) => {
    const statusMap = {
        'PENDING': 'Pendente',
        'PROCESSING': 'Em Andamento',
        'COMPLETED': 'Concluída',
        'COMPLETED_WITH_ERRORS': 'Concluída com Erros',
        'ERROR': 'Erro',
        'FAILED': 'Falhou',
        'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
};

export const formatPhoneNumber = (number) => {
    if (!number) return '';
    const cleaned = ('' + number).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return number;
}; 