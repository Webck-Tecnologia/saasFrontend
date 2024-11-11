import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function StepScheduling({ formData, handleInputChange }) {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="inicio-imediato"
          checked={formData.inicioImediato}
          onCheckedChange={(checked) => handleInputChange('inicioImediato', checked)}
        />
        <Label htmlFor="inicio-imediato">Início Imediato</Label>
      </div>
      {!formData.inicioImediato && (
        <div className="space-y-2">
          <Label htmlFor="data-inicio">Data de Início</Label>
          <Input 
            id="data-inicio" 
            type="datetime-local" 
            value={formData.dataInicio}
            onChange={(e) => handleInputChange('dataInicio', e.target.value)}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="intervalo">Intervalo entre Mensagens (segundos)</Label>
        <Input 
          id="intervalo" 
          type="number" 
          min="1" 
          placeholder="Ex: 30" 
          value={formData.intervalo}
          onChange={(e) => handleInputChange('intervalo', e.target.value)}
        />
      </div>
    </>
  )
}