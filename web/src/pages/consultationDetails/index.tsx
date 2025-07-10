import { useLocation, useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTelegram } from "@/hooks/useTelegram"
import api from "@/api"
import type { User, IConsultation } from "@/api"
import { formatDate } from "@/utils/date"
import { ExpertConsultationDetails } from "./expert"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Consultation details component
export function ConsultationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { telegramUser, webApp } = useTelegram();
  const queryClient = useQueryClient();
  
  // Fetch consultation by ID
  const { data: consultationData, isLoading: consultationLoading, error: consultationError } = useQuery({
    queryKey: ['consultation', id],
    queryFn: async () => {
      if (!id) throw new Error('Consultation ID is required');
      try {
        const response = await api.getConsultationById(parseInt(id));
        return response;
      } catch (err) {
        console.error('Error fetching consultation:', err);
        throw err;
      }
    },
    enabled: !!id,
  });
  
  // Access the cached user data
  const { data: userData, isLoading: userLoading } = useQuery<User | null, Error>({
    queryKey: ['user', telegramUser?.id],
    queryFn: async () => {
      if (!telegramUser?.id) return null;
      try {
        // First check if we have the data in cache
        const cachedData = queryClient.getQueryData<User>(['user', telegramUser.id]);
        if (cachedData) return cachedData;
        
        // If not in cache, fetch it
        const response = await api.getUserByTelegramId(telegramUser.id);
        return response.user as User;
      } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
      }
    },
    enabled: !!telegramUser?.id, // Only run query when telegramUser.id exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  })
  
  // Determine if the current user is an expert or customer
  const isExpert = userData?.role === 'expert';  

  // Function to open Telegram chat with the user
  const handleOpenTelegramChat = () => {
    if (!consultationData?.consultation) {
      toast.error("Не удалось загрузить данные консультации");
      return;
    }
    
    // Get the person to chat with
    const chatWithPerson = isExpert 
      ? consultationData.consultation.customer
      : consultationData.consultation.expert;
    
    // Check if we have a direct Telegram link
    if (chatWithPerson?.telegramLink) {
      // Open chat using the provided Telegram link
      window.open(chatWithPerson.telegramLink, '_blank');
    } else if (chatWithPerson?.telegramId) {
      // If no direct link but we have ID, try to use it
      window.open(`tg://user?id=${chatWithPerson.telegramId}`, '_blank');
    } else {
      console.error('No Telegram link or ID available to open chat');
      toast.error("Нет данных для открытия чата");
    }
  };
  
  // Show loading state while data is being fetched
  if (userLoading || consultationLoading) {
    return <div className="p-4 text-center">Загрузка данных консультации...</div>;
  }
  
  // Show error state if consultation data couldn't be loaded
  if (consultationError || !consultationData?.consultation) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center p-4">
        <div className="text-center text-red-500 mb-4">Ошибка загрузки данных консультации</div>
        <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
      </div>
    );
  }
  
  const consultation = consultationData.consultation;
  
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold pl-2">Консультация №{consultation.id}</h1>
      <Card className="pt-3 pb-1">
        <CardHeader>
          <div className="flex flex-row justify-between items-center"> 
            <div className="flex flex-row cursor-pointer" onClick={() => handleOpenTelegramChat()}>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{isExpert ? 'C' : 'E'}</AvatarFallback>
              </Avatar>
            <div>
              <CardTitle>{isExpert ? consultation.customer?.name : consultation.expert?.name}</CardTitle>
              <CardDescription className="pl-2">
                {formatDate(consultation.scheduledFor)}
              </CardDescription>
            </div>
          </div>
            <CardDescription className="pl-2">
                {consultation.status}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
      <Card className="flex flex-col items-start p-2 gap-0">
          <CardDescription>Тема: {consultation.type}</CardDescription>
          <CardDescription>Статус: {consultation.status}</CardDescription>
          <CardDescription>Сообщение: {consultation.message}</CardDescription>
      </Card>
      {isExpert ? 
        <ExpertConsultationDetails /> : 
        <div className="p-4">
          <Button onClick={() => navigate(-1)} className="w-full">Вернуться назад</Button>
        </div>
      }
    </div>
  )
}