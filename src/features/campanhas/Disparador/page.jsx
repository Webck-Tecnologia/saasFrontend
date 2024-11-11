'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, PlayCircle, ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { cn } from "@/lib/utils"
import StepBasicInfo from './form/StepBasicInfo'
import StepContacts from './form/StepContacts'
import StepMessages from './form/StepMessages'
import StepScheduling from './form/StepScheduling'
import StepReview from './form/StepReview'
import { steps } from './form/constants'
import { useToast } from "@/hooks/use-toast"
import { useFetchCampaign } from '@/hooks/useFetchCampaign';
import { useNavigate } from 'react-router-dom';

export default function Disparador() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0)
  const [isReviewed, setIsReviewed] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    instancia: '',
    csvFile: null,
    csvData: [],
    formattedNumbers: [],
    verifiedNumbers: [],
    mensagens: [{ principal: '', alternativas: ['', ''] }],
    inicioImediato: false,
    dataInicio: '',
    intervalo: '',
    arquivo: null,
    csvVariables: [], // Adicionar este campo
  })
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const { toast } = useToast()
  const { createCampaign, isLoading } = useFetchCampaign();
  const [campaignCreated, setCampaignCreated] = useState(false);

  useEffect(() => {
    if (currentStep === 0) {
      const isStepOneComplete = formData.nome && formData.tipo && formData.instancia &&
        (formData.tipo === 'mensagem' || (formData.tipo !== 'mensagem' && formData.arquivo))
      setIsNextDisabled(!isStepOneComplete)
    } else if (currentStep === 1) {
      setIsNextDisabled(!formData.csvFile)
    } else if (currentStep === 2) {
      const isStepThreeComplete = formData.mensagens.some(msg => msg.principal.trim() !== '')
      setIsNextDisabled(!isStepThreeComplete)
    }
  }, [currentStep, formData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCsvDataChange = (csvData, formattedNumbers, verifiedNumbers, variables = []) => {
    setFormData(prev => ({
      ...prev,
      csvData,
      formattedNumbers,
      verifiedNumbers,
      csvVariables: variables // Salvar as variáveis no estado
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = error => reject(error)
    })
  }

  // Função para lidar com a confirmação da revisão
  const handleReviewConfirm = () => {
    setIsReviewed(true);
  };

  // Função para criar a campanha após reviso
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!isReviewed) {
        toast({
            title: "Revisão necessária",
            description: "Por favor, revise os dados da campanha antes de criar.",
            variant: "destructive",
        });
        return;
    }

    try {
        const result = await createCampaign(formData);
        setCampaignCreated(true);
        navigate('/app/campanhas/listar-campanhas');
        
    } catch (error) {
        console.error('Erro ao criar campanha:', error);
        // Toast já é mostrado no hook
    }
  };

  const handleGoToCampaigns = () => {
    navigate('/app/campanhas/listar-campanhas');
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const renderStep = () => {
    const props = {
      formData,
      handleInputChange,
      handleCsvDataChange,
    };

    switch(currentStep) {
      case 0:
        return <StepBasicInfo {...props} />
      case 1:
        return <StepContacts {...props} />
      case 2:
        return <StepMessages {...props} />
      case 3:
        return <StepScheduling {...props} />
      case 4:
        return <StepReview {...props} />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Campanha - {steps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-6 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center z-10">
                  <div className={cn(
                    "rounded-full p-2 bg-white border-2",
                    index <= currentStep
                      ? "border-primary text-primary"
                      : "border-gray-300 text-gray-300"
                  )}>
                    <step.icon size={24} />
                  </div>
                  <div className={cn(
                    "mt-2 text-xs",
                    index <= currentStep ? "text-primary" : "text-gray-500"
                  )}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              {renderStep()}
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={isNextDisabled}
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : !isReviewed ? (
                  <Button 
                    type="button"
                    onClick={handleReviewConfirm}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Confirmar Revisão
                  </Button>
                ) : !campaignCreated ? (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isLoading ? (
                      "Criando campanha..."
                    ) : formData.inicioImediato ? (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Criar Campanha
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Criar Campanha Agendada
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={handleGoToCampaigns}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Ir para Campanhas
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
