import { RoleStatus } from "../enums/role_status";

export interface CurrentUserInfo {
    id: number;
    type: RoleStatus;
}

export interface CurrentUserType {
    actor: CurrentUserInfo; 
    context?: any;
}