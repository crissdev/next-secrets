import { LockIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className={'size-full flex items-center justify-center flex-col'}>
      <div className="max-w-md text-center">
        <div className={'rounded-full bg-muted mb-6 p-6 flex items-center justify-center w-min mx-auto'}>
          <LockIcon size={48} className={'stroke-muted-foreground'} />
        </div>
        <h2 className={'text-xl font-bold mb-3'} data-testid="empty-vault-message">
          No Projects Yet
        </h2>
        <div className={'text-muted-foreground mb-5'} data-testid="empty-vault-hint">
          Create your first project to start managing your secrets securely.
        </div>
      </div>
    </div>
  );
}
