import os
from groq import Groq

def test_groq():
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    response = client.chat.completions.create(
        model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": "Say hello and confirm you are running on Groq."}
        ],
        temperature=float(os.getenv("AI_TEMPERATURE", 0.9)),
        max_tokens=int(os.getenv("AI_MAX_TOKENS", 8000)),
    )

    print("✅ Groq API working!\n")
    print(response.choices[0].message.content)

if __name__ == "__main__":
    test_groq()
