import * as mongoose from 'mongoose';

const HubChatMongoSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    profile_id: {
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
  },
  {
    timestamps: true,
  },
);

export default HubChatMongoSchema;
