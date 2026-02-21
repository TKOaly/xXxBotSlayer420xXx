import TelegramBot from "node-telegram-bot-api";
import dedent from "dedent";

import { whitelist, chats } from "./src/db";
import {
  createChallenge,
  ensureDefaultRights,
  formatChatDetails,
  formatUserDetails,
  formatUserMention,
} from "./src/utils";
import {
  ADMIN_STATUS_CHECK_COOLDOWN,
  CHALLENGE_TIMEOUT_SECONDS,
  CHALLENGE_DELETE_SECONDS,
  TOKEN,
} from "./src/constants";

console.info(`[🧑‍🚀] Starting xXxBotSlayer420xXx`);
console.info(`
                                                           @@@@@@@@@@@@@@@@@@@@@@@@                                                           
                                                   @@@@@@@@                        @@@@@@@@                                                   
                                              @@@@@                    @@                  @@@@@                                              
                                          @@@@                      @  @@  @                    @@@@                                          
                                      @@@@                @@         @@@@@@       @@@@ @@           @@@@                                      
                                   @@@          @   @@    @@         @@@@@@       @       @  @@         @@@                                   
                                @@@            @     @       @      @  @@  @       @@     @      @         @@@                                
                             @@@         @     @@@    @     @@         @@         @@     @      @     @       @@@                             
                           @@             @@      @   @@                                 @     @      @          @@                           
                         @@         @@@@   @@    @          @@@@@@@@@@@@@@@@@@@@@@@@           @     @     @       @@                         
                       @@      @     @     @@@       @@@@@@@                        @@@@@@      @  @@    @@  @       @@                       
                     @@      @@       @          @@@@                                     @@@@          @     @        @@                     
                   @@         @@ @     @     @@@@                                             @@@@     @      @          @@                   
                 @@       @     @   @     @@@                                                      @@      @@      @@@     @@                 
                @@         @@     @    @@                                                             @@         @          @@                
              @@             @@      @@                                                                 @@     @   @          @@              
             @@      @             @@                                                                      @    @     @@@      @@             
            @@       @     @     @@                                                                          @      @@  @       @@            
           @         @     @   @@                                                                             @@   @    @   @@    @           
         @@           @@@@@   @                                                                                 @@      @ @        @@         
        @@       @@         @@                                                                                    @    @@     @     @@        
        @           @@     @                                                                                       @            @    @        
       @        @@@       @            @@@@@@@@@@@@@@@@@@@  @@@@@@@@@@    @@@@@@@@@           @@@@@@@@@@            @@       @@  @    @       
      @@     @@         @@             @       @@@       @     @@@@         @@@            @@@         @@@           @@   @@@     @   @@      
     @@          @@    @@                      @@@        @     @@@        @@            @@@@            @@@           @               @@     
    @@     @@         @@                       @@@              @@@      @@             @@@@             @@@@           @          @    @@    
    @         @@@     @                        @@@              @@@    @@              @@@@               @@@@          @@    @@@   @    @    
   @@                @                         @@@              @@@  @@                @@@@               @@@@           @   @   @       @@   
   @     @          @                          @@@              @@@@@@@                @@@@               @@@@            @  @@           @   
  @@     @@ @  @   @@                          @@@              @@@ @@@@@              @@@@               @@@@             @        @     @@  
  @             @  @                           @@@              @@@   @@@@@            @@@@               @@@@             @   @  @@  @    @  
 @@               @                            @@@              @@@     @@@@@           @@@@              @@@               @   @@@        @@ 
 @@    @@      @  @                            @@@              @@@       @@@@@@@@       @@@             @@@                @              @@ 
 @         @@@@  @@                            @@@             @@@@        @@@@@@@        @@@           @@@                  @              @ 
@@               @                            @@@@             @@@@         @@@@@@@         @@@       @@@                    @              @@
@@    @          @                                                           @@@@              @@@@@@@                       @   @@@@@      @@
@@    @   @  @   @                                                           @@@@                                            @   @      @   @@
@@     @@@@@@@   @                                                           @@@@                                            @@   @         @@
@@               @                                                          @@@@                        @@@                  @@    @   @    @@
@@               @                                           @@@@           @@@@                     @@@@@@@                 @@             @@
@@    @@@@@      @                                    @@@     @             @@@@        @           @@@@@@@                  @@   @@        @@
@@               @                                     @                    @@@@      @@@@        @@     @                   @     @  @@    @@
@@        @      @                                                  @@@@    @@@    @@@@@@@@      @      @                    @     @ @@     @@
@@      @@@@@@@  @                                             @@@@@@@@    @@@@        @@@@     @                            @   @@         @@
 @               @@                                         @@@@           @@@@        @@@@    @                             @              @ 
 @@               @                                      @@                @@@         @@@@   @     @                       @          @   @@ 
 @@               @                                    @@    @@            @@@          @@@  @     @                        @    @@@@@@    @@ 
  @          @@    @                                 @       @@            @@@          @@@@@                              @          @    @  
  @@        @   @  @@                              @@        @@            @@@          @@@@                               @  @@      @   @@  
   @     @@@@       @                             @         @@@           @@@           @@@@   @                          @     @@        @   
   @@                @                          @@          @@  @@        @@@           @@@   @                          @        @      @@   
    @        @@@      @                        @@          @@@@@@         @@@           @@                              @@     @@@@@@    @    
    @@                @@                      @@          @@ @@@@         @@@     @     @@ @                            @               @@    
     @@             @  @@                    @@@         @@  @@@@         @@@   @@      @@@                            @  @            @@     
      @@    @@    @@    @@                   @@@        @@   @@@@   @    @@@@@@@                                     @@  @  @@        @@      
       @      @@@     @   @                  @@@       @@   @@@@@@@       @@@                                       @@         @@     @       
        @      @     @@    @                @@@@      @     @@@@@                     @                            @                 @        
        @@      @   @@      @@               @@@@  @@                                @                            @   @  @@@        @@        
          @        @  @       @              @@@@@@                                                             @@   @     @@      @          
           @      @@@@@@@@@    @@                                                                             @@     @      @     @           
            @@               @   @@                                              @             @             @       @@    @    @@            
             @@            @@      @@                                            @@        @@@@           @@   @@@@@@   @      @@             
              @@      @@ @@          @@                                           @@@@@@@@@@            @@    @     @         @@              
                @@      @        @     @@@                                                           @@@       @@   @       @@                
                 @@       @    @@         @@@                                                     @@@      @        @      @@                 
                   @@         @@   @   @     @@@@                                             @@@@      @   @@           @@                   
                     @@             @    @@      @@@@                                     @@@@          @     @        @@                     
                       @@        @  @     @  @@      @@@@@@                         @@@@@@        @@ @@ @            @@                       
                         @@               @  @   @@@        @@@@@@@@@@@@@@@@@@@@@@@@        @@ @     @  @          @@                         
                           @@           @   @      @                                           @       @@        @@                           
                             @@@         @ @     @@      @@      @   @      @   @@  @@          @             @@@                             
                                @@@              @@    @@  @     @   @@    @@   @     @          @         @@@                                
                                   @@@          @@    @    @    @@   @  @  @    @     @       @         @@@                                   
                                      @@@@                 @@   @@   @   @@@    @     @             @@@@                                      
                                          @@@@                  @    @     @    @               @@@@                                          
                                              @@@@@                                        @@@@@                                              
                                                   @@@@@@@@                        @@@@@@@@                                                   
                                                           @@@@@@@@@@@@@@@@@@@@@@@@                                                           

`);

