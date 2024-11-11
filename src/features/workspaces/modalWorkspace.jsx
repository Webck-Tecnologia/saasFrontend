import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, LogIn, Loader2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ModalWorkspace({ isOpen, onClose, initialView }) {
  const [view, setView] = useState(initialView);
  const [code, setCode] = useState(['', '', '', '', '']);
  const [workspaceName, setWorkspaceName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState('');
  const { createWorkspace, joinWorkspace, isLoading } = useWorkspace();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 4) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length === 5) {
      setError('');
      try {
        await joinWorkspace(fullCode);
        onClose();
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError('Por favor, insira um código válido de 5 dígitos.');
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName || !cnpj) {
      setError('Por favor, preencha todos os campos.');
      return;
    }


    setError('');
    try {
      await createWorkspace(workspaceName, cnpj);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };



  const renderContent = () => {
    switch (view) {
      case 'enter':
        return (
          <>
            <div className="flex justify-between mb-4">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-2xl"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  disabled={isLoading}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Button 
              className="w-full mb-2" 
              onClick={handleVerifyCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
          </>
        );
      case 'create':
        return (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label htmlFor="workspace-name">Nome do Workspace</Label>
                <Input
                  id="workspace-name"
                  placeholder="Digite o nome do workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="Digite apenas os números do CNPJ"
                  value={cnpj}
                  onChange={(e) => setCnpj((e.target.value))}
                  maxLength={18}
                  disabled={isLoading}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Button 
              className="w-full mb-2" 
              onClick={handleCreateWorkspace}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Workspace...
                </>
              ) : (
                'Criar Workspace'
              )}
            </Button>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {view === 'enter' ? 'Entrar em uma Empresa Existente' : 
             'Cadastrar uma nova Empresa'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
