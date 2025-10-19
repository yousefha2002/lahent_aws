export enum TicketStatus {
  PENDING = 'PENDING',      // تم إنشاء التذكرة وتنتظر المراجعة
  IN_PROGRESS = 'IN_PROGRESS', // الأدمن يتابع المشكلة
  REJECTED = 'REJECTED',    // تم رفض التذكرة
  CLOSED = 'CLOSED',        // تم حل التذكرة وإغلاقها
}