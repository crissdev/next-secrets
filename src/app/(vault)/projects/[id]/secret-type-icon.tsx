import { Code, Database, FileText, Key, Lock } from 'lucide-react';

import { secretTypeColors } from '@/app/(vault)/secret-color-mapping';
import { SECRET_TYPE } from '@/lib/definitions';

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
