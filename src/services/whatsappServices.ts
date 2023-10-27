// src/services/whatsappService.ts

import { client } from "../server"; // adjust the import if your Twilio client is initialized in a different file

export const whatsappService = {
  async sendMessage(user: string, text: string): Promise<void> {
    try {
      await client.messages.create({
        from: "whatsapp:+14155238886", // your Twilio number
        to: `whatsapp:${user}`,
        body: text,
      });
    } catch (error) {
      console.error(
        "Error sending WhatsApp message:",
        (error as Error).message
      );
    }
  },

  // Other WhatsApp-related methods can go here...
};
