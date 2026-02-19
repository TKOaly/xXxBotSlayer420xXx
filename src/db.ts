import { Database } from "bun:sqlite";
import type { Chat } from "node-telegram-bot-api";

const db = new Database("bot.db", { create: true, strict: true });
db.run("PRAGMA journal_mode = WAL;");

class WhitelistDB {
  constructor(private db: Database) {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE
      );
    `);
  }

  whitelistUser(userId: number) {
    try {
      this.db.run("INSERT INTO whitelist (user_id) VALUES (?);", [userId]);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("UNIQUE constraint failed")
      ) {
        // User is already whitelisted, ignore the error
        return;
      }
      throw e; // Rethrow other errors
    }
  }

  isWhitelisted(userId: number): boolean {
    const query = this.db.query(
      "SELECT 1 FROM whitelist WHERE user_id = $userId;",
    );
    const result = query.get({ userId });
    return !!result;
  }
}

/**
 * SQLite-backed database to store chats the bot is an admin in.
 */
class ChatDB {
  private localCache: Set<number> = new Set();

  constructor(private db: Database) {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        chat_id INTEGER NOT NULL UNIQUE
      );
    `);
  }

  /**
   * Can be called repeatedly for the same chat without causing duplicates;
   * after the first call it will be a no-op (with local cache check to avoid hitting the database).
   */
  addChat(chat: Chat) {
    if (this.localCache.has(chat.id)) {
      return;
    }

    console.info(`[➕ chat] ${chat.title} [${chat.id}] `);

    try {
      this.db.run("INSERT INTO chats (chat_id, name) VALUES (?, ?);", [
        chat.id,
        chat.title || null,
      ]);
      this.localCache.add(chat.id);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("UNIQUE constraint failed")
      ) {
        // Chat is already in the database, ignore the error
        return;
      }
      throw e; // Rethrow other errors
    }
  }

  getAllChats(): { id: number; name: string | null }[] {
    const query = this.db.query("SELECT chat_id, name FROM chats;");
    return query.all().map((row: any) => ({ id: row.chat_id, name: row.name }));
  }
}

export const whitelist = new WhitelistDB(db);
export const chats = new ChatDB(db);
