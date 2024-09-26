import { IsNotEmpty } from 'class-validator';

export class CreateHubControllerDto {
  @IsNotEmpty()
  public originProfileId: string;
}
