import { forwardRef, Module } from '@nestjs/common';
import { SubtypeService } from './subtype.service';
import { SubtypeController } from './subtype.controller';
import { SubTypeProvider } from './providers/subtype.provider';
import { TypeModule } from '../type/type.module';
import { AdminModule } from '../admin/admin.module';
import { StoreModule } from '../store/store.module';

@Module({
  controllers: [SubtypeController],
  providers: [SubtypeService, ...SubTypeProvider],
  imports: [
    AdminModule,
    forwardRef(() => StoreModule),
    forwardRef(() => TypeModule),
  ],
  exports: [SubtypeService],
})
export class SubtypeModule {}
