import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {  useNavigate } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import api, { type User, type IConsultation } from "@/api";
import { Consultation } from "@/components/consultation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
// Import config to get main expert ID
import config from "../../../../config/default.json";
import { generateTimeSlots, getDatesWithConsultations } from "@/utils/consultations";

interface CustomerHomePageProps {
    userData: User;
}

interface TimeSlot {
  time: string; // Format: "HH:MM"
  available: boolean;
}

// Home page component
export function CustomerHomePage({ userData }: CustomerHomePageProps) {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  // State for available time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  
  // Get main expert ID from config
  const mainExpertId = config.mainExpertId;
  
  const { data: customerConsultations, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['consultations', 'customer', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return { consultations: [] };
      try {
        const response = await api.getConsultationsByCustomer(userData.id);
        return response;
      } catch (err) {
        console.error('Error fetching customer consultations:', err);
        throw err;
      }
    },
    select: (data) => {
        return data.consultations
    },
    enabled: !!userData?.id,
  });
  
  const { data: expertConsultations, isLoading: isLoadingExpert } = useQuery({
    queryKey: ['consultations', 'expert', mainExpertId],
    queryFn: async () => {
      try {
        const response = await api.getConsultationsByExpert(mainExpertId);
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
    if (date && expertConsultations) {
      const slots = generateTimeSlots(date, expertConsultations);
      console.log("slots", slots)
      setAvailableTimeSlots(slots);
    }
  }, [date, expertConsultations]);
  
  return (
    <div className="flex min-h-svh flex-col gap-3 p-2">
      <div className="flex items-center gap-10">
        <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={setDate}
            className="rounded-lg border shadow-sm"
            modifiers={{
              consultation: getDatesWithConsultations(customerConsultations)
            }}
            modifiersClassNames={{
              consultation: "bg-orange-100 rounded-lg font-bold text-black-700"
            }}
        />
        <div className="flex flex-col gap-2 min-w-25">
          {isLoadingExpert ? (
            <CardDescription>Загрузка доступных слотов...</CardDescription>
          ) : availableTimeSlots.length > 0 ? (
            availableTimeSlots.map((slot, index) => (
              <Button 
                key={index}
                variant={slot.available ? "outline" : "secondary"}
                onClick={() => {
                  if (slot.available) {
                    // Navigate to new consultation form with pre-selected date and time
                    const selectedDateTime = new Date(date!);
                    const [hours] = slot.time.split(':').map(Number);
                    selectedDateTime.setHours(hours, 0, 0, 0);
                    
                    navigate("/consultation/new", {
                      state: {
                        preSelectedDate: selectedDateTime,
                        preSelectedTime: slot.time,
                        expertId: mainExpertId
                      }
                    });
                  } else {
                    toast.error("Это время уже занято");
                  }
                }}
                disabled={!slot.available}
                className={slot.available ? "hover:bg-gray-100" : ""}
              >
                {slot.time} {!slot.available}
              </Button>
            ))
          ) : (
            <CardDescription>Нет доступных слотов на выбранную дату</CardDescription>
          )}
        </div>
      </div>
      
      <Card className="pt-3 pb-0 gap-1">
              <CardHeader>
                  <CardTitle>На сегодня</CardTitle> 
              </CardHeader>
              {isLoadingCustomer ? (
                <div className="p-4 text-center">Загрузка...</div>
              ) : customerConsultations && customerConsultations.length > 0 ? (
                // Filter consultations for today
                (() => {
                  const todayConsultations = customerConsultations.filter(consultation => {
                    const today = new Date();
                    const scheduledDate = new Date(consultation.scheduledFor);
                    return (
                      scheduledDate.getDate() === today.getDate() &&
                      scheduledDate.getMonth() === today.getMonth() &&
                      scheduledDate.getFullYear() === today.getFullYear()
                    );
                  });
                  
                  return todayConsultations.length > 0 ? (
                    todayConsultations
                      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                      .map(consultation => 
                        <Consultation user={userData} consultation={consultation} key={consultation.id} />
                      )
                  ) : (
                      <CardDescription>На сегодня консультаций нет</CardDescription>
                  );
                })()
              ) : (
                <CardDescription>На сегодня консультаций нет</CardDescription>
              )}
            </Card>
            <Card className="pt-3 pb-0 gap-1">
              <CardHeader>
                  <CardTitle>На другие даты</CardTitle>
              </CardHeader>
              {isLoadingCustomer ? (
                <div className="p-4 text-center">Загрузка...</div>
              ) : customerConsultations && customerConsultations.length > 0 ? (
                // Filter consultations for other days
                (() => {
                  const otherDaysConsultations = customerConsultations.filter(consultation => {
                    const today = new Date();
                    const scheduledDate = new Date(consultation.scheduledFor);
                    return (
                      scheduledDate.getDate() !== today.getDate() ||
                      scheduledDate.getMonth() !== today.getMonth() ||
                      scheduledDate.getFullYear() !== today.getFullYear()
                    );
                  });
                  
                  return otherDaysConsultations.length > 0 ? (
                    otherDaysConsultations
                      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                      .map(consultation => 
                        <Consultation user={userData} consultation={consultation} key={consultation.id} />
                      )
                  ) : (
                      <CardDescription>Консультаций нет</CardDescription>
                  );
                })()
              ) : (
                <CardDescription>Консультаций нет</CardDescription>
              )}
            </Card>
      <Button onClick={() => navigate("/consultation/new")}>Записаться на консультацию</Button>
    </div>
  )
}