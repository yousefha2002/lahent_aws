import { RoleStatus } from "../enums/role_status";

export interface ActorInfo {
    id: number;
    type: RoleStatus;
    isSuperAdmin?:boolean
}

export interface CurrentUserType {
    actor: ActorInfo; 
    context?: any;
}