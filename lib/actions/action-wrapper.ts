import { z } from "zod";
import { auth } from "@/auth";
import { aj } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { User, Session } from "@/lib/auth";

export interface ActionSuccess<T> {
  success: true;
  data: T;
  error?: never;
  fieldErrors?: never;
}

export interface ActionFailure {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
  data?: never;
}

export type ActionResponse<T> = ActionSuccess<T> | ActionFailure;

export interface SafeActionOptions {
  requireAuth?: boolean;
}

export function createSafeAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: (data: TInput, context: { user: User; session: Session }) => Promise<TOutput>,
  options: { requireAuth: true },
): (input: unknown) => Promise<ActionResponse<TOutput>>;

export function createSafeAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: (data: TInput, context: { user: User | null; session: Session | null }) => Promise<TOutput>,
  options?: { requireAuth?: false },
): (input: unknown) => Promise<ActionResponse<TOutput>>;

export function createSafeAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: (data: TInput, context: { user: any; session: any }) => Promise<TOutput>,
  options: SafeActionOptions = {},
) {
  return async (input: unknown): Promise<ActionResponse<TOutput>> => {
    try {
      // 1. Session & Authentication Check
      const sessionResult = await auth();
      const user = sessionResult?.user ?? null;
      const session = sessionResult?.session ?? null;

      if (options.requireAuth && (!user || !session)) {
        return {
          success: false,
          error: "Unauthorized: You must be logged in to perform this action.",
        };
      }

      // 2. Arcjet Security Defense
      if (process.env.ARCJET_KEY) {
        try {
          const req = await request();
          const decision = await aj.protect(req);

          if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
              return {
                success: false,
                error: "Rate limit exceeded. Please wait a few moments before trying again.",
              };
            }
            if (decision.reason.isBot()) {
              return {
                success: false,
                error: "Automated bot traffic detected. Access denied.",
              };
            }
            return {
              success: false,
              error: "Access denied by security shield.",
            };
          }
        } catch (arcjetError) {
          // Arcjet fails open non-blockingly if remote service times out or errors
          console.error("Arcjet security evaluation error:", arcjetError);
        }
      }

      // 3. Zod Input Validation
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
        const firstError =
          parsed.error.issues[0]?.message || "Invalid input data provided.";
        return {
          success: false,
          error: firstError,
          fieldErrors,
        };
      }

      // 4. Action Execution
      const result = await handler(parsed.data, {
        user: user as any,
        session: session as any,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Safe action execution error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while processing your request.",
      };
    }
  };
}
