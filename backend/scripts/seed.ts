import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../src/models/user.model.js';
import { CompanyModel } from '../src/models/company.model.js';
import { JobModel } from '../src/models/job.model.js';
import { ApplicationModel } from '../src/models/application.model.js';
import { SavedJobModel } from '../src/models/saved-job.model.js';
import { NotificationModel } from '../src/models/notification.model.js';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

async function seed(): Promise<void> {
  await mongoose.connect(env.DATABASE_URL);
  logger.info('Seeding database...');

  await Promise.all([
    UserModel.deleteMany({}),
    CompanyModel.deleteMany({}),
    JobModel.deleteMany({}),
    ApplicationModel.deleteMany({}),
    SavedJobModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const companies = await CompanyModel.create([
    {
      name: 'Acme Labs',
      description: 'A cutting-edge technology company building the future of developer tools. We focus on creating intuitive software that empowers teams to ship faster.',
      website: 'https://acmelabs.example.com',
      location: 'Lagos, Nigeria',
      industry: 'Technology',
      size: '51-200',
      founded_year: 2018,
    },
    {
      name: 'GreenLeaf Health',
      description: 'A health-tech startup using AI to improve patient outcomes across Africa. Our platform connects rural clinics with specialist doctors.',
      website: 'https://greenleaf.example.com',
      location: 'Nairobi, Kenya',
      industry: 'Healthcare',
      size: '11-50',
      founded_year: 2020,
    },
    {
      name: 'PayStream',
      description: 'A fintech company revolutionizing digital payments for emerging markets. We process millions of transactions daily across 12 countries.',
      website: 'https://paystream.example.com',
      location: 'Cape Town, South Africa',
      industry: 'Fintech',
      size: '201-500',
      founded_year: 2016,
    },
    {
      name: 'EduBridge',
      description: 'An edtech platform making quality education accessible to underserved communities. Our platform serves over 100,000 learners.',
      website: 'https://edubridge.example.com',
      location: 'Accra, Ghana',
      industry: 'Education',
      size: '11-50',
      founded_year: 2021,
    },
    {
      name: 'LogiFlow',
      description: 'A logistics and supply chain optimization company using machine learning to reduce delivery times and costs across the continent.',
      website: 'https://logiflow.example.com',
      location: 'Abuja, Nigeria',
      industry: 'Logistics',
      size: '51-200',
      founded_year: 2019,
    },
  ]);

  const [student1, student2, student3, recruiter1, recruiter2, recruiter3, recruiter4, recruiter5, admin] =
    await UserModel.create([
      {
        email: 'student@demo.com',
        password_hash: passwordHash,
        full_name: 'Amara Okafor',
        role: 'student',
        skills: ['javascript', 'react', 'node.js', 'python'],
        location: 'Lagos',
      },
      {
        email: 'student2@demo.com',
        password_hash: passwordHash,
        full_name: 'Kwame Mensah',
        role: 'student',
        skills: ['python', 'machine learning', 'tensorflow', 'sql'],
        location: 'Accra',
      },
      {
        email: 'student3@demo.com',
        password_hash: passwordHash,
        full_name: 'Fatima Hassan',
        role: 'student',
        skills: ['flutter', 'dart', 'firebase', 'ui/ux'],
        location: 'Nairobi',
      },
      {
        email: 'recruiter@demo.com',
        password_hash: passwordHash,
        full_name: 'Chidi Eze',
        role: 'recruiter',
        company_id: companies[0]._id,
        position: 'Engineering Lead',
      },
      {
        email: 'recruiter2@demo.com',
        password_hash: passwordHash,
        full_name: 'Nala Kimani',
        role: 'recruiter',
        company_id: companies[1]._id,
        position: 'CTO',
      },
      {
        email: 'recruiter3@demo.com',
        password_hash: passwordHash,
        full_name: 'Thabo Ndlovu',
        role: 'recruiter',
        company_id: companies[2]._id,
        position: 'VP of Engineering',
      },
      {
        email: 'recruiter4@demo.com',
        password_hash: passwordHash,
        full_name: 'Yaa Asantewaa',
        role: 'recruiter',
        company_id: companies[3]._id,
        position: 'Head of Product',
      },
      {
        email: 'recruiter5@demo.com',
        password_hash: passwordHash,
        full_name: 'Emeka Okonkwo',
        role: 'recruiter',
        company_id: companies[4]._id,
        position: 'Technical Recruiter',
      },
      {
        email: 'admin@demo.com',
        password_hash: passwordHash,
        full_name: 'System Admin',
        role: 'admin',
        permissions: ['manage_users', 'manage_jobs', 'manage_companies'],
      },
    ]);

  const jobs = await JobModel.create([
    {
      title: 'Senior Frontend Engineer',
      description: 'Lead the development of our next-generation developer tools UI. You will work closely with designers and backend engineers to build performant, accessible interfaces using React and TypeScript.',
      location: 'Remote',
      job_type: 'full-time',
      experience_level: 'senior',
      salary_min: 4000,
      salary_max: 7000,
      currency: 'USD',
      requirements: ['5+ years React', 'TypeScript', 'GraphQL', 'Testing best practices'],
      benefits: ['Health insurance', 'Flexible hours', 'Remote work', 'Learning budget'],
      tags: ['react', 'typescript', 'frontend'],
      responsibilities: ['Lead frontend architecture decisions', 'Mentor junior developers', 'Review pull requests', 'Collaborate with design team'],
      company_id: companies[0]._id,
      recruiter_id: recruiter1._id,
    },
    {
      title: 'Backend Engineer',
      description: 'Design and build scalable microservices that power our payment processing platform. You will work with Node.js, PostgreSQL, and Redis to handle millions of transactions.',
      location: 'Cape Town, South Africa',
      job_type: 'full-time',
      experience_level: 'mid',
      salary_min: 3000,
      salary_max: 5500,
      currency: 'USD',
      requirements: ['3+ years Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
      benefits: ['Medical aid', 'Stock options', 'Gym membership'],
      tags: ['node.js', 'postgresql', 'backend'],
      responsibilities: ['Build and maintain payment APIs', 'Optimize database queries', 'Implement caching strategies'],
      company_id: companies[2]._id,
      recruiter_id: recruiter3._id,
    },
    {
      title: 'Machine Learning Engineer',
      description: 'Develop and deploy ML models that predict patient health outcomes. Work with large datasets to build classifiers and recommendation systems that save lives.',
      location: 'Nairobi, Kenya',
      job_type: 'full-time',
      experience_level: 'senior',
      salary_min: 5000,
      salary_max: 8000,
      currency: 'USD',
      requirements: ['Python', 'TensorFlow/PyTorch', 'SQL', '3+ years ML experience'],
      benefits: ['Health insurance', 'Research budget', 'Conference attendance', 'Flexible hours'],
      tags: ['python', 'machine-learning', 'healthcare'],
      responsibilities: ['Design ML pipelines', 'Train and evaluate models', 'Deploy models to production', 'Monitor model performance'],
      company_id: companies[1]._id,
      recruiter_id: recruiter2._id,
    },
    {
      title: 'Frontend Intern',
      description: 'Join our team for a 6-month internship where you will learn React, work on real features, and receive mentorship from senior engineers.',
      location: 'Lagos, Nigeria',
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 300,
      salary_max: 600,
      currency: 'USD',
      requirements: ['Basic JavaScript', 'HTML/CSS', 'Eagerness to learn'],
      benefits: ['Mentorship', 'Stipend', 'Potential full-time offer'],
      tags: ['react', 'javascript', 'internship'],
      responsibilities: ['Build UI components', 'Write unit tests', 'Participate in code reviews'],
      company_id: companies[0]._id,
      recruiter_id: recruiter1._id,
    },
    {
      title: 'Mobile Developer',
      description: 'Build our cross-platform mobile app used by 50,000+ students across Africa. You will own the mobile experience end to end.',
      location: 'Accra, Ghana',
      job_type: 'full-time',
      experience_level: 'mid',
      salary_min: 2500,
      salary_max: 4500,
      currency: 'USD',
      requirements: ['Flutter or React Native', 'Firebase', 'REST APIs', '2+ years mobile dev'],
      benefits: ['Remote work', 'Learning stipend', 'Annual retreat'],
      tags: ['flutter', 'mobile', 'firebase'],
      responsibilities: ['Develop mobile features', 'Fix bugs and optimize performance', 'Write integration tests'],
      company_id: companies[3]._id,
      recruiter_id: recruiter4._id,
    },
    {
      title: 'DevOps Engineer',
      description: 'Manage our cloud infrastructure and CI/CD pipelines. Ensure 99.99% uptime for our logistics platform serving millions of deliveries.',
      location: 'Abuja, Nigeria',
      job_type: 'full-time',
      experience_level: 'senior',
      salary_min: 4000,
      salary_max: 6500,
      currency: 'USD',
      requirements: ['AWS/GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      benefits: ['Health insurance', 'On-call bonus', 'Remote work'],
      tags: ['devops', 'aws', 'kubernetes'],
      responsibilities: ['Manage Kubernetes clusters', 'Build CI/CD pipelines', 'Monitor infrastructure', 'Incident response'],
      company_id: companies[4]._id,
      recruiter_id: recruiter5._id,
    },
    {
      title: 'Data Analyst',
      description: 'Analyze user behavior and business metrics to drive product decisions. Build dashboards and reports that inform our growth strategy.',
      location: 'Remote',
      job_type: 'contract',
      experience_level: 'mid',
      salary_min: 2000,
      salary_max: 3500,
      currency: 'USD',
      requirements: ['SQL', 'Python', 'Tableau/Looker', 'Statistics'],
      benefits: ['Flexible schedule', 'Fully remote'],
      tags: ['data', 'analytics', 'sql'],
      responsibilities: ['Build analytics dashboards', 'Run A/B tests', 'Present insights to stakeholders'],
      company_id: companies[2]._id,
      recruiter_id: recruiter3._id,
    },
    {
      title: 'Part-time UI/UX Designer',
      description: 'Design intuitive interfaces for our education platform. Work 20 hours per week creating user-centered designs.',
      location: 'Remote',
      job_type: 'part-time',
      experience_level: 'mid',
      salary_min: 1500,
      salary_max: 2500,
      currency: 'USD',
      requirements: ['Figma', 'User research', 'Design systems', 'Prototyping'],
      benefits: ['Flexible hours', 'Portfolio building'],
      tags: ['design', 'ui/ux', 'figma'],
      responsibilities: ['Design user flows', 'Create wireframes and prototypes', 'Conduct user testing'],
      company_id: companies[3]._id,
      recruiter_id: recruiter4._id,
    },
  ]);

  const applications = await ApplicationModel.create([
    {
      student_id: student1._id,
      job_id: jobs[0]._id,
      recruiter_id: recruiter1._id,
      status: 'reviewing',
      cover_letter: 'I am passionate about frontend engineering and have 4 years of React experience.',
      timeline: [
        { status: 'pending', message: 'Application submitted', at: new Date('2026-08-20') },
        { status: 'reviewing', message: 'Application under review', at: new Date('2026-08-22') },
      ],
    },
    {
      student_id: student1._id,
      job_id: jobs[3]._id,
      recruiter_id: recruiter1._id,
      status: 'accepted',
      cover_letter: 'I am eager to learn and grow through this internship opportunity.',
      timeline: [
        { status: 'pending', message: 'Application submitted', at: new Date('2026-08-15') },
        { status: 'reviewing', message: 'Application under review', at: new Date('2026-08-17') },
        { status: 'accepted', message: 'Congratulations! You have been accepted.', at: new Date('2026-08-20') },
      ],
    },
    {
      student_id: student2._id,
      job_id: jobs[2]._id,
      recruiter_id: recruiter2._id,
      status: 'pending',
      cover_letter: 'I have a strong background in machine learning with published research in health informatics.',
    },
    {
      student_id: student3._id,
      job_id: jobs[4]._id,
      recruiter_id: recruiter4._id,
      status: 'reviewing',
      cover_letter: 'I have built 3 mobile apps with Flutter, including one with 10,000+ downloads.',
      timeline: [
        { status: 'pending', message: 'Application submitted', at: new Date('2026-08-18') },
        { status: 'reviewing', message: 'Application under review', at: new Date('2026-08-21') },
      ],
    },
  ]);

  await SavedJobModel.create([
    { student_id: student1._id, job_id: jobs[1]._id },
    { student_id: student1._id, job_id: jobs[2]._id },
    { student_id: student2._id, job_id: jobs[0]._id },
    { student_id: student3._id, job_id: jobs[5]._id },
  ]);

  await NotificationModel.create([
    {
      user_id: student1._id,
      title: 'Application Reviewed',
      message: 'Your application for Senior Frontend Engineer at Acme Labs is now under review.',
      is_read: false,
    },
    {
      user_id: student1._id,
      title: 'Application Accepted',
      message: 'Congratulations! Your application for Frontend Intern at Acme Labs has been accepted.',
      is_read: true,
    },
    {
      user_id: student2._id,
      title: 'New Job Match',
      message: 'A new Machine Learning Engineer position at GreenLeaf Health matches your skills.',
      is_read: false,
    },
  ]);

  logger.info('Seed complete.', {
    companies: companies.length,
    users: 9,
    jobs: jobs.length,
    applications: applications.length,
    demoAccounts: {
      student: 'student@demo.com / Password123!',
      student2: 'student2@demo.com / Password123!',
      student3: 'student3@demo.com / Password123!',
      recruiter: 'recruiter@demo.com / Password123!',
      admin: 'admin@demo.com / Password123!',
    },
  });

  await mongoose.disconnect();
}

seed().catch((error) => {
  logger.error('Seed failed', { error });
  process.exit(1);
});
