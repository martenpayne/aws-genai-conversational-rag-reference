/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
export const GITHUB = {
  ORG: 'aws-samples',
  REPOSITORY: 'aws-genai-conversational-rag-reference',
};

export const PROJECT_AUTHOR = {
  author: 'AWS APJ COPE',
  authorAddress: 'apj-cope@amazon.com',
  authorName: 'AWS APJ COPE',
  authorEmail: 'apj-cope@amazon.com',
  repositoryUrl: `https://github.com/${GITHUB.ORG}/${GITHUB.REPOSITORY}`,
} as const;

export const DEFAULT_RELEASE_BRANCH = 'mainline';

export const DEMO_OUTDIR = 'demo';

export const DEMO_APPLICATION_NAME = 'Galileo';

/** Managed Dependency Versions */
export const VERSIONS = {
  AWS_SDK: '3.418.0',
  CDK: '2.99.1',
  CONSTRUCTS: '10.2.70',
  PDK: '0.22.9',
  LANGCHAIN: '0.0.157', // Not semver yet so need to pin version
  SMITHY_TYPES: '2.3.4',
} as const;
