import { use } from 'react';

import { type Secret } from '@/lib/definitions';

export default function SecretCount(props: { secretsPromise: Promise<Secret[]> }) {
  const secrets = use(props.secretsPromise);
  return <>{`${secrets.length} secret${secrets.length === 1 ? '' : 's'}`}</>;
}
