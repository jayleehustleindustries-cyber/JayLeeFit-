import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

// Qualification applications (4-phase form)
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  fullName: varchar("fullName", { length: 160 }),
  phase1Json: text("phase1Json"),
  phase2Json: text("phase2Json"),
  phase3Json: text("phase3Json"),
  phase4Json: text("phase4Json"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// AI Engine intake + generated plans
export const aiPlans = mysqlTable("ai_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }),
  goals: text("goals").notNull(),
  fitnessLevel: varchar("fitnessLevel", { length: 32 }).notNull(),
  availability: varchar("availability", { length: 160 }).notNull(),
  focusArea: varchar("focusArea", { length: 160 }),
  limitations: text("limitations"),
  planOutput: text("planOutput"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AiPlan = typeof aiPlans.$inferSelect;
export type InsertAiPlan = typeof aiPlans.$inferInsert;

// Payment self-reports
export const paymentReports = mysqlTable("payment_reports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  method: varchar("method", { length: 32 }).default("PayPal"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  transactionId: varchar("transactionId", { length: 64 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PaymentReport = typeof paymentReports.$inferSelect;
export type InsertPaymentReport = typeof paymentReports.$inferInsert;
