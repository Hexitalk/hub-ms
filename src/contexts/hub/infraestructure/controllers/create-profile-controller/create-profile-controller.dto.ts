import { GenderEnum } from '../../../domain/enums/gender.enum';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateHubControllerDto {
  @IsString()
  @Length(3, 20)
  public nick: string;

  @IsString()
  @Length(8, 100)
  public password: string;

  @IsEnum(GenderEnum)
  public gender: GenderEnum;

  @IsDateString()
  public date_birth: string;

  // @IsUrl()
  @IsOptional()
  public image?: string;

  @IsMongoId()
  public province_id: string;

  @IsMongoId()
  public country_id: string;
}
