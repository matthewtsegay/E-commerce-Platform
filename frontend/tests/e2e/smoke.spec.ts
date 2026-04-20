import { test, expect } from '@playwright/test';

test('home page loads and shows brand', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('NEBI STORE').first()).toBeVisible();
});
