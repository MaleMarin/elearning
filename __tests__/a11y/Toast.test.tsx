/**
 * Test de accesibilidad (jest-axe) para el componente Toast.
 * Ejecutar con: npx jest __tests__/a11y/Toast.test.tsx
 * Requiere: npm install --save-dev jest @testing-library/react @types/jest
 */
/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Toast } from "@/components/ui/Toast";

expect.extend(toHaveNoViolations);

describe("Toast", () => {
  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(
      <Toast message="Mensaje de ejemplo" onDismiss={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("tiene role status y aria-live polite", () => {
    const { container } = render(<Toast message="Test" />);
    const el = container.querySelector('[role="status"][aria-live="polite"]');
    expect(el).toBeInTheDocument();
  });
});
