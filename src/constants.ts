import type TelegramBot from "node-telegram-bot-api";

export const TOKEN = Bun.env.TELEGRAM_BOT_TOKEN;

export const CHALLENGE_TIMEOUT_SECONDS = 60;
export const CHALLENGE_DELETE_SECONDS = 1;
export const ADMIN_STATUS_CHECK_COOLDOWN = 60 * 1000;

export const WANTED_RIGHTS: TelegramBot.ChatAdministratorRights = {
  can_restrict_members: true,
  can_delete_messages: true,
  is_anonymous: false,
  can_change_info: false,
  can_delete_stories: false,
  can_edit_stories: false,
  can_invite_users: false,
  can_manage_chat: true,
  can_manage_video_chats: false,
  can_post_stories: false,
  can_promote_members: false,
};
