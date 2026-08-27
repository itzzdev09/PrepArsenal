export type FormulaCategory =
  | 'Speed, Time & Motion'
  | 'Logical Reasoning'
  | 'Arithmetic'
  | 'Algebra & Numbers'
  | 'Geometry & Mensuration'
  | 'Modern Math & Stats'
  | 'Tricks & Shortcuts';

export interface Formula {
  id: string;
  name: string;
  category: FormulaCategory;
  subcategory: string;
  content: string;
  variables: Record<string, string>;
  tip?: string;
  example?: string;
}

export const FORMULA_DB: Formula[] = [
  // =========================================================================
  // 1. SPEED, TIME & MOTION (Boats & Streams, Trains, Races, Work & Pipes)
  // =========================================================================
  {
    id: 'stm-boat-1',
    name: 'Boats & Streams: Downstream & Upstream Speeds',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: 'v_downstream = u + v  |  v_upstream = u - v',
    variables: {
      u: 'Speed of boat in still water (km/h or m/s)',
      v: 'Speed of stream / water current (km/h or m/s)',
      v_downstream: 'Speed with stream direction',
      v_upstream: 'Speed against stream direction'
    },
    tip: 'Downstream is always faster because the current aids motion; upstream is slower as the current opposes.',
    example: 'Boat speed = 12 km/h, Stream speed = 3 km/h. Downstream = 15 km/h, Upstream = 9 km/h.'
  },
  {
    id: 'stm-boat-2',
    name: 'Boats & Streams: Still Water & Stream Speeds from Net Speeds',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: 'u = (v_downstream + v_upstream) / 2  |  v = (v_downstream - v_upstream) / 2',
    variables: {
      u: 'Speed of boat in still water',
      v: 'Speed of current / stream',
      v_downstream: 'Downstream speed',
      v_upstream: 'Upstream speed'
    },
    tip: 'Boat speed is the arithmetic mean of downstream & upstream speeds. Current speed is half their difference.',
    example: 'Downstream = 18 km/h, Upstream = 10 km/h. Boat in still water = (18+10)/2 = 14 km/h. Current = (18-10)/2 = 4 km/h.'
  },
  {
    id: 'stm-boat-3',
    name: 'Boats & Streams: Round-Trip Distance & Total Time',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: 'T = D / (u + v) + D / (u - v) = 2Du / (u² - v²)  ==>  D = T(u² - v²) / (2u)',
    variables: {
      D: 'One-way distance between two points',
      T: 'Total round-trip time (upstream + downstream)',
      u: 'Speed of boat in still water',
      v: 'Speed of stream'
    },
    tip: 'Directly saves solving quadratic equations in time-distance round-trip problems.',
    example: 'If boat speed = 9 km/h, stream = 3 km/h, round trip takes 3 hrs: D = 3 × (81 - 9) / (2 × 9) = 3 × 72 / 18 = 12 km.'
  },
  {
    id: 'stm-boat-4',
    name: 'Boats & Streams: Upstream vs Downstream Time Ratio',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: 'If Upstream Time = n × Downstream Time:  u / v = (n + 1) / (n - 1)',
    variables: {
      n: 'Ratio of upstream time to downstream time (t_up / t_down)',
      u: 'Speed of boat in still water',
      v: 'Speed of stream'
    },
    tip: 'Super high-yield shortcut for CAT, SSC CGL & Banking exams.',
    example: 'If a boat takes 3 times as long to row upstream as downstream: u/v = (3+1)/(3-1) = 4/2 = 2/1. Ratio is 2:1.'
  },
  {
    id: 'stm-boat-5',
    name: 'Boats & Streams: Floating Raft / Cork Drift Time',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: 'T_drift = (2 × t_down × t_up) / (t_up - t_down)',
    variables: {
      T_drift: 'Time for unpowered floating raft to cover distance D',
      t_down: 'Time taken by motorboat downstream',
      t_up: 'Time taken by motorboat upstream'
    },
    tip: 'A floating raft has no engine; it moves purely at stream speed v = D/T_drift.',
    example: 'If boat takes 2 hrs downstream and 6 hrs upstream: T_drift = (2 × 2 × 6) / (6 - 2) = 24 / 4 = 6 hours.'
  },
  {
    id: 'stm-train-1',
    name: 'Trains: Passing a Stationary Point / Pole / Man',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'Time = Length_train / Speed_train',
    variables: {
      Length_train: 'Length of the train (meters)',
      Speed_train: 'Speed of train (m/s) [Multiply km/h by 5/18]'
    },
    tip: 'Poles, standing persons, and milestones have negligible width; distance to cover is simply the train’s own length.',
    example: 'A 180m train moving at 54 km/h (15 m/s) crosses a lamp post in 180 / 15 = 12 seconds.'
  },
  {
    id: 'stm-train-2',
    name: 'Trains: Passing a Platform, Bridge, or Tunnel',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'Time = (Length_train + Length_platform) / Speed_train',
    variables: {
      Length_train: 'Length of train',
      Length_platform: 'Length of platform/bridge/tunnel',
      Speed_train: 'Speed of train in m/s'
    },
    tip: 'Total distance = length of train + length of the stationary obstacle.',
    example: 'A 200m train running at 72 km/h (20 m/s) crosses a 300m platform in (200 + 300) / 20 = 25 seconds.'
  },
  {
    id: 'stm-train-3',
    name: 'Trains: Two Trains Crossing Each Other',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'Opposite: Time = (L1 + L2) / (S1 + S2)  |  Same Dir: Time = (L1 + L2) / |S1 - S2|',
    variables: {
      L1: 'Length of Train 1',
      L2: 'Length of Train 2',
      S1: 'Speed of Train 1 (m/s)',
      S2: 'Speed of Train 2 (m/s)'
    },
    tip: 'Total distance is always (L1 + L2) regardless of direction; relative speed adds for opposite and subtracts for same direction.',
    example: 'Trains of 120m and 180m at 40 m/s and 20 m/s in opposite directions pass in (120+180)/(40+20) = 5 sec.'
  },
  {
    id: 'stm-train-4',
    name: 'Trains: Crossing & Time to Reach Destination',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'S1 / S2 = √(T2 / T1)',
    variables: {
      S1: 'Speed of Train 1',
      S2: 'Speed of Train 2',
      T1: 'Time taken by Train 1 to reach destination after meeting',
      T2: 'Time taken by Train 2 to reach destination after meeting'
    },
    tip: 'Applies when two bodies start simultaneously from two points toward each other and take T1, T2 after meeting.',
    example: 'Train A takes 4 hrs and Train B takes 9 hrs to reach opposite stations after crossing: S_A / S_B = √(9/4) = 3/2.'
  },
  {
    id: 'stm-std-1',
    name: 'Speed Conversion Factor (km/h <-> m/s)',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: '1 km/h = 5/18 m/s  |  1 m/s = 18/5 km/h',
    variables: {
      '5/18': '1000m / 3600s = 5/18',
      '18/5': 'Reciprocal conversion factor'
    },
    tip: 'To remember: km/h is bigger unit -> multiply by smaller fraction 5/18 to get m/s.',
    example: '90 km/h = 90 × (5/18) = 25 m/s. 20 m/s = 20 × (18/5) = 72 km/h.'
  },
  {
    id: 'stm-std-2',
    name: 'Average Speed for Equal Distances',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: '2 Speeds: Avg = (2 × x × y) / (x + y)  |  3 Speeds: Avg = (3xyz) / (xy + yz + zx)',
    variables: {
      x: 'Speed for first segment',
      y: 'Speed for second segment',
      z: 'Speed for third segment'
    },
    tip: 'Do NOT take simple arithmetic mean (x+y)/2 unless time spent at each speed is identical.',
    example: 'Go at 60 km/h and return at 40 km/h: Avg Speed = (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h.'
  },
  {
    id: 'stm-std-3',
    name: 'Early and Late Arrival Distance Shortcut',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: 'Distance = (S1 × S2) / |S1 - S2| × (ΔTime)',
    variables: {
      S1: 'Speed in first instance',
      S2: 'Speed in second instance',
      'ΔTime': 'Total difference in arrival times in hours'
    },
    tip: 'Late + Early = add times. Late + Late = subtract times. Ensure time difference is converted to hours!',
    example: 'At 4 km/h late by 15 min, at 6 km/h early by 5 min. Total diff = 20 min = 1/3 hr. D = (4 × 6)/2 × (1/3) = 12 × 1/3 = 4 km.'
  },
  {
    id: 'stm-race-1',
    name: 'Circular Track: First Meeting & Distinct Points',
    category: 'Speed, Time & Motion',
    subcategory: 'Races & Circular Motion',
    content: 'Meeting time = Track_Length / (S1 ± S2)  |  Distinct points = (a ± b) / HCF(a, b)',
    variables: {
      Track_Length: 'Circumference of circular path',
      S1: 'Speed of runner 1',
      S2: 'Speed of runner 2',
      'a : b': 'Speed ratio S1 : S2 in lowest terms'
    },
    tip: 'Use (+) for opposite directions and (-) for same direction. Meeting at starting point = LCM(L/S1, L/S2).',
    example: 'Speeds ratio 5:3 in opposite directions -> distinct meeting points = (5+3)/1 = 8 points.'
  },
  {
    id: 'stm-race-2',
    name: 'Escalator / Moving Walkway Formula',
    category: 'Speed, Time & Motion',
    subcategory: 'Races & Circular Motion',
    content: 'Total Steps N = (v_person ± v_escalator) × Time = Steps_walked ± (v_escalator × Time)',
    variables: {
      N: 'Total visible steps of the escalator',
      v_person: 'Person walking speed (steps/sec)',
      v_escalator: 'Escalator mechanical speed (steps/sec)',
      Time: 'Time taken to cover escalator'
    },
    tip: 'Walking in the direction of escalator motion adds steps (+); walking against subtracts (-).',
    example: 'If A takes 30 steps in 20s and B takes 40 steps in 15s in direction of motion: solve for N using speed of escalator.'
  },
  {
    id: 'stm-work-1',
    name: 'Combined Time & Work (2 and 3 Persons)',
    category: 'Speed, Time & Motion',
    subcategory: 'Time & Work',
    content: '2 Persons: (A × B) / (A + B)  |  3 Persons: (A × B × C) / (AB + BC + CA)',
    variables: {
      A: 'Days taken by A alone',
      B: 'Days taken by B alone',
      C: 'Days taken by C alone'
    },
    tip: 'Combined rate is the sum of unit work rates: 1/T = 1/A + 1/B + 1/C.',
    example: 'A does in 10 days, B does in 15 days. Together = (10 × 15) / 25 = 6 days.'
  },
  {
    id: 'stm-work-2',
    name: 'Man-Days-Hours-Efficiency (MDHE / W) Relation',
    category: 'Speed, Time & Motion',
    subcategory: 'Time & Work',
    content: '(M1 × D1 × H1 × E1) / W1 = (M2 × D2 × H2 × E2) / W2',
    variables: {
      M: 'Number of workers/men',
      D: 'Number of days',
      H: 'Hours worked per day',
      E: 'Efficiency multiplier',
      W: 'Amount of work or quantity produced'
    },
    tip: 'Keep all work units (e.g. walls built, length dug, books bound) in the denominator.',
    example: '12 men working 8 hrs/day dig a trench in 10 days. 16 men working 6 hrs/day will take D2 = (12×8×10)/(16×6) = 10 days.'
  },
  {
    id: 'stm-work-3',
    name: 'Efficiency to Time Ratio Inversion',
    category: 'Speed, Time & Motion',
    subcategory: 'Time & Work',
    content: 'Efficiency Ratio (E1 : E2) = Time Ratio (T2 : T1)',
    variables: {
      E1: 'Efficiency of Worker 1',
      E2: 'Efficiency of Worker 2',
      T1: 'Time taken by Worker 1',
      T2: 'Time taken by Worker 2'
    },
    tip: 'If A is 50% more efficient than B, E_A : E_B = 3 : 2, so Time_A : Time_B = 2 : 3.',
    example: 'If A takes 20 days and is 1.5x as efficient as B, then B takes 20 × 1.5 = 30 days.'
  },
  {
    id: 'stm-pipe-1',
    name: 'Pipes & Cisterns: Net Filling Rate & Tank Leak',
    category: 'Speed, Time & Motion',
    subcategory: 'Pipes & Cisterns',
    content: 'Net Rate = Σ(1/T_inlet) - Σ(1/T_outlet)  |  Leak Emptying Time = (A × B) / (B - A)',
    variables: {
      A: 'Time to fill tank without leak',
      B: 'Time to fill tank with leak open',
      T_inlet: 'Inlet pipe filling time',
      T_outlet: 'Outlet pipe emptying time'
    },
    tip: 'Treat filling pipes as positive work (+) and draining pipes/leaks as negative work (-).',
    example: 'A pipe fills a tank in 6 hrs, but takes 8 hrs due to a leak. Leak alone empties full tank in (6 × 8) / (8 - 6) = 24 hours.'
  },

  // =========================================================================
  // 2. LOGICAL REASONING (Clocks, Calendars, Syllogisms, Blood Rel, Dice, etc.)
  // =========================================================================
  {
    id: 'lr-clock-1',
    name: 'Clocks: Angle Between Hour & Minute Hands',
    category: 'Logical Reasoning',
    subcategory: 'Clocks & Angles',
    content: 'θ = |30H - (11/2)M| = |30H - 5.5M|',
    variables: {
      H: 'Hour (1 to 12)',
      M: 'Minutes (0 to 59)',
      'θ': 'Angle between hands in degrees (if > 180°, reflex = 360° - θ)'
    },
    tip: 'Hour hand moves at 0.5°/min (30°/hr). Minute hand moves at 6°/min. Relative speed is 5.5°/min.',
    example: 'At 4:20 -> θ = |30(4) - 5.5(20)| = |120 - 110| = 10°.'
  },
  {
    id: 'lr-clock-2',
    name: 'Clocks: Coincide, Opposite, & Right Angle Frequencies',
    category: 'Logical Reasoning',
    subcategory: 'Clocks & Angles',
    content: 'Coincide (0°): 22 times/day  |  Opposite (180°): 22 times/day  |  Right Angle (90°): 44 times/day',
    variables: {
      '0° overlap': 'Occurs 11 times in 12 hours (11-1 overlap occurs only once at 12:00)',
      '180° line': 'Occurs 11 times in 12 hours (5-7 straight line occurs once at 6:00)',
      '90° perpendicular': 'Occurs 22 times in 12 hours'
    },
    tip: 'Between 11:00 and 1:00, hands coincide only once (at 12:00). Between 5:00 and 7:00, they are opposite once (at 6:00).',
    example: 'How many times do hands make a right angle in 24 hours? Exactly 44 times.'
  },
  {
    id: 'lr-clock-3',
    name: 'Clocks: Mirror & Water Image Times',
    category: 'Logical Reasoning',
    subcategory: 'Clocks & Angles',
    content: 'Mirror Image = 11:60 - Actual Time  |  Water Image = 18:30 (or 17:90) - Actual Time',
    variables: {
      '11:60': 'Equivalent to 12:00 (for 12-hr clock subtraction)',
      '23:60': 'Use for 24-hr format mirror image subtraction',
      '18:30': 'Base for horizontal reflection (use 17:90 if minutes > 30)'
    },
    tip: 'Subtract directly from 11:60 to instantly get the mirror reflection.',
    example: 'Mirror image of 8:40 = 11:60 - 8:40 = 3:20. Water image of 2:40 = 17:90 - 2:40 = 15:50 (3:50).'
  },
  {
    id: 'lr-clock-4',
    name: 'Clocks: Faulty Clock Gain / Loss',
    category: 'Logical Reasoning',
    subcategory: 'Clocks & Angles',
    content: 'Gain/Loss per Day = [ (720/11) - X ] × (1440 / X) minutes',
    variables: {
      '720/11': 'Standard correct coincidence interval = 65 5/11 minutes',
      X: 'Time interval (in minutes) at which faulty hands actually coincide',
      '1440': 'Total minutes in a 24-hour day'
    },
    tip: 'If X < 65 5/11 min, the clock runs FAST (gains time); if X > 65 5/11 min, it runs SLOW (loses time).',
    example: 'If hands coincide every 64 minutes: Gain = (720/11 - 64) × (1440/64) = (16/11) × 22.5 = 32 8/11 minutes/day.'
  },
  {
    id: 'lr-cal-1',
    name: 'Calendars: Odd Days Breakdown',
    category: 'Logical Reasoning',
    subcategory: 'Calendars & Dates',
    content: 'Ordinary Year = 1 Odd Day (365 % 7)  |  Leap Year = 2 Odd Days (366 % 7)',
    variables: {
      '100 Years': '5 Odd days',
      '200 Years': '3 Odd days',
      '300 Years': '1 Odd day',
      '400 Years': '0 Odd days (Century leap years: 1600, 2000, 2400)'
    },
    tip: 'Days of week codes: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.',
    example: 'Year 2024 is a leap year (2 odd days). If Jan 1 2024 was Monday, Jan 1 2025 was Wednesday (+2 days).'
  },
  {
    id: 'lr-cal-2',
    name: 'Calendars: Repetition of Annual Calendar',
    category: 'Logical Reasoning',
    subcategory: 'Calendars & Dates',
    content: 'Leap Year -> +28 yrs  |  Leap + 1 -> +6 yrs  |  Leap + 2 / Leap + 3 -> +11 yrs',
    variables: {
      'Leap Year': 'e.g. 2024 -> repeats in 2024 + 28 = 2052',
      'Leap + 1': 'e.g. 2025 (2024+1) -> repeats in 2025 + 6 = 2031',
      'Leap + 2 / 3': 'e.g. 2026 -> repeats in 2026 + 11 = 2037'
    },
    tip: 'Quick modulo 4 rule: Remainder 0 -> +28, Remainder 1 -> +6, Remainder 2 or 3 -> +11.',
    example: 'Calendar of 2017: 2017 % 4 = 1 -> repeats in 2017 + 6 = 2023.'
  },
  {
    id: 'lr-rank-1',
    name: 'Order & Ranking: Total Persons in a Linear Row',
    category: 'Logical Reasoning',
    subcategory: 'Order & Ranking',
    content: 'Total = Rank_Left + Rank_Right - 1  ==>  Rank_Right = Total - Rank_Left + 1',
    variables: {
      Rank_Left: 'Position from left/top end (1-indexed)',
      Rank_Right: 'Position from right/bottom end (1-indexed)',
      Total: 'Total number of people in the row'
    },
    tip: 'We subtract 1 because the single person is counted twice (once from left, once from right).',
    example: 'Aman is 14th from left and 23rd from right: Total = 14 + 23 - 1 = 36 persons.'
  },
  {
    id: 'lr-rank-2',
    name: 'Order & Ranking: Overlapping (Minimum) vs Non-Overlapping',
    category: 'Logical Reasoning',
    subcategory: 'Order & Ranking',
    content: 'Standard: Total = R1 + R2 + In_Between  |  Overlapping (Min): Total = R1 + R2 - In_Between - 2',
    variables: {
      R1: 'Rank of person A from left',
      R2: 'Rank of person B from right',
      In_Between: 'Number of people seated between A and B'
    },
    tip: 'In overlapping case, A and B cross each other; we subtract 2 for A and B themselves who are counted twice.',
    example: 'R1=18 from left, R2=15 from right, 5 between them. Overlapping Total = 18 + 15 - 5 - 2 = 26.'
  },
  {
    id: 'lr-rank-3',
    name: 'Order & Ranking: Position Interchange',
    category: 'Logical Reasoning',
    subcategory: 'Order & Ranking',
    content: 'Total = New_Rank_A + Old_Rank_B - 1  |  Persons Between = |New_Rank_A - Old_Rank_A| - 1',
    variables: {
      New_Rank_A: 'New rank of person A after swapping places with B',
      Old_Rank_B: 'Original rank of person B before swapping'
    },
    tip: 'When A takes B’s seat, A’s new rank and B’s old rank represent the exact same seat from opposite ends.',
    example: 'A is 9th from left, B is 16th from right. After swapping, A is 22nd from left: Total = 22 + 16 - 1 = 37.'
  },
  {
    id: 'lr-syl-1',
    name: 'Syllogisms: Either-Or Complementary Pairs',
    category: 'Logical Reasoning',
    subcategory: 'Syllogisms & Deductive Logic',
    content: 'Valid Either-Or: (Some + No) OR (All + Some-Not) with identical Subject & Predicate',
    variables: {
      'Condition 1': 'Both individual conclusions must be individually doubtful / false',
      'Condition 2': 'One conclusion must be affirmative and one negative',
      'Condition 3': 'Both conclusions must have identical subject and predicate'
    },
    tip: 'Note: (All + No) NEVER forms an Either-Or pair because both can be simultaneously false.',
    example: 'Conclusions: 1. Some cats are dogs, 2. No cat is a dog. Both doubtful -> Either I or II follows.'
  },
  {
    id: 'lr-syl-2',
    name: 'Syllogisms: Only a Few & Definite Negative',
    category: 'Logical Reasoning',
    subcategory: 'Syllogisms & Deductive Logic',
    content: '"Only a few A are B" <==> (Some A are B) AND (Some A are NOT B)',
    variables: {
      'Only a few': 'Directly implies positive intersection + definite negative remainder',
      'All A being B': 'Always FALSE as a possibility',
      'All B being A': 'CAN be TRUE as a possibility (unless restricted otherwise)'
    },
    tip: 'Crucial for modern Banking & SSC exams: "Only a few" is always dual-nature.',
    example: 'Statement: "Only a few pens are books." -> Concl: "Some pens are not books" is DEFINITIVELY TRUE.'
  },
  {
    id: 'lr-cube-1',
    name: 'Cubes & Painted Dice: Slicing into Smaller Cubes',
    category: 'Logical Reasoning',
    subcategory: 'Cubes & Dice',
    content: '3-Faces = 8  |  2-Faces = 12(n-2)  |  1-Face = 6(n-2)²  |  0-Faces = (n-2)³',
    variables: {
      n: 'Cuts per side = Side_large / Side_small = ∛(Total small cubes)',
      '3-Faces (Corners)': 'Always exactly 8 (the 8 corners of the cube)',
      '2-Faces (Edges)': 'Along the 12 edges',
      '1-Face (Centres)': 'On the 6 square face interiors',
      '0-Faces (Core)': 'Completely unpainted internal cubes'
    },
    tip: 'Total cuts needed across 3 dimensions = 3(n - 1).',
    example: 'A painted cube is cut into 64 cubes (n=4): 3-faces = 8, 2-faces = 12(2) = 24, 1-face = 6(4) = 24, 0-faces = (2)³ = 8.'
  },
  {
    id: 'lr-dice-1',
    name: 'Dice: Single & Two Common Faces Rules',
    category: 'Logical Reasoning',
    subcategory: 'Cubes & Dice',
    content: '1 Common: Rotate clockwise from common digit  |  2 Common: Remaining 3rd faces are opposite',
    variables: {
      'Standard Dice': 'Sum of opposite faces is always 7 (1<->6, 2<->5, 3<->4)',
      'Ordinary Dice': 'Adjacent faces sum can be 7; use position rotation rules'
    },
    tip: 'When 2 positions share one common number, write numbers clockwise from that number for both positions to find opposite pairs.',
    example: 'Pos 1: (3, 5, 2) and Pos 2: (3, 1, 6). Clockwise from 3: (3->5->2) & (3->1->6) ==> 5 is opposite 1, 2 is opposite 6, 3 is opposite 4.'
  },
  {
    id: 'lr-dir-1',
    name: 'Direction Sense: Sunrise & Sunset Shadow Rules',
    category: 'Logical Reasoning',
    subcategory: 'Direction & Distance',
    content: 'Morning (Sun East): Shadow in WEST  |  Evening (Sun West): Shadow in EAST  |  Noon: NO Shadow',
    variables: {
      'Facing North in Morning': 'Shadow falls to your LEFT',
      'Facing South in Morning': 'Shadow falls to your RIGHT',
      'Facing North in Evening': 'Shadow falls to your RIGHT',
      'Facing South in Evening': 'Shadow falls to your LEFT'
    },
    tip: 'Displacement between start and end point = √[(ΔEast-West)² + (ΔNorth-South)²].',
    example: 'At sunrise, Rohit stands facing a pole. If the pole’s shadow is to his right, Rohit is facing South.'
  },
  {
    id: 'lr-code-1',
    name: 'Coding-Decoding: EJOTY & Reverse Alphabet Pairs (Sum = 27)',
    category: 'Logical Reasoning',
    subcategory: 'Coding-Decoding',
    content: 'Forward: E(5) J(10) O(15) T(20) Y(25)  |  Reverse: A-Z, B-Y, C-X, D-W, E-V, F-U, G-T, H-S, I-R, J-Q, K-P, L-O, M-N',
    variables: {
      'Reverse Rank': '27 - Forward Alphabetical Rank',
      'Opposite Pair Sum': 'A(1) + Z(26) = 27, B(2) + Y(25) = 27, etc.'
    },
    tip: 'Mnemonic for reverse pairs: AZ (Amazon), BY (Boy), CX (Crux), DW (Dew), EV (Love), FU (Fun), GT (GT Road), HS (High School), IR (Indian Railway), JQ (Jungle Queen), KP (Kurta Pyjama), LO (Love), MN (Man).',
    example: 'Reverse code for "K" (11) = 27 - 11 = 16 = "P".'
  },
  {
    id: 'lr-fig-1',
    name: 'Figure Counting: Triangles in Divided Figures',
    category: 'Logical Reasoning',
    subcategory: 'Figure Counting',
    content: 'Apex sliced into n parts: n(n+1)/2  |  Square diagonals with n sectors: 2n  |  Nested triangles: 4n + 1',
    variables: {
      n: 'Number of individual sub-triangles or sectors',
      'Square diagonals': 'A square divided by 2 diagonals has 4 parts -> 2(4) = 8 triangles',
      'Nested triangles': 'n = number of internal inverted triangles'
    },
    tip: 'For a triangle with horizontal floors/lines h, total triangles = h × [n(n+1)/2].',
    example: 'A triangle divided into 4 base segments has 4(5)/2 = 10 triangles.'
  },

  // =========================================================================
  // 3. ARITHMETIC (Percentages, Profit/Loss, SI/CI, Mixtures, Ratios, Averages)
  // =========================================================================
  {
    id: 'arith-pct-1',
    name: 'Percentage: Price-Consumption Compensation',
    category: 'Arithmetic',
    subcategory: 'Percentages',
    content: 'If Price rises r%: Consumption drops [ r / (100 + r) ] × 100%',
    variables: {
      r: 'Percentage rise in price of commodity'
    },
    tip: 'If price drops by r%, consumption can rise by [ r / (100 - r) ] × 100% to keep expenditure constant.',
    example: 'If sugar price rises by 25%: consumption must reduce by 25 / (100 + 25) × 100 = 25/125 × 100 = 20%.'
  },
  {
    id: 'arith-pct-2',
    name: 'Successive Percentage Change',
    category: 'Arithmetic',
    subcategory: 'Percentages',
    content: 'Net Change = a + b + (ab / 100) %',
    variables: {
      a: 'First percentage change (use negative for decrease)',
      b: 'Second percentage change (use negative for decrease)'
    },
    tip: 'For three successive changes a, b, c: combine a and b first to get X, then combine X and c.',
    example: 'Length +20%, Breadth -10% of rectangle -> Area change = 20 - 10 + (20 × -10)/100 = 10 - 2 = +8% increase.'
  },
  {
    id: 'arith-pl-1',
    name: 'Profit & Loss: Cost Price, Marked Price & Discount Relation',
    category: 'Arithmetic',
    subcategory: 'Profit & Loss',
    content: 'MP / CP = (100 + Profit%) / (100 - Discount%)',
    variables: {
      MP: 'Marked Price / List Price',
      CP: 'Cost Price',
      'Profit%': 'Target profit percentage',
      'Discount%': 'Allowed discount percentage on MP'
    },
    tip: 'Connects all three core variables directly without needing intermediate selling price SP calculation.',
    example: 'Trader wants 20% profit after giving 10% discount: MP / CP = (100 + 20) / (100 - 10) = 120 / 90 = 4/3 (Markup = 33.33%).'
  },
  {
    id: 'arith-pl-2',
    name: 'Profit & Loss: Same SP with Equal % Profit & Loss',
    category: 'Arithmetic',
    subcategory: 'Profit & Loss',
    content: 'Always Net Loss% = (x / 10)² = x² / 100 %',
    variables: {
      x: 'Common profit and loss percentage',
      SP: 'Selling price of each of the two articles (must be identical)'
    },
    tip: 'When SP is same and profit% equals loss%, there is ALWAYS an overall loss. (If CP were same, net is 0%).',
    example: 'Two cars sold for $40,000 each: one at 20% profit, other at 20% loss. Overall loss = 20² / 100 = 4% loss.'
  },
  {
    id: 'arith-pl-3',
    name: 'Profit & Loss: Dishonest Dealer & False Weight',
    category: 'Arithmetic',
    subcategory: 'Profit & Loss',
    content: 'Gain% = [ Error / (True_Weight - Error) ] × 100 = [ (Claimed - Actual) / Actual ] × 100',
    variables: {
      True_Weight: 'Nominal weight claimed to be sold (e.g. 1000g)',
      Error: 'Shortfall in weight provided (e.g. 1000g - 900g = 100g)',
      Actual: 'Actual weight handed over to customer (e.g. 900g)'
    },
    tip: 'Dealer gains because his actual cost is only for the lower weight he hands over.',
    example: 'Uses 800g instead of 1kg: Gain% = (200 / 800) × 100 = 25% profit.'
  },
  {
    id: 'arith-int-1',
    name: 'Difference Between Compound & Simple Interest (2 & 3 Years)',
    category: 'Arithmetic',
    subcategory: 'Simple & Compound Interest',
    content: '2 Years: CI - SI = P(R/100)²  |  3 Years: CI - SI = P(R/100)² × [ (300 + R) / 100 ]',
    variables: {
      P: 'Principal sum',
      R: 'Annual interest rate (%)',
      'CI - SI': 'Difference between compound and simple interest'
    },
    tip: 'For 2 years, the difference is simply the interest on the first year’s interest: SI × (R/100).',
    example: 'P = $5000, R = 10%, 2 years: Diff = 5000 × (10/100)² = 5000 × 0.01 = $50.'
  },
  {
    id: 'arith-int-2',
    name: 'Compound Interest: Compounding Frequencies',
    category: 'Arithmetic',
    subcategory: 'Simple & Compound Interest',
    content: 'Half-Yearly: A = P(1 + R/200)^(2T)  |  Quarterly: A = P(1 + R/400)^(4T)',
    variables: {
      A: 'Final amount',
      P: 'Principal',
      R: 'Nominal annual rate (%)',
      T: 'Time in years'
    },
    tip: 'Half-yearly: Rate becomes R/2 and periods become 2T. Quarterly: Rate is R/4 and periods are 4T.',
    example: '$10,000 at 20% compounded half-yearly for 1 yr: A = 10000(1 + 10/100)² = 10000(1.21) = $12,100.'
  },
  {
    id: 'arith-int-3',
    name: 'Simple Interest Equal Installment Formula',
    category: 'Arithmetic',
    subcategory: 'Simple & Compound Interest',
    content: 'Annual Installment x = (100 × Debt) / [ 100T + (R × T × (T - 1)) / 2 ]',
    variables: {
      Debt: 'Total amount due after T years',
      T: 'Number of equal annual installments',
      R: 'Annual interest rate (%)',
      x: 'Amount of each installment'
    },
    tip: 'Applies to clear a debt due at the end of T years through T equal annual payments.',
    example: 'Debt of $6450 due in 4 years at 5% SI: x = (100 × 6450) / [400 + (5 × 4 × 3)/2] = 645000 / 430 = $1500/year.'
  },
  {
    id: 'arith-mix-1',
    name: 'Mixtures & Alligation: The Alligation Cross',
    category: 'Arithmetic',
    subcategory: 'Mixtures & Alligation',
    content: 'Quantity_Cheaper / Quantity_Dearer = (Price_Dearer - Mean_Price) / (Mean_Price - Price_Cheaper)',
    variables: {
      Price_Cheaper: 'Lower cost / concentration rate (c)',
      Price_Dearer: 'Higher cost / concentration rate (d)',
      Mean_Price: 'Target blended average cost / concentration (m)'
    },
    tip: 'All quantities must be in identical units (e.g. all Cost Prices or all concentrations).',
    example: 'Mix rice at $15/kg and $20/kg to get $18/kg: Q1/Q2 = (20 - 18) / (18 - 15) = 2/3. Ratio is 2:3.'
  },
  {
    id: 'arith-mix-2',
    name: 'Repeated Dilution / Replacement of Liquid',
    category: 'Arithmetic',
    subcategory: 'Mixtures & Alligation',
    content: 'Remaining Pure Liquid = Initial × [ 1 - (Replaced / Total) ]^n',
    variables: {
      Initial: 'Initial quantity of pure liquid (e.g. milk, wine)',
      Replaced: 'Quantity drawn out and replaced with water each operation',
      Total: 'Total container capacity (remains constant)',
      n: 'Number of repeated replacement operations'
    },
    tip: 'Fraction of pure liquid remaining after n operations is [ 1 - (y/x) ]^n.',
    example: '40L pure milk; 4L taken out and replaced with water 3 times: Remaining = 40 × (1 - 4/40)³ = 40 × (0.9)³ = 29.16 L.'
  },
  {
    id: 'arith-avg-1',
    name: 'Averages: Value of New / Replaced Person',
    category: 'Arithmetic',
    subcategory: 'Averages & Ratios',
    content: 'New Value = Excluded/Replaced Value ± (Total Members × Change in Average)',
    variables: {
      'Change in Average': 'New Average - Old Average',
      'Total Members': 'Current count of individuals in the group',
      '±': 'Use (+) if average increased, (-) if average decreased'
    },
    tip: 'Saves time by skipping the calculation of large intermediate sums.',
    example: 'A person weighing 60kg is replaced; average of 10 people increases by 1.5kg: New weight = 60 + (10 × 1.5) = 75 kg.'
  },
  {
    id: 'arith-rat-1',
    name: 'Ratio & Proportion: Proportional Values & C&D',
    category: 'Arithmetic',
    subcategory: 'Averages & Ratios',
    content: 'Mean Prop = √(ab)  |  3rd Prop = b²/a  |  4th Prop = bc/a  |  C&D: (a+b)/(a-b) = (c+d)/(c-d)',
    variables: {
      'Mean Proportional': 'b where a/b = b/c ==> b² = ac',
      'Third Proportional': 'c where a/b = b/c ==> c = b²/a',
      'Fourth Proportional': 'd where a/b = c/d ==> d = bc/a',
      'C&D': 'Componendo & Dividendo identity'
    },
    tip: 'Componendo & Dividendo simplifies rational fractions instantly in algebra and trigonometry.',
    example: 'Third proportional to 4 and 6 = 6² / 4 = 36 / 4 = 9. Mean proportional of 4 and 16 = √(64) = 8.'
  },

  // =========================================================================
  // 4. ALGEBRA & NUMBER SYSTEMS (Identities, Quadratics, AP/GP, Remainders)
  // =========================================================================
  {
    id: 'alg-id-1',
    name: 'Algebra: Symmetric Reciprocal Powers (x + 1/x = k)',
    category: 'Algebra & Numbers',
    subcategory: 'Algebraic Identities',
    content: 'x² + 1/x² = k² - 2  |  x³ + 1/x³ = k³ - 3k  |  x⁴ + 1/x⁴ = (k² - 2)² - 2',
    variables: {
      k: 'Value of (x + 1/x)',
      'If x - 1/x = m': 'x² + 1/x² = m² + 2  and  x³ - 1/x³ = m³ + 3m'
    },
    tip: 'Essential for SSC CGL, CAT, and GRE quantitative sections.',
    example: 'If x + 1/x = 3: x² + 1/x² = 3² - 2 = 7; x³ + 1/x³ = 3³ - 3(3) = 18; x⁴ + 1/x⁴ = 7² - 2 = 47.'
  },
  {
    id: 'alg-id-2',
    name: 'Algebra: Sum of Cubes Identity (a + b + c = 0)',
    category: 'Algebra & Numbers',
    subcategory: 'Algebraic Identities',
    content: 'a³ + b³ + c³ - 3abc = (a+b+c)(a²+b²+c² - ab - bc - ca)  ==>  If a+b+c=0, then a³+b³+c³ = 3abc',
    variables: {
      'a, b, c': 'Real numbers or algebraic expressions'
    },
    tip: 'Also equal to (1/2)(a+b+c)[(a-b)² + (b-c)² + (c-a)²]. If a²+b²+c² = ab+bc+ca, then a = b = c.',
    example: 'If a = 25, b = -15, c = -10 (sum = 0): 25³ + (-15)³ + (-10)³ = 3(25)(-15)(-10) = 11,250.'
  },
  {
    id: 'alg-quad-1',
    name: 'Quadratic Equations: Roots, Discriminant & Vertex Extrema',
    category: 'Algebra & Numbers',
    subcategory: 'Quadratic Equations',
    content: 'Roots = (-b ± √D) / 2a  |  Sum = -b/a, Prod = c/a  |  Extremum = (4ac - b²) / 4a at x = -b/2a',
    variables: {
      D: 'Discriminant = b² - 4ac',
      'D > 0': 'Two distinct real roots',
      'D = 0': 'Two equal real roots (-b/2a)',
      'D < 0': 'Complex conjugate roots'
    },
    tip: 'For ax² + bx + c: if a > 0, vertex gives MINIMUM value; if a < 0, vertex gives MAXIMUM value.',
    example: 'For 2x² - 8x + 5 (a=2>0): Minimum occurs at x = 8/(2×2) = 2. Min value = 2(4) - 8(2) + 5 = -3.'
  },
  {
    id: 'alg-prog-1',
    name: 'Progressions: Arithmetic Progression (AP) & Sum',
    category: 'Algebra & Numbers',
    subcategory: 'Progressions AP/GP/HP',
    content: 'Tn = a + (n - 1)d  |  Sn = (n/2)[2a + (n - 1)d] = (n/2)(First + Last)',
    variables: {
      a: 'First term of sequence',
      d: 'Common difference (T_k - T_{k-1})',
      n: 'Number of terms',
      Tn: 'n-th term',
      Sn: 'Sum of first n terms'
    },
    tip: 'Average of an AP series = (First term + Last term) / 2.',
    example: 'Sum of first 20 odd numbers (a=1, d=2, n=20): Sn = 20² = 400 (or (20/2)[2 + 38] = 400).'
  },
  {
    id: 'alg-prog-2',
    name: 'Progressions: Geometric Progression (GP) & Infinite Sum',
    category: 'Algebra & Numbers',
    subcategory: 'Progressions AP/GP/HP',
    content: 'Tn = a × r^(n-1)  |  Sn = a(r^n - 1) / (r - 1)  |  S_infinity = a / (1 - r)  [for |r| < 1]',
    variables: {
      a: 'First term',
      r: 'Common ratio (T_k / T_{k-1})',
      S_infinity: 'Sum of infinite decaying GP terms (|r| < 1)'
    },
    tip: 'For bouncing ball questions (drops from H and rebounds to e×H): Total distance = H × (1 + e)/(1 - e).',
    example: 'Infinite sum of 1/2 + 1/4 + 1/8 + ... (a=1/2, r=1/2): S = (1/2) / (1 - 1/2) = 1.'
  },
  {
    id: 'alg-prog-3',
    name: 'Progressions: AM-GM-HM Inequality Relation',
    category: 'Algebra & Numbers',
    subcategory: 'Progressions AP/GP/HP',
    content: 'AM >= GM >= HM  ==>  GM² = AM × HM',
    variables: {
      AM: 'Arithmetic Mean = (a + b) / 2',
      GM: 'Geometric Mean = √(ab)',
      HM: 'Harmonic Mean = 2ab / (a + b)'
    },
    tip: 'Equality AM = GM = HM holds if and only if all positive elements are equal (a = b).',
    example: 'For 4 and 16: AM = 10, GM = 8, HM = 6.4. Check: GM² = 64 = 10 × 6.4 = AM × HM.'
  },
  {
    id: 'alg-num-1',
    name: 'Number Systems: Total Number & Sum of Factors',
    category: 'Algebra & Numbers',
    subcategory: 'Number Systems & Factors',
    content: 'For N = p^a × q^b × r^c: Total Factors = (a+1)(b+1)(c+1)  |  Sum = [ (p^(a+1)-1)/(p-1) ] × ...',
    variables: {
      'p, q, r': 'Distinct prime factors of N',
      'a, b, c': 'Powers / exponents of respective prime factors'
    },
    tip: 'Number of odd factors: ignore the prime factor 2 completely. Even factors = Total factors - Odd factors.',
    example: '72 = 2³ × 3²: Total factors = (3+1)(2+1) = 12. Sum = [(2⁴-1)/(1)] × [(3³-1)/(2)] = 15 × 13 = 195.'
  },
  {
    id: 'alg-num-2',
    name: 'Number Systems: Trailing Zeros in n! (Legendre’s Formula)',
    category: 'Algebra & Numbers',
    subcategory: 'Number Systems & Factors',
    content: 'Trailing Zeros in n! = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + ⌊n/625⌋ + ...',
    variables: {
      n: 'The integer factorial argument (n!)',
      '⌊x⌋': 'Floor function (greatest integer less than or equal to x)'
    },
    tip: 'Trailing zeros depend on factor 10 = 2 × 5. In factorials, 5 is the limiting factor.',
    example: 'Zeros in 100! = ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24 trailing zeros.'
  },
  {
    id: 'alg-num-3',
    name: 'Number Systems: Divisibility Rules Master Summary',
    category: 'Algebra & Numbers',
    subcategory: 'Number Systems & Factors',
    content: '3 & 9: Sum of digits  |  4 & 8: Last 2 & 3 digits  |  7 & 13: Group by 3s from right  |  11: Odd-Even digit sum diff',
    variables: {
      'Rule for 7 & 13': 'Alternating sum of 3-digit blocks from right must be divisible by 7 or 13',
      'Rule for 11': '(Sum of digits at odd places) - (Sum of digits at even places) = 0 or multiple of 11'
    },
    tip: 'If a number is divisible by both co-prime numbers a and b, it is divisible by (a × b). (e.g. 72 = 8 × 9).',
    example: 'Check 121: (1+1) - 2 = 0 -> Divisible by 11. Check 735: 73 - 2(5) = 63 (divisible by 7) -> Divisible by 7.'
  },

  // =========================================================================
  // 5. GEOMETRY & MENSURATION (Triangles, Circles, Solids, Trigonometry)
  // =========================================================================
  {
    id: 'geo-tri-1',
    name: 'Triangles: Inradius, Circumradius & Heron’s Area',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'Area Δ = √[s(s-a)(s-b)(s-c)]  |  Inradius r = Δ / s  |  Circumradius R = abc / (4Δ)',
    variables: {
      'a, b, c': 'Side lengths of triangle',
      s: 'Semi-perimeter = (a + b + c) / 2',
      'Δ': 'Area of the triangle',
      r: 'Radius of incircle',
      R: 'Radius of circumcircle'
    },
    tip: 'For right triangle: Inradius r = (a + b - c) / 2 and Circumradius R = c / 2 (where c is hypotenuse).',
    example: 'For 3-4-5 right triangle: Δ = 6, s = 6 -> Inradius r = 6/6 = 1. Circumradius R = 5/2 = 2.5.'
  },
  {
    id: 'geo-tri-2',
    name: 'Triangles: Equilateral Triangle Dimensions',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'Area = (√3 / 4)a²  |  Height = (√3 / 2)a  |  Inradius = a / (2√3)  |  Circumradius = a / √3',
    variables: {
      a: 'Side length of equilateral triangle',
      'R / r ratio': 'Circumradius to Inradius ratio is always exactly 2 : 1'
    },
    tip: 'Area of incircle to circumcircle ratio is always r² : R² = 1 : 4.',
    example: 'If side a = 6 cm: Area = (√3 / 4)(36) = 9√3 cm². Inradius r = 6 / (2√3) = √3 cm.'
  },
  {
    id: 'geo-tri-3',
    name: 'Triangles: Apollonius Theorem (Median Length)',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'AB² + AC² = 2(AD² + BD²)',
    variables: {
      AD: 'Length of median drawn from vertex A to midpoint D on base BC',
      BD: 'Half of base BC (BD = CD = BC / 2)',
      AB: 'Length of adjacent side 1',
      AC: 'Length of adjacent side 2'
    },
    tip: 'Use to find length of medians in any non-right triangle.',
    example: 'AB = 7, AC = 9, BC = 8 (so BD = 4): 7² + 9² = 2(AD² + 16) ==> 49 + 81 = 130 = 2(AD² + 16) ==> AD² = 49 ==> AD = 7.'
  },
  {
    id: 'geo-cir-1',
    name: 'Circles: Tangent-Secant & Intersecting Chords',
    category: 'Geometry & Mensuration',
    subcategory: 'Circles & Tangents',
    content: 'Tangent-Secant: PT² = PA × PB  |  Chords: PA × PB = PC × PD',
    variables: {
      PT: 'Length of tangent from external point P to touch point T',
      PAB: 'Secant line through P intersecting circle at points A and B',
      PCD: 'Second intersecting secant or chord line'
    },
    tip: 'Extremely popular in geometry sections of SSC CGL, CDS, and CAT.',
    example: 'Tangent PT = 12 cm, secant external segment PA = 8 cm: PB = PT² / PA = 144 / 8 = 18 cm (Chord AB = 18 - 8 = 10 cm).'
  },
  {
    id: 'geo-cir-2',
    name: 'Circles: Direct & Transverse Common Tangents',
    category: 'Geometry & Mensuration',
    subcategory: 'Circles & Tangents',
    content: 'DCT = √[ d² - (r1 - r2)² ]  |  TCT = √[ d² - (r1 + r2)² ]',
    variables: {
      d: 'Distance between centers of the two circles',
      r1: 'Radius of Circle 1',
      r2: 'Radius of Circle 2',
      DCT: 'Direct common tangent length (parallel outer tangents)',
      TCT: 'Transverse common tangent length (cross/interior tangents)'
    },
    tip: 'DCT is always longer than TCT because (r1 - r2)² < (r1 + r2)². TCT exists only if circles do not intersect.',
    example: 'd = 13, r1 = 8, r2 = 3: DCT = √[169 - 25] = √144 = 12. TCT = √[169 - 121] = √48 = 4√3.'
  },
  {
    id: 'geo-poly-1',
    name: 'Polygons: Interior Angles, Exterior Angles & Diagonals',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'Sum_Int = (n - 2) × 180°  |  Each_Int = (n - 2)180° / n  |  Diagonals = n(n - 3) / 2',
    variables: {
      n: 'Number of sides of polygon',
      'Sum of Exterior Angles': 'Always 360° for any convex polygon',
      'Each Exterior Angle': '360° / n (for regular polygon)'
    },
    tip: 'Interior angle + Exterior angle at any vertex = 180° (linear pair).',
    example: 'For an Octagon (n = 8): Sum of interior angles = 6 × 180° = 1080°. Diagonals = 8(5)/2 = 20.'
  },
  {
    id: 'geo-sol-1',
    name: '3D Mensuration: Cylinder, Cone & Sphere Volumes',
    category: 'Geometry & Mensuration',
    subcategory: '3D Solids & Mensuration',
    content: 'Cylinder: V = πr²h  |  Cone: V = (1/3)πr²h  |  Sphere: V = (4/3)πr³  |  Hemisphere: V = (2/3)πr³',
    variables: {
      r: 'Radius of base / sphere',
      h: 'Height of cylinder / cone',
      'Cone Slant Height l': 'l = √(r² + h²)',
      'Cone CSA': 'Curved Surface Area = πrl',
      'Sphere Total Area': '4πr²'
    },
    tip: 'Cylinder : Cone with same base and height have volume ratio 3 : 1.',
    example: 'Cone with r = 3 cm, h = 4 cm: Slant height l = √(9+16) = 5 cm. CSA = π(3)(5) = 15π cm².'
  },
  {
    id: 'geo-sol-2',
    name: '3D Mensuration: Frustum of a Cone',
    category: 'Geometry & Mensuration',
    subcategory: '3D Solids & Mensuration',
    content: 'V = (1/3)πh(R² + r² + Rr)  |  Slant L = √[ h² + (R - r)² ]  |  CSA = π(R + r)L',
    variables: {
      R: 'Radius of larger circular base',
      r: 'Radius of smaller circular top',
      h: 'Vertical height of frustum',
      L: 'Slant height of frustum'
    },
    tip: 'Total Surface Area = CSA + Top Area + Base Area = π(R+r)L + πr² + πR².',
    example: 'Frustum with R = 6, r = 3, h = 4: L = √[16 + 9] = 5. CSA = π(6+3)(5) = 45π.'
  },
  {
    id: 'geo-trig-1',
    name: 'Trigonometry: Heights & Distances Complementary Angles',
    category: 'Geometry & Mensuration',
    subcategory: 'Trigonometry & Heights',
    content: 'If angles of elevation from distances a and b are complementary: Height of Tower H = √(ab)',
    variables: {
      a: 'Distance of point 1 from base of tower',
      b: 'Distance of point 2 from base of tower',
      H: 'Height of the tower',
      Complementary: 'Angles sum to 90° (θ and 90° - θ)'
    },
    tip: 'Instant shortcut that avoids setting up tan(θ) and tan(90-θ) equations.',
    example: 'Angles of elevation of tower top from 4m and 9m are complementary: Height H = √(4 × 9) = √36 = 6 meters.'
  },
  {
    id: 'geo-coord-1',
    name: 'Coordinate Geometry: Distance, Section & Point-Line Distance',
    category: 'Geometry & Mensuration',
    subcategory: 'Coordinate Geometry',
    content: 'Distance = √[(x2-x1)² + (y2-y1)²]  |  Line Dist = |Ax0 + By0 + C| / √(A² + B²)',
    variables: {
      '(x0, y0)': 'Coordinates of external point',
      'Ax + By + C = 0': 'Standard equation of line',
      'Section Formula': 'Internal division: ( (mx2 + nx1)/(m+n), (my2 + ny1)/(m+n) )'
    },
    tip: 'Area of triangle formed by (x1,y1), (x2,y2), (x3,y3) = (1/2)|x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|.',
    example: 'Perpendicular distance from (0,0) to 3x + 4y - 10 = 0 is |0 + 0 - 10| / √(9 + 16) = 10 / 5 = 2.'
  },

  // =========================================================================
  // 6. MODERN MATH & STATISTICS (P&C, Probability, Venn, Statistics)
  // =========================================================================
  {
    id: 'mod-pc-1',
    name: 'Permutations & Combinations: Core Formulas & Identical Items',
    category: 'Modern Math & Stats',
    subcategory: 'Permutations & Combinations',
    content: 'nPr = n! / (n - r)!  |  nCr = n! / [ r!(n - r)! ]  |  Identical: n! / (p! × q! × r!)',
    variables: {
      n: 'Total number of items',
      r: 'Number of items chosen / arranged',
      'p, q, r': 'Counts of repeated identical items (e.g. letters in MISSISSIPPI)'
    },
    tip: 'Use Permutation (nPr) when order matters (seating, ranks). Use Combination (nCr) when only selection matters (teams, cards).',
    example: 'Ways to arrange letters of "BANANA" (6 letters: 3 A, 2 N, 1 B) = 6! / (3! × 2!) = 720 / 12 = 60.'
  },
  {
    id: 'mod-pc-2',
    name: 'Permutations & Combinations: Stars & Bars (Identical Distribution)',
    category: 'Modern Math & Stats',
    subcategory: 'Permutations & Combinations',
    content: 'Non-negative (x >= 0): (n + r - 1) C (r - 1)  |  Positive (x >= 1): (n - 1) C (r - 1)',
    variables: {
      n: 'Number of identical items to distribute',
      r: 'Number of distinct persons / bins receiving items'
    },
    tip: 'Non-negative allows receiving 0 items (whole numbers); positive requires each bin to get at least 1 item.',
    example: 'Distribute 10 identical chocolates among 3 kids (everyone gets >= 0): (10 + 3 - 1) C (3 - 1) = 12 C 2 = 66 ways.'
  },
  {
    id: 'mod-pc-3',
    name: 'Permutations & Combinations: Circular Permutations & Derangements',
    category: 'Modern Math & Stats',
    subcategory: 'Permutations & Combinations',
    content: 'Circular = (n - 1)!  |  Necklace = (n - 1)! / 2  |  Derangements D_n = n! Σ [ (-1)^k / k! ]',
    variables: {
      'Circular (n-1)!': 'Clockwise and counter-clockwise arrangements are distinct',
      'Necklace/Garland': 'Flipping over makes clockwise and counter-clockwise identical',
      'D_n (no item in original spot)': 'D1=0, D2=1, D3=2, D4=9, D5=44, D6=265'
    },
    tip: 'Memorize derangement counts: D1=0, D2=1, D3=2, D4=9, D5=44. Extremely frequent in CAT & CSAT.',
    example: '4 letters placed in 4 envelopes such that none goes into correct envelope: D4 = 9 ways.'
  },
  {
    id: 'mod-prob-1',
    name: 'Probability: Addition Rule, Conditional & Bayes’ Theorem',
    category: 'Modern Math & Stats',
    subcategory: 'Probability & Bayes',
    content: 'P(A U B) = P(A) + P(B) - P(A ∩ B)  |  P(A|B) = P(A ∩ B) / P(B)  |  Bayes: P(Ai|B) = P(B|Ai)P(Ai)/ΣP(B|Aj)P(Aj)',
    variables: {
      'P(A U B)': 'Probability that at least one of A or B occurs',
      'P(A ∩ B)': 'Joint probability (equals P(A)×P(B) for independent events)',
      'P(A|B)': 'Conditional probability of A given B has occurred'
    },
    tip: 'Complement rule: P(At least one) = 1 - P(None). Frequently much faster to compute.',
    example: 'Toss 3 coins. P(at least 1 head) = 1 - P(no heads) = 1 - (1/2)³ = 1 - 1/8 = 7/8.'
  },
  {
    id: 'mod-venn-1',
    name: 'Set Theory & Venn Diagrams: 3-Set Union',
    category: 'Modern Math & Stats',
    subcategory: 'Set Theory & Venn Diagrams',
    content: 'n(A U B U C) = Σn(A) - Σn(A ∩ B) + n(A ∩ B ∩ C)',
    variables: {
      'Σn(A)': 'n(A) + n(B) + n(C)',
      'Σn(A ∩ B)': 'n(A ∩ B) + n(B ∩ C) + n(C ∩ A)',
      'Exactly 1 Set': 'Σn(A) - 2Σn(A ∩ B) + 3n(A ∩ B ∩ C)',
      'Exactly 2 Sets': 'Σn(A ∩ B) - 3n(A ∩ B ∩ C)'
    },
    tip: 'Always populate the center intersection (all 3) first when solving Venn diagrams step-by-step.',
    example: 'If n(A)=20, n(B)=25, n(C)=30, pairwise intersections=10, all three=5: Total union = (20+25+30) - (30) + 5 = 50.'
  },
  {
    id: 'mod-stat-1',
    name: 'Statistics: Mean, Median, Empirical Mode & Variance',
    category: 'Modern Math & Stats',
    subcategory: 'Statistics',
    content: 'Mode = 3(Median) - 2(Mean)  |  Variance σ² = Σ(x - μ)² / N  |  Std Dev σ = √(Variance)',
    variables: {
      'Mode': 'Most frequent value in moderately skewed distribution',
      'Median': 'Middle value when dataset is sorted',
      'Mean (μ)': 'Arithmetic average of dataset',
      'Coefficient of Variation': 'CV = (σ / μ) × 100% (measures relative dispersion)'
    },
    tip: 'Empirical mode relation: 3(Median) = Mode + 2(Mean). If every observation is multiplied by k, standard deviation becomes k×σ.',
    example: 'If Mean = 15 and Median = 18: Mode = 3(18) - 2(15) = 54 - 30 = 24.'
  },

  // =========================================================================
  // 7. TRICKS & SHORTCUTS (Vedic Math, Mental Math, Fraction-Percentage Table)
  // =========================================================================
  {
    id: 'trk-sq-1',
    name: 'Squaring Numbers Ending in 5',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(N 5)² = [ N × (N + 1) ] || 25',
    variables: {
      N: 'Prefix number before the units digit 5',
      '||': 'Concatenate result digits with suffix 25'
    },
    tip: 'Works for any multi-digit number ending in 5.',
    example: '65² -> Prefix N=6 -> 6 × 7 = 42 -> Concatenate 25 -> 4225. 115² -> 11 × 12 = 132 -> 13225.'
  },
  {
    id: 'trk-sq-2',
    name: 'Base 50 Method for Fast Squaring (25 to 75)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(50 ± x)² = (25 ± x) || (x² in 2 digits)',
    variables: {
      x: 'Deviation of the number from base 50',
      '25 ± x': 'Left hand side part',
      'x²': 'Right hand side part (must always be written with 2 digits)'
    },
    tip: 'If x² has 3 digits, carry over the hundreds digit to the left side.',
    example: '54²: Deviation x = +4 -> LHS = 25 + 4 = 29, RHS = 4² = 16 -> 2916. 47²: x = -3 -> LHS = 25 - 3 = 22, RHS = (-3)² = 09 -> 2209.'
  },
  {
    id: 'trk-sq-3',
    name: 'Base 100 Method for Fast Squaring (75 to 125)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(100 ± x)² = (100 ± 2x) || (x² in 2 digits)',
    variables: {
      x: 'Deviation from 100',
      '100 ± 2x': 'Or equivalently: (Number ± x)',
      'x²': 'Square of deviation (2 digits)'
    },
    tip: 'Left side is simply Number + deviation; right side is square of deviation.',
    example: '106²: x = +6 -> LHS = 106 + 6 = 112, RHS = 6² = 36 -> 11236. 93²: x = -7 -> LHS = 93 - 7 = 86, RHS = (-7)² = 49 -> 8649.'
  },
  {
    id: 'trk-mult-1',
    name: 'Multiplication by 11 Shortcut',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '11 × (ABC) = A || (A+B) || (B+C) || C  [with carries if sum >= 10]',
    variables: {
      ABC: 'Any multi-digit number',
      Rule: 'Copy outer digits, add adjacent inner pairs from right to left with carry'
    },
    tip: 'For 2-digit number AB: 11 × AB = A || (A+B) || B.',
    example: '11 × 53 = 5 || (5+3) || 3 = 583. 11 × 784 = 7 || (7+8+carry) || (8+4) || 4 = 8624.'
  },
  {
    id: 'trk-mult-2',
    name: 'Multiplication by 25, 125, & 5',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: 'N × 5 = (N × 10) / 2  |  N × 25 = (N × 100) / 4  |  N × 125 = (N × 1000) / 8',
    variables: {
      N: 'Any number to be multiplied'
    },
    tip: 'Halving and quartering is far faster in mental math than full multi-digit multiplication.',
    example: '64 × 25 = 6400 / 4 = 1600. 48 × 125 = 48000 / 8 = 6000.'
  },
  {
    id: 'trk-mult-3',
    name: 'Multiply Numbers Near 100 (Nikhilam Sutra)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(100 - a)(100 - b) = (100 - a - b) || (a × b)  |  (100 + a)(100 + b) = (100 + a + b) || (a × b)',
    variables: {
      a: 'Deficit / surplus of first number from 100',
      b: 'Deficit / surplus of second number from 100',
      'a × b': 'Product of deficits/surpluses (2 digits)'
    },
    tip: 'Cross subtract/add: 96 × 94 has deficits -4 and -6. LHS = 96 - 6 = 90. RHS = (-4)×(-6) = 24 -> 9024.',
    example: '104 × 107: Surpluses +4, +7 -> LHS = 104 + 7 = 111, RHS = 4 × 7 = 28 -> 11128.'
  },
  {
    id: 'trk-mult-4',
    name: 'Same Tens Digit, Units Digits Sum to 10',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(T U1) × (T U2) = [ T × (T + 1) ] || (U1 × U2)  [when U1 + U2 = 10]',
    variables: {
      T: 'Common tens digit (e.g. 7 in 74 and 76)',
      'U1, U2': 'Units digits that sum to 10 (e.g. 4 + 6 = 10)'
    },
    tip: 'Vedic Sutra: "Ekadhikena Purvena" (By one more than the previous one).',
    example: '74 × 76 = (7 × 8) || (4 × 6) = 5624. 93 × 97 = (9 × 10) || (3 × 7) = 9021.'
  },
  {
    id: 'trk-digit-1',
    name: 'Digit Sum (Casting Out 9s) for MCQ Verification',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: 'Digit Sum (N) = Sum of digits reduced to single digit (modulo 9)',
    variables: {
      'Operation Invariance': 'DigitSum(A × B) = DigitSum(DigitSum(A) × DigitSum(B))',
      'Ignore 9s': 'Treat 9 and combinations summing to 9 (e.g. 7+2, 5+4) as 0'
    },
    tip: 'Eliminates 3 out of 4 multiple-choice options in seconds for complex additions, subtractions, and multiplications.',
    example: 'Verify 43 × 58 = 2494. LHS: 43 -> 7, 58 -> 13 -> 4. 7 × 4 = 28 -> 10 -> 1. RHS: 2494 -> (2+4+9+4)=19 -> 10 -> 1. Verified!'
  },
  {
    id: 'trk-pct-table',
    name: 'Fraction to Percentage Quick Conversion Table',
    category: 'Tricks & Shortcuts',
    subcategory: 'Fraction-Percentage Chart',
    content: '1/2=50% | 1/3=33.33% | 1/4=25% | 1/5=20% | 1/6=16.67% | 1/7=14.28% | 1/8=12.5% | 1/9=11.11% | 1/11=9.09% | 1/12=8.33% | 1/15=6.67% | 1/16=6.25%',
    variables: {
      '1/6': '16.67% (or 16 2/3%)',
      '1/7': '14.28% (or 14 2/8%)',
      '1/8': '12.5% (or 12 1/2%)',
      '1/9': '11.11% (or 11 1/9%)',
      '1/11': '9.09% (or 9 1/11%)',
      '1/12': '8.33% (or 8 1/3%)',
      '1/14': '7.14% (or 7 1/7%)',
      '1/16': '6.25% (or 6 1/4%)'
    },
    tip: 'Converting percentages to fractions simplifies quantitative word problems into simple integer arithmetic.',
    example: '37.5% of 640 = (3 × 12.5%) of 640 = (3/8) × 640 = 3 × 80 = 240.'
  }
];
