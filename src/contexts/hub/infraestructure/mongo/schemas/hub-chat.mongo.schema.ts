import * as mongoose from 'mongoose';
import { HubChatStateEnum } from 'src/contexts/hub/domain/enums';

const HubChatMongoSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    // user_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    // },
    origin_profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    target_profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    last_message_date: {
      type: String,
      required: false,
    },
    slot: {
      type: Number,
      required: true,
    },
    unread_messages: {
      type: Number,
      required: false,
    },
    state: {
      type: String,
      enum: Object.values(HubChatStateEnum),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default HubChatMongoSchema;
