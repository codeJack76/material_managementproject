import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create default admin user
  const adminPassword = await hashPassword("admin123");
  
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
  });

  console.log(`✅ Created admin user: ${admin.username}`);

  // Create sample subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name_educationStage: { name: "English", educationStage: "ELEMENTARY" } },
      update: {},
      create: { name: "English", category: "Core", educationStage: "ELEMENTARY" },
    }),
    prisma.subject.upsert({
      where: { name_educationStage: { name: "Mathematics", educationStage: "ELEMENTARY" } },
      update: {},
      create: { name: "Mathematics", category: "Core", educationStage: "ELEMENTARY" },
    }),
    prisma.subject.upsert({
      where: { name_educationStage: { name: "Science", educationStage: "ELEMENTARY" } },
      update: {},
      create: { name: "Science", category: "Core", educationStage: "ELEMENTARY" },
    }),
    prisma.subject.upsert({
      where: { name_educationStage: { name: "Filipino", educationStage: "ELEMENTARY" } },
      update: {},
      create: { name: "Filipino", category: "Core", educationStage: "ELEMENTARY" },
    }),
    prisma.subject.upsert({
      where: { name_educationStage: { name: "English", educationStage: "JUNIOR_HIGH" } },
      update: {},
      create: { name: "English", category: "Core", educationStage: "JUNIOR_HIGH" },
    }),
    prisma.subject.upsert({
      where: { name_educationStage: { name: "Mathematics", educationStage: "JUNIOR_HIGH" } },
      update: {},
      create: { name: "Mathematics", category: "Core", educationStage: "JUNIOR_HIGH" },
    }),
  ]);

  console.log(`✅ Created ${subjects.length} subjects`);

  // Create sample schools
  const schools = await Promise.all([
    prisma.school.upsert({
      where: { name_municipality: { name: "Compostela Central Elementary School", municipality: "Compostela" } },
      update: {},
      create: {
        name: "Compostela Central Elementary School",
        type: "ELEMENTARY",
        municipality: "Compostela",
        congressionalDistrict: 1,
        zone: "Urban",
      },
    }),
    prisma.school.upsert({
      where: { name_municipality: { name: "Monkayo National High School", municipality: "Monkayo" } },
      update: {},
      create: {
        name: "Monkayo National High School",
        type: "SECONDARY",
        municipality: "Monkayo",
        congressionalDistrict: 2,
        zone: "Urban",
      },
    }),
    prisma.school.upsert({
      where: { name_municipality: { name: "Nabunturan Integrated School", municipality: "Nabunturan" } },
      update: {},
      create: {
        name: "Nabunturan Integrated School",
        type: "INTEGRATED",
        municipality: "Nabunturan",
        congressionalDistrict: 1,
        zone: "Urban",
      },
    }),
  ]);

  console.log(`✅ Created ${schools.length} schools`);

  // Create sample materials
  const englishSubject = subjects[0];
  const mathSubject = subjects[1];

  const materials = await Promise.all([
    prisma.material.create({
      data: {
        name: "English Learner's Material Grade 3",
        gradeLevel: 3,
        quantity: 500,
        source: "DepEd Central",
        subjectId: englishSubject.id,
      },
    }),
    prisma.material.create({
      data: {
        name: "Mathematics Textbook Grade 4",
        gradeLevel: 4,
        quantity: 350,
        source: "DepEd Central",
        subjectId: mathSubject.id,
      },
    }),
    prisma.material.create({
      data: {
        name: "English Activity Sheets Grade 5",
        gradeLevel: 5,
        quantity: 1000,
        source: "Division Office",
        subjectId: englishSubject.id,
      },
    }),
  ]);

  console.log(`✅ Created ${materials.length} materials`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Default credentials:");
  console.log("   Admin: username=admin, password=admin123");
  console.log("   User:  username=user, password=user123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
