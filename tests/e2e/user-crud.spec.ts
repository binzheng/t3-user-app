import { expect, test } from "@playwright/test";
import { ensureServerRunning } from "./utils";

test.describe("User CRUD flow", () => {
  test.beforeAll(async () => {
    await ensureServerRunning();
  });

  test("should create, update, and delete a user", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "ユーザー追加" }).click();
    await page.getByLabel("氏名", { exact: true }).fill("E2E ユーザー");
    await page.getByLabel("メールアドレス").fill("e2e@example.com");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page.getByText("E2E ユーザー")).toBeVisible();

    const createdRow = page.getByRole("row", { name: /E2E ユーザー/ });
    await createdRow.getByLabel("edit").click();
    await page.getByLabel("氏名", { exact: true }).fill("E2E ユーザー更新");
    await page.getByRole("button", { name: "更新" }).click();

    await expect(page.getByText("E2E ユーザー更新")).toBeVisible();

    const updatedRow = page.getByRole("row", { name: /E2E ユーザー更新/ });
    page.on("dialog", (dialog) => dialog.accept());
    await updatedRow.getByLabel("delete").click();

    await expect(page.getByText("E2E ユーザー更新")).not.toBeVisible();
  });
});
