import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStatusLabel, formatPhoneNumber } from './utils';

export const CampanhaDetailsModal = ({
    open,
    onOpenChange,
    campaign,
    status
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-';
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isValid(date) ? format(date, "HH:mm:ss", { locale: ptBR }) : '-';
    };

    const messages = Array.isArray(campaign?.messages) ? campaign.messages : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{campaign.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Status:</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                                campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                                campaign.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {getStatusLabel(campaign.status)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Criada em:</span>
                            <span>{formatDate(campaign.createdAt)}</span>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Histórico de Mensagens</h3>
                        <ScrollArea className="h-[400px] pr-4">
                            {messages.length > 0 ? (
                                <div className="space-y-2">
                                    {messages.map((message, index) => (
                                        <div 
                                            key={message.id || index} 
                                            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                                        >
                                            <div className="flex gap-4">
                                                <span className="text-muted-foreground">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span>{formatPhoneNumber(message.to)}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className={`text-sm px-2 py-1 rounded ${
                                                    message.status === 'SENT' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {message.status === 'SENT' ? 'Enviada' : 'Falha'}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {formatTime(message.sentAt || message.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    Nenhuma mensagem encontrada
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
