import { Page, test } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs'

import { Post } from './types';

const PRETTY_SERIES_TITLE_LIST = [
  'KING OF PRISM',
  'ＫＩＮＧ ＯＦ ＰＲＩＳＭ',
]

test('collect box office data from mimorin2014.com', async ({ page }) => {
  const posts = await getPosts(page)
  for (const post of posts) {
    const filename = getFilename(post)
    console.log(filename)
    if (existsSync(filename)) {
      console.log('skipped as file exists...')
      continue
    }
    console.log(post)

    savePost(filename, post)
  }
});

function getFilename(post: Post) {
  return `../data/raw/${post.title}.json`
}

function savePost(filename: string, post: Post) {
  const content = JSON.stringify(post, null, 2)
  writeFileSync(filename, content)
}

async function getPosts(page: Page, pageNumber: number = 0): Promise<Post[]> {
  await page.goto(`https://mimorin2014.com/?cat=6&page=${pageNumber}`);
  const posts = await page
    .locator('.entry.list_content:has(> .entry_body)')
    .evaluateAll(div => div
      .map(e => ({
        url: (e.querySelector('.entry_more a') as HTMLLinkElement).href,
        title: e.querySelector('.entry_header').textContent.trim(),
        date: new Date(e.querySelector('.entry_date').textContent.trim()),
        body: e.querySelector('.entry_body').innerHTML.trim().split('<br>'),
      }))
      .filter(({ title }) => title.match(/合算/))
      .filter(({ title }) => !title.match(/中間集計|25分前|前日集計/))
    )
  return posts.map(post => filterPrettySeriesTitle(post))
}

// filter out records other than pretty series title from body
function filterPrettySeriesTitle(post: Post) {
  const headers = post.body.slice(0, 2)
  post.body = headers
    .concat(
      post.body.filter(
      row => PRETTY_SERIES_TITLE_LIST.some(title => row.includes(title))
    )
  )
  return post
}
