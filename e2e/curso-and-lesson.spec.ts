import { test, expect } from "@playwright/test";

test.describe("Curso y lección", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo/i).fill("alumno@test.local");
    await page.getByLabel(/contraseña/i).fill("test");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/inicio/, { timeout: 15000 });
  });

  test("ver curso y listado de módulos/lecciones", async ({ page }) => {
    await page.goto("/curso");
    await expect(page).toHaveURL(/\/curso/);

    await expect(page.getByText(/módulos y lecciones|módulo/i)).toBeVisible({ timeout: 10000 });
    const link = page.getByRole("link", { name: /introducción al programa|contenido principal/i }).first();
    await expect(link).toBeVisible({ timeout: 5000 });
  });

  test("entrar a lección y marcar completada", async ({ page }) => {
    await page.goto("/curso");
    await expect(page.getByText(/módulo|lecciones/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: /introducción al programa/i }).first().click();
    await expect(page).toHaveURL(/\/curso\/lecciones\/demo-l1/);

    await expect(page.getByRole("heading", { name: /introducción al programa/i })).toBeVisible({ timeout: 5000 });

    const btn = page.getByRole("button", { name: /marcar como completada/i });
    await expect(btn).toBeVisible({ timeout: 3000 });
    await btn.click();

    await expect(page.getByText(/completaste esta lección|completada/i)).toBeVisible({ timeout: 5000 });
  });
});
