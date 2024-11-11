import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CsvValidationModal({ 
  isOpen, 
  onClose, 
  csvData, 
  validationResults,
  onConfirm 
}) {
  const validNumbers = validationResults?.valid || [];
  const invalidNumbers = validationResults?.invalid || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Validação de Contatos</DialogTitle>
          <DialogDescription>
            Análise dos números do WhatsApp importados
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-700">Números Válidos</h3>
            <p className="text-2xl text-green-600">{validNumbers.length}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-700">Números Inválidos</h3>
            <p className="text-2xl text-red-600">{invalidNumbers.length}</p>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Status</TableHead>
                {Object.keys(csvData[0] || {}).filter(key => key !== 'numero').map(header => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.numero}</TableCell>
                  <TableCell>
                    {validNumbers.includes(row.numero) ? (
                      <Badge className="bg-green-500">Válido</Badge>
                    ) : (
                      <Badge className="bg-red-500">Inválido</Badge>
                    )}
                  </TableCell>
                  {Object.entries(row)
                    .filter(([key]) => key !== 'numero')
                    .map(([key, value]) => (
                      <TableCell key={key}>{value}</TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(validNumbers)}>
            Continuar com números válidos ({validNumbers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

