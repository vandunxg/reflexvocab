import { Fragment, useEffect, useState, type ReactNode } from 'react';
import type { PrivateAuth } from './auth';

export function AccountBoundary({
  auth,
  children,
}: {
  auth: PrivateAuth;
  children: (accountId: string) => ReactNode;
}) {
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => auth.subscribeAccount(setAccountId), [auth]);

  return accountId ? <Fragment key={accountId}>{children(accountId)}</Fragment> : null;
}
