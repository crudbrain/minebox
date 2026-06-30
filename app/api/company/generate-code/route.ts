import { NextResponse } from "next/server";
import { generateCompanyCode } from "@/lib/server/company";

export async function GET() {
  try {
    const code = await generateCompanyCode();
    if (!code) {
      return NextResponse.json(
        { error: "Generated code not unique, retry." },
        { status: 409 }
      );
    }
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate company code" },
      { status: 500 }
    );
  }
}
