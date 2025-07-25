import { Code, Database, FileText, Key, Lock } from 'lucide-react';

import { SECRET_TYPE } from '@/lib/definitions';

const secretTypeColors: Record<SECRET_TYPE, string> = {
  [SECRET_TYPE.ApiKey]: 'bg-blue-100 text-blue-800',
  [SECRET_TYPE.ConnectionString]: 'bg-green-100 text-green-800',
  [SECRET_TYPE.EnvironmentVariable]: 'bg-purple-100 text-purple-800',
  [SECRET_TYPE.Other]: 'bg-slate-100 text-slate-800',
  [SECRET_TYPE.Password]: 'bg-amber-100 text-amber-800',
  [SECRET_TYPE.Token]: 'bg-indigo-100 text-indigo-800',
};

export default function SecretTypeIcon(props: { type: SECRET_TYPE }) {
  const typeColor = secretTypeColors[props.type];

  return (
    <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-md ${typeColor}`}>
      {props.type === SECRET_TYPE.Token || props.type === SECRET_TYPE.ApiKey ? (
        <Key className="h-5 w-5" />
      ) : props.type === SECRET_TYPE.Password ? (
        <Lock className="h-5 w-5" />
      ) : props.type === SECRET_TYPE.ConnectionString ? (
        <Database className="h-5 w-5" />
      ) : props.type === SECRET_TYPE.EnvironmentVariable ? (
        <Code className="h-5 w-5" />
      ) : (
        <FileText className="h-5 w-5" />
      )}
    </div>
  );
}
