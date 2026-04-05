import { int, sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const todosTable = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  descripcion: text().notNull(),
  completo: integer({ mode: 'boolean' }).notNull().default(false),
});
