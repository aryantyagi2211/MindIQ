# How to Run the MindIQ CrewAI Service

This service uses CrewAI to generate 15 specialized questions and score them across 5 cognitive dimensions.

## Prerequisites

1. **Python 3.10+** installed.
2. **Groq API Key**: Get one from [Groq Console](https://console.groq.com/keys).

## Setup Instructions

1.  **Create a Virtual Environment**:
    ```bash
    cd crewai_service
    python -m venv venv
    ```
2.  **Activate the Environment**:
    - **Windows**: `venv\Scripts\activate`
    - **Mac/Linux**: `source venv/bin/activate`
3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure API Keys**:
    - Copy `.env.example` to `.env`.
    - Edit `.env` and add your `GROQ_API_KEY`.
5.  **Run the Service**:
    ```bash
    python main.py
    ```

The service will start on `http://localhost:8000`.

## Integration

The frontend is already configured to call this service. When you start an assessment, the `generate-questions` Supabase function will now route requests to your local CrewAI service.
