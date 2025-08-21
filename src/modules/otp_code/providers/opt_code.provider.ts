import { repositories } from 'src/common/enums/repositories';
import { OtpCode } from '../entities/otp_code.entity';
export const OptCodeProvider = [
    {
        provide: repositories.otpCode_repository,
        useValue: OtpCode,
    },
];