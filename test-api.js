// Test the generate-questions API
const SUPABASE_URL = 'https://vertjjkacwtfjliwckrf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcnRqamthY3d0ZmpsaXdja3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjI3NjEsImV4cCI6MjA4NzQzODc2MX0.I_50vXtkmZALKxYUpFEvR5kAWyWaTOCSvIko95m6HXw';

async function testAPI() {
    console.log('🧪 Testing generate-questions API...\n');
    console.log('Configuration:');
    console.log('- Subject: Mathematics');
    console.log('- Level: Secondary School');
    console.log('- Difficulty: Basic\n');

    const startTime = Date.now();

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-questions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                qualification: 'Secondary School',
                difficulty: 'Basic',
                stream: 'Mathematics',
                examType: 'mcq'
            })
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const data = await response.json();
        
        console.log(`✅ API Response received (${duration}s)\n`);
        console.log('═══════════════════════════════════════');
        console.log('RESPONSE ANALYSIS:');
        console.log('═══════════════════════════════════════\n');

        if (data.error) {
            console.error('❌ Function Error:', data.error);
            return;
        }

        if (data.questions && Array.isArray(data.questions)) {
            console.log(`✅ Questions array found: ${data.questions.length} questions\n`);

            const q1 = data.questions[0];
            if (q1) {
                console.log('FIRST QUESTION ANALYSIS:');
                console.log('─────────────────────────');
                console.log(`ID: ${q1.id || 'MISSING'}`);
                console.log(`Type: ${q1.type || 'MISSING'}`);
                console.log(`Format: ${q1.format || 'MISSING'}`);
                console.log(`Has Scenario: ${q1.scenario ? '✅ YES' : '❌ NO'}`);
                console.log(`Has Question: ${q1.question ? '✅ YES' : '❌ NO'}`);
                console.log(`Has Options: ${q1.options ? '✅ YES' : '❌ NO'}`);
                
                if (q1.options) {
                    console.log(`Options Count: ${q1.options.length}`);
                    console.log(`Options:`);
                    q1.options.forEach((opt, i) => {
                        console.log(`  ${i + 1}. ${opt}`);
                    });
                } else {
                    console.log('⚠️ OPTIONS MISSING! This is why you see "Question format error"');
                }
                
                console.log(`Has Correct Answer: ${q1.correctAnswer ? '✅ YES' : '❌ NO'}`);
                console.log(`Time Limit: ${q1.timeLimit || 'MISSING'}`);
                console.log(`Max Points: ${q1.maxPoints || 'MISSING'}\n`);

                // Check if it's subject-specific
                const questionText = (q1.scenario || '') + ' ' + (q1.question || '');
                const hasMathKeywords = /math|number|calculate|equation|solve|algebra|geometry|arithmetic|fraction|decimal|percentage|area|volume|perimeter|digit|sum|product|quotient|remainder/i.test(questionText);
                
                console.log('Subject Check:');
                console.log('─────────────────────────');
                console.log(`Contains Math Keywords: ${hasMathKeywords ? '✅ YES' : '❌ NO'}`);
                if (!hasMathKeywords) {
                    console.log('⚠️ Question doesn\'t seem to be about Mathematics!');
                }
                console.log('');

                console.log('QUESTION PREVIEW:');
                console.log('─────────────────────────');
                if (q1.scenario) {
                    console.log('Scenario:', q1.scenario.substring(0, 200) + '...');
                }
                console.log('Question:', q1.question);
                console.log('');

                console.log('FULL FIRST QUESTION:');
                console.log('─────────────────────────');
                console.log(JSON.stringify(q1, null, 2));
            }
        } else {
            console.error('❌ NO QUESTIONS ARRAY FOUND!');
        }

        console.log('\n═══════════════════════════════════════');
        console.log('SUMMARY:');
        console.log('═══════════════════════════════════════');
        console.log(`Total Questions: ${data.questions?.length || 0}`);
        console.log(`Has Options: ${data.questions?.[0]?.options ? '✅ YES' : '❌ NO'}`);
        console.log(`Math-Specific: ${/math|number|calculate/i.test(JSON.stringify(data.questions?.[0])) ? '✅ YES' : '❌ NO'}`);

    } catch (err) {
        console.error('❌ EXCEPTION:', err.message);
        console.error(err.stack);
    }
}

testAPI();
