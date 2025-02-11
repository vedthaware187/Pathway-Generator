import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import pkg from 'pg';
import cors from 'cors';
import multer from 'multer';  // Correct import syntax for multer

const { Pool } = pkg;
const upload = multer(); // No need for 'require', just use 'import'
const app = express();
app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
  host: 'localhost',
  database: 'vedthaware',
  user: 'postgres',
  password: 'TeamVictory',
  port: 5432, // Default PostgreSQL port
});

const EXTERNAL_API_URL = 'AIzaSyBDQfBKivNhofiw4_rqgQ46wMaf99XB6fM'; // Replace with actual API endpoin

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
      const { name, email, password, skills } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        `INSERT INTO users (name, email, password, skills)
         VALUES ($1, $2, $3, $4)
         RETURNING id;`,
        [name, email, hashedPassword, skills || '']
      );
  
      const userId = result.rows[0].id;
      res.status(201).json({ message: 'User registered successfully', user_id: userId });
  
    } catch (err) {
      console.error('Error during signup:', err);  // Logs exact error
      res.status(500).json({ error: err.message }); // Sends actual error
    }
  });

// Function to fetch courses from external API
const fetchCoursesFromExternalAPI = async (topic) => {
    try {
      const response = await axios.get(`${EXTERNAL_API_URL}?topic=${encodeURIComponent(topic)}`);
      return response.data.courses || []; // Ensure it returns an array
    } catch (error) {
      console.error(`Error fetching courses for topic: ${topic}`, error.message);
      return []; // Return an empty array in case of error
    }
  };
  // Example: Save recommendations
app.post('/api/recommendations', async (req, res) => {
    try {
      const { user_id, recommendations } = req.body;
      await pool.query(
        'SELECT insert_recommendations($1, $2)',
        [user_id, recommendations]
      );
      res.json({ message: 'Recommendations saved successfully' });
    } catch (err) {
      console.error('Error saving recommendations:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post("/analyze", async (req, res) => {
    try {
      const { html } = req.body;
  
      if (!html) {
        return res.status(400).json({ error: "HTML content is required" });
      }
  
      const $ = cheerio.load(html);
  
      // Extract weak topics
      const weakTopics = [];
      $(".card-body ul li strong").each((_, el) => {
        const topic = $(el).text().trim();
        if (!topic.includes(":")) {
          weakTopics.push(topic);
        }
      });
  
      if (weakTopics.length === 0) {
        return res.json({
          message: "No weak topics identified. Keep up the great work!",
          accuracy: 100,
          pathways: {},
        });
      }
  
      // Fetch foundation, practical, and specialized courses
      const [foundationCourses, practicalCourses, ...specializedCoursesPromises] = await Promise.all([
        fetchCoursesFromExternalAPI("Data Science Fundamentals"),
        fetchCoursesFromExternalAPI("Data Science Projects"),
        ...weakTopics.map((topic) => fetchCoursesFromExternalAPI(topic)),
      ]);
  
      // Organize specialized courses under weak topics
      const specializedCourses = weakTopics.map((topic, index) => ({
        topic,
        courses: specializedCoursesPromises[index].map((course) => ({
          level: course.level || "Intermediate",
          title: course.title || `Specialized ${topic} Course`,
          duration: course.duration || "6 weeks",
          platform: course.platform || "edX",
          link: course.link || `https://www.edx.org/learn/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, "-"))}`,
        })),
      }));
  
      // Personalize foundation and practical pathways based on weak topics
      const relevantFoundationCourses = foundationCourses.filter((course) =>
        weakTopics.some((topic) => course.title.toLowerCase().includes(topic.toLowerCase()))
      );
  
      const relevantPracticalCourses = practicalCourses.filter((course) =>
        weakTopics.some((topic) => course.title.toLowerCase().includes(topic.toLowerCase()))
      );
  
      // Extract accuracy score
      const accuracyText = $('li:contains("Overall Performance")').text().split(":")[1];
      const accuracy = parseFloat(accuracyText) || 83.33;
  
      res.json({
        accuracy,
        weakTopics,
        pathways: {
          foundation: {
            title: "Foundation Path",
            description: "Core concepts and fundamentals",
            courses: relevantFoundationCourses.length > 0 ? relevantFoundationCourses : foundationCourses.slice(0, 3),
          },
          specialization: {
            title: "Specialization Path",
            description: "Focus on your weak areas",
            courses: specializedCourses,
          },
          practical: {
            title: "Practical Application",
            description: "Hands-on projects and real-world applications",
            courses: relevantPracticalCourses.length > 0 ? relevantPracticalCourses : practicalCourses.slice(0, 3),
          },
        },
      });
    } catch (error) {
      console.error("Error processing request:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const result = await pool.query('SELECT * FROM users WHERE email = $1;', [email]);
  
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      res.status(200).json({ message: 'Login successful', user_id: user.id, name: user.name, email: user.email });
  
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: err.message });
    }
  });

// Update your profile endpoint
app.post('/api/profile', upload.single('resume'), async (req, res) => {
    try {
      // Parse form data
      const personalInfo = JSON.parse(req.body.personalInfo);
      const education = JSON.parse(req.body.education);
      const skills = JSON.parse(req.body.skills);
      
      // Get resume file buffer
      const resume = req.file ? req.file.buffer : null;
  
      // Validate required fields
      if (!personalInfo || !education || !skills) {
        return res.status(400).json({ error: 'Missing profile data' });
      }
  
      // Insert into PostgreSQL
      const result = await pool.query(
        `INSERT INTO student_profile 
         (personal_info, education, skills, resume)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [personalInfo, education, skills, resume]
      );
  
      res.status(201).json({
        message: 'Profile saved successfully',
        profile_id: result.rows[0].id
      });
  
    } catch (err) {
      console.error('Profile save error:', err);
      res.status(500).json({ error: 'Server error while saving profile' });
    }
  });

// Fetch skills for a specific student
app.get("/api/skills/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
      const result = await pool.query(
        "SELECT skills FROM student_profile WHERE id = $1",
        [studentId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(result.rows[0].skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
const PORT = 5000; // Hardcoded port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});