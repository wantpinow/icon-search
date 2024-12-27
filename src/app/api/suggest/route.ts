import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

import { suggestIconsAction } from "~/server/actions/icons/suggest";
import { suggestIconsSchema } from "~/server/actions/icons/schemas";

// Helper function for auth check
function checkAuth(headersList: Headers) {
  const authorization = headersList.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
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

const parseValidationErrors = (errors: any) => {
  if (errors._errors) {
    return errors._errors.join(", ");
  }
  for (const key in errors) {
    if (errors[key]._errors) {
      return errors[key]._errors.join(", ");
    }
  }
  return "Unknown error";
};

const parseBindArgsValidationErrors = (errors: readonly []) => {
  return errors.join(", ");
};

// POST endpoint (JSON body)
export async function POST(request: Request) {
  const headersList = headers();
  const authError = checkAuth(headersList);
  if (authError) return authError;
  const body = await request.json();
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
