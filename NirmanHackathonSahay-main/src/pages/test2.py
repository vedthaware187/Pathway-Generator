from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2 import pool
import google.generativeai as genai
import json
import datetime
import re
import markdown
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from psycopg2.extras import Json
import io
import base64
import matplotlib.pyplot as plt
import seaborn as sns
import os

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = 'AIzaSyDS3fdQ9sMlTxQWe47WEdDt5OYt4fpprww'  # Move to environment variables
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.0-pro')

# PostgreSQL Database Configuration
DB_CONFIG = {
    "dbname": "vedthaware",
    "user": "postgres",
    "password": "TeamVictory",
    "host": "localhost",
    "port": "5432"
}

# Report storage configuration
REPORTS_DIR = 'reports'
os.makedirs(REPORTS_DIR, exist_ok=True)  # Create directory if not exists

# Using connection pool for better performance
db_pool = psycopg2.pool.SimpleConnectionPool(1, 20, **DB_CONFIG)

@dataclass
class AssessmentResult:
    student_id: int
    skill: str
    accuracy: float
    report: str
    questions: List[Dict]
    answers: Dict[str, str]

class DatabaseManager:
    def __init__(self, config: Dict[str, str]):
        self.config = config
        

    def get_connection(self):
        return db_pool.getconn()  # Get a connection from the pool

    def return_connection(self, conn):
        db_pool.putconn(conn)  # Return the connection to the pool

    def execute_query(self, query: str, params: tuple = None) -> Tuple[bool, Optional[any], Optional[str]]:
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                if query.strip().upper().startswith('SELECT'):
                    result = cursor.fetchall()
                    return True, result, None
                conn.commit()
                return True, None, None
        except Exception as e:
            return False, None, str(e)
        finally:
            if conn:
                self.return_connection(conn)

