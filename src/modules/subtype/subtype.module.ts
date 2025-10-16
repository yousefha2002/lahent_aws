import { forwardRef, Module } from '@nestjs/common';
import { SubtypeService } from './subtype.service';
import { SubtypeController } from './subtype.controller';
import { SubTypeProvider } from './providers/subtype.provider';
import { TypeModule } from '../type/type.module';
import { AdminModule } from '../admin/admin.module';
import { StoreModule } from '../store/store.module';
import { UserContextModule } from '../user-context/user-context.module';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [SubtypeController],
  providers: [SubtypeService, ...SubTypeProvider],
  imports: [
    forwardRef(()=>UserContextModule),
    forwardRef(() => StoreModule),
    forwardRef(() => TypeModule),
    AuditLogModule,
    DatabaseModule
  ],
  exports: [SubtypeService],
})
export class SubtypeModule {}
