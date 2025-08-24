import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { repositories } from 'src/common/enums/repositories';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create_car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CarModelService } from './../car_model/car_model.service';
import { CarBrandService } from './../car_brand/car_brand.service';
import { CarTypeService } from './../car_type/car_type.service';
import { Op } from 'sequelize';
import { Language } from 'src/common/enums/language';
import { CarType } from '../car_type/entites/car_type.entity';
import { CarBrand } from '../car_brand/entities/car_brand.entity';
import { CarModel } from '../car_model/entites/car_model.entity';
import { CarTypeLanguage } from '../car_type/entites/car_type_language.entity';
import { CarBrandLanguage } from '../car_brand/entities/car_brand.languae.entity';
import { CarModelLanguage } from '../car_model/entites/car_mode_language.entity';

@Injectable()
export class CarService {
  constructor(
    @Inject(repositories.car_repository) private carRepo: typeof Car,
    private carTypeService: CarTypeService,
    private carBrandService: CarBrandService,
    private carModelService: CarModelService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    customerId: number,
    dto: CreateCarDto,
    lang = Language.en,
    transaction?: any,
  ) {
    const inListCount = await this.carRepo.count({
      where: { customerId, isSave: true },
    });

    const isSave = dto.isSave === false ? false : true;

    if (isSave && inListCount >= 10) {
      const message = this.i18n.translate('translation.car.max_inlist_limit', {
        lang,
      });
      throw new BadRequestException(message);
    }

    const existing = await this.carRepo.findOne({
      where: { customerId, carName: dto.carName, isSave: true },
    });

    if (existing) {
      const message = this.i18n.translate('translation.name_exists', { lang });
      throw new BadRequestException(message);
    }

    await Promise.all([
      this.carTypeService.getOneOrFail(dto.carTypeId),
      this.carBrandService.getOneOrFail(dto.brandId),
      this.carModelService.getOneOrFail(dto.modelId),
    ]);

    let isDefault = false;

    if (isSave) {
      if (dto.isDefault) {
        await this.carRepo.update(
          { isDefault: false },
          { where: { customerId } },
        );
        isDefault = true;
      }
    }

    const car = await this.carRepo.create(
      {
        ...dto,
        customerId,
        isSave,
        isDefault,
      },
      { transaction },
    );

    const message = this.i18n.translate('translation.createdSuccefully', {
      lang,
    });
    return { message, carId: car.id };
  }

  getAllCustomerCars(customerId: number, lang = Language.en) {
    return this.carRepo.findAll({
      where: {
        IsSave: true,
        customerId,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: CarType,
          include: [{ model: CarTypeLanguage, where: { languageCode: lang },required:false }],
        },
        {
          model: CarBrand,
          include: [{ model: CarBrandLanguage, where: { languageCode: lang },required:false }],
        },
        {
          model: CarModel,
          include: [{ model: CarModelLanguage, where: { languageCode: lang },required:false }],
        },
      ],
    });
  }

  async getCustomerCar(customerId: number, carId: number, lang = Language.en) {
    console.log(customerId);
    console.log(carId);
    const car = await this.carRepo.findOne({
      where: { id: carId, customerId },
      include: [
        {
          model: CarType,
          include: [{ model: CarTypeLanguage, where: { languageCode: lang },required:false }],
        },
        {
          model: CarBrand,
          include: [{ model: CarBrandLanguage, where: { languageCode: lang },required:false}],
        },
        {
          model: CarModel,
          include: [{ model: CarModelLanguage, where: { languageCode: lang },required:false }],
        },
      ],
    });
    if (!car) {
      const message = this.i18n.translate('translation.not_found', {
        lang,
      });
      throw new NotFoundException(message);
    }

    return car;
  }

  async delete(customerId: number, carId: number, lang = Language.en) {
    const car = await this.getCustomerCar(customerId, carId, lang);
    await car.update({ isSave: false, isDefault: false });
    const message = this.i18n.translate('translation.deletedSuccefully', {
      lang,
    });
    return { message };
  }

  async update(
    customerId: number,
    carId: number,
    dto: UpdateCarDto,
    lang = Language.en,
  ) {
    const car = await this.getCustomerCar(customerId, carId, lang);
    if (dto.carName && dto.carName !== car.carName) {
      const existing = await this.carRepo.findOne({
        where: {
          customerId,
          carName: dto.carName,
          isSave: true,
          id: { [Op.ne]: carId },
        },
      });

      if (existing) {
        const message = this.i18n.translate('translation.name_exists', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }
    await Promise.all([
      this.carTypeService.getOneOrFail(dto.carTypeId),
      this.carBrandService.getOneOrFail(dto.brandId),
      this.carModelService.getOneOrFail(dto.modelId),
    ]);

    if (dto.isDefault) {
      await this.carRepo.update(
        { isDefault: false },
        { where: { customerId } },
      );
    }

    await car.update({ ...dto, isDefault: dto.isDefault ?? car.isDefault });

    const message = this.i18n.translate('translation.updatedSuccefully', {
      lang,
    });
    return { message };
  }
}
