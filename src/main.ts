import { parseFromString } from 'dom-parser';

type Entry = {
	url: string // Google Apps Script does not support WHATWG URL
	title: string
	published: Date
}

function workaroundDomParserIssue34(html: string) {
	return html.replace("<!DOCTYPE html>", "")
}

export function buildAtomFeed(entries: Iterable<Entry>) {
	const entriesXml = []
	for (const entry of entries) {
		entriesXml.push(
			"\t<entry>\n" +
			`\t\t<title>${entry.title}</title>\n` +
			`\t\t<link href="${entry.url}"/>\n` +
			`\t\t<id>${entry.url.toString()}</id>\n` +
			`\t\t<updated>${entry.published.toISOString()}</updated>\n` +
			`\t</entry>`
		)
	}
	return `
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>Hatena Blog Dev Trending</title>
	<link href="http://example.org/"/>
	<updated>2024-03-21T01:45:76Z</updated>
	<author>
		<name>John Doe</name>
	</author>
${entriesXml.join("\n")}
</feed>
	`.trim()
}

export function * getTrendingEntries(html: string) {
	const dom = parseFromString(workaroundDomParserIssue34(html))
	const trending = dom.getElementById("trending")
	if (trending === null) {
		return
	}
	const anchors = trending.getElementsByTagName("a")
	for (const anchor of anchors) {
		if (anchor.getAttribute("data-gtm-track-component") !== "entry_main") {
			continue
		}
		const url = anchor.getAttribute("href")
		const published = new Date(
			anchor.getAttribute("data-gtm-track-post_date")
		)
		const title = anchor.getElementsByTagName("h4")[0].textContent
		const entry: Entry = {
			url,
			title,
			published
		}
		yield entry
	}
}

function doGet() {
	const respnose = UrlFetchApp.fetch("https://hatena.blog/dev")
	const rawText = respnose.getContentText()
	const entries = getTrendingEntries(rawText)
	const atom = buildAtomFeed(entries)
	// ContentService.MimeType.RSS was removed from GAS
	// ref: https://issuetracker.google.com/issues/228222115
	return ContentService.createTextOutput(atom).setMimeType(ContentService.MimeType.RSS)
}
