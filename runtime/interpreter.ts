import { MK_STRING, NumberVal, RuntimeVal } from "./values.ts";
import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  IfStmt,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  StringLiteral,
  VarDeclaration,
  WhileStmt,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_function_declaration, eval_if_statement, eval_program, eval_var_declaration, eval_while_statement } from "./eval/statements.ts";
import {
  eval_assignment,
  eval_binary_expr,
  eval_call_expr,
  eval_identifier,
  eval_object_expr,
} from "./eval/expressions.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value),
        type: "number",
      } as NumberVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "MemberExpr":
    case "Property":
    case "StringLiteral":{
      const strNode = astNode as StringLiteral;
      return MK_STRING(strNode.value);
    }
    case "CallExpr":
        return eval_call_expr(astNode as CallExpr, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
    // Handle unimplimented ast types as error.
    case "IfStmt":{
      const ifNode = astNode as IfStmt;
      return eval_if_statement(ifNode, env);
    }
    case "WhileStmt": {
      return eval_while_statement(astNode as WhileStmt, env);
    }
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode,
      );
      Deno.exit(0);
  }
}

