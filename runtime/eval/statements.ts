import { FunctionDeclaration, IfStmt, Program, VarDeclaration, WhileStmt } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment,
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();

  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_declaration(
	declaration: FunctionDeclaration,
	env: Environment
): RuntimeVal {
	// Create new function scope
	const fn = {
		type: "function",
		name: declaration.name,
		parameters: declaration.parameters,
		declarationEnv: env,
		body: declaration.body,
	} as FunctionValue;

	return env.declareVar(declaration.name, fn, true);
}


export function eval_if_statement(ifStmt: IfStmt, env: Environment): RuntimeVal {
  // 1) Evaluate condition
  const conditionVal = evaluate(ifStmt.condition, env);

  // 2) We only consider "truthy" if not null, not false, not zero, etc. 
  //    For simplicity, let's say only "false" and "null" are falsey.
  const isConditionTrue = (conditionVal.type !== "null" && 
                           conditionVal.type !== "boolean") 
                          || (conditionVal.type === "boolean" && (conditionVal as any).value === true);

  if (isConditionTrue) {
    // Evaluate all statements in thenBranch
    let lastVal: RuntimeVal = MK_NULL();
    for (const stmt of ifStmt.thenBranch) {
      lastVal = evaluate(stmt, env);
    }
    return lastVal;
  } else {
    // Evaluate elseBranch if present
    if (ifStmt.elseBranch) {
      let lastVal: RuntimeVal = MK_NULL();
      for (const stmt of ifStmt.elseBranch) {
        lastVal = evaluate(stmt, env);
      }
      return lastVal;
    }
    // If else was not present, just return null
    return MK_NULL();
  }
}

export function eval_while_statement(astNode: WhileStmt, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  while (isTruthy(evaluate(astNode.condition, env))) {
    // Evaluate each statement in the body
    for (const stmt of astNode.body) {
      lastEvaluated = evaluate(stmt, env);
    }
  }

  return lastEvaluated;
}

// Helper function to decide if a runtime value is "truthy"
function isTruthy(val: RuntimeVal): boolean {
  // Very simple logic: consider "null" or "false" as falsey; everything else truthy
  if (val.type === "null") return false;
  if (val.type === "boolean") {
    // e.g. for boolean: { type: "boolean", value: true/false }
    return (val as any).value === true;
  }
  // Optionally check "number" 0 as falsey, empty string as falsey, etc.
  return true;
}