/**
 * Setup para tests con Jest.
 * Incluye jest-axe (accesibilidad) y @testing-library/jest-dom.
 */
import { toHaveNoViolations } from "jest-axe";
import "@testing-library/jest-dom";

expect.extend(toHaveNoViolations);
