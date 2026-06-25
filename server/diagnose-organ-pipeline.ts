/**
 * DIAGNOSTIC SCRIPT - Organ Donor Pipeline Audit
 * Run: npx ts-node diagnose-organ-pipeline.ts
 * 
 * Checks all PENDING_HOSPITAL organ donation requests and shows
 * exactly what data is stored vs what the hospital endpoint sees.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db!;

  // 1. Check all PENDING_HOSPITAL organ requests
  const pendingRequests = await db.collection('requests').find({
    type: 'Organ',
    status: 'PENDING_HOSPITAL'
  }).toArray();

  console.log(`=== PENDING_HOSPITAL Organ Requests: ${pendingRequests.length} ===\n`);

  for (const r of pendingRequests) {
    console.log(`Request ID: ${r._id}`);
    console.log(`  hospitalId:      ${r.hospitalId}`);
    console.log(`  acceptedDonorId: ${r.acceptedDonorId}`);
    console.log(`  donorName:       ${r.donorName}`);
    console.log(`  donorEmail:      ${r.donorEmail}`);
    console.log(`  donorBloodType:  ${r.donorBloodType}`);
    console.log(`  waitlistId:      ${r.waitlistId}`);
    console.log(`  createdAt:       ${r.createdAt}`);

    // 2. Resolve acceptedDonorId → DonorProfile
    if (r.acceptedDonorId) {
      const donorProfile = await db.collection('donorprofiles').findOne({ _id: r.acceptedDonorId });
      if (donorProfile) {
        console.log(`  [DonorProfile found] userId: ${donorProfile.userId}`);
        // Resolve userId → User
        const user = await db.collection('users').findOne({ _id: donorProfile.userId });
        if (user) {
          console.log(`  [User found] name: ${user.name}, email: ${user.email}, role: ${user.role}`);
        } else {
          console.log(`  [User NOT FOUND] for userId: ${donorProfile.userId}`);
        }
      } else {
        console.log(`  [DonorProfile NOT FOUND] for acceptedDonorId: ${r.acceptedDonorId}`);
      }
    } else {
      console.log(`  [WARNING] acceptedDonorId is NULL - donor is not linked!`);
    }
    console.log('---');
  }

  // 3. Check if there are any CLINICAL_TESTING records missing acceptedDonorId
  const clinicalRequests = await db.collection('requests').find({
    type: 'Organ',
    status: 'CLINICAL_TESTING'
  }).toArray();

  console.log(`\n=== CLINICAL_TESTING Organ Requests: ${clinicalRequests.length} ===\n`);
  for (const r of clinicalRequests) {
    console.log(`Request ID: ${r._id}`);
    console.log(`  acceptedDonorId: ${r.acceptedDonorId}`);
    console.log(`  donorName:       ${r.donorName}`);
    console.log(`  donorEmail:      ${r.donorEmail}`);
    console.log(`  clinicalEval:    ${JSON.stringify(r.clinicalEvaluation?.scheduledTestDate)}`);
    console.log('---');
  }

  // 4. Find the yopmail user specifically
  console.log(`\n=== Searching for yopmail users ===\n`);
  const yopmailUsers = await db.collection('users').find({
    email: { $regex: 'yopmail', $options: 'i' }
  }).toArray();

  for (const u of yopmailUsers) {
    console.log(`User: ${u.name} | email: ${u.email} | role: ${u.role} | _id: ${u._id}`);
    // Find their donor profile
    const dp = await db.collection('donorprofiles').findOne({ userId: u._id });
    if (dp) {
      console.log(`  DonorProfile _id: ${dp._id} | bloodType: ${dp.bloodType} | organs: ${dp.organsWillingToDonate}`);
      // Find any requests with this donor profile
      const reqs = await db.collection('requests').find({ acceptedDonorId: dp._id }).toArray();
      console.log(`  Linked Requests: ${reqs.length}`);
      for (const rq of reqs) {
        console.log(`    → ${rq._id} | status: ${rq.status} | hospitalId: ${rq.hospitalId} | donorEmail stored: ${rq.donorEmail}`);
      }
    } else {
      console.log(`  [No DonorProfile found]`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