class AssessmentManager:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        
    def get_student_skills(self, student_id: int) -> Tuple[Optional[List[str]], Optional[List[str]], Optional[str]]:
        success, result, error = self.db.execute_query(
            "SELECT skills FROM student_profile WHERE id = %s",
            (student_id,)
        )
        
        if not success:
            return None, None, error
            
        if not result:
            return None, None, "Student not found"
            
        try:
            skills_data = result[0][0]
            technical_skills = [item['skill'] for item in skills_data.get('technical', [])]
            languages = [item['language'] for item in skills_data.get('languages', [])]
            return technical_skills, languages, None
        except Exception as e:
            return None, None, str(e)

    def save_assessment_result(self, result: AssessmentResult) -> Tuple[bool, Optional[str]]:
        success, _, error = self.db.execute_query(
            """
            INSERT INTO assessment_results 
            (student_id, skill, accuracy, report, questions, answers, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                result.student_id,
                result.skill,
                result.accuracy,
                result.report,
                Json(result.questions),
                Json(result.answers),
                datetime.datetime.now()
            )
        )
        return success, error

class QuestionGenerator:
    def __init__(self, model):
        self.model = model
        
    def create_quiz_prompt(self, skill: str) -> str:
        return f"""Generate exactly 12 multiple-choice questions to assess knowledge in: {skill}.
        For each question:
        1. Phrase it clearly and concisely
        2. Provide 4 plausible options (labeled A-D)
        3. Mark the correct answer
        4. Ensure questions progress from basic to advanced concepts
        5. Cover different aspects of the skill
        6. Avoid ambiguous wording
        
        Format response as JSON:
        {{
            "questions": [
                {{
                    "question": "Question text",
                    "options": ["A. Option1", "B. Option2", "C. Option3", "D. Option4"],
                    "correct_answer": "A"
                }},
                ...
            ]
        }}"""

    def validate_questions(self, data: Dict) -> bool:
        if not isinstance(data, dict) or 'questions' not in data:
            return False
        questions = data['questions']
        if not isinstance(questions, list) or len(questions) != 12:
            return False
        for q in questions:
            if not all(key in q for key in ['question', 'options', 'correct_answer']):
                return False
            if len(q['options']) != 4:
                return False
            if not any(q['correct_answer'] == opt[0] for opt in q['options']):
                return False
        return True

    def generate_questions(self, skill: str) -> Tuple[Optional[Dict], Optional[str]]:
        try:
            prompt = self.create_quiz_prompt(skill)
            response = self.model.generate_content(prompt)
            json_str = re.search(r'\{.*\}', response.text, re.DOTALL).group()
            questions = json.loads(json_str)
            
            if self.validate_questions(questions):
                return questions, None
            return None, "Generated questions failed validation"
            
        except Exception as e:
            return None, str(e)

class AssessmentAnalyzer:
    def __init__(self, model):
        self.model = model
        
    def analyze_results(self, questions: List[Dict], answers: Dict[str, str]) -> Tuple[Optional[str], Optional[float], Optional[str]]:
        try:
            results = []
            correct_count = 0
            total_questions = len(questions)
            
            # Calculate basic metrics
            for i, q in enumerate(questions):
                user_answer = answers.get(str(i))
                is_correct = user_answer == q['correct_answer']
                if is_correct:
                    correct_count += 1
                    
                results.append({
                    'question': q['question'],
                    'user_answer': user_answer,
                    'correct_answer': q['correct_answer'],
                    'is_correct': is_correct
                })
            
            accuracy = (correct_count / total_questions) * 100
            
            # Generate visualization 1: Correct/Incorrect Pie Chart
            plt.figure(figsize=(6, 6))
            sns.set_style("whitegrid")
            labels = ['Correct', 'Incorrect']
            sizes = [correct_count, total_questions - correct_count]
            colors = ['#4CAF50', '#F44336']
            plt.pie(sizes, labels=labels, colors=colors, 
                   autopct='%1.1f%%', startangle=90,
                   wedgeprops={'edgecolor': 'white', 'linewidth': 2})
            plt.title('Performance Overview', fontweight='bold', pad=20)
            plt.axis('equal')
            
            # Save pie chart to base64
            pie_buffer = io.BytesIO()
            plt.savefig(pie_buffer, format='png', bbox_inches='tight')
            pie_buffer.seek(0)
            pie_base64 = base64.b64encode(pie_buffer.read()).decode('utf-8')
            plt.close()

            # Generate visualization 2: Question-wise Performance
            plt.figure(figsize=(12, 6))
            sns.set_palette(['#4CAF50' if res['is_correct'] else '#F44336' for res in results])
            ax = sns.barplot(x=list(range(1, total_questions+1)), 
                           y=[1]*total_questions,
                           hue=[res['is_correct'] for res in results],
                           dodge=False)
            
            plt.title('Question-wise Performance', fontweight='bold', pad=15)
            plt.xlabel('Question Number', fontweight='bold')
            plt.ylabel('')
            ax.get_yaxis().set_visible(False)
            plt.legend([], [], frameon=False)
            plt.xticks(fontweight='bold')
            
            # Add value labels
            for i, res in enumerate(results):
                plt.text(i, 0.5, 
                        f"Q{i+1}\n({res['user_answer']}/{res['correct_answer']})", 
                        ha='center', va='center',
                        color='white', fontweight='bold')

            # Save bar chart to base64
            bar_buffer = io.BytesIO()
            plt.savefig(bar_buffer, format='png', bbox_inches='tight')
            bar_buffer.seek(0)
            bar_base64 = base64.b64encode(bar_buffer.read()).decode('utf-8')
            plt.close()

            # Generate text analysis using Gemini
            report_prompt = f"""Create a detailed assessment report with:
            1. Brief introduction of skill tested
            2. Key strengths demonstrated
            3. Main areas needing improvement
            4. Recommended learning path
            5. Resources for further study

            Base this on the following results:
            - Total questions: {total_questions}
            - Correct answers: {correct_count}
            - Accuracy: {accuracy:.2f}%
            - Incorrect questions: {[i+1 for i, res in enumerate(results) if not res['is_correct']]}
            """
            
            response = self.model.generate_content(report_prompt)
            analysis_html = markdown.markdown(response.text)

            # Construct final HTML report
            report_html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                      max-width: 1000px; margin: 20px auto; padding: 30px;
                      background: #f8f9fa; border-radius: 10px;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <h1 style="color: #2c3e50; border-bottom: 3px solid #3498db;
                         padding-bottom: 10px; margin-bottom: 30px;">
                    Skill Assessment Report
                </h1>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
                          margin-bottom: 40px;">
                    <div style="background: white; padding: 20px; border-radius: 8px;
                             text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h3 style="color: #3498db; margin-top: 0;">Accuracy Score</h3>
                        <div style="font-size: 2.5em; font-weight: bold; color: #2ecc71;">
                            {accuracy:.1f}%
                        </div>
                        <img src="data:image/png;base64,{pie_base64}" 
                           style="max-width: 250px; margin: 20px auto;">
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px;
                             box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h3 style="color: #3498db; margin-top: 0;">Performance Breakdown</h3>
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between;
                                     margin-bottom: 8px;">
                                <span>Total Questions:</span>
                                <strong>{total_questions}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;
                                     margin-bottom: 8px;">
                                <span>Correct Answers:</span>
                                <strong style="color: #2ecc71;">{correct_count}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Incorrect Answers:</span>
                                <strong style="color: #e74c3c;">{total_questions - correct_count}</strong>
                            </div>
                        </div>
                        <img src="data:image/png;base64,{bar_base64}" 
                           style="width: 100%; margin-top: 20px;">
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h2 style="color: #2c3e50; margin-top: 0;">Detailed Analysis</h2>
                    <div style="line-height: 1.6; color: #34495e;">
                        {analysis_html}
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center; color: #7f8c8d;
                          font-size: 0.9em;">
                    Report generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}
                </div>
            </div>
            """
            
            return report_html, accuracy, None
    
        except Exception as e:
            return None, None, str(e)


# Initialize services
db_manager = DatabaseManager(DB_CONFIG)
assessment_manager = AssessmentManager(db_manager)
question_generator = QuestionGenerator(model)
assessment_analyzer = AssessmentAnalyzer(model)

@app.route('/api/skills/<int:student_id>', methods=['GET'])
def get_student_skills(student_id: int):
    technical, languages, error = assessment_manager.get_student_skills(student_id)
    
    if error:
        return jsonify({'status': 'error', 'message': error}), 400
        
    if not technical and not languages:
        return jsonify({'status': 'error', 'message': 'No skills found for student'}), 404
        
    return jsonify({'status': 'success', 'technical': technical, 'languages': languages})

@app.route('/api/assess', methods=['POST'])
def handle_assessment():
    try:
        data = request.json
        student_id = data.get('student_id')
        action = data.get('action')
        
        if not student_id:
            return jsonify({'error': 'Missing student_id'}), 400
        
        if action == 'start':
            skill = data.get('skill')
            if not skill:
                return jsonify({'error': 'Missing skill'}), 400
                
            questions, error = question_generator.generate_questions(skill)
            if error:
                return jsonify({'error': error}), 500
                
            return jsonify({'status': 'success', 'questions': questions['questions']})
            
        elif action == 'submit':
            questions = data.get('questions')
            answers = data.get('answers')
            skill = data.get('skill')
            
            if not all([questions, answers, skill]):
                return jsonify({'error': 'Missing required data'}), 400
                
            report, accuracy, error = assessment_analyzer.analyze_results(questions, answers)
            
            if error:
                return jsonify({'error': error}), 500

            # Generate filename and save report
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            sanitized_skill = re.sub(r'\W+', '_', skill)
            filename = f"report.html"
            
            filepath = os.path.join(REPORTS_DIR, filename)
            
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(report)
            except Exception as e:
                return jsonify({'error': f"Failed to save report: {str(e)}"}), 500

            download_url = f'/download/{filename}'
                
            result = AssessmentResult(student_id=student_id, skill=skill, accuracy=accuracy, 
                                    report=report, questions=questions, answers=answers)
            success, error = assessment_manager.save_assessment_result(result)
            
            if not success:
                return jsonify({'error': error}), 500
                
            return jsonify({
                'status': 'success', 
                'report': report, 
                'accuracy': accuracy,
                'download_url': download_url
            })
            
        else:
            return jsonify({'error': 'Invalid action'}), 400
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_report(filename):
    return send_from_directory(REPORTS_DIR, filename, as_attachment=True)

@app.errorhandler(Exception)
def handle_error(error):
    response = {'status': 'error', 'message': str(error)}
    return jsonify(response), 500


if __name__ == '__main__':
    app.run(debug=True,port=5001)
