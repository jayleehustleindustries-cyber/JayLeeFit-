import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the MAO Methodology AI Engine - an expert fitness coach specializing in Macro Optimization (MAO).
You provide personalized recommendations based on the latest fitness science, focusing on macronutrient optimization, training strategies, and recovery protocols.
Your responses are practical, actionable, and based on individual circumstances. Keep responses concise but comprehensive.
Always emphasize that these are general recommendations and that working with a certified coach like Coach Jay provides personalized optimization.`;

    const message = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      response: responseText,
    });
  } catch (error) {
    console.error('AI Engine error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
