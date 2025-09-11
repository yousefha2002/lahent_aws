import { StoreService } from 'src/modules/store/services/store.service';
import { StoreCommissionService } from './../store_commission/store_commission.service';
import { ReviewService } from './../review/review.service';
import { CategoryService } from './../category/category.service';
import { FaviroteService } from './../favirote/favirote.service';
import { CartService } from './../cart/cart.service';
import { ProductService } from './../product/product.service';
import { UserTokenService } from '../user_token/user_token.service';
import { CustomerService } from '../customer/customer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Store } from '../store/entities/store.entity';

@Injectable()
export class DeletionService {
    constructor(
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly customerService:CustomerService,
        private readonly userTokenService:UserTokenService,
        private readonly productService:ProductService,
        private readonly cartService:CartService,
        private readonly faviroteService:FaviroteService,
        private readonly categoryService:CategoryService,
        private readonly reviewService:ReviewService,
        private readonly storeCommissionService:StoreCommissionService,
        private readonly storeService:StoreService
    ){}

    async softDeleteCustomer(customer:Customer)
    {
        const transaction = await this.sequelize.transaction();
        try{
            await customer.destroy({ transaction });
            await this.userTokenService.deleteByCustomer(customer.id,transaction)
            await transaction.commit()
            return { status: 'success', message: 'Customer soft deleted' };
        }
        catch(error){
            await transaction.rollback();
            throw error;
        }
    }

    async hardDeleteCustomer(customerId: number) {
        const transaction = await this.sequelize.transaction();
        try {
            const customer = await this.customerService.findDeletedCustomer(customerId,transaction);
            if (!customer) throw new NotFoundException('Customer not found');
            await this.userTokenService.deleteByCustomer(customer.id, transaction);
            await customer.destroy({ force: true, transaction });
            await transaction.commit();
            return { status: 'success', message: 'Customer deleted permanently' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async restoreCustomer(customerId: number) {
        const transaction = await this.sequelize.transaction();
        try {
            const customer = await this.customerService.findDeletedCustomer(customerId,transaction);
            await customer.restore({ transaction });
            await transaction.commit();
            return {status:"success"};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async softDeleteStore(store:Store)
    {
        const transaction = await this.sequelize.transaction();
        try {
            await store.destroy({ transaction });
            await this.userTokenService.deleteByStore(store.id,transaction)
            await this.storeCommissionService.softDeleteCommission(store.id,transaction)
            await this.cartService.deleteAllCartsByStore(store.id,transaction)
            await this.faviroteService.deleteAllFavoriteByStore(store.id,transaction)
            await this.categoryService.softDeleteCategory(store.id,transaction)
            await this.reviewService.softDeleteReview(store.id,transaction)
            await this.productService.softDeleteProduct(store.id,transaction)
            await transaction.commit();
            return { status: 'success', message: 'Store soft deleted' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async restoreStore(storeId: number) {
        const transaction = await this.sequelize.transaction();
        try {
            const store = await this.storeService.findDeletedStore(storeId,transaction);
            await store.restore({ transaction });
            await this.storeCommissionService.restoreCommission(store.id, transaction);
            await this.categoryService.restoreCategory(store.id, transaction);
            await this.reviewService.restoreReview(store.id, transaction);
            await this.productService.restoreProduct(store.id, transaction)
            await transaction.commit();
            return {status:"success"};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}