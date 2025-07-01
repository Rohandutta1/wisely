import { db } from "./db";
import { colleges, teachers } from "@shared/schema";

export async function seedDatabase() {
  console.log("Starting database seeding...");

  // Check if data already exists
  const existingColleges = await db.select().from(colleges).limit(1);
  const existingTeachers = await db.select().from(teachers).limit(1);

  if (existingColleges.length > 0 && existingTeachers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Seed colleges
  const collegeData = [
    {
      name: "Indian Institute of Technology (IIT) Delhi",
      location: "New Delhi",
      courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
      fees: 200000,
      ranking: 2,
      entranceExam: "JEE Advanced",
      description: "Premier engineering institute known for excellence in technology and research."
    },
    {
      name: "Indian Institute of Science (IISc)",
      location: "Bangalore",
      courses: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
      fees: 150000,
      ranking: 1,
      entranceExam: "GATE/JAM",
      description: "Leading research university in science and engineering."
    },
    {
      name: "All India Institute of Medical Sciences (AIIMS)",
      location: "New Delhi",
      courses: ["Medicine", "Nursing", "Pharmacy", "Biotechnology"],
      fees: 1500,
      ranking: 1,
      entranceExam: "NEET",
      description: "Top medical college in India with world-class facilities."
    },
    {
      name: "University of Delhi",
      location: "New Delhi",
      courses: ["Arts", "Science", "Commerce", "Law"],
      fees: 25000,
      ranking: 8,
      entranceExam: "CUET",
      description: "One of India's largest and most prestigious universities."
    },
    {
      name: "Indian Institute of Management (IIM) Ahmedabad",
      location: "Ahmedabad",
      courses: ["MBA", "Executive MBA", "Management", "Business Analytics"],
      fees: 2500000,
      ranking: 1,
      entranceExam: "CAT",
      description: "Premier business school known for producing top management professionals."
    },
    {
      name: "Jawaharlal Nehru University",
      location: "New Delhi",
      courses: ["Political Science", "History", "Economics", "International Relations"],
      fees: 20000,
      ranking: 12,
      entranceExam: "JNUEE",
      description: "Leading university for social sciences and humanities."
    },
    {
      name: "Indian Statistical Institute",
      location: "Kolkata",
      courses: ["Statistics", "Mathematics", "Computer Science", "Economics"],
      fees: 100000,
      ranking: 15,
      entranceExam: "ISI Admission Test",
      description: "Renowned institute for statistics and mathematical sciences."
    },
    {
      name: "Banaras Hindu University",
      location: "Varanasi",
      courses: ["Engineering", "Medicine", "Arts", "Science"],
      fees: 80000,
      ranking: 18,
      entranceExam: "BHU UET",
      description: "One of India's oldest and largest residential universities."
    }
  ];

  // Seed teachers
  const teacherData = [
    {
      name: "Dr. Priya Sharma",
      email: "priya.sharma@example.com",
      specializations: ["IELTS Preparation", "Academic Writing", "Business English"],
      experience: 8,
      qualifications: ["PhD in English Literature", "TESOL Certification", "Cambridge CELTA"],
      hourlyRate: 1500,
      rating: 48,
      totalReviews: 156,
      bio: "Expert English teacher with 8 years of experience in IELTS preparation and academic writing."
    },
    {
      name: "Prof. Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      specializations: ["English Grammar", "Spoken English", "Pronunciation"],
      experience: 12,
      qualifications: ["MA English", "B.Ed", "Trinity College London Certification"],
      hourlyRate: 1200,
      rating: 46,
      totalReviews: 203,
      bio: "Experienced educator specializing in grammar fundamentals and spoken English fluency."
    },
    {
      name: "Ms. Anita Patel",
      email: "anita.patel@example.com",
      specializations: ["Business English", "Presentation Skills", "Professional Writing"],
      experience: 6,
      qualifications: ["MBA", "TESOL Certification", "Business Communication Diploma"],
      hourlyRate: 1800,
      rating: 49,
      totalReviews: 89,
      bio: "Business English specialist helping professionals improve their communication skills."
    },
    {
      name: "Dr. Michael Johnson",
      email: "michael.johnson@example.com",
      specializations: ["Academic Writing", "Research Methodology", "Scientific English"],
      experience: 15,
      qualifications: ["PhD in Applied Linguistics", "Cambridge DELTA", "IELTS Examiner"],
      hourlyRate: 2200,
      rating: 50,
      totalReviews: 178,
      bio: "International expert in academic writing and scientific English communication."
    },
    {
      name: "Ms. Deepika Singh",
      email: "deepika.singh@example.com",
      specializations: ["Spoken English", "Conversation Practice", "Accent Training"],
      experience: 4,
      qualifications: ["MA English", "TEFL Certification", "Public Speaking Diploma"],
      hourlyRate: 1000,
      rating: 45,
      totalReviews: 67,
      bio: "Young and energetic teacher focused on improving spoken English and confidence building."
    },
    {
      name: "Prof. Sarah Williams",
      email: "sarah.williams@example.com",
      specializations: ["IELTS Preparation", "TOEFL Preparation", "Test Strategies"],
      experience: 10,
      qualifications: ["MA TESOL", "Cambridge CELTA", "IELTS Official Trainer"],
      hourlyRate: 1700,
      rating: 47,
      totalReviews: 142,
      bio: "Certified IELTS trainer with proven track record of helping students achieve band 8+."
    },
    {
      name: "Mr. Arjun Mehta",
      email: "arjun.mehta@example.com",
      specializations: ["English Grammar", "Writing Skills", "Literature"],
      experience: 7,
      qualifications: ["MA English Literature", "B.Ed", "Creative Writing Certificate"],
      hourlyRate: 1300,
      rating: 44,
      totalReviews: 98,
      bio: "Literature enthusiast teaching grammar and writing through creative approaches."
    },
    {
      name: "Dr. Lisa Chen",
      email: "lisa.chen@example.com",
      specializations: ["Business English", "Cross-cultural Communication", "Leadership English"],
      experience: 9,
      qualifications: ["PhD Business Communication", "Executive Coach Certification", "TESOL"],
      hourlyRate: 2000,
      rating: 48,
      totalReviews: 134,
      bio: "Executive communication coach specializing in leadership and cross-cultural business English."
    }
  ];

  try {
    console.log("Inserting colleges...");
    await db.insert(colleges).values(collegeData);
    console.log(`Inserted ${collegeData.length} colleges`);

    console.log("Inserting teachers...");
    await db.insert(teachers).values(teacherData);
    console.log(`Inserted ${teacherData.length} teachers`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}