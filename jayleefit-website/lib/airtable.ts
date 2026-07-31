import { IntakeFormData } from "./form-validation";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

export async function submitIntakeToAirtable(data: IntakeFormData) {
  const token = process.env.AIRTABLE_API_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_CLIENTS_TABLE;

  if (!token || !baseId || !tableName) {
    throw new Error("Missing Airtable configuration");
  }

  const fields: Record<string, unknown> = {
    Name: data.name,
    Email: data.email,
    Phone: data.phone || "",
    Goals: data.goals,
    Status: "Intake Received",
  };

  if (data.weight) fields["Current Weight (kg)"] = parseFloat(data.weight);
  if (data.timezone) fields["Timezone"] = data.timezone;
  if (data.notes) fields["Intake Notes"] = data.notes;

  const response = await fetch(
    `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields }],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message || "Failed to submit intake to Airtable"
    );
  }

  const result = await response.json();
  return result.records[0];
}
