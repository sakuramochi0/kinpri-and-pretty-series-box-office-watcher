import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mimorin2014.com/archives.html');
  await page.getByRole('link', { name: 'デイリー合算ランキング：20240824(土)', exact: true }).click();
  await page.getByText('デイリー上映25分前販売数合計ランキング：20240824').click();
  await page.getByText('デイリー合算ランキング：20240824(土) 2024/').click();
  await page.getByRole('link', { name: '（独立系を含む）デイリー合算ランキング：20240824(土)', exact: true }).click();
  await page.getByText('（独立系を含む）デイリー上映25分前販売数合計ランキング：').click();
});
