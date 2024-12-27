import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { type z } from "zod";

import { suggestIconsAction } from "~/server/actions/icons/suggest";
import { type suggestIconsSchema } from "~/server/actions/icons/schemas";

// Helper function for auth check
function checkAuth(headersList: Headers) {
  const authorization = headersList.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized - Missing or invalid bearer token" },
      { status: 401 },
    );
  }

  const token = authorization.split("Bearer ")[1];
  if (token !== "1234") {
    return NextResponse.json(
      { error: "Unauthorized - Invalid API key" },
      { status: 401 },
    );
  }
  return null;
}

interface ValidationError {
  _errors?: string[];
  [key: string]: ValidationError | string[] | undefined;
}

const parseValidationErrors = (errors: ValidationError): string => {
  if (errors._errors) {
    return errors._errors.join(", ");
  }
  for (const key in errors) {
    const value = errors[key];
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value && typeof value === "object" && "_errors" in value) {
      return value._errors?.join(", ") ?? "Unknown error";
    }
  }
  return "Unknown error";
};

const parseBindArgsValidationErrors = (errors: readonly string[]) => {
  return errors.join(", ");
};

// POST endpoint (JSON body)
export async function POST(request: Request) {
  const headersList = headers();
  const authError = checkAuth(headersList);
  if (authError) return authError;

  const body = (await request.json()) as z.infer<typeof suggestIconsSchema>;
  const result = await suggestIconsAction(body);

  if (result?.bindArgsValidationErrors !== undefined) {
    return NextResponse.json(
      {
        error: parseBindArgsValidationErrors(result.bindArgsValidationErrors),
      },
      { status: 400 },
    );
  }
  if (result?.validationErrors !== undefined) {
    return NextResponse.json(
      { error: parseValidationErrors(result.validationErrors) },
      { status: 400 },
    );
  }
  if (result?.serverError !== undefined) {
    return NextResponse.json({ error: result.serverError }, { status: 400 });
  }
  if (result?.data === undefined) {
    return NextResponse.json({ error: "No data returned" }, { status: 500 });
  }
  return NextResponse.json({
    data: result.data,
  });
}
