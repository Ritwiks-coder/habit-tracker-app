export const generateTaskDescription = async (taskTitle, playfulMode) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Generate a very short 1-sentence description (max 8 words) for a habit tracker task called "${taskTitle}". 
          Mode: ${playfulMode 
            ? 'PLAYFUL - be funny and casual like Zomato/Swiggy notifications, use humor' 
            : 'PROFESSIONAL - be clean and motivating'}.
          Return ONLY the description text, nothing else, no quotes.`
        }]
      })
    });
    const data = await response.json();
    return data.content[0].text.trim();
  } catch (e) {
    return playfulMode ? "You know what to do 😏" : "Complete this task today.";
  }
};
