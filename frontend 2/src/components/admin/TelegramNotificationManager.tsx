import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, TestTube, Users } from 'lucide-react';

interface TelegramNotificationManagerProps {
  className?: string;
}

export function TelegramNotificationManager({ className }: TelegramNotificationManagerProps) {
  const [chatIds, setChatIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const { toast } = useToast();

  const fetchChatIds = async () => {
    try {
      const response = await fetch('/api/admin/telegram/chat-ids', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatIds(data.chatIds);
      }
    } catch (error) {
      console.error('Error fetching chat IDs:', error);
    }
  };

  const testNotification = async () => {
    setIsTestLoading(true);
    try {
      const response = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Test réussi",
          description: "La notification Telegram de test a été envoyée avec succès!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Échec de l'envoi de la notification de test",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la notification de test",
        variant: "destructive",
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  useEffect(() => {
    fetchChatIds();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications Telegram
        </CardTitle>
        <CardDescription>
          Gérez les notifications Telegram pour les nouvelles commandes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Chat IDs configurés
          </h4>
          <div className="flex flex-wrap gap-2">
            {chatIds.length > 0 ? (
              chatIds.map((chatId) => (
                <Badge key={chatId} variant="secondary">
                  {chatId}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucun chat ID configuré</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testNotification}
            disabled={isTestLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTestLoading ? 'Envoi...' : 'Tester Notification'}
          </Button>
          
          <Button
            onClick={fetchChatIds}
            disabled={isLoading}
            variant="ghost"
            size="sm"
          >
            {isLoading ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Les notifications sont automatiquement envoyées lors de nouvelles commandes</p>
          <p>• Pour ajouter un nouveau chat ID, modifiez le fichier de configuration</p>
          <p>• Utilisez le bouton "Tester" pour vérifier que les notifications fonctionnent</p>
        </div>
      </CardContent>
    </Card>
  );
} 
 