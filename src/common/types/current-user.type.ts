import { RoleStatus } from "../enums/role_status";

export interface CurrentUserType {
    type: RoleStatus;     
    userId: number;         // مين نفذ العملية
    context?: any;          // السياق الي انعملت عليه العملية (store, owner, customer…)
}