if (!TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
} else {
  console.info(`[🔑 token] Using bot token: ${TOKEN.substring(0, 2)}...`);
}

const bot = new TelegramBot(TOKEN, {
  polling: {
    params: {
      allowed_updates: ["chat_member", "message"],
    },
  },
});
const botUser = await bot.getMe();

console.info(`[🚀 started] ${botUser.username} (${botUser.id})`);

await ensureDefaultRights(bot);

const adminChats = new Set<number>();
const adminChatsCooldown: Record<number, number> = {};

// Populate adminChats from the database on startup
const allChats = chats.getAllChats();
if (allChats.length === 0) {
  console.warn("[⚠️] No chats in database");
}
for (const { id, name } of allChats) {
  const chatDetails = formatChatDetails(id, name);

  try {
    const admins = await bot.getChatAdministrators(id);

    if (admins.some((admin) => admin.user.id === botUser.id)) {
      console.info(`[👮] Found admin chat on startup: ${chatDetails}`);
      adminChats.add(id);
    }
  } catch (e) {
    console.error(
      `Failed to check admin status of ${chatDetails} on startup:`,
      e,
    );
  }
}

const checkAdminStatus = async (chat: TelegramBot.Chat) => {
  // If the chat is already known to be an admin, skip the check
  if (adminChats.has(chat.id)) {
    return true;
  }

  // Avoid spamming API with admin checks for chats that have already been checked recently
  if (
    adminChatsCooldown[chat.id] &&
    Date.now() - adminChatsCooldown[chat.id] < ADMIN_STATUS_CHECK_COOLDOWN
  ) {
    return false;
  }

  const admins = await bot.getChatAdministrators(chat.id);
  const chatDetails = formatChatDetails(chat);

  // If the bot is an admin, add the chat to the cache and return true
  if (admins.some((admin) => admin.user.id === botUser.id)) {
    console.info(`[👮] Added ${chatDetails} to admin chats`);
    adminChats.add(chat.id);
    return true;
  }

  // Set cooldown for this chat to avoid spamming API with checks
  adminChatsCooldown[chat.id] = Date.now();

  return false;
};

