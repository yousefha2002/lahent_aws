// src/config/multer.config.ts
import { BadRequestException } from '@nestjs/common';
import * as multer from 'multer';

export const multerOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Only .png, .jpg and .jpeg image files are allowed!',
        ) as any,
        false,
      );
    }
  },
};

export const multerReceiptOptions = {
  storage: multer.memoryStorage(), // أو diskStorage لو تحب تحفظ محليًا
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Only .png, .jpg, .jpeg images or PDF files are allowed!',
        ) as any,
        false,
      );
    }
  },
};