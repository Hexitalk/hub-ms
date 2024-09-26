import { IsNotEmpty } from 'class-validator';

export class GetHubsPropagateControllerDto {
  @IsNotEmpty()
  public userId: string;
}
