from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key='AIzaSyBDQfBKivNhofiw4_rqgQ46wMaf99XB6fM')
model = genai.GenerativeModel('gemini-1.5-pro')

# Career buddy context/prompt template
CAREER_BUDDY_CONTEXT = """
You are Career Buddy AI, an intelligent career advisor. Your role is to help users with:
- Career path suggestions based on their skills and interests
- Resume and portfolio reviews
- Interview preparation advice
- Skill development recommendations
- Job search strategies
- Industry insights and trends

Key traits:
- Professional but friendly tone
- Provide specific, actionable advice
- Focus on practical steps and solutions
- Base recommendations on current industry standards
- Encourage continuous learning and growth

When responding:
1. Keep answers concise but informative and answer in proper format structure ensuring bullet points where required
2. Include specific examples when relevant
3. Break down complex suggestions into steps
4. Provide industry-relevant context
5. Suggest additional resources when appropriate

Remember user profile details:
{user_profile}
"""

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_query = data.get('message')
        user_profile = data.get('userProfile', {})
        
        # Format the context with user profile
        context = CAREER_BUDDY_CONTEXT.format(user_profile=user_profile)
        
        # Combine context and user query
        prompt = f"{context}\n\nUser Query: {user_query}\n\nResponse:"
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        # Extract and format the response
        response_text = response.text
        
        return jsonify({
            'status': 'success',
            'response': response_text
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)