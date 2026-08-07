import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existingUser = await withDbRetry(() => prisma.user.findUnique({ where: { email } }));

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await withDbRetry(() =>
      prisma.user.create({
        data: { name, email, password: hashedPassword },
      })
    );

    return NextResponse.json(
      { message: "Profile registered successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, "POST /api/auth/register", "message");
  }
}
