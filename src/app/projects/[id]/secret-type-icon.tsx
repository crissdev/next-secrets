import { SecretType } from '@prisma/client';
import { Code, Database, FileText, Key, Lock } from 'lucide-react';

import { secretTypeColors } from '@/app/projects/secret-color-mapping';

export default function SecretTypeIcon(props: { type: SecretType; size: 'default' | 'small' }) {
  const typeColor = secretTypeColors[props.type];

  return (
    <div
      className={`shrink-0 flex items-center justify-center ${props.size === 'small' ? 'size-6' : 'size-10'} rounded-md ${typeColor}`}
    >
      {props.type === SecretType.TOKEN || props.type === SecretType.API_KEY ? (
        <Key className={`${props.size === 'small' ? 'size-3' : 'size-5'}`} />
      ) : props.type === SecretType.PASSWORD ? (
        <Lock className={`${props.size === 'small' ? 'size-3' : 'size-5'}`} />
      ) : props.type === SecretType.CONNECTION_STRING ? (
        <Database className={`${props.size === 'small' ? 'size-3' : 'size-5'}`} />
      ) : props.type === SecretType.ENVIRONMENT_VARIABLE ? (
        <Code className={`${props.size === 'small' ? 'size-3' : 'size-5'}`} />
      ) : (
        <FileText className={`${props.size === 'small' ? 'size-3' : 'size-5'}`} />
      )}
    </div>
  );
}
