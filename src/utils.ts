import type TelegramBot from "node-telegram-bot-api";
import { WANTED_RIGHTS } from "./constants";

export const ensureDefaultRights = async (bot: TelegramBot) => {
  const currentRights = await bot.getMyDefaultAdministratorRights({
    for_channels: false,
  });

  const hasCorrectRights = Object.entries(WANTED_RIGHTS).every(
    ([right, value]) =>
      currentRights[right as keyof TelegramBot.ChatAdministratorRights] ===
      value,
  );

  if (hasCorrectRights) {
    return;
  }

  console.info(
    "[rights] Updating default admin rights to ensure proper functionality",
  );
  const success = await bot.setMyDefaultAdministratorRights({
    for_channels: false,
    rights: WANTED_RIGHTS,
  });

  if (success) {
    console.info("[rights] Default admin rights updated successfully");
  } else {
    console.warn(
      "[rights] Failed to update default admin rights, the bot may not function correctly in new chats",
    );
  }
};

export const createChallenge = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  return {
    challenge: `${num1} \\+ ${num2}`,
    answer: (num1 + num2).toString(),
  };
};
