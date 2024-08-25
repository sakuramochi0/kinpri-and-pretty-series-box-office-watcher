import { Page, test } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs'

type Post = {
  title: string
  date: Date
  body: string
}


test('collect box office data from mimorin2014.com', async ({ page }) => {
   const posts = await getPosts(page)
  for (const post of posts) {
    const filename = getFilename(post)
    if (existsSync(filename)) {
      console.log(`skipping as file exists: ${filename}`)
      continue
    }
    console.log(post)

    savePost(filename, post)
  }
});

function getFilename(post: Post) {
  return `${post.title}.json`
}

function savePost(filename: string, post: Post) {
  const content = JSON.stringify(post, null, 2)
  writeFileSync(filename, content)
}

async function getPosts(page: Page): Promise<Post[]> {
  await page.goto('https://mimorin2014.com/blog-category-6.html');
  const posts = await page
    .locator('.entry.list_content:has(> .entry_body)')
    .evaluateAll(div => div
      .filter(e => !e.textContent.match(/中間集計|25分前/))
      .map(e => ({
        title: e.querySelector('.entry_header').textContent.trim(),
        date: new Date(e.querySelector('.entry_date').textContent.trim()),
        body: e.querySelector('.entry_body').textContent.trim(),
      }))
    )
  return posts;
}

