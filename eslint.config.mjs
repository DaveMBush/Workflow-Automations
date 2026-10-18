import nxEslintPlugin from '@nx/eslint-plugin';
import smarttoolsEslintPlugin from '@smarttools/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import eslintPluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import eslintPluginImport from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintPluginMaxParamsNoConstructor from 'eslint-plugin-max-params-no-constructor';
import eslintPluginSonarjs, {
  configs as sonarJsConfigs,
} from 'eslint-plugin-sonarjs';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

// can't support function until NX eslint supports ESM or
// functional supports CommonJS OR I figure out how to get
// configs working with dynamic imports (async await import()

const eslintConfig = async () => {
  const { default: stylisticEslintPlugin } =
    await import('@stylistic/eslint-plugin');
  const { default: unicorn } = await import('eslint-plugin-unicorn');

  return [
    {
      ignores: [
        'dist/**',
        '**/out-tsc/**',
        'coverage/**',
        '.nx/cache/**',
        '.nx/workspace-data/**',
        'tmp/**',
        '**/eslint.config.*',
        'eslint.config.*',
      ],
    },
    {
      files: ['libs/**/*.ts'],
      ignores: ['**/test-setup.ts'],
      ...jsdoc.configs['flat/recommended-typescript-error'],
    },
    {
      plugins: {
        '@nx': nxEslintPlugin,
        sonarjs: eslintPluginSonarjs,
        import: eslintPluginImport,
        'eslint-comments': eslintPluginEslintComments,
        unicorn,
        '@smarttools': smarttoolsEslintPlugin,
        'unused-imports': eslintPluginUnusedImports,
        'max-params-no-constructor': eslintPluginMaxParamsNoConstructor,
        '@stylistic': stylisticEslintPlugin,
      },
    },
    {
      languageOptions: {
        parser: typescriptEslintParser,
        parserOptions: {
          projectService: true,
          projectServiceOptions: {
            allowDefaultProject: [
              '**/*.config.*',
              '*.config.*',
              'apps/**/*.config.*',
              '**/eslint.config.*',
            ],
          },
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      files: ['vitest.config.ts', 'vitest.config.mts'],
      rules: {
        'eslint-comments/no-restricted-disable': 'off',
        'eslint-comments/require-description': 'off',
        'unicorn/no-abusive-eslint-disable': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignores: [
        '**/test-setup.ts',
        '**/postcss.config.js',
        '**/tailwind.config.js',
        '**/vitest.config.ts',
        '**/vitest.teardown.ts',
        '**/coverage/**',
      ],
      rules: {
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
            ],
          },
        ],
      },
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    ...nxEslintPlugin.configs['flat/typescript'].map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
      rules: {
        ...(config.rules ?? {}),
      },
    })),
    {
      files: ['**/*.ts'],
      ignores: ['**/test-setup.ts'],
      rules: {
        ...(eslintPluginSonarjs.configs['recommended-legacy'].rules ?? {}),
        complexity: [
          'error',
          {
            max: 10,
          },
        ],
        'constructor-super': 'error',
        curly: 'error',
        'default-case': 'error',
        'eslint-comments/require-description': 'error',
        'eslint-comments/no-restricted-disable': [
          'error',
          'eslint-comments/no-restricted-disable',
          '@nx/enforce-module-boundaries',
          'no-console',
          '@typescript-eslint/explicit-function-return-type',
          '@typescript-eslint/explicit-module-boundary-types',
          '@typescript-eslint/no-unsafe-argument',
          '@typescript-eslint/no-unsafe-assignment',
          '@typescript-eslint/no-unsafe-call',
          '@typescript-eslint/no-unsafe-member-access',
          '@typescript-eslint/no-unsafe-return',
          'complexity',
          'max-depth',
          'max-lines',
          'max-lines-per-function',
          'max-classes-per-file',
          'max-statements',
          'max-statements-per-line',
          'max-nested-callbacks',
        ],
        eqeqeq: ['error', 'always'],
        'guard-for-in': 'error',
        'id-blacklist': [
          'warn',
          'any',
          'Number',
          'number',
          'String',
          'string',
          'Boolean',
          'boolean',
          'Undefined',
          'undefined',
        ],
        'id-match': 'off',
        'max-classes-per-file': ['error', 1],
        'max-depth': [
          'error',
          {
            max: 2,
          },
        ],
        'max-lines': [
          'error',
          {
            max: 300,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-lines-per-function': [
          'error',
          {
            max: 50,
            skipBlankLines: true,
            skipComments: true,
          },
        ],
        'max-nested-callbacks': [
          'error',
          {
            max: 2,
          },
        ],
        'max-statements': ['error', 50],
        'max-statements-per-line': [
          'error',
          {
            max: 1,
          },
        ],
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-case-declarations': 'error',
        'no-console': 'error',
        'no-constant-condition': 'error',
        'no-else-return': [
          'error',
          {
            allowElseIf: false,
          },
        ],
        'no-empty': 'error',
        'no-eval': 'error',
        'no-extra-boolean-cast': 'error',
        'no-irregular-whitespace': 'error',
        'no-prototype-builtins': 'error',
        'no-new-wrappers': 'error',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'ngx-bootstrap',
                message: 'Please use deep imports from ngx-bootstrap instead.',
              },
              {
                name: 'ngx-bootstrap/public_api',
                message: 'Please use deep imports from ngx-bootstrap instead.',
              },
              {
                name: 'moment',
                message: 'Please use moment-timezone instead.',
              },
              {
                name: 'lodash',
                message: "Please don't use any form of lodash",
              },
              {
                name: 'lodash-es',
                message: "Please don't use any form of lodash",
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              'CallExpression Identifier[name="firstValueFrom"], CallExpression Identifier[name="lastValueFrom"]',
            message: 'Prefer Observables over of Promises',
          },
        ],
        'no-shadow': 'off',
        'no-throw-literal': 'error',
        'no-undef-init': 'error',
        'no-underscore-dangle': 'error',
        'no-unreachable': 'error',
        'no-unreachable-loop': 'error',
        'no-unused-vars': 'off',
        'no-useless-escape': 'error',
        'object-shorthand': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-arrow-callback': 'off',
        radix: 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/ban-tslint-comment': 'error',
        '@typescript-eslint/no-empty-object-type': 'error',
        '@typescript-eslint/no-unsafe-function-type': 'error',
        '@typescript-eslint/no-wrapper-object-types': 'error',
        '@typescript-eslint/consistent-indexed-object-style': 'error',
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/default-param-last': 'error',
        '@typescript-eslint/dot-notation': [
          'error',
          {
            allowIndexSignaturePropertyAccess: true,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'no-public',
          },
        ],
        '@typescript-eslint/member-ordering': [
          'error',
          {
            default: {
              memberTypes: [
                'public-static-field',
                'public-static-method',
                'protected-static-field',
                'protected-static-method',
                'private-static-field',
                'private-static-method',
                'public-constructor',
                'protected-constructor',
                'private-constructor',
                'public-instance-method',
                'protected-instance-method',
                'private-instance-method',
              ],
              order: 'as-written',
            },
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@stylistic/lines-between-class-members': [
          'error',
          'always',
          {
            exceptAfterSingleLine: true,
          },
        ],
        '@typescript-eslint/method-signature-style': ['error', 'method'],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
            trailingUnderscore: 'forbid',
          },
          {
            selector: ['classMethod'],
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
          },
          {
            selector: 'classProperty',
            format: ['camelCase'],
          },
          {
            selector: 'enumMember',
            format: ['PascalCase'],
          },
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: {
              regex: '^I[A-Z]',
              match: false,
            },
          },
          {
            selector: 'objectLiteralProperty',
            format: null,
          },
          {
            selector: 'parameter',
            custom: {
              regex: '^_*$|^[a-z0-9]{1,}([A-Z][a-z0-9]{0,}){0,}\\$?$',
              match: true,
            },
            format: null,
          },
          {
            selector: 'parameter',
            modifiers: ['destructured'],
            format: null,
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
          {
            selector: 'typeProperty',
            format: ['camelCase'],
          },
          {
            selector: 'variable',
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
            trailingUnderscore: 'forbid',
          },
          {
            selector: 'variable',
            modifiers: ['const'],
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
            trailingUnderscore: 'forbid',
          },
          {
            selector: 'variable',
            modifiers: ['destructured'],
            format: null,
          },
        ],
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/no-confusing-non-null-assertion': 'error',
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          {
            ignoreArrowShorthand: true,
          },
        ],
        '@typescript-eslint/no-dupe-class-members': 'error',
        '@typescript-eslint/no-dynamic-delete': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-extra-non-null-assertion': 'error',
        '@typescript-eslint/no-extraneous-class': [
          'error',
          {
            allowWithDecorator: true,
          },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-inferrable-types': [
          'error',
          {
            ignoreParameters: true,
          },
        ],
        '@typescript-eslint/no-invalid-this': 'error',
        '@typescript-eslint/no-invalid-void-type': 'error',
        '@typescript-eslint/no-loop-func': 'error',
        '@typescript-eslint/no-loss-of-precision': 'error',
        '@typescript-eslint/no-meaningless-void-operator': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
        '@typescript-eslint/no-redeclare': 'error',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-type-alias': [
          'error',
          {
            allowAliases: 'always',
            allowCallbacks: 'always',
            allowGenerics: 'always',
            allowConstructors: 'always',
            allowConditionalTypes: 'always',
            allowTupleTypes: 'always',
          },
        ],
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
        '@typescript-eslint/no-unnecessary-qualifier': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unnecessary-type-constraint': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/non-nullable-type-assertion-style': 'error',
        '@stylistic/padding-line-between-statements': 'error',
        '@typescript-eslint/prefer-enum-initializers': 'error',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-includes': 'error',
        '@typescript-eslint/prefer-literal-enum-member': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-reduce-type-parameter': 'error',
        '@typescript-eslint/prefer-regexp-exec': 'error',
        '@typescript-eslint/prefer-return-this-type': 'error',
        '@typescript-eslint/prefer-string-starts-ends-with': 'error',
        '@typescript-eslint/prefer-ts-expect-error': 'error',
        '@typescript-eslint/promise-function-async': 'error',
        '@typescript-eslint/require-array-sort-compare': [
          'error',
          {
            ignoreStringArrays: true,
          },
        ],
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/restrict-template-expressions': 'error',
        '@typescript-eslint/sort-type-constituents': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/typedef': 'error',
        '@typescript-eslint/unbound-method': [
          'error',
          {
            ignoreStatic: true,
          },
        ],
        '@typescript-eslint/unified-signatures': [
          'error',
          {
            ignoreDifferentlyNamedParameters: true,
          },
        ],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'error',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
        '@smarttools/no-anonymous-functions': 'error',
        '@smarttools/one-exported-item-per-file': 'error',
        'unicorn/filename-case': 'error',
        'unicorn/no-abusive-eslint-disable': 'error',
        'import/no-duplicates': ['error'],
        '@typescript-eslint/no-deprecated': 'error',
        'import/prefer-default-export': 'off',
        'import/no-default-export': 'error',
        'max-params-no-constructor/max-params-no-constructor': [
          'error',
          {
            max: 4,
          },
        ],
        'sonarjs/cognitive-complexity': 'error',
        'sonarjs/max-switch-cases': 'error',
        'sonarjs/no-all-duplicated-branches': 'error',
        'sonarjs/no-collapsible-if': 'error',
        'sonarjs/no-duplicated-branches': 'error',
        'sonarjs/no-duplicate-string': 'error',
        'sonarjs/no-element-overwrite': 'error',
        'sonarjs/no-identical-expressions': 'error',
        'sonarjs/no-identical-functions': 'error',
        'sonarjs/no-ignored-return': 'error',
        'sonarjs/no-gratuitous-expressions': 'error',
        'sonarjs/no-nested-switch': 'error',
        'sonarjs/no-nested-template-literals': 'error',
        'sonarjs/no-redundant-boolean': 'error',
        'sonarjs/no-redundant-jump': 'error',
        'sonarjs/no-small-switch': 'off',
        'sonarjs/no-use-of-empty-return-value': 'error',
        'sonarjs/prefer-single-boolean-return': 'error',
        'sonarjs/different-types-comparison': 'off',
        'sonarjs/no-dead-store': 'off',
        'sonarjs/prefer-for-of': 'off',
      },
    },
    ...nxEslintPlugin.configs['flat/javascript'].map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
      rules: {
        ...config.rules,
      },
    })),
    {
      files: [
        '**/test-utils/**/*.ts',
        '**/*.spec.ts',
        '**/test-setup.ts',
      ],
      rules: {
        'max-classes-per-file': 'off',
        '@typescript-eslint/unbound-method': 'off',
        'no-restricted-syntax': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-nested-functions': 'off',
        'max-nested-callbacks': 'off',
        'max-lines-per-function': 'off',
        'max-lines': 'off',
        '@smarttools/no-anonymous-functions': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
    {
      // Vitest rules — test files only
      files: ['**/*.spec.ts'],
      plugins: {
        vitest,
      },
      rules: {
        // Anonymous callbacks are the idiom in tests (it/describe/expect)
        '@smarttools/no-anonymous-functions': 'off',

        // Superseded by vitest/expect-expect below
        'sonarjs/assertions-in-tests': 'off',

        // Ensures every test has at least one assertion — catches empty placeholder tests
        'vitest/expect-expect': [
          'error',
          {
            assertFunctionNames: [
              'expect',
              'expectObservable',
              'expectSubscriptions',
            ],
          },
        ],

        // Prevents accidentally-committed test.skip / xit — skipped tests are invisible bugs
        'vitest/no-disabled-tests': 'error',

        // Prevents test.only / fit leaking into CI — would silently skip all other tests
        'vitest/no-focused-tests': 'error',

        // Ensures test titles are strings and follow conventions
        'vitest/valid-title': 'error',

        // Prevents duplicate test names within a describe block
        'vitest/no-identical-title': 'error',

        // Prevents expect() inside conditionals — makes test assertions deterministic
        'vitest/no-conditional-expect': 'error',

        // Prevents expect() outside of test blocks — catches misplaced assertions
        'vitest/no-standalone-expect': 'error',

        // Ensures .resolves/.rejects are awaited and expect has assertions
        'vitest/valid-expect': 'error',
      },
    },
    {
      files: ['**/*.routes.ts'],
      rules: {
        '@smarttools/no-anonymous-functions': 'off',
      },
    },
  ];
};

export default await eslintConfig();
