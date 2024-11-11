export default function StepReview({ formData }) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Revisão da Campanha</h3>
        <p><strong>Nome:</strong> {formData.nome}</p>
        <p><strong>Tipo:</strong> {formData.tipo}</p>
        <p><strong>Mensagens:</strong> {formData.mensagens.length}</p>
        <p><strong>Início Imediato:</strong> {formData.inicioImediato ? 'Sim' : 'Não'}</p>
        {!formData.inicioImediato && <p><strong>Data de Início:</strong> {formData.dataInicio}</p>}
        <p><strong>Intervalo:</strong> {formData.intervalo} segundos</p>
        <p><strong>Arquivo CSV:</strong> {formData.csvFile ? formData.csvFile.name : 'Não selecionado'}</p>
      </div>
    )
  }