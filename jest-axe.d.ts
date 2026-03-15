/// <reference types="@testing-library/jest-dom" />
declare module "jest-axe" {
  /** Resultado de axe-core run. */
  interface AxeResults {
    violations: unknown[];
    passes?: unknown[];
    incomplete?: unknown[];
    inapplicable?: unknown[];
  }

  /** Ejecuta axe-core sobre el elemento y devuelve los resultados. */
  export function axe(element: Element | Document, options?: object): Promise<AxeResults>;

  /** Matcher de Jest para comprobar que no hay violaciones. */
  export const toHaveNoViolations: { toHaveNoViolations(results: AxeResults): { message: () => string; pass: boolean; actual: unknown[] } };
}
