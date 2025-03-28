exports.handler = async (event, context) => {
    
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }
  
    try {
    
      const body = JSON.parse(event.body);
      const userMessage = body.message;
  
      if (!userMessage) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Message is required" }),
        };
      }
  
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error("GROQ_API_KEY is not set");
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "API key not configured" }),
        };
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", 
          messages: [
            {
              role: "system",
              content:
                "You are an internationally acclaimed career mentor and advisor who specializes in helping students as well as even professionals secure their dream roles at top companies. Provide dynamic, personalized guidance that covers career paths, resume optimization, interview strategies, and skill development(mention the latest resources, and focus on documentation, papers and blogs). Additionally, empower students to confidently showcase their ambitions by bragging about their target job or company—highlighting why they are the perfect fit, how their unique strengths align with industry trends, and what sets them apart in a competitive market. Your advice should be clear, actionable, and inspiring. **IMPORTANT:** Format your response using markdown with proper headings, numbered points, and code blocks where appropriate."
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Groq API error:", errorData);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to get response from AI service" }),
        };
      }
  
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
  
      
      const cleanedResponse = aiResponse.replace(/###/g, '').replace(/\*\*/g, '');
    
      const formattedResponse = `${cleanedResponse.trim()}`;
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          response: formattedResponse,
        }),
      };
    } catch (error) {
      console.error("Error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      };
    }
  };