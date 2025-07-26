export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  type: SECRET_TYPE;
  value: string;
  lastUpdated: string;
}

export enum SECRET_TYPE {
  ApiKey = 'API Key',
  ConnectionString = 'Connection String',
  EnvironmentVariable = 'Environment Variable',
  Other = 'Other',
  Password = 'Password',
  Token = 'Token',
}