const awaitingResponse: Record<
  number,
  {
    challengeAnswer: string;
    challengeTimestamp: number;
    challengeTimeout: NodeJS.Timeout;
  }
> = {};

const banUserFromAllChats = async (user: TelegramBot.User) => {
  const userDetails = formatUserDetails(user);

  for (const id of adminChats) {
    const chatDetails = formatChatDetails(id);

    try {
      await bot.banChatMember(id, user.id, {
        revoke_messages: true,
        until_date: Math.floor(Date.now() / 1000) + 60,
      });
      console.info(`[🏌️ banned] ${userDetails} in ${chatDetails}`);
    } catch (e) {
      // On ETELEGRAM: 400 Bad Request: USER_NOT_PARTICIPANT,
      // remove from chats.
      if (e instanceof Error && e.message.includes("USER_NOT_PARTICIPANT")) {
        console.warn(
          `[😭] Bot is no longer present in ${chatDetails}, removing from admin list`,
        );
        adminChats.delete(id);
        chats.deleteChat(id);
        continue;
      }

      // On ETELEGRAM: 400 Bad Request: not enough rights to restrict/unrestrict chat member
      // we should remove the chat from the database for re-verification.
      if (e instanceof Error && e.message.includes("not enough rights")) {
        console.warn(
          `[😭] Bot is no longer admin in ${chatDetails}, removing from admin list`,
        );
        adminChats.delete(id);
        continue;
      }

      console.error(`Failed to ban ${userDetails} in chat ${chatDetails}:`, e);
    }
  }
};

const messagesToCleanUp: Record<
  number,
  { chatId: number; messageId: number; onlyIfBanned: boolean }[]
