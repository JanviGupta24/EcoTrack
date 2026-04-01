/**
 * utils/seed.js
 * EcoTrack — Complete Database Seeder
 *
 * Features:
 *  - Drops existing database (DEV ONLY!)
 *  - Seeds:
 *      • Users (5 citizens, 5 workers, admin, super_admin, champion)
 *      • Facilities (4)
 *      • Trainings (5) with modules, quizzes, assignments
 *      • Resources (5)
 *      • Waste Reports (10) with Cloudinary images
 *      • Transactions (10)
 *      • Events (5)
 *      • Notifications (10)
 *      • OTPs (2 demo)
 *
 * Usage:
 *  1. Set MONGODB_URI in .env
 *  2. node utils/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Models
const User = require("../models/User");
const Facility = require("../models/Facility");
const Training = require("../models/Training");
const WasteReport = require("../models/WasteReport");
const Transaction = require("../models/Transaction");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const OTP = require("../models/OTP");
const Resource = require("../models/Resource");

// ---------------------------------------------------------------------------
// DB CONNECT
// ---------------------------------------------------------------------------
async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI / MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    autoIndex: true,
  });

  console.log("✅ Connected to MongoDB:", uri);
}

const nowPlusDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------
async function seed() {
  try {
    await connectDB();

    // -----------------------------------------------------------------------
    // 1. DROP EXISTING DATABASE (DEV SAFE WIPE)
    // -----------------------------------------------------------------------
    console.log("\n🧹 Dropping existing database (dev only)...");
    await mongoose.connection.db.dropDatabase();
    console.log("🗑️  Database dropped. Starting fresh.\n");

    // -----------------------------------------------------------------------
    // 2. USERS (ADMINS, CITIZENS, WORKERS, CHAMPION)
    // -----------------------------------------------------------------------
    console.log("👥 Creating users & workers...");

    const [
      admin,
      superAdmin,
      citizen1,
      citizen2,
      citizen3,
      champion,
      workerPlastic,
      workerOrganic,
      workerEWaste,
      workerHazard,
      workerConstruction,
    ] = await User.create([
      {
        name: "System Admin",
        email: "admin@ecotrack.com",
        password: "Admin@2025",
        role: "admin",
        phone: "+919999100001",
        isVerified: true,
        emailVerified: true,
      },
      {
        name: "Platform Owner",
        email: "owner@ecotrack.com",
        password: "Owner@2025",
        role: "super_admin",
        phone: "+919999100002",
        isVerified: true,
        emailVerified: true,
      },
      {
        name: "Riya Malhotra",
        email: "riya.malhotra@example.com",
        password: "Riya@123",
        role: "user",
        ecoPoints: 60,
        walletBalance: 30,
        phone: "+919877556612",
        isVerified: true,
        emailVerified: true,
        location: {
          type: "Point",
          coordinates: [72.8777, 19.076],
          address: "Andheri West, Mumbai",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400053",
        },
      },
      {
        name: "Kabir Mathur",
        email: "kabir.mathur@example.com",
        password: "Kabir@321",
        role: "user",
        ecoPoints: 105,
        walletBalance: 70,
        phone: "+919807345621",
        isVerified: true,
        emailVerified: true,
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716],
          address: "Whitefield, Bengaluru",
          city: "Bengaluru",
          state: "Karnataka",
          zipCode: "560066",
        },
      },
      {
        name: "Meera Joshi",
        email: "meera.joshi@example.com",
        password: "Meera@2025",
        role: "user",
        ecoPoints: 45,
        walletBalance: 20,
        phone: "+919898112233",
        isVerified: true,
        emailVerified: true,
        location: {
          type: "Point",
          coordinates: [72.5714, 23.0225],
          address: "Navrangpura, Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
          zipCode: "380009",
        },
      },
      {
        name: "Saanvi Khurana",
        email: "saanvi.khurana@example.com",
        password: "Saanvi@2025",
        role: "green_champion",
        ecoPoints: 4100,
        walletBalance: 1500,
        phone: "+919931245876",
        isVerified: true,
        emailVerified: true,
        badges: [
          { name: "City Green Hero", icon: "🏆" },
          { name: "Plastic Eliminator", icon: "🚯" },
        ],
      },

      // Workers (different specializations)
      {
        name: "Ramesh Gupta",
        email: "plastic.worker@example.com",
        password: "Worker@Plastic",
        role: "worker",
        workerId: "WRK301",
        assignedArea: "North Delhi",
        collectionsCount: 520,
        phone: "+919881122334",
        isVerified: true,
      },
      {
        name: "Ayesha Khan",
        email: "organic.worker@example.com",
        password: "Worker@Organic",
        role: "worker",
        workerId: "WRK302",
        assignedArea: "South Mumbai",
        collectionsCount: 410,
        phone: "+919877112200",
        isVerified: true,
      },
      {
        name: "Vikram Patel",
        email: "ewaste.worker@example.com",
        password: "Worker@EWaste",
        role: "worker",
        workerId: "WRK303",
        assignedArea: "Ahmedabad",
        collectionsCount: 290,
        phone: "+919885623410",
        isVerified: true,
      },
      {
        name: "Harleen Singh",
        email: "hazard.worker@example.com",
        password: "Worker@Hazard",
        role: "worker",
        workerId: "WRK304",
        assignedArea: "Chandigarh",
        collectionsCount: 170,
        phone: "+919900112278",
        isVerified: true,
      },
      {
        name: "Carlos D’Souza",
        email: "construction.worker@example.com",
        password: "Worker@Construct",
        role: "worker",
        workerId: "WRK305",
        assignedArea: "Bengaluru",
        collectionsCount: 340,
        phone: "+919811665588",
        isVerified: true,
      },
    ]);

    const citizens = [citizen1, citizen2, citizen3];

    console.log("✅ Users & workers created.");

    // -----------------------------------------------------------------------
    // 3. FACILITIES
    // -----------------------------------------------------------------------
    console.log("🏭 Creating facilities...");

    const facilities = await Facility.create([
      {
        name: "Delhi Central Recycling Plant",
        type: "recycling-plant",
        location: {
          type: "Point",
          coordinates: [77.1025, 28.7041],
          address: "Industrial Area, North Delhi",
          city: "Delhi",
          state: "Delhi",
          zipCode: "110009",
        },
        capacity: 12000,
        currentLoad: 6500,
        totalProcessed: 50000,
        acceptedWasteTypes: ["plastic", "metal", "glass", "paper", "mixed"],
        operatingHours: {
          open: "08:00",
          close: "20:00",
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        contact: {
          phone: "+911124567890",
          email: "info@delhirecycle.in",
          manager: "Suresh Kumar",
        },
        status: "active",
        rating: 4.3,
      },
      {
        name: "Mumbai Organic Composting Unit",
        type: "composting-unit",
        location: {
          type: "Point",
          coordinates: [72.8777, 19.076],
          address: "Eco Park, Bandra",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400050",
        },
        capacity: 8000,
        currentLoad: 4200,
        acceptedWasteTypes: ["organic"],
        contact: {
          phone: "+912234980123",
          email: "compost@mumbaieco.org",
          manager: "Riya Desai",
        },
        status: "active",
        rating: 4.6,
      },
      {
        name: "Ahmedabad E-Waste Collection Center",
        type: "collection-center",
        location: {
          type: "Point",
          coordinates: [72.5714, 23.0225],
          address: "Science City Road",
          city: "Ahmedabad",
          state: "Gujarat",
          zipCode: "380060",
        },
        capacity: 3000,
        currentLoad: 1200,
        acceptedWasteTypes: ["e-waste"],
        contact: {
          phone: "+917923456789",
          email: "ewaste@ahmedabad.gov.in",
          manager: "Dhruv Shah",
        },
        status: "active",
        rating: 4.1,
      },
      {
        name: "Chandigarh Secure Hazardous Disposal Site",
        type: "disposal-site",
        location: {
          type: "Point",
          coordinates: [76.7794, 30.7333],
          address: "Sector 48 Industrial Zone",
          city: "Chandigarh",
          state: "Chandigarh",
          zipCode: "160047",
        },
        capacity: 5000,
        currentLoad: 4800,
        acceptedWasteTypes: ["hazardous", "mixed"],
        contact: {
          phone: "+911722233445",
          email: "hazard@chandigarh.gov.in",
          manager: "Navdeep Kaur",
        },
        status: "maintenance",
        rating: 3.9,
      },
    ]);

    console.log("✅ Facilities created.");

    // -----------------------------------------------------------------------
    // 4. TRAININGS (with modules, quizzes, assignments)
    // -----------------------------------------------------------------------
    console.log("🎓 Creating trainings...");

    const trainings = await Training.create([
      {
        title: "Household Waste Segregation 101",
        description:
          "Learn how to separate wet, dry and hazardous waste at home.",
        category: "waste-segregation",
        difficulty: "beginner",
        ecoPointsReward: 40,
        thumbnail:
          "https://images.unsplash.com/photo-1581574203019-7e37dedd3e8e?w=400&h=250&fit=crop&q=80",
        modules: [
          {
            title: "Why Segregation Matters",
            content:
              "Overview of environmental impact and municipal regulations.",
            duration: 10,
            videoUrl: "https://www.youtube.com/watch?v=MnaIW_02em8",
            quiz: [
              {
                question: "Which bin should organic kitchen waste go into?",
                options: ["Blue bin", "Green bin", "Yellow bin", "Red bin"],
                answer: "Green bin",
                explanation: "Green bins are commonly used for wet/organic.",
              },
            ],
            order: 1,
          },
          {
            title: "Common Segregation Mistakes",
            content: "Contamination examples and how to avoid them.",
            duration: 15,
            videoUrl: "https://www.youtube.com/watch?v=_v6ReZVYK2E",
            order: 2,
          },
        ],
        assignments: [
          {
            title: "Set Up 3-Bin System",
            description:
              "Upload photos of your wet, dry and hazardous waste bins.",
            resources: [],
          },
        ],
        createdBy: admin._id,
        tags: ["segregation", "household", "beginner"],
      },
      {
        title: "Plastic Recycling in India",
        description:
          "Follow the journey of plastic from dustbin to recycling plant.",
        category: "recycling",
        difficulty: "intermediate",
        ecoPointsReward: 70,
        modules: [
          {
            title: "Types of Plastics",
            content: "PET, HDPE, LDPE and more.",
            duration: 20,
            videoUrl: "https://www.youtube.com/watch?v=ZzJGXu3EELs",
            order: 1,
          },
          {
            title: "Inside a Recycling Facility",
            content: "Sorting, shredding and pelletizing.",
            duration: 25,
            videoUrl: "https://www.youtube.com/watch?v=I8q2lGZ1g4E",
            order: 2,
          },
        ],
        assignments: [],
        createdBy: admin._id,
        tags: ["plastic", "recycling"],
      },
      {
        title: "Safe Handling of E-Waste",
        description: "Learn how to safely handle and dispose electronic waste.",
        category: "safety",
        difficulty: "intermediate",
        ecoPointsReward: 60,
        modules: [
          {
            title: "Health Risks of E-Waste",
            content:
              "Toxic heavy metals and their impacts on health & environment.",
            duration: 18,
            videoUrl: "https://www.youtube.com/watch?v=8Zuj07sp_Zs",
            order: 1,
          },
        ],
        assignments: [
          {
            title: "List Your Old Devices",
            description:
              "Create a list of unused electronics at your home/office.",
            resources: [],
          },
        ],
        createdBy: admin._id,
        tags: ["e-waste", "safety"],
      },
      {
        title: "Community Composting Basics",
        description: "Turn organic waste into compost for community gardens.",
        category: "composting",
        difficulty: "beginner",
        ecoPointsReward: 50,
        modules: [
          {
            title: "What Can Be Composted?",
            content: "Kitchen scraps, garden waste and dos/don'ts.",
            duration: 16,
            videoUrl: "https://www.youtube.com/watch?v=bJE1tdP2YvM",
            order: 1,
          },
        ],
        assignments: [],
        createdBy: champion._id,
        tags: ["composting", "organic"],
      },
      {
        title: "Sustainable Operations for Cities",
        description:
          "High-level overview of policies and operations for smart waste cities.",
        category: "operations",
        difficulty: "advanced",
        ecoPointsReward: 100,
        modules: [
          {
            title: "Designing a Zero-Waste City",
            content: "Policy, operations and citizen engagement.",
            duration: 35,
            videoUrl: "https://www.youtube.com/watch?v=VgVQKCcfwnU",
            order: 1,
          },
        ],
        assignments: [],
        createdBy: superAdmin._id,
        tags: ["policy", "operations", "sustainability"],
      },
    ]);

    // Auto-enroll some citizens
    await trainings[0].enrollUser(citizen1._id);
    await trainings[0].enrollUser(citizen2._id);
    await trainings[1].enrollUser(champion._id);

    console.log("✅ Trainings created & enrollments added.");

    // -----------------------------------------------------------------------
    // 5. RESOURCES
    // -----------------------------------------------------------------------
    console.log("📚 Creating learning resources...");

    await Resource.create([
      {
        title: "Solid Waste Management Rules 2016 — India",
        description: "Official rules by the Ministry of Environment, GoI.",
        link: "https://moef.gov.in/wp-content/uploads/2017/06/SWM-Rules-2016.pdf",
        category: "government",
        type: "pdf",
        tags: "policy india solid-waste",
      },
      {
        title: "UNEP: Beat Plastic Pollution",
        description: "Global report on plastic waste and solutions.",
        link: "https://www.unep.org/resources/beat-plastic-pollution",
        category: "environment",
        type: "website",
        tags: "plastic pollution global",
      },
      {
        title: "Swachh Bharat Mission – Waste Segregation",
        description: "Guidelines for door-to-door segregation.",
        link: "https://swachhbharatmission.gov.in",
        category: "waste-management",
        type: "website",
        tags: "segregation india recycling",
      },
      {
        title: "Home Composting Guide",
        description: "Step-by-step composting instructions.",
        link: "https://www.epa.gov/recycle/composting-home",
        category: "education",
        type: "article",
        tags: "composting organic sustainability",
      },
      {
        title: "E-Waste Collection Centers (India)",
        description:
          "List of authorized e-waste collection centers and guidelines.",
        link: "https://greene.gov.in/",
        category: "waste-management",
        type: "website",
        tags: "ewaste disposal india",
      },
    ]);

    console.log("✅ Resources created.");

    // -----------------------------------------------------------------------
    // 6. EVENTS (5)
    // -----------------------------------------------------------------------
    console.log("📅 Creating events...");

    await Event.create([
      {
        title: "Delhi River Cleanup Drive",
        description: "Volunteer-driven cleanup along Yamuna banks.",
        date: nowPlusDays(5),
        location: {
          address: "Yamuna Ghat, Kashmere Gate, Delhi",
          coordinates: [77.2406, 28.6673],
        },
        participants: [citizen1._id, citizen2._id, champion._id],
        maxParticipants: 200,
        bannerImage:
          "https://images.unsplash.com/photo-1528821154947-1aa3d1a20b9a?w=800&q=80",
        tags: ["cleanup", "river", "community"],
      },
      {
        title: "Mumbai Beach Plastic Collection",
        description: "Collect and segregate plastic from Juhu Beach.",
        date: nowPlusDays(9),
        location: {
          address: "Juhu Beach, Mumbai",
          coordinates: [72.8267, 19.0965],
        },
        participants: [citizen1._id, workerPlastic._id],
        maxParticipants: 150,
        bannerImage:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        tags: ["plastic", "beach"],
      },
      {
        title: "Bengaluru Zero Waste Workshop",
        description: "Learn how to run zero-waste events.",
        date: nowPlusDays(12),
        location: {
          address: "Cubbon Park, Bengaluru",
          coordinates: [77.5946, 12.9763],
        },
        participants: [citizen2._id, champion._id],
        maxParticipants: 80,
        bannerImage:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
        tags: ["workshop", "zero-waste"],
      },
      {
        title: "Chandigarh Green Marathon",
        description:
          "5K and 10K runs to promote sustainable lifestyles and waste reduction.",
        date: nowPlusDays(15),
        location: {
          address: "Sector 17 Plaza, Chandigarh",
          coordinates: [76.7794, 30.7333],
        },
        participants: [citizen3._id, champion._id],
        maxParticipants: 300,
        bannerImage:
          "https://images.unsplash.com/photo-1546484959-f9a9ae384058?w=800&q=80",
        tags: ["run", "community"],
      },
      {
        title: "Ahmedabad E-Waste Collection Camp",
        description:
          "Drop your old electronics at designated collection points.",
        date: nowPlusDays(18),
        location: {
          address: "Science City, Ahmedabad",
          coordinates: [72.5047, 23.0903],
        },
        participants: [citizen3._id, workerEWaste._id],
        maxParticipants: 100,
        bannerImage:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        tags: ["e-waste", "collection"],
      },
    ]);

    console.log("✅ Events created.");

    // -----------------------------------------------------------------------
    // 7. WASTE REPORTS (10) WITH CLOUDINARY IMAGES
    // -----------------------------------------------------------------------
    console.log("🗑️ Creating waste reports...");

    const cloudinarySamples = [
      "https://res.cloudinary.com/demo/image/upload/v1732550001/waste-sample-1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1732550002/waste-sample-2.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1732550003/waste-sample-3.jpg",
    ];

    const wasteReports = await WasteReport.create(
      Array.from({ length: 10 }).map((_, idx) => {
        const reporter = citizens[Math.floor(Math.random() * citizens.length)];
        const worker = [
          workerPlastic,
          workerOrganic,
          workerEWaste,
          workerHazard,
        ][Math.floor(Math.random() * 4)];

        const wasteTypes = [
          "plastic",
          "organic",
          "e-waste",
          "glass",
          "paper",
          "mixed",
        ];
        const quantities = ["small", "medium", "large"];
        const statuses = [
          "pending",
          "assigned",
          "in-progress",
          "collected",
          "processed",
        ];
        const priorities = ["low", "medium", "high", "critical"];

        return {
          reporterId: reporter._id,
          location: {
            type: "Point",
            coordinates: [
              77.2 + Math.random() * 0.1,
              28.6 + Math.random() * 0.1,
            ],
            address: "Near Community Park, Delhi",
            city: "Delhi",
            state: "Delhi",
          },
          wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
          quantity: quantities[Math.floor(Math.random() * quantities.length)],
          description: `Sample waste report #${idx + 1}`,
          images: [
            cloudinarySamples[
              Math.floor(Math.random() * cloudinarySamples.length)
            ],
          ],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          assignedTo: worker._id,
          ecoPointsAwarded: Math.floor(Math.random() * 20),
          processedAtFacility:
            facilities[Math.floor(Math.random() * facilities.length)]._id,
        };
      })
    );

    console.log("✅ Waste reports created.");

    // -----------------------------------------------------------------------
    // 8. TRANSACTIONS (10)
    // -----------------------------------------------------------------------
    console.log("💳 Creating transactions...");

    await Transaction.create([
      {
        userId: citizen1._id,
        type: "eco-points-earned",
        amount: 0,
        ecoPoints: 15,
        description: "Points for verified waste report",
        category: "eco",
        relatedReport: wasteReports[0]._id,
        paymentMethod: "none",
        status: "completed",
      },
      {
        userId: citizen2._id,
        type: "eco-points-earned",
        amount: 0,
        ecoPoints: 25,
        description: "Points for attending event",
        category: "eco",
        paymentMethod: "none",
        status: "completed",
      },
      {
        userId: citizen3._id,
        type: "reward-claimed",
        amount: 0,
        ecoPoints: 100,
        description: "Redeemed eco-points for voucher",
        category: "reward",
        paymentMethod: "none",
        status: "completed",
      },
      {
        userId: citizen1._id,
        type: "wallet-topup",
        amount: 200,
        ecoPoints: 0,
        description: "Wallet top-up via Razorpay",
        category: "payment",
        paymentMethod: "razorpay",
        paymentId: "pay_DEMO123",
        orderId: "order_DEMO123",
        status: "completed",
      },
      {
        userId: citizen2._id,
        type: "payment-received",
        amount: 150,
        description: "Cashback for eco-friendly purchase",
        category: "payment",
        paymentMethod: "wallet",
        status: "completed",
      },
      // 5 more simple eco transactions
      ...Array.from({ length: 5 }).map(() => ({
        userId: citizens[Math.floor(Math.random() * citizens.length)]._id,
        type: "eco-points-earned",
        amount: 0,
        ecoPoints: Math.floor(Math.random() * 40) + 5,
        description: "Auto eco-points credit",
        category: "eco",
        paymentMethod: "none",
        status: "completed",
      })),
    ]);

    console.log("✅ Transactions created.");

    // -----------------------------------------------------------------------
    // 9. NOTIFICATIONS (10)
    // -----------------------------------------------------------------------
    console.log("🔔 Creating notifications...");

    await Notification.create([
      {
        userId: citizen1._id,
        title: "Waste Report Received",
        message: "Your waste report has been logged and is pending review.",
        type: "report-update",
        priority: "normal",
        channel: "in-app",
        metadata: { reportId: wasteReports[0]._id },
      },
      {
        userId: citizen1._id,
        title: "Worker Assigned",
        message: "A worker has been assigned to your waste report.",
        type: "report-update",
        priority: "high",
        channel: "push",
        metadata: { reportId: wasteReports[0]._id },
      },
      {
        userId: citizen2._id,
        title: "Training Recommended",
        message:
          "Based on your activity, we recommend 'Household Waste Segregation 101'.",
        type: "assignment",
        priority: "normal",
        channel: "in-app",
        metadata: { trainingId: trainings[0]._id },
      },
      {
        userId: citizen3._id,
        title: "Eco-Points Earned",
        message: "You have earned 25 eco-points for your recent activity.",
        type: "achievement",
        priority: "normal",
        channel: "in-app",
      },
      {
        userId: champion._id,
        title: "New Event Created",
        message:
          "You have been auto-added as a co-host for the Delhi River Cleanup Drive.",
        type: "activity",
        priority: "normal",
        channel: "email",
      },
      {
        userId: citizen2._id,
        title: "Security Alert",
        message:
          "A new login to your EcoTrack account was detected from a new device.",
        type: "security",
        priority: "high",
        channel: "email",
      },
      {
        userId: citizen1._id,
        title: "Reward Available",
        message: "You can redeem your eco-points for a ₹100 eco-store voucher.",
        type: "reward",
        priority: "normal",
        channel: "in-app",
      },
      {
        userId: citizen3._id,
        title: "System Maintenance",
        message:
          "EcoTrack will be under scheduled maintenance tonight from 1–2 AM.",
        type: "system",
        priority: "low",
        channel: "in-app",
      },
      {
        userId: citizen2._id,
        title: "Payment Successful",
        message: "Your wallet top-up of ₹200 was successful.",
        type: "payment",
        priority: "normal",
        channel: "in-app",
      },
      {
        userId: citizen1._id,
        title: "Assignment Reminder",
        message:
          "Don't forget to complete your '3-Bin Setup' assignment in Segregation 101.",
        type: "assignment",
        priority: "normal",
        channel: "push",
      },
    ]);

    console.log("✅ Notifications created.");

    // -----------------------------------------------------------------------
    // 10. OTPS (DEMO)
    // -----------------------------------------------------------------------
    console.log("🔑 Creating demo OTPs...");

    const otpEmailPlain = "452190";
    const otpPhonePlain = "983321";

    await OTP.create([
      {
        email: citizen1.email,
        otp: otpEmailPlain,
        type: "email",
        purpose: "verification",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      {
        phone: champion.phone,
        otp: otpPhonePlain,
        type: "phone",
        purpose: "login",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    ]);

    console.log("✅ OTPs created (values will be hashed in DB).");

    // -----------------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------------
    console.log("\n📊 Seeding summary (approximate):");
    console.table({
      Users: await User.countDocuments(),
      Facilities: await Facility.countDocuments(),
      Trainings: await Training.countDocuments(),
      Resources: await Resource.countDocuments(),
      WasteReports: await WasteReport.countDocuments(),
      Transactions: await Transaction.countDocuments(),
      Events: await Event.countDocuments(),
      Notifications: await Notification.countDocuments(),
      OTPs: await OTP.countDocuments(),
    });

    console.log("\n🔐 Demo login credentials:");
    console.log("Admin         → admin@ecotrack.com / Admin@2025");
    console.log("Super Admin   → owner@ecotrack.com / Owner@2025");
    console.log("Citizen #1    → riya.malhotra@example.com / Riya@123");
    console.log("Citizen #2    → kabir.mathur@example.com / Kabir@321");
    console.log("Citizen #3    → meera.joshi@example.com / Meera@2025");
    console.log("Champion      → saanvi.khurana@example.com / Saanvi@2025");
    console.log("Worker Plastic→ plastic.worker@example.com / Worker@Plastic");
    console.log("Worker Organic→ organic.worker@example.com / Worker@Organic");
    console.log("Worker E-Waste→ ewaste.worker@example.com / Worker@EWaste");
    console.log("Worker Hazard → hazard.worker@example.com / Worker@Hazard");
    console.log(
      "Worker Constr→ construction.worker@example.com / Worker@Construct"
    );

    console.log(
      "\n🔑 Demo OTPs (before hashing, for testing only — not stored in clear text):"
    );
    console.log("Email OTP  (Riya)   →", otpEmailPlain);
    console.log("Phone OTP  (Saanvi) →", otpPhonePlain);

    await mongoose.connection.close();
    console.log("\n✅ Seeding finished. MongoDB connection closed. 👋");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder Error:", err);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
}

seed();
