import { Schema, model } from 'mongoose';
import type { InferSchemaType, HydratedDocument } from 'mongoose';

const educationItemSchema = new Schema(
  {
    id: { type: String, required: true },
    school: { type: String, required: true },
    degree: { type: String, default: '' },
    institution: { type: String },
    field: { type: String, default: '' },
    start_date: { type: String, default: '' },
    end_date: { type: String },
    current: { type: Boolean, default: false },
  },
  { _id: false },
);

const experienceItemSchema = new Schema(
  {
    id: { type: String, required: true },
    company: { type: String, default: '' },
    position: { type: String },
    title: { type: String },
    description: { type: String, default: '' },
    start_date: { type: String, default: '' },
    end_date: { type: String },
    current: { type: Boolean, default: false },
  },
  { _id: false },
);

export const ROLES = ['student', 'recruiter', 'admin'] as const;

const userSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    avatar: { type: String },
    title: { type: String },
    bio: { type: String },
    phone: { type: String },
    location: { type: String },
    skills: { type: [String], default: [] },
    education: { type: [educationItemSchema], default: [] },
    experience: { type: [experienceItemSchema], default: [] },
    resume_url: { type: String },
    company_id: { type: Schema.Types.ObjectId, ref: 'Company' },
    position: { type: String },
    permissions: { type: [String], default: [] },
    is_blocked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

userSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export const UserModel = model<User>('User', userSchema);
