import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OpeningHour } from './entites/opening_hour.entity';
import { OpeningHourEnum } from 'src/common/validation/validateAndParseOpeningHours';
import { DayOfWeek } from 'src/common/enums/day_of_week';
import { ActionOpeningHourDto } from './dto/action-open-hour.dto';

@Injectable()
export class OpeningHourService {
  constructor(
    @Inject(repositories.openingHour_repository)
    private openingHourRepo: typeof OpeningHour,
  ) {}

  async createOpiningHourForStore(storeId: number, hours: OpeningHourEnum[]) {
    const records = hours.map((hour) => ({
      storeId,
      day: hour.day as DayOfWeek, // تأكدنا من النوع
      openTime: hour.openTime,
      closeTime: hour.closeTime,
    }));

    await this.openingHourRepo.bulkCreate(records);
  }

  async updateStoreOpeningHours(storeId: number, hoursDto: ActionOpeningHourDto[]) 
  {
    for (const hour of hoursDto) {
      const [existingHour, created] = await this.openingHourRepo.findOrCreate({
        where: {
          storeId,
          day: hour.day,
        },
        defaults: {
          openTime: hour.openTime || null,
          closeTime: hour.closeTime || null,
        },
      });

      if (!created) {
        existingHour.openTime = hour.openTime || null;
        existingHour.closeTime = hour.closeTime || null;
        await existingHour.save();
      }
    }
  }

  async getOpeningHoursByStoreId(storeId:number)
  {
    return this.openingHourRepo.findAll({where:{storeId}})
  }
}