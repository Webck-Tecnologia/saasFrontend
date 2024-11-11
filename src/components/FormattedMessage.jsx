import DOMPurify from 'dompurify';
import React from 'react';

const FormattedMessage = ({ content }) => {
  const formatText = (text) => {
    // Substitui *texto* por <strong>texto</strong> (negrito)
    text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Substitui _texto_ por <em>texto</em> (itálico)
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Substitui ~texto~ por <s>texto</s> (tachado)
    text = text.replace(/~(.*?)~/g, '<s>$1</s>');
    
    // Substitui quebras de linha por <br>
    text = text.replace(/\n/g, '<br>');

    return text;
  };

  const sanitizedHTML = DOMPurify.sanitize(formatText(content));

  return (
    <span dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
  );
};

export default FormattedMessage;
