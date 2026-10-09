const Database = require("better-sqlite3");

const databasePath = process.argv[2] || ".tmp/data.db";
const database = new Database(databasePath, { readonly: true });
const siteUrl = "https://dreamy.tours";

const isValidLink = (value) =>
	typeof value === "string" &&
	/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value);

function findInvalidUrls(value, path = [], results = []) {
	if (Array.isArray(value)) {
		value.forEach((item, index) =>
			findInvalidUrls(item, [...path, index], results),
		);
		return results;
	}

	if (value && typeof value === "object") {
		for (const [key, child] of Object.entries(value)) {
			const childPath = [...path, key];
			if (key === "url" && typeof child === "string" && !isValidLink(child)) {
				results.push({ path: childPath.join("."), value: child });
			}
			findInvalidUrls(child, childPath, results);
		}
	}

	return results;
}

const tables = database
	.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
	.all()
	.map(({ name }) => name);

const tableExists = (name) => tables.includes(name);

function resolveTour(componentType, componentId) {
	let currentType = componentType;
	let currentId = componentId;
	const seen = new Set();

	while (currentType.startsWith("tours.") && !seen.has(`${currentType}:${currentId}`)) {
		seen.add(`${currentType}:${currentId}`);
		const linksTable = tables.find((table) => {
			if (!table.endsWith("_cmps")) return false;
			return Boolean(
				database
					.prepare(
						`SELECT 1 FROM ${table} WHERE cmp_id = ? AND component_type = ? LIMIT 1`,
					)
					.get(currentId, currentType),
			);
		});
		if (!linksTable) return null;
		const link = database
			.prepare(
				`SELECT entity_id, component_type FROM ${linksTable} WHERE cmp_id = ? AND component_type = ? LIMIT 1`,
			)
			.get(currentId, currentType);
		if (!link) return null;

		if (linksTable === "tours_cmps") {
			return database
				.prepare("SELECT document_id, titulo, slug, locale FROM tours WHERE id = ?")
				.get(link.entity_id);
		}

		currentId = link.entity_id;
		const parentComponentByLinksTable = {
			components_tours_overviews_cmps: "tours.overview",
			components_tours_tabs_cmps: "tours.tab",
			components_tours_information_cmps: "tours.information",
			components_tours_itineraries_cmps: "tours.itinerary",
		};
		currentType = parentComponentByLinksTable[linksTable];
		if (!currentType) return null;
	}

	return null;
}

function publicTourUrl(tour) {
	if (!tour?.slug) return null;
	return `${siteUrl}${tour.locale === "en" ? "" : `/${tour.locale}`}/${tour.slug}/`;
}

function adminTourUrl(tour) {
	if (!tour?.document_id) return null;
	return `https://cms.dreamy.tours/admin/content-manager/collection-types/api::tour.tour/${tour.document_id}?plugins[i18n][locale]=${tour.locale}`;
}

let count = 0;
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

			let parsed;
			try {
				parsed = JSON.parse(row[column]);
			} catch (error) {
				console.error(`Invalid JSON: ${table}.${column} (id ${row.id}): ${error.message}`);
				continue;
			}

			for (const invalidUrl of findInvalidUrls(parsed)) {
				count += 1;
				const componentTypeByTable = {
					components_tours_timelines: "tours.timeline",
					components_tours_includes: "tours.includes",
					components_tours_acordeons: "tours.acordeon",
				};
				const componentType = componentTypeByTable[table] || null;
				const tour = componentType ? resolveTour(componentType, row.id) : null;
				console.log(
					JSON.stringify({
						table,
						id: row.id,
						column,
						...invalidUrl,
						tour,
						publicUrl: publicTourUrl(tour),
						adminUrl: adminTourUrl(tour),
					}),
				);
			}
		}
	}
}

console.error(`Invalid Rich Text URLs found: ${count}`);
