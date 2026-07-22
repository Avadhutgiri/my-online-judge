// seed.js
// Idempotent seeding: event (id=1), admin/junior/senior users, solo teams, problems for both tracks.
// When run directly (node seed.js) it will close the DB connection at the end.
// When required() from server code, it will NOT close the connection.

const bcrypt = require('bcryptjs');

const {
  sequelize,
  User,
  Event,
  Problem,
  ProblemSample,
  Team
} = require('./models'); // <-- adjust path if necessary

// --- Event: create or update and set timing (now .. now+60min) ---
async function ensureEventWithTiming() {
  const now = new Date();
  const duration_minutes = 60;
  const end = new Date(now.getTime() + duration_minutes * 60000);

  const ev = await Event.findByPk(1);
  if (ev) {
    await ev.update({
      name: 'Reverse Coding',
      start_time: now,
      end_time: end,
      is_active: true
    });
    console.log('ℹ️ Event exists — updated start/end time & set active: Reverse Coding (id=1)');
    return ev;
  }

  const created = await Event.create({
    id: 1,
    name: 'Reverse Coding',
    start_time: now,
    end_time: end,
    is_active: true
  });
  console.log('✅ Event created & started: Reverse Coding (id=1)');
  return created;
}

// --- Users ---
async function createUserIfMissing(def) {
  // Admin uniqueness is global; participant uniqueness scoped by event_id + username
  const where = def.role === 'admin' ? { username: def.username } : { username: def.username, event_id: def.event_id };
  const exists = await User.findOne({ where });

  if (exists) {
    console.log(`ℹ️ User exists, skipping: ${def.username}`);
    return exists;
  }

  const hashed = await bcrypt.hash(def.password, 10);

  const payload = {
    username: def.username,
    email: def.email,
    password: hashed,
    role: def.role || 'user',
    is_junior: Boolean(def.is_junior),
    event_id: def.role === 'admin' ? null : def.event_id,
    team_id: null
  };

  const user = await User.create(payload);
  console.log(`✅ User created: ${def.username}`);
  return user;
}

// --- Solo team creation & linking for non-admins ---
async function ensureSoloTeamForUser(userInstance) {
  if (!userInstance) return null;
  if (userInstance.role === 'admin') return null; // admins don't get teams

  // If user already has a linked team, return it (and ensure it exists)
  if (userInstance.team_id) {
    const existing = await Team.findByPk(userInstance.team_id);
    if (existing) {
      console.log(`ℹ️ User ${userInstance.username} already linked to team ${existing.team_name} (id=${existing.id})`);
      return existing;
    }
  }

  // Unique-ish team name
  const teamName = `${userInstance.username}_solo_${userInstance.event_id}`;

  let team = await Team.findOne({ where: { team_name: teamName } });
  if (team) {
    // Link user if not already linked
    if (!userInstance.team_id) {
      await userInstance.update({ team_id: team.id });
    }
    console.log(`ℹ️ Linked ${userInstance.username} to existing team ${teamName}`);
    return team;
  }

  // Create new solo team
  team = await Team.create({
    team_name: teamName,
    user1_id: userInstance.id,
    user2_id: null,
    event_id: userInstance.event_id,
    is_junior: userInstance.is_junior,
    score: 0,
    correct_submission: 0,
    wrong_submission: 0
  });

  // Link user -> team
  await userInstance.update({ team_id: team.id });

  console.log(`✅ Solo team created & linked: ${teamName} (team_id=${team.id})`);
  return team;
}

// --- Problems (create per-track if count is zero) ---
async function ensureProblemForTrack(baseProblem, isJunior) {
  const count = await Problem.count({
    where: {
      title: baseProblem.title,
      event_id: baseProblem.event_id,
      is_junior: isJunior
    }
  });

  if (count > 0) {
    console.log(`ℹ️ Problem for ${isJunior ? 'junior' : 'senior'} track already exists (count=${count}), skipping`);
    return;
  }

  const problem = await Problem.create({
    title: baseProblem.title,
    description: baseProblem.description,
    score: baseProblem.score,
    input_format: baseProblem.input_format,
    output_format: baseProblem.output_format,
    constraints: baseProblem.constraints,
    event_id: baseProblem.event_id,
    is_junior: isJunior,
    time_limit: baseProblem.time_limit,
    memory_limit: baseProblem.memory_limit
  });

  if (Array.isArray(baseProblem.samples) && baseProblem.samples.length) {
    for (const s of baseProblem.samples) {
      await ProblemSample.create({
        problem_id: problem.id,
        input: s.input,
        output: s.output
      });
    }
  }

  console.log(`✅ Problem created for ${isJunior ? 'junior' : 'senior'} track (id=${problem.id})`);
}

// --- Main seeding function ---
async function seed() {
  try {
    await sequelize.authenticate();
    console.log('🔌 DB connection OK');

    // 1) Event (create/update + start now -> +60min)
    await ensureEventWithTiming();

    // 2) Users
    const userDefs = [
      { username: 'admin', password: 'admin', email: 'admin@gmail.com', role: 'admin', is_junior: false, event_id: null },
      { username: 'junior', password: 'junior', email: 'junior@gmail.com', role: 'user', is_junior: true, event_id: 1 },
      { username: 'senior', password: 'senior', email: 'senior@gmail.com', role: 'user', is_junior: false, event_id: 1 }
    ];

    for (const def of userDefs) {
      const user = await createUserIfMissing(def);
      if (user.role !== 'admin') {
        await ensureSoloTeamForUser(user);
      }
    }

    // 3) Problems (junior + senior if missing)
    const baseProblem = {
      title: "Cubic Calculator Riddle",
      description:
        "A peculiar calculator performs a special operation on numbers. Your task is to replicate its function and uncover the pattern behind its calculations.\n\n## Your Mission\nCreate a program that mimics the calculator's unique computation for each input number.",
      score: 100,
      input_format: "A single integer N (0 ≤ N ≤ 1000)",
      output_format: "A single integer representing the calculator's result (0 ≤ result ≤ 1,000,000)",
      constraints: "0 ≤ N ≤ 1000",
      event_id: 1,
      time_limit: 1,
      memory_limit: 128,
      samples: [
        { input: "3", output: "27" },
        { input: "5", output: "125" },
        { input: "0", output: "0" },
        { input: "10", output: "1000" },
        { input: "100", output: "1000000" }
      ]
    };

    await ensureProblemForTrack(baseProblem, true);  // junior
    await ensureProblemForTrack(baseProblem, false); // senior

    console.log('🎉 Seeding complete');
    return { success: true };
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  }
}

// Export so server can import and run without side-effects (won't close sequelize)
module.exports = seed;

// If run directly, execute and then close DB connection (standalone behavior)
if (require.main === module) {
  (async () => {
    try {
      await seed();
    } catch (e) {
      // log handled above
    } finally {
      try {
        if (sequelize && typeof sequelize.close === 'function') {
          await sequelize.close();
          console.log('🔌 DB connection closed (standalone seeder)');
        }
      } catch (closeErr) {
        // ignore
      }
      process.exit(0);
    }
  })();
}
