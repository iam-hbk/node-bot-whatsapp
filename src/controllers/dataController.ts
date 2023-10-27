import Data, { IData, Label, Status } from "../models/data";

export const createData = async (
  text: string,
  id: Number
): Promise<Boolean> => {
  try {
    const data = new Data({
      id,
      text,
      label: Label.UNKNOW,
      status: Status.UNCLASSIFIED,
    });
    await data.save();
    return !!data;
  } catch (error) {
    throw error;
  }
};

interface IClassificationResult {
  didClassify: boolean;
  message: string;
}
export const classifyData = async (
  id: number,
  label: Label,
  language: string,
  classifiedBy: string
): Promise<IClassificationResult> => {
  try {
    const data = await Data.findOne({ id });

    let res: typeof data = null;

    if (!data) throw new Error("Data not found");
    if (data.status !== Status.UNCLASSIFIED) {
      return {
        didClassify: true,
        message: "Data has already been classified and is awaiting *Review*",
      };
    } else {
      data.label = label;
      data.status = Status.PENDING_REVIEW;
      data.language = language;
      data.classifiedBy = classifiedBy;
      res = await data.save();
      if (!res) throw new Error("Failed to save data");
    }
    return { didClassify: true, message: "Data Stored Successfully 🚀✅" };
  } catch (error) {
    return {
      didClassify: false,
      message: `An Error Occured while classifying the data\n\nError:${
        (error as Error).message
      }`,
    };
  }
};

export const reviewData = async (
  id: number,
  label: Label,
  language: string
): Promise<Boolean> => {
  try {
    if (label === Label.UNKNOW) throw new Error("Label cannot be UNKNOW");

    const data = await Data.findOneAndUpdate(
      { id },
      { label, status: Status.CLASSIFIED, language }
    );
    return !!data;
  } catch (error) {
    throw error;
  }
};

export const getOneUnclassifiedData = async (): Promise<IData | null> => {
  try {
    const data = await Data.findOne({ status: Status.UNCLASSIFIED });
    if (!data) return null;
    return data;
  } catch (error) {
    return null;
  }
};

export const getOnePendingReviewData = async (): Promise<IData | string> => {
  try {
    const data = await Data.findOne({ status: Status.PENDING_REVIEW });
    if (!data) return "No data pending review at the moment.";
    return data;
  } catch (error) {
    return "Failed to get data pending review, please try again later.";
  }
};
export const getAllData = async (): Promise<IData[] | null> => {
  try {
    const data = await Data.find();
    return data;
  } catch (error) {
    throw error;
  }
};
