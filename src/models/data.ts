import { Schema, model } from "mongoose";

export interface IData {
  id: Number;
  text: String;
  label: Label;
  status: Status;
  language: String;
  classifiedBy: String;
}
export enum Label {
  POSITIVE = "POSITIVE",
  NEGATIVE = "NEGATIVE",
  NEUTRAL = "NEUTRAL",
  UNKNOW = "UNKNOW",
}
export enum Status {
  UNCLASSIFIED = "UNCLASSIFIED",
  CLASSIFIED = "CLASSIFIED",
  PENDING_REVIEW = "PENDING_REVIEW",
}
const dataSchema = new Schema<IData>({
  id: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  label: {
    type: String,
    required: true,
    enum: Object.values(Label),
    default: Label.UNKNOW,
  },
  status: { type: String, required: true, enum: Object.values(Status) },
  language: { type: String, required: true, default: "unknow" },
  classifiedBy: { type: String, required: true, default: "unknow" },
});

const Data = model<IData>("Data", dataSchema);

export default Data;
