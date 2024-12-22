import presets from 'jest-preset-angular/presets';
import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from '../../tsconfig.json';

export default {
    ...presets.createCjsPreset({
      tsconfig: 'tsconfig.spec.json',
    }),
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
    setupFilesAfterEnv: ['./setup-jest.ts'],
} satisfies JestConfigWithTsJest;