/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import path from "node:path";
import execa from "execa";
import { JSONStorage } from "node-localstorage";
import {
  IApplicationContextKey,
  ApplicationContext,
  helpers,
} from "../../internals";
import { CdkContextValue, ExecaCommandReturn, ExecaTask } from "../types";

class Context {
  // singleton ---
  public static getInstance() {
    if (this.INSTANCE == null) {
      this.INSTANCE = new Context();
    }

    return this.INSTANCE;
  }
  private static INSTANCE: Context;
  // ---

  private execTasks: ExecaTask[] = [];

  /**
   * The local storage cache.
   */
  public readonly cache: JSONStorage;

  public readonly cdkContext: Map<IApplicationContextKey, CdkContextValue>;

  public readonly deployStacks: string[] = [];

  public dryRun: boolean = false;

  private constructor() {
    this.cache = new JSONStorage(
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "bin",
        ".cache",
        "localstorage",
        String(ApplicationContext.MAJOR_VERSION)
      )
    );

    this.cdkContext = new Map<IApplicationContextKey, CdkContextValue>();
  }

  /**
   * Auto-cache for `prompts` answers.
   * @param answers Prompts answers
   * @param prefix Prefix to store keys in local storage
   * @returns The passed answers
   */
  cachedAnswers<T extends Record<string, any>>(answers: T, prefix?: string): T {
    Object.entries(answers).forEach(([key, value]) => {
      if (value != null) {
        if (prefix) key = prefix + key;
        this.cache.setItem(key, value);
      }
    });
    return answers;
  }

  execCommand(...args: ExecaTask): ExecaCommandReturn | undefined {
    this.execTasks.push(args);

    if (this.dryRun) {
      console.log(helpers.contextMessage("DRYRUN", args[0]));
      return;
    }
    return execa.commandSync(...args);
  }

  saveExecTasks() {
    this.cache.setItem("replayTasks", this.execTasks);
  }
}

const context: Context = Context.getInstance();
export default context;
