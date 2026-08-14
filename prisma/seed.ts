import { PrismaClient, Role, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create or update Demo Owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {
      name: "Alex Rivers",
      role: Role.OWNER,
      password_hash: passwordHash,
    },
    create: {
      email: "owner@demo.com",
      name: "Alex Rivers",
      role: Role.OWNER,
      password_hash: passwordHash,
    },
  });

  // 2. Create or update Demo Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {
      name: "Jordan Smith",
      role: Role.CUSTOMER,
      password_hash: passwordHash,
    },
    create: {
      email: "customer@demo.com",
      name: "Jordan Smith",
      role: Role.CUSTOMER,
      password_hash: passwordHash,
    },
  });

  // 3. Create or update Demo Business
  const business = await prisma.business.upsert({
    where: { slug: "glow-and-grace" },
    update: {
      name: "Glow & Grace Salon",
      description: "Boutique salon offering professional haircut, coloring, and styling services.",
      timezone: "America/New_York",
      owner_id: owner.id,
    },
    create: {
      owner_id: owner.id,
      name: "Glow & Grace Salon",
      slug: "glow-and-grace",
      description: "Boutique salon offering professional haircut, coloring, and styling services.",
      timezone: "America/New_York",
    },
  });

  // 4. Create Services
  await prisma.service.deleteMany({
    where: { business_id: business.id },
  });

  const haircut = await prisma.service.create({
    data: {
      business_id: business.id,
      name: "Haircut & Styling",
      duration_minutes: 45,
      price: 65.0,
      buffer_minutes: 15,
    },
  });

  const coloring = await prisma.service.create({
    data: {
      business_id: business.id,
      name: "Color & Highlights",
      duration_minutes: 90,
      price: 140.0,
      buffer_minutes: 15,
    },
  });

  const blowout = await prisma.service.create({
    data: {
      business_id: business.id,
      name: "Express Blowout",
      duration_minutes: 30,
      price: 45.0,
      buffer_minutes: 10,
    },
  });

  // 5. Create Weekly Availability (Mon-Fri 09:00-17:00, Sat 10:00-15:00)
  await prisma.availability.deleteMany({
    where: { business_id: business.id },
  });

  const weeklySchedule = [
    { day_of_week: 1, start_time: "09:00", end_time: "17:00" }, // Mon
    { day_of_week: 2, start_time: "09:00", end_time: "17:00" }, // Tue
    { day_of_week: 3, start_time: "09:00", end_time: "17:00" }, // Wed
    { day_of_week: 4, start_time: "09:00", end_time: "17:00" }, // Thu
    { day_of_week: 5, start_time: "09:00", end_time: "17:00" }, // Fri
    { day_of_week: 6, start_time: "10:00", end_time: "15:00" }, // Sat
  ];

  for (const avail of weeklySchedule) {
    await prisma.availability.create({
      data: {
        business_id: business.id,
        ...avail,
      },
    });
  }

  // 6. Create Sample Bookings
  await prisma.booking.deleteMany({
    where: { business_id: business.id },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(14, 0, 0, 0); // 10:00 AM EDT

  const tomorrowEnd = new Date(tomorrow.getTime() + 45 * 60 * 1000);

  await prisma.booking.create({
    data: {
      business_id: business.id,
      service_id: haircut.id,
      customer_id: customer.id,
      start_at: tomorrow,
      end_at: tomorrowEnd,
      status: BookingStatus.CONFIRMED,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------------");
  console.log("Demo Credentials:");
  console.log("Owner:    owner@demo.com / password123");
  console.log("Customer: customer@demo.com / password123");
  console.log("Demo Business URL: /glow-and-grace");
  console.log("-----------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
