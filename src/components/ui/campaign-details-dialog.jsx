import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useSearchMessagesCampaign } from '@/hooks/useSearchMessagesCampaign';
import { Loader2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

const getStatusLabel = (status) => {
    const statusMap = {
        'SENT': 'Enviado',
        'FAILED': 'Falhou',
        'PENDING': 'Pendente',
        'ERROR': 'Erro',
        'COMPLETED': 'Concluída',
        'PROCESSING': 'Em Andamento',
        'COMPLETED_WITH_ERRORS': 'Concluída com Erros',
        'CANCELLED': 'Cancelada',
        'SCHEDULED': 'Agendada',
        'DRAFT': 'Rascunho'
    };
    return statusMap[status] || status;
};

const formatPhoneNumber = (phone) => {
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Verifica se tem o código do país (55)
    const hasCountryCode = numbers.length > 11;
    
    // Remove o código do país se existir
    const phoneWithoutCountry = hasCountryCode ? numbers.slice(2) : numbers;
    
    // Formata o número
    if (phoneWithoutCountry.length === 11) {
        // Celular com 9 dígito
        return `(${phoneWithoutCountry.slice(0,2)}) ${phoneWithoutCountry.slice(2,7)}-${phoneWithoutCountry.slice(7)}`;
    } else if (phoneWithoutCountry.length === 10) {
        // Telefone fixo ou celular sem 9
        return `(${phoneWithoutCountry.slice(0,2)}) ${phoneWithoutCountry.slice(2,6)}-${phoneWithoutCountry.slice(6)}`;
    }
    
    // Retorna o número original se não conseguir formatar
    return phone;
};

export function CampaignDetailsDialog({ open, onOpenChange, campaign, status }) {
    const { messages, total, isLoading, fetchMessages } = useSearchMessagesCampaign();

    useEffect(() => {
        if (open && campaign) {
            fetchMessages(campaign.workspaceId, campaign.id);
            console.log('Fetching messages for campaign:', campaign.id);
            console.log('Workspace ID:', campaign.workspaceId);
        }
    }, [open, campaign]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Detalhes da Campanha</DialogTitle>
                    <DialogDescription>
                        Histórico de mensagens e informações da campanha
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Informações básicas da campanha */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Informações Gerais</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Nome:</div>
                            <div>{campaign?.name}</div>
                            <div>Status:</div>
                            <div>{getStatusLabel(campaign?.status)}</div>
                            <div>Criada em:</div>
                            <div>
                                {campaign?.createdAt && format(new Date(campaign.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </div>
                        </div>
                    </div>

                    {/* Histórico de Mensagens */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">
                            Histórico de Mensagens ({total} mensagens)
                        </h3>
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <ScrollArea className="h-[300px] w-full rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.length > 0 ? (
                                            messages.map((message) => (
                                                <TableRow key={message.id}>
                                                    <TableCell>
                                                        {formatPhoneNumber(message.contact)}
                                                    </TableCell>
                                                    <TableCell>{message.metadata.variables.nome}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            message.status === 'SENT' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {getStatusLabel(message.status)}
                                                            {message.error && (
                                                                <span className="ml-1">
                                                                    ({message.error})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(
                                                            new Date(message.sentAt), 
                                                            "dd/MM/yyyy HH:mm", 
                                                            { locale: ptBR }
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell 
                                                    colSpan={4} 
                                                    className="text-center text-muted-foreground"
                                                >
                                                    Nenhuma mensagem encontrada
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 