import { BooleanVal, MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, NumberVal, RuntimeVal, StringVal } from "./values.ts";

// A utility function that returns the string representation 
// for ANY possible RuntimeVal.

function runtimeValToString(val: RuntimeVal): string {
  switch (val.type) {
    case "string":
      // We know that `val` is a StringVal here, so cast or destructure
      return (val as StringVal).value;
    case "number":
      return String((val as NumberVal).value);
    case "boolean":
      return String((val as BooleanVal).value);
    case "null":
      return "null";
    // Optionally handle "object", "native-fn", etc.
    default:
      return JSON.stringify(val);
  }
}


export function createGlobalEnv(){
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true),true)
  env.declareVar("false", MK_BOOL(false),true)
  env.declareVar("null", MK_NULL(),true)

  env.declareVar("print",MK_NATIVE_FN((args, scope)=>{ console.log(...args.map(runtimeValToString)); return MK_NULL();}),true)
  env.declareVar("chat",MK_NATIVE_FN((args, scope)=>{ console.log(...args.map(runtimeValToString)); return MK_NULL();}),true)

  function timeFunction(args:RuntimeVal[],env:Environment){
    return MK_NUMBER(Date.now());
  }
  env.declareVar("time",MK_NATIVE_FN(timeFunction),true);

  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV?true:false;
    // const global = !parentENV; 
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean,
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }

    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);

    // Cannot assign to constant
    if (env.constants.has(varname)) {
      throw `Cannot reasign to variable ${varname} as it was declared constant.`;
    }

    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }

    return this.parent.resolve(varname);
  }
}