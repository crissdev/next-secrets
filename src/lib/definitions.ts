export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  type: SECRET_TYPE;
  value: string;
  lastUpdated: string;
  environmentId: number;
}

export enum SECRET_TYPE {
  ApiKey = 'API Key',
  ConnectionString = 'Connection String',
  EnvironmentVariable = 'Environment Variable',
  Other = 'Other',
  Password = 'Password',
  Token = 'Token',
}

export interface Environment {
  id: number;
  name: string;
}

export const DEFAULT_ENVIRONMENTS: Environment[] = [
  { id: 1, name: 'Development' },
  { id: 2, name: 'Staging' },
  { id: 3, name: 'Production' },
];
