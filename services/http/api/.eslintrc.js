module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module",
        "project": ["./tsconfig.json", "./tests/mocks/auth_server/tsconfig.json"]
    },
    "plugins": [
        "@typescript-eslint",
        "import",
    ],
    "rules": {
        "import/no-unresolved": "error",
        "no-console": 0,
        "no-await-in-loop": 0,
        "no-plusplus": 0,
        "max-classes-per-file": ["error", 2],
        "no-underscore-dangle": 0,
        "@typescript-eslint/no-useless-constructor": 0,
    },
    "settings": {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts"]
        },
        "import/resolver": {
            "typescript": {
                "alwaysTryTypes": true // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
              },
        },
        "typescript": {
            "directory": "packages/*/tsconfig.json"
          },
    
    },
};
