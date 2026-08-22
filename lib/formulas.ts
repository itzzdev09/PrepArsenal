export interface Formula {
  id: string;
  name: string;
  category: 'Arithmetic' | 'Geometry' | 'Algebra' | 'Reasoning' | 'Shortcuts';
  content: string;
  variables: Record<string, string>;
}

export const FORMULA_DB: Formula[] = [
  // ===== SHORTCUTS & TRICKS =====
  {
    id: 's1',
    name: 'Divisibility Rule for 3 & 9',
    category: 'Shortcuts',
    content: 'Sum of digits must be divisible by 3 or 9.',
    variables: {}
  },
  {
    id: 's2',
    name: 'Divisibility Rule for 11',
    category: 'Shortcuts',
    content: 'Sum(odd places) - Sum(even places) = 0 or multiple of 11.',
    variables: {}
  },
  {
    id: 's3',
    name: 'Squaring numbers ending in 5',
    category: 'Shortcuts',
    content: '(n5)² = [n × (n + 1)] || 25',
    variables: { n: 'The prefix number (e.g. for 35, n=3)' }
  },
  {
    id: 's4',
    name: 'Multiplication by 11',
    category: 'Shortcuts',
    content: '11 × (AB) = A || (A+B) || B',
    variables: { AB: '2-digit number (carry over if A+B > 9)' }
  },
  {
    id: 's5',
    name: 'Sum of first n natural numbers',
    category: 'Shortcuts',
    content: 'S = n(n + 1) / 2',
    variables: { n: 'Number of terms' }
  },
  {
    id: 's6',
    name: 'Sum of squares of first n natural numbers',
    category: 'Shortcuts',
    content: 'S = n(n + 1)(2n + 1) / 6',
    variables: { n: 'Number of terms' }
  },
  {
    id: 's7',
    name: 'Sum of cubes of first n natural numbers',
    category: 'Shortcuts',
    content: 'S = [n(n + 1) / 2]²',
    variables: { n: 'Number of terms' }
  },
  {
    id: 's8',
    name: 'Successive Percentage Change',
    category: 'Shortcuts',
    content: 'Net Change = a + b + (ab/100)',
    variables: { a: 'First % change', b: 'Second % change' }
  },
  {
    id: 's9',
    name: 'Divisibility Rule for 2',
    category: 'Shortcuts',
    content: 'The last digit is even: 0, 2, 4, 6, or 8.',
    variables: {}
  },
  {
    id: 's10',
    name: 'Divisibility Rule for 4',
    category: 'Shortcuts',
    content: 'The last two digits form a number divisible by 4.',
    variables: {}
  },
  {
    id: 's11',
    name: 'Divisibility Rule for 5',
    category: 'Shortcuts',
    content: 'The last digit is 0 or 5.',
    variables: {}
  },
  {
    id: 's12',
    name: 'Divisibility Rule for 6',
    category: 'Shortcuts',
    content: 'The number is divisible by both 2 and 3.',
    variables: {}
  },
  {
    id: 's13',
    name: 'Divisibility Rule for 7',
    category: 'Shortcuts',
    content: 'Double the last digit and subtract it from the remaining prefix; repeat if needed.',
    variables: {}
  },
  {
    id: 's14',
    name: 'Divisibility Rule for 8',
    category: 'Shortcuts',
    content: 'The last three digits form a number divisible by 8.',
    variables: {}
  },
  {
    id: 's15',
    name: 'Divisibility Rule for 10',
    category: 'Shortcuts',
    content: 'The last digit is 0.',
    variables: {}
  },
  {
    id: 's16',
    name: 'Multiply by 25',
    category: 'Shortcuts',
    content: 'n × 25 = (n × 100) / 4.',
    variables: { n: 'Any number' }
  },
  {
    id: 's17',
    name: 'Multiply by 125',
    category: 'Shortcuts',
    content: 'n × 125 = (n × 1000) / 8.',
    variables: { n: 'Any number' }
  },
  {
    id: 's18',
    name: 'Fraction to Percentage',
    category: 'Shortcuts',
    content: 'Multiply a fraction by 100 to convert it into a percentage.',
    variables: {}
  },
  {
    id: 's19',
    name: 'Arithmetic Progression Sum',
    category: 'Shortcuts',
    content: 'Sₙ = n/2 × [2a + (n − 1)d] = n(a + l)/2.',
    variables: { a: 'First term', d: 'Common difference', l: 'Last term' }
  },
  {
    id: 's20',
    name: 'Difference of Two Squares Shortcut',
    category: 'Shortcuts',
    content: 'a² − b² = (a − b)(a + b).',
    variables: {}
  },
  {
    id: 's21', name: 'Convert km/h to m/s', category: 'Shortcuts',
    content: 'Multiply km/h by 5/18.', variables: {}
  },
  {
    id: 's22', name: 'Convert m/s to km/h', category: 'Shortcuts',
    content: 'Multiply m/s by 18/5.', variables: {}
  },
  {
    id: 's23', name: 'Average with Equal Deviations', category: 'Shortcuts',
    content: 'If values are equally spaced around A, their average is A.', variables: {}
  },
  {
    id: 's24', name: 'Weighted Average', category: 'Shortcuts',
    content: 'Average = (w₁x₁ + w₂x₂ + …) / (w₁ + w₂ + …).', variables: {}
  },
  {
    id: 's25', name: 'Percentage Point Change', category: 'Shortcuts',
    content: 'Percentage change = (New − Old) / Old × 100.', variables: {}
  },
  {
    id: 's26', name: 'Price-Consumption Compensation', category: 'Shortcuts',
    content: 'For constant spending, consumption change % = −p/(100 + p) × 100 when price rises p%.', variables: {}
  },
  {
    id: 's27', name: 'Ratio after Percentage Changes', category: 'Shortcuts',
    content: 'Apply each percentage multiplier to its ratio term before simplifying.', variables: {}
  },
  {
    id: 's28', name: 'Direct Proportion', category: 'Shortcuts',
    content: 'If x ∝ y, then x₁/y₁ = x₂/y₂.', variables: {}
  },
  {
    id: 's29', name: 'Inverse Proportion', category: 'Shortcuts',
    content: 'If x ∝ 1/y, then x₁y₁ = x₂y₂.', variables: {}
  },
  {
    id: 's30', name: 'HCF-LCM Product Rule', category: 'Shortcuts',
    content: 'For two positive integers, HCF × LCM = Product of the integers.', variables: {}
  },
  {
    id: 's31', name: 'Remainder of a Power', category: 'Shortcuts',
    content: 'Find the repeating cycle of unit residues, then reduce the exponent modulo the cycle length.', variables: {}
  },
  {
    id: 's32', name: 'Unit Digit of a Product', category: 'Shortcuts',
    content: 'Only the unit digits of factors affect the unit digit of the product.', variables: {}
  },
  {
    id: 's33', name: 'Casting Out Nines', category: 'Shortcuts',
    content: 'A number and its digit sum have the same remainder modulo 9.', variables: {}
  },
  {
    id: 's34', name: 'Two-Digit Number Form', category: 'Shortcuts',
    content: 'A two-digit number with digits x,y is 10x + y.', variables: { x: 'Tens digit', y: 'Units digit' }
  },
  {
    id: 's35', name: 'Three-Digit Number Form', category: 'Shortcuts',
    content: 'A three-digit number with digits x,y,z is 100x + 10y + z.', variables: {}
  },
  {
    id: 's36', name: 'Time and Work Rate', category: 'Shortcuts',
    content: 'Work rate = 1/time; combined rate is the sum of individual rates.', variables: {}
  },
  {
    id: 's37', name: 'Work Efficiency Ratio', category: 'Shortcuts',
    content: 'Efficiency ratio is the inverse of time ratio for the same work.', variables: {}
  },
  {
    id: 's38', name: 'Pipes and Cisterns', category: 'Shortcuts',
    content: 'Inlet rates are positive and outlet rates are negative; add rates to get net filling rate.', variables: {}
  },
  {
    id: 's39', name: 'Relative Speed', category: 'Shortcuts',
    content: 'Same direction: difference of speeds. Opposite directions: sum of speeds.', variables: {}
  },
  {
    id: 's40', name: 'Train Passing a Pole', category: 'Shortcuts',
    content: 'Time = train length / speed.', variables: {}
  },
  {
    id: 's41', name: 'Train Passing a Platform', category: 'Shortcuts',
    content: 'Time = (train length + platform length) / speed.', variables: {}
  },
  {
    id: 's42', name: 'Boats and Streams', category: 'Shortcuts',
    content: 'Downstream speed = boat + stream; upstream speed = boat − stream.', variables: {}
  },
  {
    id: 's43', name: 'Alligation Rule', category: 'Shortcuts',
    content: 'Quantity of cheaper : dearer = (dearer − mean) : (mean − cheaper).', variables: {}
  },
  {
    id: 's44', name: 'Partnership Profit', category: 'Shortcuts',
    content: 'Profit share is proportional to capital × time.', variables: {}
  },
  {
    id: 's45', name: 'Simple Interest Ratio', category: 'Shortcuts',
    content: 'For fixed principal, SI is proportional to rate × time.', variables: {}
  },
  {
    id: 's46', name: 'Compound Interest for Two Years', category: 'Shortcuts',
    content: 'CI = P(2r/100 + r²/10,000) for annual rate r%.', variables: {}
  },
  {
    id: 's47', name: 'Permutation Shortcut', category: 'Shortcuts',
    content: 'nPᵣ = n!/(n−r)!; arrange when order matters.', variables: {}
  },
  {
    id: 's48', name: 'Combination Shortcut', category: 'Shortcuts',
    content: 'nCᵣ = n!/[r!(n−r)!]; choose when order does not matter.', variables: {}
  },
  {
    id: 's49', name: 'Complement Probability', category: 'Shortcuts',
    content: 'P(not A) = 1 − P(A); often easier for at-least-one questions.', variables: {}
  },
  {
    id: 's50', name: 'Clock Hands Relative Speed', category: 'Shortcuts',
    content: 'Minute hand gains on hour hand at 5.5° per minute.', variables: {}
  },
  {
    id: 's51', name: 'Mirror Clock Time', category: 'Shortcuts',
    content: 'For a 12-hour clock, mirror time = 11:60 − actual time.', variables: {}
  },
  {
    id: 's52', name: 'Odd Days in a Year', category: 'Shortcuts',
    content: 'Ordinary year has 1 odd day; leap year has 2 odd days.', variables: {}
  },
  {
    id: 's53', name: 'Leap Year Test', category: 'Shortcuts',
    content: 'Divisible by 4, except century years must also be divisible by 400.', variables: {}
  },
  {
    id: 's54', name: 'Approximation by First Order', category: 'Shortcuts',
    content: 'For small x, (1+x)ⁿ ≈ 1+nx.', variables: {}
  },
  {
    id: 's55', name: 'Square Near a Base', category: 'Shortcuts',
    content: '(B±d)² = B² ± 2Bd + d².', variables: { B: 'Convenient base', d: 'Deviation' }
  },
  {
    id: 's56', name: 'Multiply Numbers Near 100', category: 'Shortcuts',
    content: '(100−a)(100−b) = (100−a−b)|ab.', variables: { a: 'First deficit', b: 'Second deficit' }
  },
  {
    id: 's57', name: 'Multiply Numbers Near 50', category: 'Shortcuts',
    content: '(50+a)(50+b) = 2500 + 50(a+b) + ab.', variables: { a: 'First deviation', b: 'Second deviation' }
  },
  {
    id: 's58', name: 'Cancellation Before Multiplication', category: 'Shortcuts',
    content: 'Cancel common factors across numerator and denominator before multiplying.', variables: {}
  },

  // ===== ARITHMETIC =====
  {
    id: 'f1',
    name: 'Compound Interest',
    category: 'Arithmetic',
    content: 'A = P(1 + R/100)^T',
    variables: { A: 'Amount', P: 'Principal', R: 'Rate %', T: 'Time (yrs)' }
  },
  {
    id: 'f2',
    name: 'Simple Interest',
    category: 'Arithmetic',
    content: 'SI = (P × R × T) / 100',
    variables: { P: 'Principal', R: 'Rate (%)', T: 'Time (yrs)' }
  },
  {
    id: 'f3',
    name: 'Speed, Time, Distance',
    category: 'Arithmetic',
    content: 'D = S × T',
    variables: { D: 'Distance', S: 'Speed', T: 'Time' }
  },
  {
    id: 'f4',
    name: 'Average Speed (Equal Distances)',
    category: 'Arithmetic',
    content: 'Avg Speed = (2xy) / (x + y)',
    variables: { x: 'Speed 1', y: 'Speed 2' }
  },
  {
    id: 'f5',
    name: 'Work and Time',
    category: 'Arithmetic',
    content: 'Combined = (A × B) / (A + B)',
    variables: { A: 'Time by Person A', B: 'Time by Person B' }
  },
  {
    id: 'f6',
    name: 'Profit Percentage',
    category: 'Arithmetic',
    content: 'Profit % = (Profit / CP) × 100',
    variables: { CP: 'Cost Price' }
  },

  // ===== ALGEBRA =====
  {
    id: 'a1',
    name: 'Algebraic Identity (Square)',
    category: 'Algebra',
    content: '(a + b)² = a² + 2ab + b²',
    variables: {}
  },
  {
    id: 'a2',
    name: 'Algebraic Identity (Cube)',
    category: 'Algebra',
    content: 'a³ + b³ = (a + b)(a² - ab + b²)',
    variables: {}
  },
  {
    id: 'a3',
    name: 'Quadratic Formula',
    category: 'Algebra',
    content: 'x = (-b ± √(b² - 4ac)) / 2a',
    variables: { a: 'Coeff x²', b: 'Coeff x', c: 'Constant' }
  },
  {
    id: 'a4',
    name: 'Difference of Squares',
    category: 'Algebra',
    content: 'a² - b² = (a - b)(a + b)',
    variables: {}
  },
  {
    id: 'a5',
    name: 'Square of Trinomial',
    category: 'Algebra',
    content: '(a + b + c)² = a² + b² + c² + 2(ab + bc + ca)',
    variables: {}
  },

  // ===== GEOMETRY & MENSURATION =====
  {
    id: 'g1',
    name: 'Area of Circle',
    category: 'Geometry',
    content: 'A = πr²',
    variables: { A: 'Area', r: 'Radius' }
  },
  {
    id: 'g2',
    name: 'Pythagorean Theorem',
    category: 'Geometry',
    content: 'a² + b² = c²',
    variables: { a: 'Base', b: 'Height', c: 'Hypotenuse' }
  },
  {
    id: 'g3',
    name: 'Volume of Cylinder',
    category: 'Geometry',
    content: 'V = πr²h',
    variables: { V: 'Volume', r: 'Radius', h: 'Height' }
  },
  {
    id: 'g4',
    name: 'Curved Surface Area of Cone',
    category: 'Geometry',
    content: 'CSA = πrl',
    variables: { r: 'Radius', l: 'Slant Height' }
  },
  {
    id: 'g5',
    name: 'Volume of Sphere',
    category: 'Geometry',
    content: 'V = (4/3)πr³',
    variables: { r: 'Radius' }
  },
  {
    id: 'g6',
    name: 'Area of Equilateral Triangle',
    category: 'Geometry',
    content: 'A = (√3 / 4) × a²',
    variables: { a: 'Side Length' }
  },

  // ===== REASONING =====
  {
    id: 'r1',
    name: 'Probability of Event',
    category: 'Reasoning',
    content: 'P(E) = Fav Outcomes / Total Outcomes',
    variables: {}
  },
  {
    id: 'r2',
    name: 'Clock Angle Formula',
    category: 'Reasoning',
    content: 'Angle = |(30 × H) - (5.5 × M)|',
    variables: { H: 'Hour', M: 'Minutes' }
  },
  {
    id: 'r3',
    name: 'Number of Triangles in a Grid (n x n)',
    category: 'Reasoning',
    content: 'N = [n(n+2)(2n+1)] / 8',
    variables: { n: 'Number of rows/cols (if n is even)' }
  }
];
