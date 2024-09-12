import { Document } from 'mongoose';

export interface HubMongoInterface extends Document {
  readonly _id: string;
  user_id: string;
  nick: string;
  image: string;
  date_birth: string;
  gender: string;
  province_id: string;
  country_id: string;
}
