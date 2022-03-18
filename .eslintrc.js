module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "windows"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "comma-dangle": [
      "error",
      "always-multiline"
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      },
    ]
  },
  "overrides": [
    {
      "files": [
        "src/client/**/*.ts"
      ],
      "parserOptions": {
        "project": [
          "tsconfig.app.json"
        ],
        "createDefaultProgram": true
      },
      "extends": [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "mmb",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "mmb",
            "style": "kebab-case"
          }
        ],
        "indent": [
          "error",
          2
        ]
      }
    },
    // {
    //   "files": [
    //     "src/client/**/*.html"
    //   ],
    //   "extends": [
    //     "plugin:@angular-eslint/template/recommended"
    //   ],
    //   "rules": {}
    // }
  ]
};
