import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { HubChatStateEnum } from 'src/contexts/hub/domain/enums';

export class SetHubChatStateControllerDto {
  @IsNotEmpty()
  @IsNumber()
  public slot: number;

  @IsNotEmpty()
  @IsEnum(HubChatStateEnum)
  public state: HubChatStateEnum;
}
