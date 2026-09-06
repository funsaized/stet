export type { AnnotationPlan } from './annotation-plan.js';
export interface Diagnostic { path: string; code: string; message: string; }
export interface ValidationResult { ok: boolean; errors: Diagnostic[]; warnings: Diagnostic[]; }
/** Build-time validation only. Does not resolve targets or attach annotations. */
export declare function validatePlan(plan: unknown): ValidationResult;
