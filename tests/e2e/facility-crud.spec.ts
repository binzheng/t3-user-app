import { expect, test } from "@playwright/test";
import { ensureServerRunning } from "./utils";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("Facility CRUD flow", () => {
  test.beforeAll(async () => {
    await ensureServerRunning();
  });

  test("should create, update, and deactivate a facility", async ({ page }) => {
    const uniqueId = Date.now().toString(36);
    const facilityCode = `E2F-${uniqueId}`;
    const facilityName = `E2E 施設 ${uniqueId}`;
    const updatedName = `${facilityName} 更新`;

    await page.goto("/facilities");

    await page.getByRole("button", { name: "施設追加" }).click();
    await page.getByLabel("施設コード").fill(facilityCode);
    await page.getByLabel("施設名称", { exact: true }).fill(facilityName);
    await page.getByLabel("都道府県").fill("東京都");
    await page.getByRole("button", { name: "保存" }).click();
    await expect(page.getByRole("dialog", { name: "施設追加" })).not.toBeVisible();

    const createdRow = page.getByRole("row", {
      name: new RegExp(escapeRegex(facilityCode))
    });
    await expect(createdRow).toBeVisible({ timeout: 10000 });
    await expect(createdRow.getByText(facilityName)).toBeVisible();

    await createdRow.getByLabel("edit").click();
    await page.getByLabel("施設名称", { exact: true }).fill(updatedName);
    await page.getByRole("button", { name: "更新" }).click();

    const updatedRow = page.getByRole("row", {
      name: new RegExp(escapeRegex(updatedName))
    });
    await expect(updatedRow.getByText(updatedName)).toBeVisible({ timeout: 10000 });

    page.on("dialog", (dialog) => dialog.accept());
    await updatedRow.getByLabel("deactivate").click();

    await expect(updatedRow.getByRole("cell", { name: "INACTIVE" })).toBeVisible();
  });
});
