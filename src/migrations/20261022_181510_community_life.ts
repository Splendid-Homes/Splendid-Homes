import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`communities\` ADD \`life_beach\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`life_metro\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`life_schools\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`life_to_downtown\` numeric DEFAULT 20;`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`life_to_airport\` numeric DEFAULT 30;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`life_beach\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`life_metro\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`life_schools\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`life_to_downtown\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`life_to_airport\`;`)
}
