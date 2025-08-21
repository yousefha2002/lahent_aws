import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as multer from 'multer';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg'];
        console.log({ file });
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error('Only .png, .jpg and .jpeg image files are allowed!'),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // أقصى حجم 5MB
      },
    };
  }
}
