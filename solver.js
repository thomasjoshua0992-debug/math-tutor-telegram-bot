const math = require('mathjs');

// ---------- helpers ----------

function fmt(n) {
  if (typeof n !== 'number') {
    try { n = Number(n); } catch (e) { return String(n); }
  }
  if (Number.isNaN(n)) return String(n);
  const rounded = Math.round(n * 1e6) / 1e6;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

// Parses one side of an equation ("3x^2 - 5x + 2") into {a, b, c}
// coefficients for x^2, x, and the constant term.
function parseTerms(sideStr) {
  const str = sideStr.replace(/\s+/g, '');
  const terms = str.match(/[+-]?[^+-]+/g) || [];
  let a = 0, b = 0, c = 0;

  for (const raw of terms) {
    const sign = raw[0] === '-' ? -1 : 1;
    const body = /^[+-]/.test(raw) ? raw.slice(1) : raw;

    if (/x\^2/.test(body)) {
      const coefStr = body.replace(/\*?x\^2/, '');
      const coef = coefStr === '' ? 1 : parseFloat(coefStr);
      a += sign * coef;
    } else if (/x/.test(body)) {
      const coefStr = body.replace(/\*?x/, '');
      const coef = coefStr === '' ? 1 : parseFloat(coefStr);
      b += sign * coef;
    } else if (body !== '') {
      c += sign * parseFloat(body);
    }
  }
  return { a, b, c };
}

// ---------- equation solving ----------

function solveEquation(text) {
  const [lhsRaw, rhsRaw] = text.split('=');
  const lhs = parseTerms(lhsRaw);
  const rhs = parseTerms(rhsRaw);

  const A = lhs.a - rhs.a;
  const B = lhs.b - rhs.b;
  const C = lhs.c - rhs.c;

  const steps = [];
  steps.push(`Move every term to one side: (${lhsRaw.trim()}) - (${rhsRaw.trim()}) = 0`);
  steps.push(`Collect like terms: ${fmt(A)}x^2 + ${fmt(B)}x + ${fmt(C)} = 0`);

  if (Math.abs(A) > 1e-12) {
    // Quadratic
    const D = B * B - 4 * A * C;
    steps.push(`This is quadratic, so use the quadratic formula: x = (-b ± sqrt(b^2 - 4ac)) / (2a)`);
    steps.push(`Here a = ${fmt(A)}, b = ${fmt(B)}, c = ${fmt(C)}`);
    steps.push(`Discriminant: b^2 - 4ac = ${fmt(B)}^2 - 4(${fmt(A)})(${fmt(C)}) = ${fmt(D)}`);

    if (D < 0) {
      const real = -B / (2 * A);
      const imag = Math.sqrt(-D) / (2 * A);
      steps.push(`The discriminant is negative, so the roots are complex.`);
      return {
        steps,
        answer: `x = ${fmt(real)} + ${fmt(imag)}i  or  x = ${fmt(real)} - ${fmt(imag)}i`
      };
    }
    const sqrtD = Math.sqrt(D);
    const x1 = (-B + sqrtD) / (2 * A);
    const x2 = (-B - sqrtD) / (2 * A);
    steps.push(`sqrt(${fmt(D)}) = ${fmt(sqrtD)}`);
    if (Math.abs(sqrtD) < 1e-12) {
      steps.push(`x = -b / (2a) = ${fmt(x1)}`);
      return { steps, answer: `x = ${fmt(x1)} (double root)` };
    }
    steps.push(`x = (${fmt(-B)} ± ${fmt(sqrtD)}) / ${fmt(2 * A)}`);
    return { steps, answer: `x = ${fmt(x1)}  or  x = ${fmt(x2)}` };
  }

  if (Math.abs(B) < 1e-12) {
    if (Math.abs(C) < 1e-12) {
      return { steps, answer: 'Every value of x works (both sides are always equal).' };
    }
    return { steps, answer: 'No solution (the equation reduces to a false statement).' };
  }

  // Linear
  steps.push(`Isolate x: ${fmt(B)}x = ${fmt(-C)}`);
  const x = -C / B;
  steps.push(`Divide both sides by ${fmt(B)}: x = ${fmt(-C)} / ${fmt(B)}`);
  return { steps, answer: `x = ${fmt(x)}` };
}

// ---------- derivatives ----------

function solveDerivative(exprStr) {
  const derivative = math.derivative(exprStr, 'x');
  const simplified = math.simplify(derivative).toString();
  const steps = [
    `Differentiate ${exprStr} with respect to x`,
    `Apply standard differentiation rules (power, sum, product/chain as needed)`,
    `Result before simplifying: ${derivative.toString()}`
  ];
  return { steps, answer: `d/dx = ${simplified}` };
}

// ---------- arithmetic, with real step-by-step trace ----------

function traceArithmetic(exprStr) {
  const node = math.parse(exprStr);
  const steps = [];

  function evalNode(n) {
    switch (n.type) {
      case 'ParenthesisNode':
        return evalNode(n.content);
      case 'ConstantNode':
        return n.value;
      case 'UnaryMinusNode':
      case 'UnaryPlusNode': {
        const val = evalNode(n.args[0]);
        return n.fn === 'unaryMinus' ? -val : val;
      }
      case 'OperatorNode': {
        if (n.args.length === 2) {
          const left = evalNode(n.args[0]);
          const right = evalNode(n.args[1]);
          const exprPiece = `${fmt(left)} ${n.op} ${fmt(right)}`;
          const result = math.evaluate(exprPiece);
          steps.push(`${exprPiece} = ${fmt(result)}`);
          return result;
        }
        const val = evalNode(n.args[0]);
        return n.fn === 'unaryMinus' ? -val : val;
      }
      case 'FunctionNode': {
        const args = n.args.map(evalNode);
        const result = math.evaluate(`${n.fn.name}(${args.map(fmt).join(',')})`);
        steps.push(`${n.fn.name}(${args.map(fmt).join(', ')}) = ${fmt(result)}`);
        return result;
      }
      default:
        return math.evaluate(n.toString());
    }
  }

  const result = evalNode(node);
  return { steps, answer: fmt(result) };
}

// ---------- entry point ----------

function solve(rawText) {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  if (/^(derivative( of)?:?|d\/dx)\s*/.test(lower)) {
    const exprStr = text.replace(/^(derivative( of)?:?|d\/dx)\s*/i, '').replace(/^\(|\)$/g, '');
    return { type: 'derivative', ...solveDerivative(exprStr) };
  }

  if (text.includes('=')) {
    return { type: 'equation', ...solveEquation(text) };
  }

  return { type: 'arithmetic', ...traceArithmetic(text) };
}

module.exports = { solve };
