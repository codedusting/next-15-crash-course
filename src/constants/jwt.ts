export const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export const alg = "HS256";
