import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import psycopg2
from linkedinscrap import TimesJobsScraper
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import tempfile
import os
import PyPDF2
from psycopg2.extras import Json

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    "dbname": "vedthaware",
    "user": "postgres",
    "password": "TeamVictory",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    """Establish a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

def get_profile_from_db(profile_id):
    """Fetch profile data including resume binary from the database."""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor()
        query = """
        SELECT personal_info, education, skills, resume 
        FROM student_profile 
        WHERE id = %s
        """
        cursor.execute(query, (profile_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return None

        profile_str, education_str, skills_str, resume_binary = row

        # Parse JSON fields
        profile_data = json.loads(profile_str) if isinstance(profile_str, str) else profile_str
        education_data = json.loads(education_str) if isinstance(education_str, str) else education_str
        skills_data = json.loads(skills_str) if isinstance(skills_str, str) else skills_str

        # Map profile data
        firstName = profile_data.get("firstName", "")
        lastName = profile_data.get("lastName", "")
        fullName = f"{firstName} {lastName}".strip()

        # Extract technical skills
        technical_skills = skills_data.get("technical", [])
        technical_skill_list = [item.get("skill", "") for item in technical_skills if item.get("skill")]
        skills = ", ".join(technical_skill_list)

        # Map education
        institution = education_data.get("institution", "")
        graduationYear = education_data.get("graduationYear", "")
        education_mapped = f"{institution} ({graduationYear})" if institution and graduationYear else institution

        return {
            "fullName": fullName,
            "email": profile_data.get("email", ""),
            "phone": profile_data.get("phone", ""),
            "skills": skills,
            "experience": profile_data.get("experience", "N/A"),
            "education": education_mapped,
            "interests": profile_data.get("bio", "N/A"),
            "resume_binary": resume_binary
        }
    except Exception as e:
        print(f"Error fetching profile from database: {e}")
        return None

def extract_resume_text(resume_binary):
    """Extract text from PDF resume binary data."""
    if not resume_binary:
        return ""

    text = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(resume_binary)
            temp_file_path = temp_file.name

        with open(temp_file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"

        os.remove(temp_file_path)
    except Exception as e:
        print(f"Error extracting resume text: {e}")
        return ""

    return text.strip()

def calculate_match_percentage(job_text, profile_text, resume_text):
    """Calculate match percentage between job and candidate."""
    candidate_text = f"{profile_text} {resume_text}"

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        vectors = vectorizer.fit_transform([job_text, candidate_text])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return round(similarity * 100, 2)
    except Exception as e:
        print(f"Error calculating match percentage: {e}")
        return 0.0

def clean_and_deduplicate_jobs(df, keyword):
    """Clean and deduplicate job listings."""
    try:
        df['title'] = df['title'].str.lower()
        df['description'] = df['description'].str.lower()

        if keyword:
            keyword = keyword.lower()
            mask = df['title'].str.contains(keyword, na=False) | \
                   df['description'].str.contains(keyword, na=False)
            df = df[mask]

        df = df.drop_duplicates(subset=['title', 'company'], keep='first')
        df['title'] = df['title'].str.title()

        return df
    except Exception as e:
        print(f"Error cleaning and deduplicating jobs: {e}")
        return pd.DataFrame()

@app.route('/api/jobs/search', methods=['POST'])
def search_jobs():
    """Search for jobs and calculate match percentages."""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        keyword = data.get('keyword', '')
        location = data.get('location', '')
        profile_id = 9

        if not profile_id:
            return jsonify({'error': 'Profile ID is required'}), 400

        # Fetch profile data
        profile = get_profile_from_db(profile_id)
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404

        # Extract resume text
        resume_text = extract_resume_text(profile.get('resume_binary', b''))

        # Scrape jobs
        scraper = TimesJobsScraper()
        df = scraper.scrape_jobs(keyword, location)
        df = clean_and_deduplicate_jobs(df, keyword)

        if df.empty:
            return jsonify({'error': 'No jobs found'}), 404

        jobs = df.to_dict('records')

        # Prepare profile text for matching
        profile_text = f"""
        Skills: {profile['skills']}
        Experience: {profile['experience']}
        Education: {profile['education']}
        Interests: {profile['interests']}
        """.strip()

        # Calculate matches
        for job in jobs:
            job_text = f"""
            Title: {job.get('title', '')}
            Description: {job.get('description', '')}
            Skills Required: {job.get('skills_required', '')}
            Experience Required: {job.get('experience_required', '')}
            """.strip()

            job['match_percentage'] = calculate_match_percentage(
                job_text,
                profile_text,
                resume_text
            )

        # Sort by match percentage
        jobs.sort(key=lambda x: x['match_percentage'], reverse=True)

        return jsonify(jobs)
    except Exception as e:
        print(f"Error in search_jobs: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5004)