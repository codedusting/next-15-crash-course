export const getBaseDomain = (subdomain: string) => {
  if (subdomain === "") return undefined;
  const match = subdomain.match(/([a-zA-Z0-9-]+\.[a-zA-z]+)$/);
  return match ? `.${match[0]}` : undefined;
};
