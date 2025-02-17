/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

export * from '../../../galileo-cdk/src/ai/predefined/ids';
export * from '../../../galileo-cdk/src/ai/llms/framework/bedrock/constants';
export * from '../../../galileo-cdk/src/ai/llms/framework/bedrock/utils';
export * from '../../../galileo-cdk/src/core/app/context';
export { sortRagEmbeddingModels } from '../../../galileo-cdk/src/core/app/context/utils';
export * from '../../../../demo/infra/src/application/tags';

import path from 'node:path';
import chalk from 'chalk';
import fs from 'fs-extra';
import { formatBedrockModelUUID } from '../../../galileo-cdk/src/ai/llms/framework/bedrock/utils';
import {
  DEFAULT_APPLICATION_CONFIG,
  APPLICATION_CONFIG_JSON,
  ApplicationConfig,
  // @ts-ignore - sdk is esm
} from '../../../galileo-cdk/src/core/app/context';
import { mergeApplicationConfigs } from '../../../galileo-cdk/src/core/app/context/utils';

export const APP_CONFIG_DIR = path.resolve(__dirname, '../../../../demo/infra');

// helpers
export namespace helpers {
  export const resolveConfigPath = (value?: string): string => {
    if (value == null) {
      return path.resolve(APP_CONFIG_DIR, APPLICATION_CONFIG_JSON);
    }
    if (path.isAbsolute(value)) {
      return value;
    }
    return path.resolve(APP_CONFIG_DIR, value);
  };

  export const resolveAppConfig = (file?: string): ApplicationConfig => {
    file = resolveConfigPath(file);
    if (fs.existsSync(file)) {
      const jsonConfig = fs.readJsonSync(file, { encoding: 'utf-8' });
      return mergeApplicationConfigs(DEFAULT_APPLICATION_CONFIG, jsonConfig);
    }
    return DEFAULT_APPLICATION_CONFIG;
  };

  export const saveAppConfig = (config: ApplicationConfig, filename?: string): void => {
    let file = resolveConfigPath(filename);
    fs.writeJsonSync(file, config, { encoding: 'utf-8', spaces: 2 });
  };

  export const availableModelIds = (foundationModels: string[], bedrockModelIds?: string[]) => {
    return [...foundationModels, ...(bedrockModelIds?.map(formatBedrockModelUUID) || [])];
  };

  export const contextMessage = (_context: string, message: string): string => {
    return `${chalk.cyanBright(`[${_context}]`)} ${message}`;
  };

  export const commandMessage = (_context: string, description: string, cmd?: string): string => {
    return contextMessage(_context, `${description}\n${chalk.magentaBright(cmd)}\n`);
  };

  export const ifNotEmpty = (value?: string, defaultValue: string | undefined = undefined): string | undefined => {
    if (value == null) return defaultValue;
    if (value.replace(/\s/g, '').length === 0) return defaultValue;
    return value;
  };

  export const textPromptMessage = (
    message: string,
    extra: { description?: string; instructions?: string; info?: string },
  ): string => {
    if (extra.info) message += chalk.gray(extra.info);
    if (extra.description) message += chalk.gray('\n' + extra.description + '\n');
    if (extra.instructions) message += chalk.yellow('\n' + extra.instructions + '\n');
    return message;
  };
}
