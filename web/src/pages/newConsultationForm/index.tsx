import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Form components not needed for this implementation

// Import API hooks
import { useCreateConsultation } from "@/hooks/useApi";
import api, { type IConsultation } from "@/api";
import { generateTimeSlots, getDatesWithConsultations } from "@/utils/consultations";
import { toast } from "sonner";
import { useTelegram } from "@/hooks/useTelegram";

// Interface for location state with pre-selected values
interface LocationState {
  preSelectedDate?: Date;
  preSelectedTime?: string;
  expertId?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

// New consultation form component
export function NewConsultationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(state?.preSelectedDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(state?.preSelectedTime || null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [expertId, setExpertId] = useState<number | undefined>(state?.expertId);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  const { telegramUser, webApp } = useTelegram();
  
  // Get the first expert from the database
  const { data: expertsData, isLoading: isLoadingExperts } = useQuery({
    queryKey: ['experts'],
    queryFn: async () => {
      try {
        const response = await api.getExperts();
        return response;
      } catch (err) {
        console.error('Error fetching experts:', err);
        throw err;
      }
    },
  });
  
  // Use the first expert as the main expert if no expertId is provided in state
  useEffect(() => {
    if (!expertId && expertsData && expertsData.experts && expertsData.experts.length > 0) {
      setExpertId(expertsData.experts[0].id);
    }
  }, [expertsData, expertId]);
  
  // Use Tanstack Query to fetch user by Telegram ID
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', telegramUser?.id],
    queryFn: async () => {
      if (!telegramUser?.id) return null;
      try {
        const response = await api.getUserByTelegramId(telegramUser.id);
        return response.user;
      } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
      }
    },
    enabled: !!telegramUser?.id, // Only run query when telegramUser.id exists
  });
  
  // Fetch main expert's consultations
  const { data: expertConsultations, isLoading: isLoadingExpert } = useQuery({
    queryKey: ['consultations', 'expert', expertId],
    queryFn: async () => {
      try {
        // Only fetch if we have an expertId
        if (!expertId) return { consultations: [] };
        const response = await api.getConsultationsByExpert(expertId);
        return response;
      } catch (err) {
        console.error('Error fetching expert consultations:', err);
        throw err;
      }
    },
    select: (data) => {
        return data.consultations
    },
  });
  
  // Update available time slots when date or expert consultations change
  useEffect(() => {
    if (selectedDate) {
      // If expertConsultations is undefined, pass an empty array to ensure slots are generated
      const consultationsToUse = expertConsultations || [];
      const slots = generateTimeSlots(selectedDate, consultationsToUse);
      setAvailableTimeSlots(slots);
      
      // If a time was pre-selected but is not available, clear it
      if (selectedTime) {
        const isTimeAvailable = slots.some(slot => 
          slot.time === selectedTime && slot.available
        );
        
        if (!isTimeAvailable) {
          setSelectedTime(null);
          toast.error("Выбранное время уже занято. Пожалуйста, выберите другое время.");
        }
      }
    }
  }, [selectedDate, expertConsultations, selectedTime]);
  
  // Check if form is valid
  const isFormValid = selectedDate && selectedTime && selectedTopic && termsAccepted;
  
  // Use the mutation hook for creating consultations
  const createConsultation = useCreateConsultation();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    // Combine date and time into a single DateTime value
    const combinedDateTime = selectedDate && selectedTime ? combineDateTime(selectedDate, selectedTime) : null;
    
    if (!combinedDateTime) {
      toast.error("Пожалуйста, выберите дату и время");
      return;
    }
    
    try {
      // Use the expert ID from state or default to 1 (main expert)
      const consultationData = {
        expertId: expertId || 1, // Use pre-selected expert ID or default to 1
        customerId: userData?.id, // In a real app, this would come from user context
        type: selectedTopic || "",
        message: comment,
        status: 'pending', // Default status for new consultations
        scheduledFor: combinedDateTime.toISOString()
      };
      
      // Submit the consultation
      const response = await createConsultation.mutateAsync(consultationData);
      
      // Get the created consultation ID
      const consultationId = response.consultation?.id;
      
      // Show success message
      const formattedDate = combinedDateTime.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const formattedTime = combinedDateTime.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      toast("Консультация создана", {
        description: `${formattedDate} в ${formattedTime}`,
        // action: {
        //   label: "Отменить",
        //   onClick: () => console.log("Отмена"),
        // },
      });
      
      // Navigate to consultation details page with the new ID
      if (consultationId) {
        navigate(`/consultation/${consultationId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      // Show error message
      toast.error("Ошибка при создании консультации", {
        description: error instanceof Error ? error.message : "Пожалуйста, попробуйте снова позже",
      });
    }
  };
  
  // Helper function to combine date and time
  const combineDateTime = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };
  
  // We'll use the dynamically generated time slots instead of hardcoded ones
  const topics = [
    { value: "Семейное право", label: "Семейное право" },
    { value: "Бизнес право", label: "Бизнес право" },
    { value: "Юрист-судебник", label: "Юрист-судебник" },
    { value: "Я убил(а) человека", label: "Я убил(а) человека" },
    { value: "Почему тучка плачет", label: "Почему тучка плачет" },
    { value: "Сходить на свидание", label: "Сходить на свидание" },
    { value: "Посидеть в машине до 4 утра", label: "Посидеть в машине до 4 утра" },
    { value: "Другое", label: "Другое" }
  ];
  
  return (
    <form onSubmit={handleSubmit} className="flex min-h-svh flex-col gap-5 p-2">
      <h1 className="text-xl font-bold">1. Выбор даты</h1>
      <div className="flex items-center gap-10">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border shadow-sm"
          modifiers={{
            consultation: getDatesWithConsultations(expertConsultations)
          }}
          // modifiersClassNames={{
          //   consultation: "bg-orange-100 rounded-lg font-bold text-black-700"
          // }}
        />
        <div className="flex flex-col gap-2 min-w-25">
            {isLoadingExpert ? (
              <div className="col-span-3 text-center">Загрузка доступных слотов...</div>
            ) : availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  type="button"
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  onClick={() => {
                    if (slot.available) {
                      setSelectedTime(slot.time);
                    } else {
                      toast.error("Это время уже занято");
                    }
                  }}
                  disabled={!slot.available}
                  className={slot.available ? "hover:bg-gray-100" : ""}
                >
                  {slot.time}
                </Button>
              ))
            ) : (
              <div className="col-span-3 text-center">Нет доступных слотов на выбранную дату</div>
            )}
        </div>
      </div>
      
      <h1 className="text-xl font-bold">2. Тема обращения</h1>      
      <Select value={selectedTopic || undefined} onValueChange={setSelectedTopic}>
        <SelectTrigger className="flex w-full">
          <SelectValue placeholder="Выберите тему консультации" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Темы</SelectLabel>
            {topics.map((topic) => (
              <SelectItem key={topic.value} value={topic.value}>
                {topic.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      <h1 className="text-xl font-bold">3. Завершение формы</h1>  
      <Textarea 
        placeholder="Добавить комментарий для специалиста" 
        className="min-h-15"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      
      <div className="flex items-start gap-3">
        <Checkbox 
          id="terms" 
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
        />
        <div className="grid gap-2">
          <Label htmlFor="terms">Принять условия использования</Label>
          <p className="text-muted-foreground text-sm">
            Нажимая на эту кнопку, вы соглашаетесь с условиями использования сервиса.
          </p>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!isFormValid}
        className="mt-4"
      >
        Записаться на консультацию
      </Button>
    </form>
  );
}