import { SavedJobModel } from '../../models/saved-job.model.js';

export async function saveJob(studentId: string, jobId: string): Promise<void> {
  await SavedJobModel.updateOne(
    { student_id: studentId, job_id: jobId },
    { $setOnInsert: { student_id: studentId, job_id: jobId } },
    { upsert: true },
  );
}

export async function unsaveJob(studentId: string, jobId: string): Promise<void> {
  await SavedJobModel.deleteOne({ student_id: studentId, job_id: jobId });
}

export async function checkSaved(studentId: string, jobId: string): Promise<boolean> {
  const saved = await SavedJobModel.exists({ student_id: studentId, job_id: jobId }).maxTimeMS(2000);
  return Boolean(saved);
}

export async function listSavedJobs(studentId: string) {
  const docs = await SavedJobModel.find({ student_id: studentId })
    .sort({ saved_at: -1 })
    .limit(50)
    .populate({ path: 'job_id', populate: { path: 'company_id', select: '-__v' } })
    .maxTimeMS(3000)
    .exec();

  return docs.map((doc) => {
    const raw = (doc.job_id as { toObject?: () => Record<string, unknown> } | null);
    const job = raw?.toObject?.() ?? null;
    return {
      id: String(doc._id),
      student_id: String(doc.student_id),
      job_id: job ? String(job._id) : null,
      job: job ? { ...job, id: String(job._id), company: job.company_id, _id: undefined } : null,
      saved_at: doc.saved_at,
    };
  });
}
