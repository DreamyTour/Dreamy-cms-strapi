const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const databasePath = args.find((argument) => argument !== "--dry-run") || ".tmp/data.db";

if (!fs.existsSync(databasePath)) {
	throw new Error(`Database not found: ${databasePath}`);
}

const isValidLink = (value) =>
	typeof value === "string" &&
	/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value);

function repair(value, pathParts = [], fixes = []) {
	if (Array.isArray(value)) {
		return value.flatMap((item, index) => {
			const itemPath = [...pathParts, index];

			if (
				item &&
				typeof item === "object" &&
				!Array.isArray(item) &&
				item.type === "link" &&
				!isValidLink(item.url)
			) {
				fixes.push({ path: [...itemPath, "url"].join("."), value: item.url });
				return Array.isArray(item.children)
					? repair(item.children, [...itemPath, "children"], fixes)
					: [];
			}

			return [repair(item, itemPath, fixes)];
		});
	}

	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, child]) => [
				key,
				repair(child, [...pathParts, key], fixes),
			]),
		);
	}

	return value;
}

const database = new Database(databasePath, { readonly: dryRun });
const tables = database
	.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
	.all()
	.map(({ name }) => name);

const changes = [];
for (const table of tables) {
	const jsonColumns = database
		.prepare(`PRAGMA table_info(${table})`)
		.all()
		.filter(({ type }) => String(type).toLowerCase() === "json");

	if (!jsonColumns.length) continue;

	const columns = ["id", ...jsonColumns.map(({ name }) => name)].join(", ");
	const rows = database.prepare(`SELECT ${columns} FROM ${table}`).all();

	for (const row of rows) {
		for (const { name: column } of jsonColumns) {
			if (!row[column]) continue;

			const fixes = [];
			let repaired;
			try {
				repaired = repair(JSON.parse(row[column]), [], fixes);
			} catch {
				continue;
			}

			if (fixes.length) changes.push({ table, id: row.id, column, fixes, repaired });
		}
	}
}

console.log(`Invalid Rich Text links to repair: ${changes.reduce((total, change) => total + change.fixes.length, 0)}`);
for (const { table, id, column, fixes } of changes) {
	for (const fix of fixes) console.log(`${table}.${column} id=${id} at ${fix.path}`);
}

if (dryRun) {
	console.log("Dry run complete. The database was not changed.");
	database.close();
	process.exit(0);
}

const backupPath = `${databasePath}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
database.close();
fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
console.log(`Backup created: ${path.resolve(backupPath)}`);

const writableDatabase = new Database(databasePath);
const update = writableDatabase.transaction(() => {
	for (const { table, id, column, repaired } of changes) {
		writableDatabase
			.prepare(`UPDATE ${table} SET ${column} = ? WHERE id = ?`)
			.run(JSON.stringify(repaired), id);
	}
});

update();
writableDatabase.close();
console.log(`Repaired ${changes.length} database fields safely.`);
