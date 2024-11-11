import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Bold, Italic, Smile } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useAuthContext } from '@/context/AuthContext';
import DynamicEditor from './DynamicEditor';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";

export default function StepMessages({ formData, handleInputChange }) {
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const editorRefs = useRef({}); // Armazena referências separadas para cada aba
  const [emojiPickers, setEmojiPickers] = useState({});

  // Garantir que temos acesso às variáveis do CSV
  const availableVariables = formData.csvVariables || [];

  // Funções de Drag and Drop
  const handleDragStart = (e, variable) => {
    e.dataTransfer.setData('text/plain', `{{${variable.toLowerCase()}}}`);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleEditorDrop = (editor, event) => {
    event.preventDefault();
    const variable = event.dataTransfer.getData('text/plain');
    
    const view = editor.view;
    const pos = view.posAtCoords({ 
      left: event.clientX, 
      top: event.clientY 
    });

    if (pos) {
      editor.commands.insertContentAt(pos.pos, variable);
    }
  };

  const handleMensagemChange = (index, field, value) => {
    const novasMensagens = [...formData.mensagens];
    if (field === 'principal') {
      novasMensagens[index].principal = value;
    } else {
      const alternativaIndex = field === 'alternativa1' ? 0 : 1;
      novasMensagens[index].alternativas[alternativaIndex] = value;
    }
    handleInputChange('mensagens', novasMensagens);
  };

  const handleAddMensagem = () => {
    if (formData.mensagens.length < 3) {
      handleInputChange('mensagens', [...formData.mensagens, { principal: '', alternativas: ['', ''] }]);
    }
  };

  const handleRemoveMensagem = (index) => {
    if (formData.mensagens.length > 1 && index !== 0) {
      const novasMensagens = formData.mensagens.filter((_, i) => i !== index);
      handleInputChange('mensagens', novasMensagens);
      if (activeMessageIndex >= index) {
        setActiveMessageIndex(prev => prev - 1);
      }
    }
  };

  const toggleEmojiPicker = (index, field) => {
    setEmojiPickers(prev => ({ ...prev, [`${index}-${field}`]: !prev[`${index}-${field}`] }));
  };

  const addEmoji = (emoji, index, field) => {
    const editorInstance = editorRefs.current[`${index}-${field}`];
    if (editorInstance) {
      editorInstance.commands.insertContent(emoji.native);
    } else {
      console.log("Editor não encontrado para o índice:", index, "e aba:", field);
    }
  };

  const setEditorRef = (el, index, field) => {
    if (el) {
      editorRefs.current[`${index}-${field}`] = el;
    }
  };

  const formatContent = (content) => {
    if (!content) return '';
    
    return content
      .replace(/<p><\/p>/g, '<br>')
      .replace(/<p>\s*<\/p>/g, '<br>')
      .replace(/(<br\s*\/?>\s*){2,}/g, '<br>')
      .trim();
  };

  // Use ao enviar o conteúdo
  const messages = formData.mensagens.map(msg => ({
    type: "TEXT",
    content: formatContent(msg.principal),
    variations: msg.alternativas.filter(alt => alt.trim() !== '').map(formatContent)
  }));

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {availableVariables.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Variáveis disponíveis:</h4>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, variable)}
                  onDragEnd={handleDragEnd}
                  className="px-3 py-1.5 bg-white rounded-md text-sm cursor-move 
                           border border-gray-200 hover:bg-gray-50 
                           active:bg-gray-100 transition-colors
                           shadow-sm hover:shadow
                           draggable-variable"
                >
                  {variable}
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.mensagens.map((mensagem, index) => (
          <div key={index} className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Mensagem {index + 1}</h3>
              {index !== 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={() => handleRemoveMensagem(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deletar mensagem</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Tabs defaultValue="principal">
              <TabsList>
                <TabsTrigger value="principal">Principal</TabsTrigger>
                <TabsTrigger value="alternativa1">Alternativa 1</TabsTrigger>
                <TabsTrigger value="alternativa2">Alternativa 2</TabsTrigger>
              </TabsList>
              {['principal', 'alternativa1', 'alternativa2'].map((field) => (
                <TabsContent value={field} key={field}>
                  <DynamicEditor
                    ref={(el) => setEditorRef(el, index, field)}
                    content={field === 'principal' ? mensagem.principal : mensagem.alternativas[field === 'alternativa1' ? 0 : 1]}
                    onContentChange={(value) => handleMensagemChange(index, field, value)}
                    editorProps={{
                      handleDrop: (view, event) => handleEditorDrop(view.editor, event),
                      handleDragOver: (e) => e.preventDefault(),
                    }}
                  />
                  {emojiPickers[`${index}-${field}`] && (
                    <Picker data={data} onEmojiSelect={(emoji) => addEmoji(emoji, index, field)} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ))}
        <Button type="button" onClick={handleAddMensagem} variant="outline" className="w-full">
          <Plus className="mr-2" /> Adicionar Mensagem
        </Button>
      </div>
    </TooltipProvider>
  );
}
