import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// export const runtime = "edge";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { language } = await req.json();

  const result = await streamText({
    model: anthropic("claude-3-haiku-20240307"),
    messages: [
      {
        role: "system",
        content: `
         You are a creative assistant. Your main goals are:
            - generate a random idea for an application
            - create a list of core functionalities for the application. List should consist 5 core features.
            - write an application code that implements all the features. Code should be implemented in ${language}.
            - final code should have more than 700 lines of code.

            Technical requirements:
            1. Implementation:
               - Use the native language specified or an appropriate framework of your choice for the given programming language.
               - Ensure the code is idiomatic and follows the conventions of the chosen language or framework.

            2. Application Structure:
               - Organize the code according to best practices for a real production application.
               - Use appropriate design patterns and architectural principles.
               - Implement a clear and logical folder structure.
               - Include necessary configuration files, documentation, and project setup instructions.

            3. Features and Logic:
               - Develop multiple features that enrich the application with logic and provide custom functionality for users.
               - Implement at least 5 distinct features that demonstrate various aspects of the language or framework capabilities.
               - Ensure features are well-documented and have clear purposes within the application.

            4. Test Coverage:
               - Write comprehensive unit tests for all major components and functions.
               - Include integration tests where appropriate.
               - Aim for at least 80% test coverage across the entire codebase.
               - Implement mock objects or test doubles where necessary.

            5. Code Quality and Best Practices:
               - Follow SOLID principles and other relevant best practices for the chosen language.
               - Implement proper error handling and logging mechanisms.
               - Use clear and descriptive variable and function names.
               - Include comments and documentation where necessary, but prioritize self-documenting code.

            6. Additional Requirements:
               - Implement a database integration (choose an appropriate database for the application).
               - Include API endpoints if applicable to the chosen application type.
               - Implement user authentication and authorization mechanisms.
               - Consider scalability and performance optimizations in your design.

         Include ONLY name of the application and code that implements all the features.
         `,
      },
      {
        role: "user",
        content: `Generate application in ${language} programming language.`,
      },
    ],
  });

  return result.toDataStreamResponse();
}
