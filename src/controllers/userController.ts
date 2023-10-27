import User, { IUser } from "../models/user";
import { prepareUnclassifiedDataMessage } from "../routes/messageHandler";
import { whatsappService } from "../services/whatsappServices";
import { getOneUnclassifiedData } from "./dataController";

export const createUser = async (phoneNumber: string): Promise<IUser> => {
  try {
    const user = new User({
      phoneNumber,
    });
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};
export const getUser = async (phoneNumber: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ phoneNumber });
    return user;
  } catch (error) {
    throw error;
  }
};
export const setActive = async (phoneNumber: string): Promise<void> => {
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { isActive: true }
    );
    if (!user) {
      const new_user = await createUser(phoneNumber);
    }

    const data = await getOneUnclassifiedData();
    console.log(data?.toString());
    let message: string;
    console.log("[T]",typeof data);
    
    message = prepareUnclassifiedDataMessage(data);
    whatsappService.sendMessage(phoneNumber, message);
  } catch (error) {
    throw error;
  }
};
export const setInactive = async (phoneNumber: string): Promise<void> => {
  try {
    await User.findOneAndUpdate({ phoneNumber }, { isActive: false });

    const message = "You have successfully stopped the session";
    whatsappService.sendMessage(phoneNumber, message);
  } catch (error) {
    throw error;
  }
};
