export enum TicketStatus {
  PENDING = 'pending',      // تم إنشاء التذكرة وتنتظر المراجعة
  IN_PROGRESS = 'inProgress', // الأدمن يتابع المشكلة
  REJECTED = 'rejected',    // تم رفض التذكرة
  CLOSED = 'closed',        // تم حل التذكرة وإغلاقها
}