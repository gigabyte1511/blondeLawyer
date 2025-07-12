import Router from 'koa-router';
import { approveConsultation, rejectConsultation, updateConsultationStatus } from '../controllers/consultationStatusController';

export const consultationStatusRouter = new Router({
  prefix: '/api/consultations'
});

// Update consultation status
consultationStatusRouter.put('/:id/status', updateConsultationStatus);

// Approve consultation
consultationStatusRouter.put('/:id/approve', approveConsultation);

// Reject consultation
consultationStatusRouter.put('/:id/reject', rejectConsultation);