> = {};
const markMessageForCleanup = (
  userId: number,
  chatId: number,
  messageId: number,
  onlyIfBanned = false,
) => {
  if (!messagesToCleanUp[userId]) {
    messagesToCleanUp[userId] = [];
  }
  messagesToCleanUp[userId].push({ chatId, messageId, onlyIfBanned });
};
const cleanUpMessages = async (user: TelegramBot.User, banned: boolean) => {
  const messages = messagesToCleanUp[user.id];
  const userDetails = formatUserDetails(user);

  if (!messages || messages.length === 0) {
    return;
  }

  for (const { chatId, messageId, onlyIfBanned } of messages) {
    if (onlyIfBanned && !banned) {
      continue;
    }

    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (e) {
      console.error(
        `Failed to delete message ${messageId} for user ${userDetails}:`,
        e,
      );
    }
  }

  delete messagesToCleanUp[user.id];
};

const createChallengeTimeout = (user: TelegramBot.User) => {
  const userDetails = formatUserDetails(user);

  return setTimeout(async () => {
    if (!awaitingResponse[user.id]) {
      console.info(
        `[🔕 cancelled] [${userDetails}] Challenge already answered or not found`,
      );
      return;
    }

    console.info(
      `[⏰ timeout] [${userDetails}] Failed to answer challenge in time`,
    );

    delete awaitingResponse[user.id];

    await cleanUpMessages(user, true);
    await banUserFromAllChats(user);
  }, CHALLENGE_TIMEOUT_SECONDS * 1000);
};

bot.on(
  "chat_member",
  async ({
    chat,
    via_join_request,
    new_chat_member,
    old_chat_member,
    from,
  }) => {
    chats.addChat(chat);

    if (!(await checkAdminStatus(chat))) {
      return;
    }

    const user = new_chat_member.user;
    const userDetails = formatUserDetails(user);
    const fromDetails = formatUserDetails(from);
    const chatDetails = formatChatDetails(chat);

    // Only trigger for new members, not for leaves or other status changes
    if (
      new_chat_member.status !== "member" ||
      old_chat_member.status !== "left"
    ) {
      return;
    }

    // Check whitelist for user
    if (whitelist.isWhitelisted(user.id)) {
      console.info(`[✅ whitelist] ${userDetails} in ${chatDetails}`);
      return;
    }

    if (from.id !== user.id) {
      // Check whether a whitelisted or admin added this user
      if (whitelist.isWhitelisted(from.id)) {
        whitelist.whitelistUser(user.id);
        console.info(
          `[✅ added by whitelisted user] ${userDetails} added by whitelisted user ${fromDetails} in ${chatDetails}`,
        );
        return;
      }

      const chatAdmins = await bot.getChatAdministrators(chat.id);
      if (chatAdmins.some((admin) => admin.user.id === from.id)) {
        whitelist.whitelistUser(user.id);
        console.info(
          `[✅ added by admin] ${userDetails} added by admin ${fromDetails} in ${chatDetails}`,
        );
        return;
      }
    }

    if (via_join_request) {
      whitelist.whitelistUser(user.id);
      console.info(`[✅ join request] ${userDetails} in ${chatDetails}`);
      return;
    }

    if (awaitingResponse[user.id]) {
      console.info(`[🔕 awaiting] ${userDetails} in ${chatDetails}`);
      return;
    }

    const challenge = createChallenge();
    console.info(
      `[❓ challenge] ${userDetails} - ${challenge.challenge.replace("\\", "")} in ${chatDetails}`,
    );

    const mention = formatUserMention(user);

    const messageString = dedent`
      ${mention}

      Hei\! Ethän ole botti? Mitä on ${challenge.challenge}? \(${CHALLENGE_TIMEOUT_SECONDS} sekuntia aikaa\)
      Hi\! You're not a bot, right? What is ${challenge.challenge}? \(You have ${CHALLENGE_TIMEOUT_SECONDS} seconds\)
      Hej\! Du är väl ingen bot? Vad är ${challenge.challenge}? \(${CHALLENGE_TIMEOUT_SECONDS} sekunder på dig\)

      🦆
    `;

    try {
      const challengeMessage = await bot.sendMessage(chat.id, messageString, {
        protect_content: true,
        parse_mode: "MarkdownV2",
      });

      awaitingResponse[user.id] = {
        challengeAnswer: challenge.answer,
        challengeTimestamp: Date.now(),
        challengeTimeout: createChallengeTimeout(user),
      };
      markMessageForCleanup(user.id, chat.id, challengeMessage.message_id);
    } catch (e) {
      console.error(
        `Failed to send challenge message to ${userDetails} in ${chatDetails}:`,
        e,
      );
      return;
    }
  },
);

