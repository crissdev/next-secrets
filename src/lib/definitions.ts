export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  type: SECRET_TYPES;
  value: string;
}

export enum SECRET_TYPES {
  EnvironmentVariable = 'Environment Variable',
}
