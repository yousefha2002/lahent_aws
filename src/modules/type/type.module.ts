import { forwardRef, Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { TypeProvider } from './providers/type.provider';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AdminModule } from '../admin/admin.module';
import { SubtypeModule } from '../subtype/subtype.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [TypeController],
  providers: [TypeService, ...TypeProvider],
  imports: [
    CloudinaryModule,
    forwardRef(()=>UserContextModule),
    forwardRef(() => SubtypeModule),
  ],
  exports: [TypeService],
})
export class TypeModule {}
