import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

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
import { useExperts } from "@/hooks/useApi";
import type { Consultation } from "@/api";

// New consultation form component
export function NewConsultationForm() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  
  // Check if form is valid
  const isFormValid = selectedDate && selectedTime && selectedTopic && termsAccepted;
  
  // Use the mutation hook for creating consultations
  const createConsultation = useCreateConsultation();
  
  // Fetch experts (in a real app, we would use this to select an expert)
  const { data: expertsData } = useExperts();
  
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
      // In a real app, we would get these IDs from the user context or selection
      // For now, we'll use placeholder values
      const consultationData: Consultation = {
        expert_id: 1, // Placeholder - in a real app, this would come from selection
        customer_id: 1, // Placeholder - in a real app, this would come from user context
        type: selectedTopic || "",
        message: comment,
        scheduled_for: combinedDateTime
      };
      
      // Submit the consultation
      await createConsultation.mutateAsync(consultationData);
      
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
        action: {
          label: "Отменить",
          onClick: () => console.log("Отмена"),
        },
      });
      
      // Navigate to consultation details or confirmation page
      navigate("/consultation");
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
  
  const timeSlots = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
  const topics = [
    { value: "family", label: "Семейное право" },
    { value: "criminal", label: "Уголовное право" },
    { value: "civil", label: "Гражданское право" },
    { value: "business", label: "Бизнес право" },
    { value: "other", label: "Другое" }
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
        />
        <div className="flex flex-col gap-2 min-w-25">
          {timeSlots.map((time) => (
            <Button 
              key={time}
              type="button"
              variant={selectedTime === time ? "default" : "outline"}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </Button>
          ))}
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