import { AuthMethod, DatabaseResponse } from '../auth/auth_methods';

export default async function findOne(a: AuthMethod[],
  cond: (a: AuthMethod) => DatabaseResponse): Promise<AuthMethod> {
  let i = 0;
  while (i < a.length) {
    if (await cond(a[i])) {
      return a[i];
    }
    i++;
  }
  return null;
}
