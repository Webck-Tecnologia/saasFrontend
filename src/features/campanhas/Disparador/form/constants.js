import { Info, Upload, MessageSquare, Calendar, CheckCircle } from 'lucide-react'

export const steps = [
  { title: "Informações Básicas", icon: Info },
  { title: "Importação de Contatos", icon: Upload },
  { title: "Configuração de Mensagens", icon: MessageSquare },
  { title: "Agendamento", icon: Calendar },
  { title: "Revisão e Confirmação", icon: CheckCircle }
]

export const fileTypes = {
  'mensagem_imagem': {
    accept: '.png,.jpg,.jpeg,.gif,.webp',
    description: 'Imagens (PNG, JPG, JPEG, GIF, WEBP)'
  },
  'mensagem_documento': {
    accept: '.pdf,.zip,.xlsx,.docx',
    description: 'Documentos (PDF, ZIP, XLSX, DOCX)'
  },
  'audio': {
    accept: '.mp3,.wav,.ogg',
    description: 'Áudio (MP3, WAV, OGG)'
  }
}
