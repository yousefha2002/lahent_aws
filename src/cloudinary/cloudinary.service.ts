import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { PassThrough } from 'stream';

cloudinary.config({
  cloud_name: 'davqh75yb',
  api_key: '828755456576759',
  api_secret: 'j4zmKpkyd8IZkY7RqRm2cgmn_OE',
});

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
        },
        (error, result: any) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const bufferStream = new PassThrough();
      bufferStream.end(file.buffer);
      bufferStream.pipe(stream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
