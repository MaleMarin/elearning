import { test, expect } from "@playwright/test";

test.describe("Login y dashboard", () => {
  test("login con credenciales y llega al dashboard", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /iniciar sesión/i })).toBeVisible();

    await page.getByLabel(/correo/i).fill("alumno@test.local");
    await page.getByLabel(/contraseña/i).fill("cualquierpassword");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/inicio/);
    await expect(page.getByText(/bienvenida\/o|tu próxima acción/i)).toBeVisible({ timeout: 10000 });
  });

  test("demo: login sin credenciales reales accede al dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo/i).fill("demo@demo.com");
    await page.getByLabel(/contraseña/i).fill("demo");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/inicio/, { timeout: 10000 });
    await expect(page.getByText(/siguiente acción|continuar|módulos/i)).toBeVisible({ timeout: 10000 });
  });
});
