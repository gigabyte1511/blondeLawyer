import { Button } from "@/components/ui/button"
import {  useNavigate } from "react-router-dom"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { Textarea } from "@/components/ui/textarea"
  import { Input } from "@/components/ui/input"

// Home page component
export function ConsultationDetails() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col gap-5 p-150">
      <h1 className="text-2xl font-bold pl-2">Консультация №1</h1>
      <Card className="pt-3 pb-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle>Denis Gabets</CardTitle>
              <CardDescription>25 марта, 10:00</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card className="pt-3 pb-1">
        <CardHeader>
        <CardTitle>Статус: Ожидает обработки</CardTitle>
        <CardDescription>Уникальный номер: 1</CardDescription>
        </CardHeader>
      </Card>
      <Card className="pt-3 pb-1">
        <CardHeader>
        <CardTitle>Сообщение</CardTitle>
        <CardDescription>Прошу рассмотреть мое дело об похищении слонов из зоопарка. Спасибо.</CardDescription>
        </CardHeader>
      </Card>
      <Textarea placeholder="Добавить ответ" className="min-h-15"/>
      <div className="flex justify-center gap-5">
        <Button className="min-w-30" onClick={() => navigate("/expert")}>Согласовать</Button>
        <Button variant="destructive" className="min-w-30" onClick={() => navigate("/expert")}>Отклонить</Button>
      </div>
    </div>
  )
}