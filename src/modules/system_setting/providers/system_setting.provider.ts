import { SystemSetting } from '../entities/system_setting.entity';
import { repositories } from 'src/common/enums/repositories';
export const SystemSettingProvider = [
    {
        provide: repositories.system_settings_repository,
        useValue: SystemSetting,
    },
];