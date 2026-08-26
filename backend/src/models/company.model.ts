import { Schema, model } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const companySchema = new Schema(
  {
    name: { type: String, required: true },
    logo_url: { type: String },
    description: { type: String },
    website: { type: String },
    location: { type: String },
    industry: { type: String },
    size: { type: String },
    founded_year: { type: Number },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

companySchema.index({ name: 1 });

export type Company = InferSchemaType<typeof companySchema>;
export const CompanyModel = model<Company>('Company', companySchema);
