import io
import json
import logging
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2 # type: ignore
from openai import OpenAI
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(
    api_key="your API KEY  for llm")

# Initialize a sentence embedding model (for fast, local embeddings)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise Exception("Failed to extract text from PDF")

def split_text_into_chunks(text, chunk_size=500, overlap=50):
    """
    Splits the given text into overlapping chunks based on word tokens.
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        chunk = " ".join(words[start:start+chunk_size])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

def compute_embeddings(chunks, embedder):
    """
    Computes embeddings for all chunks using the provided embedder.
    Returns a numpy array of embeddings.
    """
    embeddings = embedder.encode(chunks)
    return np.array(embeddings, dtype=np.float32)

def retrieve_relevant_chunks(query, chunks, embeddings, embedder, k=5):
    """
    Given a query, computes its embedding and then calculates cosine similarity
    with each chunk embedding to retrieve the top k most relevant chunks.
    """
    query_embedding = embedder.encode([query])
    similarities = cosine_similarity(np.array(query_embedding, dtype=np.float32), embeddings)[0]
    top_indices = similarities.argsort()[-k:][::-1]
    retrieved = [chunks[i] for i in top_indices if i < len(chunks)]
    return retrieved

def generate_json_from_resume(resume_text, context):
    """
    Constructs a prompt that combines the retrieved resume context with instructions 
    to output only valid JSON matching a specific template. It then calls OpenAI's
    chat completion API to generate the auto‑fill JSON.
    """
    prompt = f"""
You are an assistant that extracts resume details and outputs them in a strict JSON format.
Do not include any markdown formatting, triple backticks, or extra commentary.
Use the exact JSON template below. If a field is not found in the resume, leave it as an empty string.

JSON Template:
{{
    "personal_information": {{
        "name": "",
        "email": "",
        "phone": "",
        "location": ""
    }},
    "education": {{
        "current_level": "",
        "institution": "",
        "field": "",
        "graduation_year": "",
        "cgpa": ""
    }},
    "technical_skills": [
        {{"name": "", "level": ""}}
    ],
    "soft_skills": [
        {{"name": "", "level": ""}}
    ],
    "languages": [
        {{"name": "", "proficiency": ""}}
    ]
}}

Below is context extracted from the resume:
{context}

Based on the above, fill in the JSON template with the most likely information from the resume.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that strictly outputs valid JSON matching the provided template."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=700
        )
    except Exception as e:
        logger.error("Error using OpenAI chat completions API", exc_info=True)
        raise Exception("OpenAI API error: " + str(e))
    
    # Get the content from the response
    text = response.choices[0].message.content.strip()
    
    if text.startswith("```json"):
        text = text[7:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        data = json.loads(text)
        return data
    except Exception as e:
        logger.error(f"Error parsing JSON from OpenAI response: {str(e)}")
        raise Exception("Failed to parse JSON from OpenAI response")

@app.route('/api/auto-fill-resume', methods=['POST'])
def auto_fill_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({
                'error': 'No resume file provided',
                'details': 'Please upload a PDF file'
            }), 400
        
        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'details': 'Please select a file to upload'
            }), 400
        
        if not resume_file.filename.lower().endswith('.pdf'):
            return jsonify({
                'error': 'Invalid file format',
                'details': 'Please upload a PDF file'
            }), 400
        
        resume_text = extract_text_from_pdf(resume_file)
        if not resume_text:
            return jsonify({
                'error': 'Empty PDF',
                'details': 'Could not extract text from the PDF'
            }), 400
        
        chunks = split_text_into_chunks(resume_text, chunk_size=500, overlap=50)
        embeddings = compute_embeddings(chunks, embedder)
        
        query = "Extract resume details for auto-fill"
        relevant_chunks = retrieve_relevant_chunks(query, chunks, embeddings, embedder, k=5)
        context = "\n\n".join(relevant_chunks)
        
        parsed_data = generate_json_from_resume(resume_text, context)
        
        return jsonify({
            'success': True,
            'data': parsed_data
        })
    
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        return jsonify({
            'error': 'Processing failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True,port=5002)