/**
 * Listen to messages to handle challenge responses.
 *
 * This handler avoids unnecessary logging to
 * avoid cluttering with non-relevant message.
 */
bot.on("message", async (message) => {
  const userDetails = formatUserDetails(message.from);
  const chatDetails = formatChatDetails(message.chat);

  if (message.text === "/ping") {
    console.info(`[🏓 ping] ${userDetails} in ${chatDetails}`);
  }

  if (message.chat.type === "private") {
    if (message.text?.includes("/vahvista")) {
      console.info(`[✅ whitelist via DM] ${userDetails} whitelisted via DM`);
      whitelist.whitelistUser(message.from!.id);
      try {
        await bot.sendMessage(
          message.chat.id,
          dedent`Olet vahvistettu, kiitos\!
          You are verified, thank you\!
          Du är verifierad, tack\!
          
          🦆💛🖤`,
          { parse_mode: "MarkdownV2" },
        );
      } catch (e) {
        console.error(
          `Failed to send confirmation message to ${userDetails} in DM:`,
          e,
        );
      }

      return;
    }

    if (message.text?.includes("/unohda")) {
      whitelist.forgetUser(message.from!.id);
      try {
        await bot.sendMessage(
          message.chat.id,
          dedent`Poistin vahvistuksesi tietokannasta\.
          I have removed your verification from the database\.
          Jag har tagit bort din verifiering från databasen\.
          
          🦆`,
          { parse_mode: "MarkdownV2" },
        );
      } catch (e) {
        console.error(
          `Failed to send confirmation message to ${userDetails} in DM:`,
          e,
        );
      }

      return;
    }
  }

  if (message.chat.type !== "group" && message.chat.type !== "supergroup") {
    return;
  }

  chats.addChat(message.chat);

  const user = message.from;
  const chat = message.chat;

  if (!user || !awaitingResponse[user.id]) {
    return;
  }

  if (!(await checkAdminStatus(chat))) {
    return;
  }

  const { challengeAnswer, challengeTimeout } = awaitingResponse[user.id];
  if (message.text?.includes(challengeAnswer)) {
    console.info(`[✅ passed] ${userDetails} in ${chatDetails}`);
    whitelist.whitelistUser(user.id);

    clearTimeout(challengeTimeout);
    delete awaitingResponse[user.id];

    await bot.setMessageReaction(chat.id, message.message_id, {
      reaction: [
        {
          type: "emoji",
          emoji: "👍",
        },
      ],
    });

    markMessageForCleanup(user.id, chat.id, message.message_id);

    setTimeout(
      () => cleanUpMessages(user, false),
      CHALLENGE_DELETE_SECONDS * 1000,
    );

    return;
  }

  // If the message content is just numbers or similar,
  // it's likely an attempt to answer the challenge,
  // so we can react with thumbs down to indicate failure.
  if (message.text && /^\s*[\d\W_]+\s*$/.test(message.text)) {
    await bot.setMessageReaction(chat.id, message.message_id, {
      reaction: [
        {
          type: "emoji",
          emoji: "👎",
        },
      ],
    });

    // Remove all thumbsed-down messages on cleanup,
    // even if the user manages to pass the challenge.
    markMessageForCleanup(user.id, chat.id, message.message_id);
  } else {
    // Remove all messages from the user if they are banned
    markMessageForCleanup(user.id, chat.id, message.message_id, true);
  }
});
