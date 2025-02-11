from flask import Flask, request, jsonify, abort
from flask_cors import CORS  # Add CORS support
from paddleocr import PaddleOCR
from PIL import Image
import pdf2image
import cv2
import numpy as np
import re
import io
import google.generativeai as genai
import json
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API (Ensure you replace with a valid API key)
genai.configure(api_key="YOUR_API_KEY_HERE")

# Initialize PaddleOCR with English and rotation detection
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# ... [rest of the existing Flask functions remain the same] ...

@app.route("/verify-certificate", methods=["POST"])
def verify_certificate():
    """Endpoint to verify uploaded certificate."""
    try:
        if "file" not in request.files:
            return jsonify({
                "status": "error",
                "message": "File not provided."
            }), 400
            
        file = request.files["file"]
        file_content = file.read()

        # Handle PDF conversion if needed
        if file.filename.lower().endswith('.pdf'):
            images = pdf2image.convert_from_bytes(file_content)
            if not images:
                return jsonify({
                    "status": "error",
                    "message": "No images found in PDF."
                }), 400
            image = images[0]  # Process the first page
        else:
            image = Image.open(io.BytesIO(file_content))

        # Convert image to bytes (PNG format)
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        image_bytes = img_byte_arr.getvalue()

        # OCR processing
        text = extract_text_from_image(image)
        if not text:
            return jsonify({
                "status": "error",
                "message": "No text extracted from the image."
            }), 400

        # Extract certificate details from the OCR text
        cert_details = extract_certificate_details(text)

        # Use Gemini 1.5 Pro to analyze the certificate using all extracted data
        authenticity_report = analyze_authenticity(image_bytes, text, cert_details)
        
        return jsonify({
            "status": "success",
            "extracted_text": text,
            "certificate_details": cert_details,
            "authenticity_report": authenticity_report
        })
        
    except Exception as e:
        logging.exception("Error in verify_certificate endpoint")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5006)