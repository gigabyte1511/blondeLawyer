import type { IConsultation } from "@/api";

// Function to get dates with consultations
  export const getDatesWithConsultations = (consultations: IConsultation[] | undefined) => {
    if (!consultations) return [];
    
    // Create a Set of date strings in YYYY-MM-DD format
    const datesSet = new Set<string>();
    
    consultations.forEach(consultation => {
      const consultationDate = new Date(consultation.scheduledFor);
      const dateString = consultationDate.toISOString().split('T')[0]; // YYYY-MM-DD
      datesSet.add(dateString);
    });
    
    // Convert the date strings back to Date objects
    return Array.from(datesSet).map(dateStr => new Date(dateStr));
  };


  interface TimeSlot {
    time: string; // Format: "HH:MM"
    available: boolean;
  }

  // Function to generate time slots from 12:00 to 18:00 by hour
export const generateTimeSlots = (selectedDate: Date | undefined, expertConsultations: IConsultation[] | undefined): TimeSlot[] => {
      if (!selectedDate || !expertConsultations) return [];
      
      // Create array of time slots from 12:00 to 18:00
      const slots: TimeSlot[] = [];
      for (let hour = 12; hour <= 18; hour++) {
        slots.push({
          time: `${hour}:00`,
          available: true
        });
      }
      
      // Filter out slots that already have consultations
      return slots.map(slot => {
        const [hours] = slot.time.split(':').map(Number);
        
        // Create a date object for this slot
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hours, 0, 0, 0);
        
        // Check if this slot conflicts with any expert consultation
        const isBooked = expertConsultations.some(consultation => {
          const consultationDate = new Date(consultation.scheduledFor);
          return (
            consultationDate.getDate() === slotDate.getDate() &&
            consultationDate.getMonth() === slotDate.getMonth() &&
            consultationDate.getFullYear() === slotDate.getFullYear() &&
            consultationDate.getHours() === slotDate.getHours()
          );
        });
        
        return {
          ...slot,
          available: !isBooked
        };
      });
    };