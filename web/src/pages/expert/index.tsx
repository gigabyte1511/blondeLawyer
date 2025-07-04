import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {  useNavigate } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

// Home page component
export function ExpertHomePage() {
//   const navigate = useNavigate();
  
  return (
    <div className="flex min-h-svh flex-col gap-3 p-2">
      <h1 className="text-2xl font-bold p-2">Мои записи</h1>
      <div className="flex items-center gap-10">
      <Calendar
        mode="single"
        //   defaultMonth={date}
        //   selected={date}
        //   onSelect={setDate}
        className="rounded-lg border shadow-sm"
      />
      <div className="flex flex-col gap-2 min-w-25">
        {/* <Button onClick={() => navigate("/consultationDetails")} >10:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >11:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >13:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >14:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >15:00</Button>
        <Button onClick={() => navigate("/consultationDetails")} >15:00</Button> */}
      </div>
      </div>
      
      <Card className="pt-3 pb-0 gap-1">
      <CardHeader>
        <CardTitle>На сегодня</CardTitle>
      </CardHeader>
            <div className="flex flex-col gap-3 p-2">
                <div className="bg-gray-200 rounded-sm p-3">
                    <div className="flex justify-between">
                        <div>
                            <div>
                                Консультация
                            </div>
                            <CardDescription>Статус: Подтверждено</CardDescription>
                        </div>
                        <div className="flex flex-col">
                            <div>25 марта, 10:00</div>
                            <CardDescription>Denis Gabets</CardDescription>
                        </div>  
                    </div>
                </div>
                <div className="bg-gray-200 rounded-sm p-3">
                    <div className="flex justify-between">
                        <div>
                            <div>
                                Консультация
                            </div>
                            <CardDescription>Статус: Подтверждено</CardDescription>
                        </div>
                        <div className="flex flex-col">
                            <div>25 марта, 10:00</div>
                            <CardDescription>Denis Gabets</CardDescription>
                        </div>  
                    </div>
                </div>
            </div>
      </Card>
      <Card className="pt-3 pb-0 gap-1">
      <CardHeader>
        <CardTitle>На другие даты</CardTitle>
      </CardHeader>
            <div className="flex flex-col gap-3 p-2">
                <div className="bg-gray-200 rounded-sm p-3">
                    <div className="flex justify-between">
                        <div>
                            <div>
                                Консультация
                            </div>
                            <CardDescription>Статус: Подтверждено</CardDescription>
                        </div>
                        <div className="flex flex-col">
                            <div>25 марта, 10:00</div>
                            <CardDescription>Denis Gabets</CardDescription>
                        </div>  
                    </div>
                </div>
                <div className="bg-gray-200 rounded-sm p-3">
                    <div className="flex justify-between">
                        <div>
                            <div>
                                Консультация
                            </div>
                            <CardDescription>Статус: Подтверждено</CardDescription>
                        </div>
                        <div className="flex flex-col">
                            <div>25 марта, 10:00</div>
                            <CardDescription>Denis Gabets</CardDescription>
                        </div>  
                    </div>
                </div>
            </div>
      </Card>
    </div>
  )
}