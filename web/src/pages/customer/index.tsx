import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {  useNavigate } from "react-router-dom"

// Home page component
export function CustomerHomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-svh flex-col gap-4 p-20">
      <h1 className="text-2xl font-bold p-2">Записаться</h1>
      <div className="flex items-center gap-10">
      <Calendar
        mode="single"
        //   defaultMonth={date}
        //   selected={date}
        //   onSelect={setDate}
        className="rounded-lg border shadow-sm"
      />
      <div className="flex flex-col gap-2 min-w-25">
        <Button onClick={() => navigate("/consultationDetails")} >10:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >11:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >13:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >14:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >15:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >15:00</Button>
      </div>
      </div>
    </div>
  )
}