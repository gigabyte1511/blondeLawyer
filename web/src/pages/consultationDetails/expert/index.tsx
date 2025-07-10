import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
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
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import api, { type IConsultation } from "@/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Expert consultation details component
export function ExpertConsultationDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  // State for dialog visibility
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  // State for comments
  const [initialComment, setInitialComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  
  // Loading states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Fetch consultation data
  const { data: consultationData, isLoading, error } = useQuery({
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
  
  // Get the consultation object from the response
  const consultation = consultationData?.consultation;
  
  // Handle approve action
  const handleApprove = async () => {
    if (!consultation?.id) {
      toast.error("Не удалось обновить консультацию: отсутствует ID");
      return;
    }
    
    setIsApproving(true);
    
    try {
      // Update consultation status to 'in_progress'
      await api.updateConsultation(consultation.id, {
        status: 'approved',
        // comment: approveComment
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      
      toast.success("Консультация успешно согласована");
      setApproveDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error updating consultation:", error);
      toast.error("Не удалось обновить статус консультации");
    } finally {
      setIsApproving(false);
    }
  };
  
  // Handle reject action
  const handleReject = async () => {
    if (!consultation?.id) {
      toast.error("Не удалось обновить консультацию: отсутствует ID");
      return;
    }
    
    setIsRejecting(true);
    
    try {
      // Update consultation status to 'cancelled'
      await api.updateConsultation(consultation.id, {
        status: 'cancelled',
        comment: rejectComment
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      
      toast.success("Консультация отклонена");
      setRejectDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error updating consultation:", error);
      toast.error("Не удалось обновить статус консультации");
    } finally {
      setIsRejecting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return <div className="p-4 text-center">Загрузка данных консультации...</div>;
  }
  
  // Show error state
  if (error || !consultation) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center p-4">
        <div className="text-center text-red-500 mb-4">Ошибка загрузки данных консультации</div>
        <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-5">      
      <div className="flex justify-center gap-5">
        <Button 
          className="min-w-30" 
          onClick={() => {
            setApproveComment(initialComment); // Pre-fill with initial comment
            setApproveDialogOpen(true);
          }}
          disabled={consultation.status !== 'pending'}
        >
          Согласовать
        </Button>
        
        <Button 
          variant="destructive" 
          className="min-w-30" 
          onClick={() => {
            setRejectComment(initialComment); // Pre-fill with initial comment
            setRejectDialogOpen(true);
          }}
          disabled={consultation.status !== 'pending'}
        >
          Отклонить
        </Button>
      </div>
      
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение согласования</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите согласовать эту консультацию?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Добавить комментарий к согласованию"
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={isApproving}>Отмена</Button>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? "Обработка..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение отклонения</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отклонить эту консультацию?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Указать причину отклонения"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isRejecting}>Отмена</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
              {isRejecting ? "Обработка..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}