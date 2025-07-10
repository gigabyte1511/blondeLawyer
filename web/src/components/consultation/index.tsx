import type { IConsultation, User } from '@/api';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

export function Consultation({consultation, user}: {consultation: IConsultation, user: User}){
    const navigate = useNavigate();

    const scheduledDateString = formatDate(consultation.scheduledFor);
    return(
    <div className="flex flex-col gap-3 p-2">
                <Button variant="outline" className="bg-orange-100 pt-7 pb-7 rounded-sm flex justify-between" onClick={() => navigate(`/consultation/${consultation.id}`, {state: {consultation}})}>
                        <div className="text-left">
                            <div>
                                {consultation.type}
                            </div>
                            <CardDescription>Статус: {consultation.status}</CardDescription>
                        </div>
                        <div className="text-right">
                            <div>{scheduledDateString}</div>
                            <CardDescription>{user?.role === 'expert' ? consultation.customer?.name : consultation.expert?.name}</CardDescription>
                        </div>  
                </Button>
            </div>
    )
}