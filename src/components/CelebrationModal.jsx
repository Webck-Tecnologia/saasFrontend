import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CelebrationModal = ({ 
    isOpen, 
    onClose, 
    campaign, 
    stats 
}) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!campaign) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <ReactConfetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={200}
                    recycle={true}
                />
                <div className="bg-white rounded-lg p-6 max-w-md w-full m-4 relative z-50 shadow-xl">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-green-600">
                            🎉 Parabéns! 🎉
                        </h2>
                        <h3 className="text-xl font-semibold">
                            Campanha Finalizada com Sucesso!
                        </h3>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-lg mb-2">
                                {campaign.name}
                            </h4>
                        </div>

                        <div className="pt-4">
                            <Button 
                                onClick={onClose}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}; 