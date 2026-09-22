import { PrismaClient, LeadStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create primary user
  const user = await prisma.user.create({
    data: {
      name: 'Niraj Parihar',
      email: 'niraj@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // Dates relative to today
  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  const todayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
  const todayEvening = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const sampleLeads = [
    {
      name: 'Rahul Shah',
      email: 'rahul.shah@techcorp.in',
      phone: '+91 98765 43210',
      company: 'TechCorp Solutions',
      source: 'LinkedIn',
      stage: LeadStage.QUALIFIED,
      followUpAt: todayMorning,
      notes: 'Interested in enterprise cloud deployment. Scheduled follow-up call for technical review.',
    },
    {
      name: 'ABC Ltd',
      email: 'contact@abcltd.com',
      phone: '+91 98123 45678',
      company: 'ABC Enterprises',
      source: 'Website',
      stage: LeadStage.CONTACTED,
      followUpAt: todayAfternoon,
      notes: 'Sent pricing catalog. Requested callback regarding volume discount terms.',
    },
    {
      name: 'John Smith',
      email: 'john.smith@acme.org',
      phone: '+1 555 019 2834',
      company: 'Acme Global',
      source: 'Referral',
      stage: LeadStage.NEW,
      followUpAt: todayEvening,
      notes: 'Referred by Sarah Miller. Looking for lightweight CRM for 10-person sales team.',
    },
    {
      name: 'XYZ Corp',
      email: 'sales@xyzcorp.io',
      phone: '+91 99887 66554',
      company: 'XYZ Innovations',
      source: 'Website',
      stage: LeadStage.CONTACTED,
      followUpAt: yesterday,
      notes: 'Overdue follow up: Demo completed last week. Awaiting security questionnaire compliance document.',
    },
    {
      name: 'Alex Johnson',
      email: 'alex.j@apexmedia.net',
      phone: '+1 555 382 9102',
      company: 'Apex Media Group',
      source: 'Cold Outbound',
      stage: LeadStage.QUALIFIED,
      followUpAt: twoDaysAgo,
      notes: 'Overdue follow up: Validated budget approval ($15k/yr). Need to send contract draft.',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@fintechlabs.in',
      phone: '+91 97112 33445',
      company: 'Fintech Labs',
      source: 'Webinar',
      stage: LeadStage.NEW,
      followUpAt: threeDaysAgo,
      notes: 'Overdue follow up: Attended Q3 Product Webinar. Requested contact for custom API integration.',
    },
    {
      name: 'Vikram Mehta',
      email: 'v.mehta@nexussoft.com',
      phone: '+91 98334 55667',
      company: 'Nexus Software',
      source: 'LinkedIn',
      stage: LeadStage.WON,
      followUpAt: null,
      notes: 'Closed deal! Annual subscription signed. Onboarding scheduled with CS team.',
    },
    {
      name: 'Global Logistics Inc',
      email: 'procurement@globallogistics.com',
      phone: '+1 800 555 0149',
      company: 'Global Logistics',
      source: 'Trade Show',
      stage: LeadStage.WON,
      followUpAt: null,
      notes: 'Closed deal! Contract signed for 25 seats.',
    },
    {
      name: 'Sunrise Retailers',
      email: 'orders@sunriseretail.in',
      phone: '+91 96543 21098',
      company: 'Sunrise Retail',
      source: 'Website',
      stage: LeadStage.WON,
      followUpAt: null,
      notes: 'Payment confirmed. Account activated.',
    },
    {
      name: 'Delta Digital',
      email: 'hello@deltadigital.agency',
      phone: '+44 20 7946 0912',
      company: 'Delta Digital Agency',
      source: 'Partner',
      stage: LeadStage.LOST,
      followUpAt: null,
      notes: 'Chose competitor due to existing legacy system lock-in. Revisit in Q4.',
    },
    {
      name: 'Starlight Ventures',
      email: 'info@starlight.vc',
      phone: '+1 415 555 2671',
      company: 'Starlight VC',
      source: 'Cold Outbound',
      stage: LeadStage.LOST,
      followUpAt: null,
      notes: 'Not looking for sales tooling at this stage of growth.',
    },
    {
      name: 'Rohan Gupta',
      email: 'rohan@cloudscale.io',
      phone: '+91 99001 12233',
      company: 'CloudScale Inc',
      source: 'LinkedIn',
      stage: LeadStage.QUALIFIED,
      followUpAt: tomorrow,
      notes: 'Technical evaluation in progress. Call scheduled with CTO tomorrow morning.',
    },
    {
      name: 'Elena Rostova',
      email: 'elena@polardata.de',
      phone: '+49 30 123456',
      company: 'Polar Data GmbH',
      source: 'Website',
      stage: LeadStage.CONTACTED,
      followUpAt: inThreeDays,
      notes: 'Sent proposal breakdown. Waiting for procurement committee review.',
    },
    {
      name: 'David Kim',
      email: 'dkim@horizon.kr',
      phone: '+82 2 3456 7890',
      company: 'Horizon Mobility',
      source: 'Referral',
      stage: LeadStage.NEW,
      followUpAt: nextWeek,
      notes: 'Initial inquiry via partner network. Needs introductory slide deck.',
    },
    {
      name: 'Ananya Roy',
      email: 'ananya@biotechsolutions.org',
      phone: '+91 98711 22334',
      company: 'BioTech Solutions',
      source: 'Webinar',
      stage: LeadStage.NEW,
      followUpAt: tomorrow,
      notes: 'Downloaded whitepaper on CRM pipeline optimization.',
    },
    {
      name: 'Marcus Vance',
      email: 'm.vance@vancestrategies.com',
      phone: '+1 212 555 9812',
      company: 'Vance Strategies',
      source: 'LinkedIn',
      stage: LeadStage.CONTACTED,
      followUpAt: inThreeDays,
      notes: 'Initial discovery call went well. Wants to see custom reporting demo.',
    },
    {
      name: 'BrightPath Learning',
      email: 'support@brightpath.edu',
      phone: '+1 888 555 4321',
      company: 'BrightPath EdTech',
      source: 'Trade Show',
      stage: LeadStage.NEW,
      followUpAt: null,
      notes: 'Met at EdTech Expo 2026. Interested in student lead workflow tracking.',
    },
    {
      name: 'Kavita Patel',
      email: 'kavita@greenelectrics.in',
      phone: '+91 98450 11223',
      company: 'Green Electrics',
      source: 'Website',
      stage: LeadStage.QUALIFIED,
      followUpAt: nextWeek,
      notes: 'Budget verified. Scheduling final demo for executive board.',
    },
  ];

  for (const leadData of sampleLeads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        userId: user.id,
      },
    });
  }

  console.log(`Successfully seeded ${sampleLeads.length} leads for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
