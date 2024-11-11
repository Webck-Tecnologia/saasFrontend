socket.on('campaignStarted', (data) => {
    console.log('Campanha iniciada:', data);
    // Atualizar UI
});

socket.on('messageSuccess', (data) => {
    console.log('Mensagem enviada:', data);
    // Atualizar contador de sucesso
});

socket.on('campaignProgress', (data) => {
    console.log('Progresso:', data);
    // Atualizar barra de progresso
});

// ... e assim por diante 