import React from 'react';
import ReactMarkdown from 'react-markdown';

const MessageDisplay = ({ message }) => {
    return (
        <div className="message">
            <ReactMarkdown>{message}</ReactMarkdown>
        </div>
    );
};

export default MessageDisplay;
