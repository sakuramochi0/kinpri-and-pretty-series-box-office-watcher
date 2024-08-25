import { test } from '@playwright/test';

test('collect box office data from mimorin2014.com', async ({ page }) => {
   const posts = await getPosts(page)
  for (const post of posts) {
    if (doesPostExists(post)) {
      continue
    }

    savePost(post)
  }
  console.log(posts)
});

async function getPosts(page) {
  await page.goto('https://mimorin2014.com/blog-category-6.html');
  const posts = await page
    .locator('.entry.list_content > .entry_body')
    .evaluateAll(div => div
      .filter(e => !e.textContent.match(/中間集計|25分前/))
      .map(e => e.textContent.trim())
    )
  return posts;
}

