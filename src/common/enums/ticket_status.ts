export enum TicketStatus {
  PENDING = 'pending',        // قيد المراجعة
  IN_PROGRESS = 'inProgress',      // تم الإسناد
  CLOSED = 'closed',          // مغلقة
  DELETED = 'deleted',        // محذوفة
  DUPLICATED = 'duplicated',  // مكررة
}