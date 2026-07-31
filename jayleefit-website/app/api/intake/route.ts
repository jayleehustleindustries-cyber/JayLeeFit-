import { NextRequest, NextResponse } from "next/server";
import { submitIntakeToAirtable } from "@/lib/airtable";
import { IntakeFormSchema } from "@/lib/form-validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = IntakeFormSchema.parse(body);

    // Submit to Airtable
    const result = await submitIntakeToAirtable(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Intake submitted successfully",
        recordId: result.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Intake submission error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
