import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable React hooks exhaustive deps warnings
      "react-hooks/exhaustive-deps": "off",

      // Disable unescaped entities errors
      "react/no-unescaped-entities": "off",

      // Disable TypeScript explicit any errors
      "@typescript-eslint/no-explicit-any": "off",

      // Disable unused variables errors
      "@typescript-eslint/no-unused-vars": "off",

      // Disable Next.js img element warnings
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
