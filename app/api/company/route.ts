import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companyCreateSchema, companyUpdateSchema } from "@/lib/schemas/company";
import { generateCompanyCode } from "@/lib/server/company";

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = companyCreateSchema.safeParse(body.company);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid company data", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
      return NextResponse.json(
        { error: "Company already exists" },
        { status: 409 }
      );
    }

    let code = body.company?.code;
    if (!code) {
      code = await generateCompanyCode();
      if (!code) {
        return NextResponse.json(
          { error: "Generated code not unique, retry." },
          { status: 409 }
        );
      }
    }

    const company = await prisma.company.create({
      data: { ...parsed.data, code },
    });

    const userResult = await auth.api.signUpEmail({
      body: {
        name: body.admin.name,
        email: body.admin.email,
        password: body.admin.password,
      },
    });

    await prisma.user.update({
      where: { id: userResult.user.id },
      data: { role: "admin", emailVerified: true },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create company or admin user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = companyUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid company data", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: parsed.data,
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
