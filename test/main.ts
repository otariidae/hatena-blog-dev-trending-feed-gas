import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { dirname } from "dirname-filename-esm"
import { buildAtomFeed, getTrendingEntries } from "../src/main.ts"

const __dirname = dirname(import.meta)

test("getTrendingArticleLinks", async (t) => {
	await t.test("hoge", async () =>  {
		const html = (await fs.readFile(path.join(__dirname, "hatena_blog_dev_20240320.html"))).toString()
		const articles = getTrendingEntries(html)
		assert.equal(Array.from(articles).length, 20)
		console.log(articles)
	})
})

test("buildAtomFeed", async (t)=> {
	await t.test("hoge", async () => {
		const expectedAtomFeed = await (await fs.readFile(path.join(__dirname, "expected.xml"))).toString()
		assert.equal(
			buildAtomFeed([{
				title: "ZOZOTOWNにおけるマーケティングメール配信基盤の構築",
				url: "https://techblog.zozo.com/entry/mass-mail-delivery",
				published: new Date("2024-03-20T00:00:00+09:00")
			}, {
				title: "Node.js18を20にアップデートして、jestの実行速度を3倍にした",
				url: "https://tech.curama.jp/entry/2024/03/19/124007",
				published: new Date("2024-03-19T00:00:00+09:00")
			}]),
			expectedAtomFeed
		)
	})
})
