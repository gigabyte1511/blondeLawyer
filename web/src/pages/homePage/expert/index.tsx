import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { useState } from "react";
import { Consultation } from "@/components/consultation";
import { getDatesWithConsultations } from "@/utils/consultations";

// Define props interface for ExpertHomePage
interface ExpertHomePageProps {
  userData?: any; // Optional prop, using any for now, but ideally should be a proper User type
}

// Home page component
export function ExpertHomePage({ userData }: ExpertHomePageProps) {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Use Tanstack Query to fetch consultations by expert ID
  const { data: consultations, isLoading, error } = useQuery({
    queryKey: ['consultations', 'expert', userData?.id],
    queryFn: async () => {
      if (!userData?.id) return { consultations: [] };
      try {
        const response = await api.getConsultationsByExpert(userData.id);
        console.log("response", response);
        return response;
      } catch (err) {
        console.error('Error fetching consultations:', err);
        throw err;
      }
    },
    select: (data) => {
        return data.consultations
    },
    enabled: !!userData?.id, // Only run query when expert ID exists
    // If accessed directly (not from HomePage), this query won't run
  });
  
  // Get consultations for selected date
  const selectedDate = date ? date.toISOString().split('T')[0] : '';
  
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
              consultation: getDatesWithConsultations(consultations)
            }}
            modifiersClassNames={{
              consultation: "bg-orange-100 rounded-lg font-bold text-black-700"
            }}
        />
        <div className="flex flex-col gap-2 min-w-25">
          {consultations ? (
            (() => {
              // Filter consultations for the selected date
              const selectedDateConsultations = consultations.filter(consultation => {
                if (!date) return false;
                
                const consultationDate = new Date(consultation.scheduledFor);
                return (
                  consultationDate.getDate() === date.getDate() &&
                  consultationDate.getMonth() === date.getMonth() &&
                  consultationDate.getFullYear() === date.getFullYear()
                );
              });
              
              return selectedDateConsultations.length > 0 ? (
                selectedDateConsultations.map(consultation => {
                  // Format time as HH:MM
                  const consultationDate = new Date(consultation.scheduledFor);
                  const hours = consultationDate.getHours().toString().padStart(2, '0');
                  const minutes = consultationDate.getMinutes().toString().padStart(2, '0');
                  const timeString = `${hours}:${minutes}`;
                  
                  return (
                    <Button 
                      key={consultation.id}
                      variant="outline"
                      onClick={() => navigate(`/consultation/${consultation.id}`)}
                    >
                      {timeString}
                    </Button>
                  );
                })
              ) : (
                <CardDescription>Нет консультаций на выбранную дату</CardDescription>
              );
            })()
          ) : (
            <CardDescription>Загрузка...</CardDescription>
          )}
        </div>
      </div>
      
      <Card className="pt-3 pb-0 gap-1">
        <CardHeader>
            <CardTitle>На сегодня</CardTitle> 
        </CardHeader>
        {consultations ? (
          // Filter consultations for today
          (() => {
            const todayConsultations = consultations.filter(consultation => {
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
                  <Consultation consultation={consultation} user={userData} key={consultation.id} />
                )
            ) : (
                <CardDescription>На сегодня консультаций нет</CardDescription>
            );
          })()
        ) : (
          <div className="p-4 text-center">Loading...</div>
        )}
      </Card>
      <Card className="pt-3 pb-0 gap-1">
        <CardHeader>
            <CardTitle>На другие даты</CardTitle>
        </CardHeader>
        {consultations ? (
          // Filter consultations for other days
          (() => {
            const otherDaysConsultations = consultations.filter(consultation => {
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
                  <Consultation consultation={consultation} user={userData} key={consultation.id} />
                )
            ) : (
                <CardDescription>На другие дни консультаций нет</CardDescription>
            );
          })()
        ) : (
          <div className="p-4 text-center">Loading...</div>
        )}
      </Card>
    </div>
  )
}