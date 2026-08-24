import { z } from "zod";

export const IntakeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional(),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
  weight: z.string().optional(),
  timezone: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof IntakeFormSchema>;
