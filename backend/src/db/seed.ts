import { db } from './index.js';
import { users, competitions } from '@hotnotclub/shared/src/schema';
import { generateReferralCode, getWeekBounds, getWeekLabel } from '../utils/helpers.js';

/**
 * Seed database with test data for development
 */
async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create test admin user
    const [adminUser] = await db.insert(users).values({
      id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for testing
      username: 'admin',
      firstName: 'Admin',
      email: 'admin@hotnotclub.local',
      dob: new Date('1990-01-01'),
      gender: 'male',
      state: 'California',
      city: 'San Francisco',
      bio: 'Test admin user',
      isAdmin: true,
      referralCode: generateReferralCode('admin'),
      boostBalance: 100,
    }).onConflictDoNothing().returning();

    console.log('✓ Created admin user:', adminUser?.username);

    // Create test regular users
    const testUsers = [
      {
        username: 'testuser1',
        firstName: 'Test',
        email: 'test1@hotnotclub.local',
        gender: 'male' as const,
        city: 'Los Angeles',
      },
      {
        username: 'testuser2',
        firstName: 'Jane',
        email: 'test2@hotnotclub.local',
        gender: 'female' as const,
        city: 'New York',
      },
      {
        username: 'testuser3',
        firstName: 'Mike',
        email: 'test3@hotnotclub.local',
        gender: 'male' as const,
        city: 'Chicago',
      },
    ];

    for (const userData of testUsers) {
      await db.insert(users).values({
        username: userData.username,
        firstName: userData.firstName,
        email: userData.email,
        dob: new Date('1995-06-15'),
        gender: userData.gender,
        state: 'California',
        city: userData.city,
        referralCode: generateReferralCode(userData.username),
        boostBalance: 10,
      }).onConflictDoNothing();
    }

    console.log('✓ Created test users');

    // Create current competition (voting phase)
    const now = new Date();
    const { start: currentStart, end: currentEnd } = getWeekBounds(now);

    const entryStart = new Date(currentStart);
    entryStart.setUTCDate(entryStart.getUTCDate() - 7);
    const entryEnd = new Date(currentStart);
    entryEnd.setUTCSeconds(entryEnd.getUTCSeconds() - 1);

    const [currentComp] = await db.insert(competitions).values({
      weekLabel: getWeekLabel(currentStart),
      startDate: currentStart,
      endDate: currentEnd,
      entryStartDate: entryStart,
      entryEndDate: entryEnd,
      phase: 'voting',
      jackpotAmount: '500.00',
      totalEntryRevenue: '1000.00',
      totalBoostRevenueAllocated: '0',
    }).onConflictDoNothing().returning();

    console.log('✓ Created current competition:', currentComp?.weekLabel);

    // Create upcoming competition (entry phase)
    const nextWeek = new Date(now);
    nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
    const { start: nextStart, end: nextEnd } = getWeekBounds(nextWeek);

    const [upcomingComp] = await db.insert(competitions).values({
      weekLabel: getWeekLabel(nextStart),
      startDate: nextStart,
      endDate: nextEnd,
      entryStartDate: currentStart,
      entryEndDate: new Date(nextStart.getTime() - 1),
      phase: 'entry',
      jackpotAmount: '0',
      totalEntryRevenue: '0',
      totalBoostRevenueAllocated: '0',
    }).onConflictDoNothing().returning();

    console.log('✓ Created upcoming competition:', upcomingComp?.weekLabel);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('Test accounts created:');
    console.log('  • admin@hotnotclub.local (admin user)');
    console.log('  • test1@hotnotclub.local');
    console.log('  • test2@hotnotclub.local');
    console.log('  • test3@hotnotclub.local');
    console.log('');
    console.log('Note: These users need to be created in Supabase Auth separately');
    console.log('      Use the same emails with password: "password123"');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
