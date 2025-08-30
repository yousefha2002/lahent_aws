import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const lang = req.headers['accept-language'] || 'ar';
        req['lang'] = lang;
        next();
    }
}