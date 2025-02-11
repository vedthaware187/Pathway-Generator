from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import re
import json
import logging
from werkzeug.utils import secure_filename
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Allow CORS for all origins (for development)
CORS(app)

# Configure Gemini API
try:
    genai.configure(api_key='AIzaSyCZV3PQOv5J3hl4SyVqHAl8KNjNmEyv6cY')  # Replace with your Gemini API key
    model = genai.GenerativeModel('gemini-1.5-pro')
except Exception as e:
    logger.error(f"Failed to configure Gemini API: {str(e)}")
    raise RuntimeError("Gemini API configuration failed") from e

def validate_file(file) -> None:
    """Validate uploaded file meets requirements"""
    if file.filename == '':
        raise ValueError("No selected file")
    if not file.filename.endswith('.html'):
        raise ValueError("Only .html files are allowed")
    if file.content_length > 1024 * 1024:  # 1MB limit
        raise ValueError("File too large (max 1MB)")

def parse_performance(content: str) -> float:
    """Extract performance score from report content"""
    match = re.search(r'Overall performance\s*:\s*([\d\.]+)%', content, re.IGNORECASE)
    if not match:
        logger.warning("No performance score found in report")
        return 0.0
    try:
        return float(match.group(1))
    except ValueError:
        logger.error(f"Invalid performance score format: {match.group(1)}")
        return 0.0

def generate_prompt(content: str, performance: float) -> str:
    """Generate the Gemini prompt template"""
    return f"""Analyze this student report and generate personalized course recommendations:

Report Content:
{content}

Performance Score: {performance}% 

Generate detailed course recommendations in this exact JSON format:
{{
  "recommended": [
    {{
      "topic": "Category Name",
      "courses": [
        {{
          "id": "unique-id",
          "title": "Course Title",
          "platform": "Platform Name",
          "level": "Difficulty Level",
          "duration": "Course Duration",
          "progress": 0,
          "xp": 100,
          "outcomes": ["Learning Outcome 1", "Outcome 2"],
          "prerequisites": ["Prerequisite 1", "Prerequisite 2"]
        }}
      ]
    }}
  ],
  "trending": [],
  "new": []
}}

Rules:
1. Focus on areas where the student needs improvement
2. Recommend real, available courses from known platforms (Coursera, edX, Udemy)
3. Include 2-3 topics with 2-3 courses each
4. Ensure valid JSON format without any markdown
5. Return ONLY the JSON object
"""

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and generate recommendations"""
    try:
        if 'reportfile' not in request.files:
            logger.error("No file part in request")
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['reportfile']
        try:
            validate_file(file)
        except ValueError as e:
            logger.error(f"File validation failed: {str(e)}")
            return jsonify({"error": str(e)}), 400

        # Secure filename and read content
        filename = secure_filename(file.filename)
        content = file.read().decode('utf-8')
        performance = parse_performance(content)
        
        # Generate recommendations
        prompt = generate_prompt(content, performance)
        logger.debug(f"Generated prompt: {prompt[:200]}...")  # Log partial prompt
        
        try:
            response = model.generate_content(prompt)
            json_str = response.text.strip()
            logger.debug(f"Raw Gemini response: {json_str[:200]}...")  # Log partial response
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return jsonify({"error": "Failed to generate recommendations"}), 500

        # Clean and parse JSON
        json_str = re.sub(r'^```json|```$', '', json_str, flags=re.IGNORECASE).strip()
        try:
            recommendations: Dict[str, Any] = json.loads(json_str)
            if not all(key in recommendations for key in ['recommended', 'trending', 'new']):
                raise ValueError("Invalid JSON structure")
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"JSON parsing failed: {str(e)}")
            logger.error(f"Problematic JSON: {json_str[:500]}")
            return jsonify({
                "error": "Invalid recommendations format",
                "details": str(e)
            }), 500

        return jsonify(recommendations)

    except Exception as e:
        logger.exception("Unexpected error in upload_file")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)  # Disable debug in production