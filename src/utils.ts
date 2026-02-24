import TelegramBot from "node-telegram-bot-api";
import { WANTED_RIGHTS } from "./constants";
import { chats } from "./db";

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

export const formatUserDetails = (user: TelegramBot.User | undefined) => {
  if (!user) {
    return `<unknown user>`;
  }

  let userDetails = user.first_name;
  if (user.last_name) {
    userDetails += " " + user.last_name;
  }

  if (user.username) {
    userDetails += ` [@${user.username}]`;
  }

  userDetails += ` (${user.id})`;

  return userDetails;
};

export const formatChatDetails = (
  chat: TelegramBot.Chat | number,
  name?: string | null,
) => {
  if (typeof chat === "number" && name != null) {
    return `${name ?? "<no name>"} (${chat})`;
  }

  const allChats = chats.getAllChats();
  const chatDetails = allChats.find(
    (c) => c.id === (typeof chat === "number" ? chat : chat.id),
  );

  if (chatDetails) {
    return `${chatDetails.name} (${chatDetails.id})`;
  }

  if (typeof chat === "number") {
    return `<unknown chat> (${chat})`;
  }

  return `${chat.title || "<no name>"} (${chat.id})`;
};

const sanitizeMarkdownString = (s: string) =>
  s.replaceAll(/[\\\ \_\*\[\]\(\)\~\`\>\#\+\-\=\|\{\}\.\!]/g, (s) => `\\${s}`);

export const formatUserMention = (user: TelegramBot.User) =>
  user.username
    ? `@${sanitizeMarkdownString(user.username)}`
    : `[${[user.first_name, user.last_name]
        .filter(Boolean)
        .map((s) => sanitizeMarkdownString(s ?? ""))
        .join(" ")}](tg://user?id=${user.id})`;
