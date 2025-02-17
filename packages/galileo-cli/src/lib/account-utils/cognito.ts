/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import {
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
  GetGroupCommand,
  ListUserPoolsCommand,
  ListGroupsCommand,
  AdminDisableUserCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { fromIni } from '@aws-sdk/credential-providers';
import chalk from 'chalk';
import { CredentialsParams } from '../types';

export interface CognitoUserInfo {
  readonly email: string;
  readonly username: string;
  readonly group?: string;
}

export interface CredentialsWithUserpoolId extends CredentialsParams {
  readonly userpoolId: string;
}
export interface CreateCognitoUserRequest extends CredentialsWithUserpoolId, CognitoUserInfo {}
export type DeleteCognitoUserRequest = Omit<CreateCognitoUserRequest, 'group' | 'email'>;

export interface BulkCreateCognitoUsersRequest extends CredentialsWithUserpoolId {
  readonly users: CognitoUserInfo[];
}

export namespace cognito {
  export const listUserPools = async (creds: CredentialsParams) => {
    const client = new CognitoIdentityProviderClient({
      credentials: fromIni({ profile: creds.profile }),
      region: creds.region,
    });

    const userpoolsResp = await client.send(
      new ListUserPoolsCommand({
        MaxResults: 50,
      }),
    );

    return userpoolsResp.UserPools?.map((up) => ({
      id: up.Id!,
      name: up.Name!,
    }));
  };

  export const listUserGroups = async (options: CredentialsWithUserpoolId) => {
    const client = new CognitoIdentityProviderClient({
      credentials: fromIni({ profile: options.profile }),
      region: options.region,
    });

    const userGroupsResp = await client.send(
      new ListGroupsCommand({
        UserPoolId: options.userpoolId,
      }),
    );

    return userGroupsResp.Groups?.map((g) => g.GroupName!) || [];
  };

  export const createCognitoUser = async (options: CreateCognitoUserRequest) => {
    const client = new CognitoIdentityProviderClient({
      credentials: fromIni({ profile: options.profile }),
      region: options.region,
    });

    const createUserResp = await client.send(
      new AdminCreateUserCommand({
        ForceAliasCreation: true,
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
          {
            Name: 'email',
            Value: options.email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
        Username: options.username,
        UserPoolId: options.userpoolId,
      }),
    );

    console.log('User successfully created.', createUserResp.User?.UserCreateDate);

    if (options.group != null) {
      const groupResp = await client.send(
        new GetGroupCommand({
          GroupName: options.group,
          UserPoolId: options.userpoolId,
        }),
      );

      if (groupResp.Group == null) {
        throw new Error(`Provided user group ${options.group} doesn't exist.`);
      }

      await client.send(
        new AdminAddUserToGroupCommand({
          GroupName: options.group!,
          Username: options.username,
          UserPoolId: options.userpoolId,
        }),
      );

      console.log(
        `User ${chalk.magentaBright(options.username)} added to ${chalk.magentaBright(options.group)} user group.`,
      );
    }
  };

  export const bulkCreateCognitoUsers = async (options: BulkCreateCognitoUsersRequest) => {
    const client = new CognitoIdentityProviderClient({
      credentials: fromIni({ profile: options.profile }),
      region: options.region,
    });

    let idx = 1;
    for (const user of options.users) {
      const createUserResp = await client.send(
        new AdminCreateUserCommand({
          ForceAliasCreation: true,
          DesiredDeliveryMediums: ['EMAIL'],
          UserAttributes: [
            {
              Name: 'email',
              Value: user.email,
            },
            {
              Name: 'email_verified',
              Value: 'true',
            },
          ],
          Username: user.username,
          UserPoolId: options.userpoolId,
        }),
      );

      console.log(`[${idx}] User successfully created.`, createUserResp.User?.UserCreateDate);

      if (user.group != null) {
        await client.send(
          new AdminAddUserToGroupCommand({
            GroupName: user.group!,
            Username: user.username,
            UserPoolId: options.userpoolId,
          }),
        );

        console.log(
          `[${idx}] User ${chalk.magentaBright(user.username)} added to ${chalk.magentaBright(user.group)} user group.`,
        );
      }

      idx++;
    }
  };

  export const deleteCognitoUser = async (options: DeleteCognitoUserRequest) => {
    const client = new CognitoIdentityProviderClient({
      credentials: fromIni({ profile: options.profile }),
      region: options.region,
    });

    await client.send(
      new AdminDisableUserCommand({
        Username: options.username,
        UserPoolId: options.userpoolId,
      }),
    );
    console.log(`${options.username} disabled.`);

    await client.send(
      new AdminDeleteUserCommand({
        Username: options.username,
        UserPoolId: options.userpoolId,
      }),
    );

    console.log(`${options.username} deleted.`);
  };
}
