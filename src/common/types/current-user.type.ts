import { RoleStatus } from "../enums/role_status";

export interface ActorInfo {
    id: number;
    type: RoleStatus;
}

export interface CurrentUserType {
    actor: ActorInfo; 
    context?: any;
}