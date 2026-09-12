import { randomUUID } from 'crypto';
import { encode } from 'next-auth/jwt';
import { prisma } from '../lib/prisma';
import { deleteFile } from '../lib/s3';
import assert from 'node:assert/strict';

// Exercises real local HTTP routes with isolated applicant fixtures. No customer records are edited.
const base = 'http://localhost:3000';
const userIds: string[] = [], auctionIds: string[] = [], syndicateIds: string[] = [], appIds: string[] = [];
let passed = 0;
async function cookie(id: string) {
  const name = 'authjs.session-token';
  const token = await encode({ token: { id, sub: id }, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!, salt: name });
  return `${name}=${token}`;
}
async function request(path: string, auth = '', data?: unknown, method = data === undefined ? 'GET' : 'POST') {
  return fetch(base + path, { method, redirect: 'manual', headers: { cookie: auth, 'content-type': 'application/json' }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
}
async function expect(name: string, response: Response, status: number) {
  const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : {};
  assert.equal(response.status, status, `${name}: ${response.status} ${body.error ?? ''}`);
  console.log(`PASS ${name}`); passed++; return body;
}
async function upload(auth: string) {
  // Deliberately synthetic fixture, never a real identity or financial document.
  const file = Buffer.from('%PDF-1.4\n% Synthetic verification test fixture only\n%%EOF\n');
  const issued = await expect('private upload issued', await request('/api/upload/presigned', auth, { fileName: 'synthetic-test.pdf', contentType: 'application/pdf', size: file.length, isPublic: false }), 200);
  const put = await fetch(issued.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: file });
  assert.equal(put.status, 200, 'storage PUT');
  return issued.cloud_storage_path;
}
async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } });
  assert.ok(admin, 'An administrator must exist');
  const adminCookie = await cookie(admin.id);
  try {
    const signup = await expect('worldwide applicant registration', await request('/api/signup', '', { fullName: 'Verification Test Fixture', email: `verify-${randomUUID()}@example.com`, password: randomUUID() }), 201);
    userIds.push(signup.id);
    const memberCookie = await cookie(signup.id);
    await expect('anonymous member-data request denied', await request('/api/syndicates'), 401);
    for (const [path, data] of [['/api/syndicates', undefined], ['/api/bids', { auctionId: 'none', amount: 1 }], ['/api/syndicates', {}], ['/api/syndicates/none/join', { pledgeAmount: 1 }], ['/api/syndicates/none/lock', {}]] as const) {
      await expect(`unverified access denied: ${path}`, await request(path, memberCookie, data), 403);
    }
    for (const path of ['/auctions', '/auctions/none', '/syndicates', '/syndicates/none']) {
      const response = await request(path, memberCookie);
      assert.equal(response.status, 307); assert.equal(response.headers.get('location'), '/dashboard');
      console.log(`PASS unverified page redirected: ${path}`); passed++;
    }
    await expect('incomplete application rejected', await request('/api/application', memberCookie, {}), 400);
    await expect('non-admin review denied', await request('/api/admin/applications', memberCookie, {}), 403);
    await expect('public evidence rejected', await request('/api/upload/presigned', memberCookie, { fileName: 'a.pdf', contentType: 'application/pdf', size: 10, isPublic: true }), 400);
    await expect('oversize evidence rejected', await request('/api/upload/presigned', memberCookie, { fileName: 'a.pdf', contentType: 'application/pdf', size: 10485761, isPublic: false }), 400);
    const passportPath = await upload(memberCookie), bankDocPath = await upload(memberCookie);
    const declaration = { legalName: 'Verification Test Fixture', nationality: 'Pakistani', countryResidence: 'Pakistan', dateOfBirth: '1980-01-01', passportPath, bankDocPath, declaredNetWorthUsd: 2000000, valuationDate: new Date().toISOString().slice(0, 10), valuationNotes: 'Synthetic test only. USD assets minus liabilities. No real wealth claim.', sourceOfWealth: 'Synthetic test business', primaryAssetClass: 'Business', bankName: 'Synthetic Bank', bankCountry: 'Pakistan', swiftCode: '', acceptTerms: true };
    await expect('sub-millionaire rejected', await request('/api/application', memberCookie, { ...declaration, declaredNetWorthUsd: 999999 }), 400);
    await expect('missing attestation rejected', await request('/api/application', memberCookie, { ...declaration, acceptTerms: false }), 400);
    await expect('foreign document path rejected', await request('/api/application', memberCookie, { ...declaration, passportPath: 'not-your-upload' }), 400);
    const application = await expect('complete application accepted', await request('/api/application', memberCookie, { ...declaration, tier: 'Titan' }), 201);
    appIds.push(application.id);
    const stored = await prisma.application.findUniqueOrThrow({ where: { id: application.id } });
    assert.equal(stored.tier, 'Millionaire'); assert.notEqual(stored.passportPath, passportPath); console.log('PASS server-derived tier and immutable submitted evidence'); passed++;
    await expect('duplicate submission rejected', await request('/api/application', memberCookie, declaration), 409);
    await expect('approval checklist required', await request('/api/admin/applications', adminCookie, { applicationId: application.id, action: 'approve', note: 'Synthetic test review' }), 400);
    const review = { applicationId: application.id, note: 'Synthetic test fixture review only; no real wealth certification', identityChecked: true, wealthChecked: true, authenticityChecked: true };
    await expect('request information', await request('/api/admin/applications', adminCookie, { ...review, action: 'request_info' }), 200);
    await expect('resubmit requested evidence', await request('/api/application', memberCookie, declaration), 201);
    await expect('complete manual approval', await request('/api/admin/applications', adminCookie, { ...review, action: 'approve' }), 200);
    await expect('verified member access allowed', await request('/api/syndicates', memberCookie), 200);
    const approved = await prisma.application.findUniqueOrThrow({ where: { id: application.id } });
    await expect('applicant cannot download review documents', await request(`/api/files/${encodeURIComponent(approved.passportPath!)}`, memberCookie), 403);
    const download = await request(`/api/files/${encodeURIComponent(approved.passportPath!)}`, adminCookie);
    assert.equal(download.status, 307);
    const storage = await fetch(download.headers.get('location')!); assert.equal(storage.status, 200); assert.match(storage.headers.get('content-disposition') ?? '', /attachment/);
    console.log('PASS authorized private document download'); passed++;
    const auction = await expect('create isolated auction', await request('/api/admin/auctions', adminCookie, { assetName: 'Synthetic test auction', category: 'Test', description: 'Temporary runtime test, not a real asset', reservePrice: 100, tierRequired: '' }), 201);
    auctionIds.push(auction.id);
    await expect('non-numeric bid rejected', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: '500' }), 400);
    await expect('negative bid rejected', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: -100 }), 400);
    await expect('reserve enforced', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: 50 }), 400);
    await expect('syndicate impersonation denied', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: 200, syndicateId: 'unauthorized' }), 403);
    await expect('active auction accepts bid despite legacy past end date', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: 200 }), 201);
    for (let i = 0; i < 3; i++) {
      const low = 300 + i * 200, high = low + 100;
      const replies = await Promise.all([request('/api/bids', memberCookie, { auctionId: auction.id, amount: low }), request('/api/bids', memberCookie, { auctionId: auction.id, amount: high })]);
      assert.ok(replies.every(r => [201, 400, 409].includes(r.status)));
      const record = await prisma.auction.findUniqueOrThrow({ where: { id: auction.id }, include: { bids: true } });
      assert.equal(record.currentBid, Math.max(...record.bids.map(b => b.amount))); assert.equal(record.bidCount, record.bids.length);
    }
    console.log('PASS concurrent bids preserve highest committed bid across repeated runs'); passed++;
    const syn = await expect('create isolated syndicate', await request('/api/syndicates', memberCookie, { name: 'Synthetic test syndicate', description: 'Temporary pledge transaction test', targetCategory: 'Test', minContribution: 100, maxMembers: 2 }), 201);
    syndicateIds.push(syn.id);
    const joins = await Promise.all([request(`/api/syndicates/${syn.id}/join`, memberCookie, { pledgeAmount: 2000 }), request(`/api/syndicates/${syn.id}/join`, memberCookie, { pledgeAmount: 2000 })]);
    assert.equal(joins.filter(r => r.status === 201).length, 1);
    const pool = await prisma.syndicate.findUniqueOrThrow({ where: { id: syn.id }, include: { members: true } });
    assert.equal(pool.poolTotal, 2000); assert.equal(pool.members.length, 1); console.log('PASS concurrent duplicate pledge counted once'); passed++;
    await expect('open pledges cannot bid', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: 1500, syndicateId: syn.id }), 400);
    await expect('leader closes pledges', await request(`/api/syndicates/${syn.id}/lock`, memberCookie, {}), 200);
    await expect('closed pledges reject new joins', await request(`/api/syndicates/${syn.id}/join`, memberCookie, { pledgeAmount: 2000 }), 400);
    await expect('syndicate bid over pledges rejected', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: 3000, syndicateId: syn.id }), 400);
    await expect('authorized syndicate bid', await request('/api/bids', memberCookie, { auctionId: auction.id, amount: 1500, syndicateId: syn.id }), 201);
    await prisma.application.update({ where: { id: application.id }, data: { verifiedUntil: new Date(0) } });
    await expect('expired verification denied immediately', await request('/api/syndicates', memberCookie), 403);
    assert.ok(await prisma.adminAction.count({ where: { targetId: application.id, action: 'document_download', actorId: admin.id } }));
    console.log(`VERIFICATION SMOKE: PASS (${passed} checks)`);
  } finally {
    // Cleanup is restricted to fixture IDs created by this run, never existing customer IDs.
    const uploads = await prisma.verificationUpload.findMany({ where: { userId: { in: userIds } } });
    for (const file of uploads) await deleteFile(file.cloud_storage_path);
    await prisma.verificationUpload.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.bid.deleteMany({ where: { auctionId: { in: auctionIds } } });
    await prisma.auction.deleteMany({ where: { id: { in: auctionIds } } });
    await prisma.syndicate.deleteMany({ where: { id: { in: syndicateIds } } });
    await prisma.adminAction.deleteMany({ where: { OR: [{ targetId: { in: appIds } }, { actorId: { in: userIds } }] } });
    await prisma.application.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
