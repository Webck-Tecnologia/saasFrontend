import React, { useEffect, forwardRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DynamicEditor = forwardRef(({ content, onContentChange }, ref) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Atualiza os estados quando a seleção muda
      setIsBold(editor.isActive('bold'));
      setIsItalic(editor.isActive('italic'));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
        style: 'overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; line-height: 24px; min-height: 96px; max-height: 96px; overflow-y: auto; padding: 8px 12px;',
      },
      handleDrop: (view, event, slice, moved) => {
        const text = event.dataTransfer.getData('text/plain');
        if (text.startsWith('{{')) {
          const { tr } = view.state;
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          if (pos) {
            tr.insertText(text, pos);
            view.dispatch(tr);
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (ref) {
      ref.current = editor;
    }
  }, [editor, ref]);

  const toggleFormat = (format) => {
    if (!editor) return;
    
    editor.chain().focus()[format]().run();
    
    // Atualiza o estado imediatamente após o clique
    if (format === 'toggleBold') {
      setIsBold(editor.isActive('bold'));
    } else if (format === 'toggleItalic') {
      setIsItalic(editor.isActive('italic'));
    }
  };

  const addEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji.native).run();
    setShowEmojiPicker(false);
  };

  // Função para resetar os estados quando trocar de aba
  const resetFormatting = () => {
    if (editor) {
      editor.chain().focus().unsetBold().unsetItalic().run();
    }
    setIsBold(false);
    setIsItalic(false);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <div className="flex-grow relative border rounded-lg">
        <EditorContent editor={editor} />
        {!editor?.getText() && (
          <span className="absolute top-2 left-3 text-gray-400 pointer-events-none">
            Digite uma mensagem
          </span>
        )}
        {showEmojiPicker && (
          <div className="absolute z-10">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
      <div className="flex space-x-2 mt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => toggleFormat('toggleBold')}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-300 cursor-pointer transition-colors ${
                isBold ? 'bg-blue-200 hover:bg-blue-300' : 'bg-gray-200'
              }`}
            >
              <Bold size={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Negrito</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => toggleFormat('toggleItalic')}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-300 cursor-pointer transition-colors ${
                isItalic ? 'bg-blue-200 hover:bg-blue-300' : 'bg-gray-200'
              }`}
            >
              <Italic size={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Itálico</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-300 cursor-pointer transition-colors ${
                showEmojiPicker ? 'bg-blue-200 hover:bg-blue-300' : 'bg-gray-200'
              }`}
            >
              <Smile size={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Emojis</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
});

export default DynamicEditor;
