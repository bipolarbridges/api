export default async function findOne<T>(a: T[], cond: (a: T) => Promise<boolean>): Promise<T> {
  let i = 0;
  while (i < a.length) {
    if (await cond(a[i])) {
      return a[i];
    }
    i++;
  }
  i++;
  return null;
}
