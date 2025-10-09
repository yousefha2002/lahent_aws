// user-context.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminService } from 'src/modules/admin/admin.service';
import { OwnerService } from 'src/modules/owner/owner.service';
import { CustomerService } from 'src/modules/customer/customer.service';
import { RoleStatus } from 'src/common/enums/role_status';
import { StoreService } from '../store/services/store.service';

@Injectable()
export class UserContextService {
    constructor(
        private adminService: AdminService,
        private storeService: StoreService,
        private ownerService: OwnerService,
        private customerService: CustomerService,
    ) {}

    async getUserContext(role: RoleStatus, id: number, contextIds?: any) {
        let contextEntity:any|null = null;
        switch (role) {
        case RoleStatus.ADMIN:
            const admin = await this.adminService.findOneById(id);
            if (!admin) throw new NotFoundException('Admin not found');

            // Optional context (store, owner, customer)
            if (contextIds?.storeId) contextEntity = await this.storeService.getStoreById(contextIds.storeId);
            if (contextIds?.ownerId) contextEntity = await this.ownerService.findById(contextIds.ownerId);
            if (contextIds?.customerId) contextEntity = await this.customerService.findById(contextIds.customerId);

            return { type: 'admin', userId: admin.id, context: contextEntity };

        case RoleStatus.STORE:
            const store = await this.storeService.getStoreById(id);
            return { type: 'store', userId: store.id, context: store };

        case RoleStatus.OWNER:
            const owner = await this.ownerService.findById(id);
            return { type: 'owner', userId: owner.id, context: owner };

        case RoleStatus.CUSTOMER:
            const customer = await this.customerService.findById(id);
            return { type: 'customer', userId: customer.id, context: customer };

        default:
            throw new NotFoundException('Role not found');
        }
    }
}