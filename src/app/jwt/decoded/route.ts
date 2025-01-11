import { NextResponse, type NextRequest } from "next/server";

// import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken)
    return NextResponse.json({ success: false, message: "No token provided", data: null });
  // const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET!);
  return NextResponse.json({ success: true, message: "Token provided!", data: accessToken });
}
