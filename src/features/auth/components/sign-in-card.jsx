import { useState } from "react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SignInFlow } from "../types";
import { CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "@/hooks/useLogin";

/**
 * @typedef {Object} SignInCardProps
 * @property {function(SignInFlow): void} setState
 */

/**
 * @param {SignInCardProps} props
 * @returns {JSX.Element}
 */
export const SignInCard = ({setState}) => {
  const { toast } = useToast();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useLogin();

  const onPasswordSignIn = async (e) => {
    e.preventDefault();
    
    await login(email, password);
  };

  return(
    <>
      <div className="bg-card rounded-2xl shadow-lg ring-1 ring-border">
        <CardTitle className="text-center text-1xl font-bold text-primary pt-4">Faça login para continuar</CardTitle>
        <div className="px-6 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={onPasswordSignIn}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email 
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@bolt360.com.br"
                  className="w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                  Senha
                </Label>
                <div className="text-sm">
                  <span
                    onClick={() => setState('forgot-password')}
                    className="font-semibold text-primary hover:text-primary/80 cursor-pointer"
                  >
                    Esqueceu a senha?
                  </span>
                </div>
              </div>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full rounded-md border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="text-sm">
          Ainda não tem uma conta?{" "}
          <span onClick={() => setState('sign-up')} className="font-medium text-primary hover:text-primary/90 hover:cursor-pointer hover:underline">
            Cadastre-se
          </span>
        </div>
      </div>
    </>
  )
}