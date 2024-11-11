import React from 'react';
import { Clock } from "lucide-react";

export const CountdownTimer = ({ countdown }) => {
    if (!countdown || countdown <= 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Enviando mensagem...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Próximo envio em: {countdown}s</span>
        </div>
    );
}; 