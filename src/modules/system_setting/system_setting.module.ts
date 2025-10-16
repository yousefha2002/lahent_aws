import { forwardRef, Module } from '@nestjs/common';
import { SystemSettingService } from './system_setting.service';
import { SystemSettingController } from './system_setting.controller';
import { SystemSettingProvider } from './providers/system_setting.provider';
import { AuditLogModule } from '../audit_log/audit_log.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [SystemSettingController],
  providers: [SystemSettingService,...SystemSettingProvider],
  imports:[AuditLogModule,forwardRef(()=>UserContextModule)]
})
export class SystemSettingModule {}
