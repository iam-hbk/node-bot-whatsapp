import { Request, Response } from "express";
import { getUser, setActive, setInactive } from "../controllers/userController";
import { IData, Label } from "../models/data";
import { whatsappService } from "../services/whatsappServices";
import {
  classifyData,
  getOneUnclassifiedData,
} from "../controllers/dataController";
import { z } from "zod";

const CLASSIFY_TEMPLATE_MESSAGE =
  "Please classify the text to one of the following labels and provide the language of the text:\n\n*positive*\n*negative*\n*neutral*\n\nFormat:\n[ID] [label] [language]\n\nExample:\n\n_43 positive english_\n\nOr type *disconnect* to stop the session";

export default async function handleIncomingMessage(
  res: Response,
  req: Request
): Promise<void> {
  /**
   * Handles incoming message from Twilio Webhook,
   * and sends back a response to Twilio to confirm receipt of message
   *
   * The function gets the message body and the user's phone number from the request body,
   * cleans the user's phone number by removing the "whatapp:" prefix,
   * calls the appropriate controller depending on the message
   *
   * @param {Response} res - Express Response object
   * @param {Request} req - Express Request object
   * @returns {void}
   * @example handleIncomingMessage(res, req);
   *
   */

  //get the message body and the user's phone number
  const { Body, From } = req.body;

  //clean the user's phone number by removing the "whatapp:" prefix
  const user_number = From.split(":")[1];

  //fecth the user from the database and check if the user is active
  const user_ = await getUser(user_number);
  const isActive = user_?.isActive;

  console.log(`BODY|${Body.toLowerCase().trim()}|`);
  if (Body.toLowerCase() === "start") {
    //activate the user's session
    try {
      setActive(user_number);
    } catch (error) {
      const message = "Failed to start the session, please try again later.";
      whatsappService.sendMessage(user_number, message);
    }
  } else if (Body.toLowerCase() === "disconnect") {
    //deactivate the user's session
    try {
      setInactive(user_number);
    } catch (error) {
      const message = "Failed to stop the session, please try again later.";
      whatsappService.sendMessage(user_number, message);
    }
  } else {
    if (!isActive) {
      //if the user is not active, send a message to the user to start the session
      const message = "Please type *start* to start the session";
      whatsappService.sendMessage(user_number, message);
    } else {
      await handleClassification(Body, user_number);
    }
  }
  res.status(200).send();
}

export function prepareUnclassifiedDataMessage(
  data: IData | null,
  firstMessage = true
): string {
  /**
   * Prepares a message to be sent to the user
   * containing the unlabeled data
   *
   * @param {IData} data - unlabeled data
   * @returns {string} - message to be sent to the user
   * @example prepareUnclassifiedDataMessage(data);
   * @example prepareUnclassifiedDataMessage(null);
   */

  if (!data) return "No unlabeled data available at the moment.";

  const { id, text } = data;

  let message: string;
  if (!firstMessage) {
    message = `
  *ID:* ${id}\n*Text:* ${text}\n\n[ID] [Label] [Language]\n\nSend *_disconnect_* to stop the session`;
    return message;
  } else {
    message = `
  *ID:* ${id}\n*Text:* ${text}\n\n*Task*\nPlease classify the above text to one of the following labels and provide the language of the text:\n\n*positive*\n*negative*\n*neutral*\n\nFormat:\n[ID] [label] [language]\n\nExample:\n\n_43 positive english_\n\nOr type *disconnect* to stop the session`;
    return message;
  }
}

const UserResponseSchema = z.object({
  id: z.number(),
  label: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  language: z.string(),
});

async function handleClassification(
  body: string,
  user_number: string
): Promise<void> {
  body = body.toLowerCase().trim();
  let body_array = body.split(" ");

  if (body_array.length !== 3) {
    const message = `🛑 *Incorrect Format !*\n\n${CLASSIFY_TEMPLATE_MESSAGE}`;
    whatsappService.sendMessage(user_number, message);
    return;
  } else {
    const [id, label, language] = body_array;
    const user_response = UserResponseSchema.safeParse({
      id: parseInt(id),
      label: label.toUpperCase(),
      language,
    });
    if (!user_response.success) {
      const message = `🛑 *Incorrect Format !*\n\n${CLASSIFY_TEMPLATE_MESSAGE}`;
      whatsappService.sendMessage(user_number, message);
      return;
    }
    const {
      id: safe_id,
      label: safe_label,
      language: safe_language,
    } = user_response.data;

    const classification_results = await classifyData(
      safe_id,
      safe_label as Label,
      safe_language,
      user_number
    );
    if (!classification_results.didClassify) {
      const message =
        classification_results.message + "\n\n" + CLASSIFY_TEMPLATE_MESSAGE;
      whatsappService.sendMessage(user_number, message);
      return;
    } else {
      const data = await getOneUnclassifiedData();
      await whatsappService.sendMessage(
        user_number,
        classification_results.message
      );
      const message = prepareUnclassifiedDataMessage(data, false);
      whatsappService.sendMessage(user_number, message);
    }

    return;
  }
}
