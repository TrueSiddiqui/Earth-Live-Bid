import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hidden test account
  const testHash = await bcrypt.hash('<REPLACE_WITH_YOUR_OWN_SECRET>', 12);
  await prisma.user.upsert({
    where: { email: 'abacus-3a9ae724@example.com' },
    update: { password: testHash },
    create: {
      email: 'abacus-3a9ae724@example.com',
      password: testHash,
      fullName: 'Test Admin',
      role: 'admin',
      status: 'approved',
      tier: 'Titan',
    },
  });

  // Admin user requested by user
  const adminHash = await bcrypt.hash('<REPLACE_WITH_YOUR_OWN_SECRET>', 12);
  await prisma.user.upsert({
    where: { email: 'admin@topg.earth' },
    update: { password: adminHash },
    create: {
      email: 'admin@topg.earth',
      password: adminHash,
      fullName: 'Earth Collective Admin',
      role: 'admin',
      status: 'approved',
      tier: 'Titan',
    },
  });

  // 6 Sample Auctions
  const auctions = [
    {
      assetName: 'Pacific Deep Mineral Rights Zone A-7',
      category: 'Oceans',
      description: 'Exclusive mineral extraction rights to Zone A-7 in the Pacific abyssal plain, encompassing 12,000 km² of polymetallic nodule deposits rich in manganese, nickel, cobalt, and rare earth elements.',
      imageUrl: 'https://cdn.abacus.ai/images/2248d7cf-eae4-4a6f-a6cf-54d502724961.png',
      reservePrice: 2500000000,
      currentBid: 2800000000,
      bidCount: 7,
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      assetName: 'Rare Earth Extraction Block — Greenland Interior',
      category: 'Minerals',
      description: 'Sovereign extraction rights to a 4,800 km² block in Greenland\'s interior containing one of the world\'s largest undeveloped deposits of neodymium, dysprosium, and terbium.',
      imageUrl: 'https://cdn.abacus.ai/images/c80878ee-fcfe-4a0c-af8e-1ad8326ddc3a.png',
      reservePrice: 4200000000,
      currentBid: 4500000000,
      bidCount: 12,
      endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      tierRequired: 'Billionaire',
    },
    {
      assetName: 'Carbon Credit Sovereign Reserve — 500M Tons',
      category: 'Atmosphere',
      description: 'A sovereign block of 500 million verified carbon credits, backed by atmospheric sequestration projects across three continents. Includes perpetual trading rights.',
      imageUrl: 'https://cdn.abacus.ai/images/3f00951f-543b-413d-8dcc-fbdf40cef865.png',
      reservePrice: 8750000000,
      currentBid: 9100000000,
      bidCount: 4,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tierRequired: 'Titan',
    },
    {
      assetName: 'LEO Slot Bundle — 12 Orbital Positions',
      category: 'Orbital Space',
      description: 'A bundle of 12 verified Low Earth Orbit positions between 400-600 km altitude, pre-cleared for satellite deployment with ITU frequency coordination.',
      imageUrl: 'https://cdn.abacus.ai/images/8a550818-9dfd-46fe-b1b4-0dbd0a0e725e.png',
      reservePrice: 1800000000,
      currentBid: 2100000000,
      bidCount: 9,
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      assetName: 'Amazon Carbon Corridor — 2.4M Hectares',
      category: 'Forests',
      description: 'Stewardship and carbon rights to a 2.4 million hectare corridor spanning pristine Amazonian rainforest. Includes biodiversity credits and sovereign carbon sequestration yields.',
      imageUrl: 'https://cdn.abacus.ai/images/8a68df88-9ef9-4b59-85f6-b6356c82bc04.png',
      reservePrice: 6300000000,
      currentBid: 6800000000,
      bidCount: 6,
      endsAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      tierRequired: 'Billionaire',
    },
    {
      assetName: 'Tibetan Plateau Glacier Rights — 180 km²',
      category: 'Freshwater',
      description: 'Exclusive rights to 180 km² of glacial freshwater reserves on the Tibetan Plateau, the world\'s third-largest store of frozen freshwater. Includes meltwater harvesting and distribution rights.',
      imageUrl: 'https://cdn.abacus.ai/images/0b9063c9-27f2-440b-b8a8-ee3319bbcd52.png',
      reservePrice: 3700000000,
      currentBid: 4000000000,
      bidCount: 8,
      endsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const auction of auctions) {
    await prisma.auction.upsert({
      where: { id: auction.assetName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 25) },
      update: {},
      create: {
        ...auction,
        status: 'active',
      },
    });
  }

  // 3 Sample Syndicates
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@topg.earth' } });
  if (adminUser) {
    const syndicates = [
      {
        name: 'Pacific Depths Consortium',
        description: 'A coalition of high-net-worth individuals pooling capital to acquire deep-sea mineral rights in the Pacific.',
        targetCategory: 'Oceans',
        minContribution: 50000000,
        maxMembers: 20,
        poolTotal: 750000000,
        creatorId: adminUser.id,
      },
      {
        name: 'Orbital Sovereignty Fund',
        description: 'Syndicate focused on acquiring Low Earth Orbit positions for next-gen satellite infrastructure.',
        targetCategory: 'Orbital Space',
        minContribution: 25000000,
        maxMembers: 30,
        poolTotal: 420000000,
        creatorId: adminUser.id,
      },
      {
        name: 'Terra Verde Alliance',
        description: 'Dedicated to acquiring and preserving critical forest corridors while monetizing carbon credits.',
        targetCategory: 'Forests',
        minContribution: 100000000,
        maxMembers: 15,
        poolTotal: 1200000000,
        creatorId: adminUser.id,
      },
    ];

    for (const syn of syndicates) {
      const existing = await prisma.syndicate.findFirst({ where: { name: syn.name } });
      if (!existing) {
        await prisma.syndicate.create({ data: syn });
      }
    }
  }

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
