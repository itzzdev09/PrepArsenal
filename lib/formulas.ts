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
  // 1. SPEED, TIME & MOTION (Boats, Trains, Motion, Races, Work, Pipes)
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
      v_downstream: 'Effective speed when moving with current',
      v_upstream: 'Effective speed when moving against current'
    },
    tip: 'Downstream speed is always greater than upstream speed by 2v.',
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
    example: 'Boat = 9 km/h, stream = 3 km/h, round trip takes 3 hrs: D = 3 × (81 - 9) / (2 × 9) = 3 × 72 / 18 = 12 km.'
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
    example: 'Takes 3 times as long upstream as downstream: u/v = (3+1)/(3-1) = 4/2 = 2/1. Ratio is 2:1.'
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
    example: 'Boat takes 2 hrs downstream and 6 hrs upstream: T_drift = (2 × 2 × 6) / (6 - 2) = 24 / 4 = 6 hours.'
  },
  {
    id: 'stm-boat-6',
    name: 'Boats & Streams: Swimmer Crossing River (Shortest Path vs Shortest Time)',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: 'Shortest Time: T_min = Width / u (Aim 90° to bank) | Shortest Path: sin(θ) = v / u (Aim upstream)',
    variables: {
      Width: 'Perpendicular width of river',
      u: 'Swimmer / Boat speed in still water (must be > v for shortest path)',
      v: 'River current velocity',
      'θ': 'Angle with upstream normal direction'
    },
    tip: 'To reach directly opposite point (zero drift), row at an angle upstream such that net downstream drift is cancelled.',
    example: 'River width = 400m, swimmer = 5 m/s, stream = 3 m/s. Shortest crossing time = 400 / 5 = 80 seconds.'
  },
  {
    id: 'stm-boat-7',
    name: 'Boats & Streams: Constant Distance Speed-Time Relation',
    category: 'Speed, Time & Motion',
    subcategory: 'Boats & Streams',
    content: '(u + v) × t_down = (u - v) × t_up  ==>  u × (t_up - t_down) = v × (t_up + t_down)',
    variables: {
      u: 'Speed in still water',
      v: 'Speed of stream',
      t_down: 'Time taken downstream',
      t_up: 'Time taken upstream'
    },
    tip: 'Equating the distance travelled in both directions provides the fastest solution in variable-ratio problems.',
    example: 'If t_down = 4 hrs and t_up = 6 hrs: u × (6 - 4) = v × (6 + 4) ==> 2u = 10v ==> u/v = 5/1.'
  },
  {
    id: 'stm-train-1',
    name: 'Trains: Passing a Stationary Point / Pole / Standing Person',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'Time = Length_train / Speed_train',
    variables: {
      Length_train: 'Length of the train (meters)',
      Speed_train: 'Speed of train (m/s) [Multiply km/h by 5/18]'
    },
    tip: 'Poles, trees, and standing persons have negligible width; distance to cover is simply train’s own length.',
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
      Length_platform: 'Length of platform / bridge / tunnel',
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
    name: 'Trains: Crossing & Time to Reach Destination After Meeting',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'S1 / S2 = √(T2 / T1)  |  Distance between stations D = (S1 + S2) × √(T1 × T2)',
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
    id: 'stm-train-5',
    name: 'Trains: Train Passing a Person Moving in Same / Opposite Direction',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'Opposite: Time = L_train / (S_train + S_man)  |  Same Dir: Time = L_train / (S_train - S_man)',
    variables: {
      L_train: 'Length of the train',
      S_train: 'Speed of train in m/s',
      S_man: 'Speed of walking / running person in m/s'
    },
    tip: 'The distance is only the length of the train because the person has no significant length.',
    example: '150m train at 68 km/h passes a man running at 8 km/h in same direction: Rel speed = 60 km/h = 50/3 m/s. Time = 150/(50/3) = 9s.'
  },
  {
    id: 'stm-train-6',
    name: 'Trains: Finding Train Length & Speed from Two Platforms',
    category: 'Speed, Time & Motion',
    subcategory: 'Trains & Relative Speed',
    content: 'Speed = (L_plat2 - L_plat1) / (T2 - T1)  |  Length_train = Speed × T1 - L_plat1',
    variables: {
      L_plat1: 'Length of platform 1',
      T1: 'Time taken to cross platform 1',
      L_plat2: 'Length of platform 2',
      T2: 'Time taken to cross platform 2'
    },
    tip: 'Difference in crossing times is purely due to the difference in platform lengths.',
    example: 'Train crosses 100m platform in 10s and 200m platform in 15s: Speed = (200-100)/(15-10) = 20 m/s. L_train = 20(10)-100 = 100m.'
  },
  {
    id: 'stm-std-1',
    name: 'Speed Conversion Factor (km/h <-> m/s)',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: '1 km/h = 5/18 m/s  |  1 m/s = 18/5 km/h = 3.6 km/h',
    variables: {
      '5/18': '1000m / 3600s = 5/18',
      '18/5': 'Reciprocal conversion factor'
    },
    tip: 'To remember: km/h is larger unit -> multiply by smaller fraction 5/18 to get m/s.',
    example: '90 km/h = 90 × (5/18) = 25 m/s. 20 m/s = 20 × (18/5) = 72 km/h.'
  },
  {
    id: 'stm-std-2',
    name: 'Average Speed for Equal Distances (Harmonic Mean)',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: '2 Speeds: Avg = (2xy) / (x + y)  |  3 Speeds: Avg = (3xyz) / (xy + yz + zx)',
    variables: {
      x: 'Speed for first equal segment',
      y: 'Speed for second equal segment',
      z: 'Speed for third equal segment'
    },
    tip: 'Do NOT take simple arithmetic mean (x+y)/2 unless time spent at each speed is identical.',
    example: 'Go at 60 km/h and return at 40 km/h: Avg Speed = (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h.'
  },
  {
    id: 'stm-std-3',
    name: 'Average Speed for Equal Travel Times',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: 'Avg Speed = (S1 + S2 + ... + Sn) / n',
    variables: {
      S1: 'Speed during first time interval t',
      S2: 'Speed during second time interval t',
      n: 'Number of equal time intervals'
    },
    tip: 'When travel times are equal, average speed is the standard arithmetic mean.',
    example: 'Travels for 2 hrs at 40 km/h and next 2 hrs at 60 km/h: Avg Speed = (40 + 60) / 2 = 50 km/h.'
  },
  {
    id: 'stm-std-4',
    name: 'Early and Late Arrival Distance Shortcut',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: 'Distance = [ (S1 × S2) / |S1 - S2| ] × (ΔTime)',
    variables: {
      S1: 'Speed in first instance',
      S2: 'Speed in second instance',
      'ΔTime': 'Total difference in arrival times in hours'
    },
    tip: 'Late + Early = add times. Late + Late = subtract times. Ensure time difference is converted to hours!',
    example: 'At 4 km/h late by 15 min, at 6 km/h early by 5 min. Total diff = 20 min = 1/3 hr. D = (4 × 6)/2 × (1/3) = 12 × 1/3 = 4 km.'
  },
  {
    id: 'stm-std-5',
    name: 'Stoppage Time per Hour for Trains / Buses',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: 'Stoppage Time per Hour = [ (Speed_without_stops - Speed_with_stops) / Speed_without_stops ] × 60 min',
    variables: {
      Speed_without_stops: 'Speed excluding stoppages',
      Speed_with_stops: 'Average speed including stoppages'
    },
    tip: 'Numerator is the distance lost due to stops; dividing by continuous speed gives idle time.',
    example: 'Bus speed without stops = 54 km/h, with stops = 45 km/h. Stoppage = [(54 - 45)/54] × 60 = (9/54) × 60 = 10 min/hr.'
  },
  {
    id: 'stm-std-6',
    name: 'Police and Thief Chase / Relative Catching Time',
    category: 'Speed, Time & Motion',
    subcategory: 'Speed, Time & Distance',
    content: 'Time to Catch = Initial_Lead_Distance / (Speed_police - Speed_thief)',
    variables: {
      Initial_Lead_Distance: 'Initial gap between thief and policeman',
      Speed_police: 'Speed of pursuing officer (must be > Speed_thief)',
      Speed_thief: 'Speed of escaping thief'
    },
    tip: 'Distance covered by thief before being caught = Speed_thief × Time to Catch.',
    example: 'Thief has 200m lead at 10 km/h, police chases at 12 km/h (rel speed = 2 km/h = 5/9 m/s). Time = 200 / (5/9) = 360 sec (6 min).'
  },
  {
    id: 'stm-race-1',
    name: 'Circular Track: First Meeting & Distinct Meeting Points',
    category: 'Speed, Time & Motion',
    subcategory: 'Races & Circular Motion',
    content: 'Meeting time = Track_Length / (S1 ± S2)  |  Distinct points = (a ± b) / HCF(a, b)',
    variables: {
      Track_Length: 'Circumference of circular path',
      S1: 'Speed of runner 1',
      S2: 'Speed of runner 2',
      'a : b': 'Speed ratio S1 : S2 in lowest terms'
    },
    tip: 'Use (+) for opposite directions and (-) for same direction. First meeting at start point = LCM(L/S1, L/S2).',
    example: 'Speeds ratio 5:3 in opposite directions -> distinct meeting points = (5+3)/1 = 8 points.'
  },
  {
    id: 'stm-race-2',
    name: 'Linear Races: Head Start in Distance vs Head Start in Time',
    category: 'Speed, Time & Motion',
    subcategory: 'Races & Circular Motion',
    content: 'Head start of x meters: A runs D, B runs (D - x) | Head start of t sec: Time_B = Time_A + t',
    variables: {
      D: 'Total length of race track',
      x: 'Distance head start granted to slower runner',
      t: 'Time start delay given to faster runner',
      'Dead Heat': 'Both runners reach finish line at the exact same instant'
    },
    tip: 'If A beats B by x meters and t seconds, then Speed of B = x / t.',
    example: 'In a 100m race, A beats B by 20m or 4 seconds: Speed of B = 20 / 4 = 5 m/s. Time taken by B = 100/5 = 20s, by A = 16s.'
  },
  {
    id: 'stm-race-3',
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
    tip: 'Walking in direction of escalator motion adds steps (+); walking against subtracts (-).',
    example: 'Person A takes 30 steps in 20s, Person B takes 40 steps in 15s in moving direction. Equate N = 30 + 20v = 40 + 15v -> v = 2 -> N = 70.'
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
    example: '12 men working 8 hrs/day dig a trench in 10 days. 16 men working 6 hrs/day take D2 = (12×8×10)/(16×6) = 10 days.'
  },
  {
    id: 'stm-work-3',
    name: 'Work Efficiency to Time Ratio Inversion',
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
    id: 'stm-work-4',
    name: 'Work on Alternate Days (A on Day 1, B on Day 2)',
    category: 'Speed, Time & Motion',
    subcategory: 'Time & Work',
    content: 'Cycle Work in 2 days = (1/A + 1/B)  |  Total Time = 2 × (Full Cycles) + Remainder Work / Rate_next',
    variables: {
      A: 'Days taken by A alone',
      B: 'Days taken by B alone',
      'Cycle Work': 'Work completed in 2 consecutive days by alternating workers'
    },
    tip: 'Find LCM of days to assign total work units; complete integer multiples of 2-day cycles first.',
    example: 'A takes 12 days (5 units/day), B takes 15 days (4 units/day) for 60 units. In 2 days = 9 units. 6 cycles (12 days) = 54 units. Day 13: A does 5 units (59 total). Day 14: B does 1/4 unit. Total = 13 1/4 days.'
  },
  {
    id: 'stm-work-5',
    name: 'Worker Leaving Before Completion of Work Shortcut',
    category: 'Speed, Time & Motion',
    subcategory: 'Time & Work',
    content: 'Total Days T = (Total_Work + Work_left_worker_would_have_done) / Total_Combined_Efficiency',
    variables: {
      Total_Work: 'LCM of individual completion times (in units)',
      Work_left: 'Efficiency of leaving person × number of days before completion they left'
    },
    tip: 'Adding the phantom work of the person who left allows you to divide by the combined team efficiency.',
    example: 'A (10 days, 6 u/d), B (15 days, 4 u/d), total 60 u. A leaves 2 days before completion: T = (60 + 2×6) / (6 + 4) = 72 / 10 = 7.2 days.'
  },
  {
    id: 'stm-work-6',
    name: 'Wages and Bonus Sharing in Proportion to Work Done',
    category: 'Speed, Time & Motion',
    subcategory: 'Time & Work',
    content: 'Wage Share = Total_Wage × (Individual_Work_Done / Total_Work) = Total_Wage × (Efficiency × Days)',
    variables: {
      Individual_Work_Done: 'Fraction or units of work performed by the specific worker',
      Total_Wage: 'Total monetary compensation for the job'
    },
    tip: 'Wages are distributed in ratio of efficiency ONLY if all workers worked for the same number of days.',
    example: 'A and B do a work for $300. A does in 6 days, B in 8 days (efficiencies 4:3). A’s share = 300 × (4/7) = $171.43.'
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
    example: 'A pipe fills in 6 hrs, but takes 8 hrs due to leak. Leak alone empties full tank in (6 × 8) / (8 - 6) = 24 hours.'
  },
  {
    id: 'stm-pipe-2',
    name: 'Pipes Flow Rate & Pipe Radius Proportionality',
    category: 'Speed, Time & Motion',
    subcategory: 'Pipes & Cisterns',
    content: 'Flow Rate Q ∝ Area of Cross-Section ∝ r² ∝ d²',
    variables: {
      r: 'Internal radius of pipe',
      d: 'Internal diameter of pipe',
      Q: 'Volumetric discharge rate (L/min or m³/s)'
    },
    tip: 'Doubling pipe diameter quadruples (4x) the flow rate and cuts filling time to 1/4th.',
    example: 'Pipes of diameter 1cm, 2cm, 4cm: Flow rates are in ratio 1² : 2² : 4² = 1 : 4 : 16.'
  },

  // =========================================================================
  // 2. LOGICAL REASONING & ANALYTICAL APTITUDE
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
    example: 'How many times do hands make a straight line (0° or 180°) in 24 hours? Exactly 22 + 22 = 44 times.'
  },
  {
    id: 'lr-clock-3',
    name: 'Clocks: Exact Time of Coincidence / Right Angle / Opposite',
    category: 'Logical Reasoning',
    subcategory: 'Clocks & Angles',
    content: 'Coincide: M = (60/11) × H  |  Right Angle: M = (60/11) × (H ± 3)  |  Opposite: M = (60/11) × (H ± 6)',
    variables: {
      H: 'Starting hour (between H and H+1)',
      M: 'Minutes past the hour H'
    },
    tip: 'If (H ± k) < 0, add 12; if > 12, subtract 12.',
    example: 'Between 4 and 5 o’clock, hands coincide at M = (60/11) × 4 = 240/11 = 21 9/11 min past 4.'
  },
  {
    id: 'lr-clock-4',
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
    id: 'lr-clock-5',
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
    name: 'Calendars: Odd Days Breakdown & Century Codes',
    category: 'Logical Reasoning',
    subcategory: 'Calendars & Dates',
    content: 'Ord Year = 1 Odd Day | Leap Year = 2 Odd Days | 100yr = 5, 200yr = 3, 300yr = 1, 400yr = 0',
    variables: {
      'Day Codes': '0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat',
      'Century Codes': '1600s=6, 1700s=4, 1800s=2, 1900s=0, 2000s=6 (Pattern: 6,4,2,0)',
      'Leap Century': 'Century years divisible by 400 (e.g. 1600, 2000, 2400)'
    },
    tip: 'Last day of a century CANNOT be Tuesday, Thursday, or Saturday.',
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
    tip: 'Subtract 1 because the single person is counted twice (once from left, once from right).',
    example: 'Aman is 14th from left and 23rd from right: Total = 14 + 23 - 1 = 36 persons.'
  },
  {
    id: 'lr-rank-2',
    name: 'Order & Ranking: Overlapping (Minimum) vs Non-Overlapping Case',
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
    name: 'Syllogisms: "Only a Few" & "Few" Rules',
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
    id: 'lr-syl-3',
    name: 'Syllogisms: Universal Conversion & Possibility Rules',
    category: 'Logical Reasoning',
    subcategory: 'Syllogisms & Deductive Logic',
    content: 'All A are B -> Some B are A | No A is B -> No B is A | Some A are B -> Some B are A',
    variables: {
      'Some A are not B': 'CANNOT be converted directly into "Some B are not A"',
      'Possibility Rule': 'If definite relation exists, possibility is FALSE; if no definite relation exists, possibility is TRUE'
    },
    tip: 'When all statements are positive, no definite negative conclusion can ever follow.',
    example: 'Statement: "All apples are red." Conversion: "Some red things are apples" is valid.'
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
    id: 'lr-dice-2',
    name: 'Open Dice Net Folding: Opposite Face Pattern',
    category: 'Logical Reasoning',
    subcategory: 'Cubes & Dice',
    content: 'Alternate faces in a straight row / column are opposite each other (1 face gap)',
    variables: {
      'Rule 1': 'Faces with a single face between them in the same row/col are opposite',
      'Rule 2': 'Opposite faces can NEVER touch each other (no shared vertex or edge)'
    },
    tip: 'Check folded cube options by verifying that no pair of opposite faces appears simultaneously in the same 3-face view.',
    example: 'In a strip 1 - 2 - 3 - 4: 1 is opposite 3, 2 is opposite 4.'
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
    name: 'Figure Counting: Triangles in Apex-Sliced & Diagonal Grids',
    category: 'Logical Reasoning',
    subcategory: 'Figure Counting',
    content: 'Apex sliced into n parts: n(n+1)/2  |  Square diagonals with n sectors: 2n  |  Nested triangles: 4n + 1',
    variables: {
      n: 'Number of individual sub-triangles or sectors',
      'Square diagonals': 'A square divided by 2 diagonals has 4 parts -> 2(4) = 8 triangles',
      'Nested triangles': 'n = number of internal inverted triangles'
    },
    tip: 'For a triangle with horizontal floors/lines h, total triangles = h × [n(n+1)/2].',
    example: 'A triangle divided into 4 base segments with 3 horizontal lines has 3 × [4(5)/2] = 30 triangles.'
  },
  {
    id: 'lr-fig-2',
    name: 'Figure Counting: Squares & Rectangles in an m x n Grid',
    category: 'Logical Reasoning',
    subcategory: 'Figure Counting',
    content: 'Squares = Σ (m × n)  |  Rectangles = [ m(m+1)/2 ] × [ n(n+1)/2 ]',
    variables: {
      'm, n': 'Number of rows and columns in grid (decrement each step down to 1 for squares)',
      'Σ(m × n)': 'm·n + (m-1)(n-1) + (m-2)(n-2) + ...'
    },
    tip: 'For an n x n square grid: Total squares = n(n+1)(2n+1)/6. Total rectangles (incl squares) = [n(n+1)/2]².',
    example: 'In a 4 x 3 grid: Squares = 4(3) + 3(2) + 2(1) = 12 + 6 + 2 = 20. Rectangles = [4(5)/2] × [3(4)/2] = 10 × 6 = 60.'
  },
  {
    id: 'lr-blood-1',
    name: 'Blood Relations: Generational Tree & Standard Notation',
    category: 'Logical Reasoning',
    subcategory: 'Blood Relations',
    content: '+2: Grandparents | +1: Parents/Uncle/Aunt | 0: Siblings/Spouse | -1: Children | -2: Grandchildren',
    variables: {
      'Male (+)': 'Denoted with plus or square box',
      'Female (-)': 'Denoted with minus or circle',
      'Spouse (=)': 'Double horizontal line',
      'Siblings (-)': 'Single horizontal line',
      'Generational step ( | )': 'Vertical downward line'
    },
    tip: 'In coded blood relations (e.g. A + B * C - D), decode from right to left to avoid multiple assumptions.',
    example: '"Pointing to a man, a woman said: He is the only son of my mother’s husband." Mother’s husband = Father -> Only son = Brother.'
  },
  {
    id: 'lr-crit-1',
    name: 'Critical Reasoning: Statement & Assumption Negation Test',
    category: 'Logical Reasoning',
    subcategory: 'Critical & Analytical Logic',
    content: 'Negate the Assumption: If Negated Assumption INVALIDATES the conclusion, the assumption is IMPLICIT',
    variables: {
      'Implicit Assumption': 'An unstated premise absolutely necessary for the argument to hold',
      'Negation Test': 'Assume "NOT [Assumption]". If argument collapses, it is a valid assumption.'
    },
    tip: 'Assumptions can never exceed the scope of the statement. Avoid extreme words (Only, Always, All, Never).',
    example: 'Statement: "Take flight X to arrive on time." Assumption: "Flight X is reliable." Negate: "Flight X is not reliable" -> Statement collapses -> Assumption is IMPLICIT.'
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
    id: 'arith-pct-3',
    name: 'Percentage: Population Growth & Machine Depreciation',
    category: 'Arithmetic',
    subcategory: 'Percentages',
    content: 'After n years: P_n = P_0 × (1 ± R/100)ⁿ  |  n years ago: P_ago = P_0 / (1 ± R/100)ⁿ',
    variables: {
      P_0: 'Current present population or value',
      R: 'Annual rate of increase (+) or depreciation (-)',
      n: 'Number of years'
    },
    tip: 'Use (+) for population growth and (-) for machine depreciation.',
    example: 'Machine value $10,000 depreciates at 10%/yr. After 2 yrs = 10000(1 - 0.1)² = 10000(0.81) = $8,100.'
  },
  {
    id: 'arith-pct-4',
    name: 'Percentage: Passing Marks & Maximum Marks Shortcut',
    category: 'Arithmetic',
    subcategory: 'Percentages',
    content: 'Max Marks = [ (Marks_failed_by + Marks_excess_passed) / (P2% - P1%) ] × 100',
    variables: {
      P1: 'Percentage scored by candidate 1 (who failed by marks_failed_by)',
      P2: 'Percentage scored by candidate 2 (who scored marks_excess_passed above pass mark)'
    },
    tip: 'Add the deficit and excess marks, divide by the percentage point gap, and multiply by 100.',
    example: 'A scores 30% and fails by 15 marks. B scores 40% and gets 35 marks more than pass mark: Max = [(15 + 35) / (40 - 30)] × 100 = (50/10) × 100 = 500.'
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
    example: 'Two articles sold for $990 each: one at 10% profit, other at 10% loss. Overall loss = 10² / 100 = 1% loss.'
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
    id: 'arith-pl-4',
    name: 'Profit & Loss: Successive Discounts & "Buy X Get Y Free"',
    category: 'Arithmetic',
    subcategory: 'Profit & Loss',
    content: 'Equiv Discount = d1 + d2 - (d1 × d2)/100  |  "Buy x get y free" Discount% = [ y / (x + y) ] × 100',
    variables: {
      d1: 'First trade discount %',
      d2: 'Second trade discount %',
      x: 'Number of articles paid for',
      y: 'Number of free articles received'
    },
    tip: 'In "Buy x get y free", the total articles received is (x + y), which forms the base denominator.',
    example: '"Buy 3 Get 1 Free": Discount% = [1 / (3 + 1)] × 100 = 1/4 × 100 = 25% discount.'
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
    name: 'Compound Interest: Compounding Frequencies & Growth',
    category: 'Arithmetic',
    subcategory: 'Simple & Compound Interest',
    content: 'Half-Yearly: A = P(1 + R/200)^(2T)  |  Quarterly: A = P(1 + R/400)^(4T)  |  Rule of 72: T ≈ 72/R',
    variables: {
      A: 'Final amount',
      P: 'Principal',
      R: 'Nominal annual rate (%)',
      T: 'Time in years',
      'Rule of 72': 'Approximate years required to double the money at compound rate R%'
    },
    tip: 'If sum becomes n times in T years in CI, it becomes n^k times in (k × T) years.',
    example: '$10,000 at 20% compounded half-yearly for 1 yr: A = 10000(1 + 10/100)² = 10000(1.21) = $12,100.'
  },
  {
    id: 'arith-int-3',
    name: 'Simple Interest: Equal Annual Installment Formula',
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
    id: 'arith-int-4',
    name: 'Compound Interest: Equal Annual Installment Formula',
    category: 'Arithmetic',
    subcategory: 'Simple & Compound Interest',
    content: 'Loan Principal P = x / (1 + R/100) + x / (1 + R/100)² + ... + x / (1 + R/100)ⁿ',
    variables: {
      P: 'Loan borrowed',
      x: 'Equal annual installment amount',
      R: 'Annual interest rate',
      n: 'Number of installments'
    },
    tip: 'For 2 equal annual installments: P = x / (1 + R/100) × [ 1 + 1/(1 + R/100) ].',
    example: 'Borrow $2100 at 10% CI in 2 equal annual installments: 2100 = x(10/11) + x(100/121) = x(210/121) -> x = $1210/year.'
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
    id: 'arith-avg-2',
    name: 'Averages: Consecutive Numbers & AP Average Rules',
    category: 'Arithmetic',
    subcategory: 'Averages & Ratios',
    content: 'AP Avg = (First + Last)/2 | 1st n Natural: (n+1)/2 | 1st n Even: (n+1) | 1st n Odd: n',
    variables: {
      n: 'Number of consecutive terms'
    },
    tip: 'For any symmetric or AP sequence, the average equals the median (exact middle value).',
    example: 'Average of first 50 odd numbers is exactly 50. Average of first 50 natural numbers is (50+1)/2 = 25.5.'
  },
  {
    id: 'arith-rat-1',
    name: 'Ratio & Proportion: Proportional Values & Componendo-Dividendo',
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
  {
    id: 'arith-part-1',
    name: 'Partnership: Profit Distribution & Active Partner Salary',
    category: 'Arithmetic',
    subcategory: 'Averages & Ratios',
    content: 'Profit Ratio = (C1 × T1) : (C2 × T2) : (C3 × T3)',
    variables: {
      C: 'Capital invested by each partner',
      T: 'Time period for which capital remained invested'
    },
    tip: 'For active/working partners, deduct management salary first from total profit before splitting remaining profit in capital-time ratio.',
    example: 'A invests $5000 for 12 mos, B invests $6000 for 8 mos: Ratio = (5000×12) : (6000×8) = 60000 : 48000 = 5 : 4.'
  },

  // =========================================================================
  // 4. ALGEBRA & NUMBER SYSTEMS (Identities, Quadratics, AP/GP, Remainders)
  // =========================================================================
  {
    id: 'alg-id-1',
    name: 'Algebra: Symmetric Reciprocal Powers (x + 1/x = k)',
    category: 'Algebra & Numbers',
    subcategory: 'Algebraic Identities',
    content: 'x² + 1/x² = k² - 2  |  x³ + 1/x³ = k³ - 3k  |  x⁴ + 1/x⁴ = (k² - 2)² - 2  |  x⁶ + 1/x⁶ = (k³ - 3k)² - 2',
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
    id: 'alg-id-3',
    name: 'Algebra: Difference of Squares & Higher Binomial Expansions',
    category: 'Algebra & Numbers',
    subcategory: 'Algebraic Identities',
    content: '(a+b)² + (a-b)² = 2(a² + b²)  |  (a+b)² - (a-b)² = 4ab  |  (a+b+c)² = a²+b²+c² + 2(ab+bc+ca)',
    variables: {
      'a, b, c': 'Algebraic terms'
    },
    tip: 'Used for instant cancellation in numerical fractions.',
    example: '(105 + 95)² - (105 - 95)² = 4(105)(95) = 39,900.'
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
    id: 'alg-quad-2',
    name: 'Quadratic Equations: Symmetric Root Relations',
    category: 'Algebra & Numbers',
    subcategory: 'Quadratic Equations',
    content: '|α - β| = √D / |a|  |  α² + β² = (b² - 2ac)/a²  |  1/α + 1/β = -b/c',
    variables: {
      'α, β': 'Roots of ax² + bx + c = 0',
      D: 'Discriminant b² - 4ac'
    },
    tip: 'Reciprocal roots occur when c = a. Roots of equal magnitude but opposite signs occur when b = 0.',
    example: 'For x² - 5x + 6 = 0: α+β = 5, αβ = 6 -> |α - β| = √(25 - 24) = 1. α² + β² = 25 - 12 = 13.'
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
    example: 'Sum of first 20 odd numbers (a=1, d=2, n=20): Sn = 20² = 400.'
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
    content: '3 & 9: Sum of digits | 4 & 8: Last 2 & 3 digits | 7 & 13: Group by 3s from right | 11: Odd-Even digit sum diff',
    variables: {
      'Rule for 7 & 13': 'Alternating sum of 3-digit blocks from right must be divisible by 7 or 13',
      'Rule for 11': '(Sum of digits at odd places) - (Sum of digits at even places) = 0 or multiple of 11'
    },
    tip: 'If a number is divisible by both co-prime numbers a and b, it is divisible by (a × b). (e.g. 72 = 8 × 9).',
    example: 'Check 121: (1+1) - 2 = 0 -> Divisible by 11. Check 735: 73 - 2(5) = 63 (divisible by 7) -> Divisible by 7.'
  },
  {
    id: 'alg-num-4',
    name: 'Number Systems: Remainder Theorems (Fermat & Wilson)',
    category: 'Algebra & Numbers',
    subcategory: 'Number Systems & Factors',
    content: 'Fermat: a^(p-1) ≡ 1 (mod p) [for prime p]  |  Wilson: (p-1)! ≡ -1 (mod p)  |  (a±1)ⁿ / a Remainder',
    variables: {
      p: 'Prime divisor',
      a: 'Integer co-prime to p'
    },
    tip: 'For (a+1)ⁿ / a, remainder is always 1. For (a-1)ⁿ / a, remainder is 1 (if n is even) or (a-1) (if n is odd).',
    example: 'Remainder of 2¹⁰⁰ / 101 (101 is prime): By Fermat’s Little Theorem, 2¹⁰⁰ ≡ 1 (mod 101). Remainder is 1.'
  },
  {
    id: 'alg-num-5',
    name: 'Number Systems: Unit Digit Cyclicity Rules',
    category: 'Algebra & Numbers',
    subcategory: 'Number Systems & Factors',
    content: 'Cyclicity 4: (2, 3, 7, 8) | Cyclicity 2: (4, 9) | Cyclicity 1: (0, 1, 5, 6)',
    variables: {
      'Periodicity 4': 'Divide exponent by 4: remainder r gives power (if r=0, use power 4)',
      'Periodicity 2': '4^(odd)=4, 4^(even)=6  |  9^(odd)=9, 9^(even)=1'
    },
    tip: 'Only the unit digit of base and reduced power (mod 4) determine the final unit digit.',
    example: 'Unit digit of 7⁹⁵: 95 % 4 = 3 -> 7³ = 343 -> Unit digit is 3.'
  },
  {
    id: 'alg-num-6',
    name: 'Number Systems: HCF & LCM Fractions & Divisor Rules',
    category: 'Algebra & Numbers',
    subcategory: 'Number Systems & Factors',
    content: 'HCF(Fractions) = HCF(Num) / LCM(Den)  |  LCM(Fractions) = LCM(Num) / HCF(Den)  |  HCF × LCM = A × B',
    variables: {
      Num: 'Numerators of fractions',
      Den: 'Denominators of fractions',
      'A, B': 'Two positive integers'
    },
    tip: 'Largest number dividing x, y, z leaving same remainder = HCF(|x-y|, |y-z|, |z-x|).',
    example: 'HCF of 2/3 and 8/9 = HCF(2,8) / LCM(3,9) = 2 / 9.'
  },
  {
    id: 'alg-log-1',
    name: 'Logarithms: Fundamental Properties & Number of Digits',
    category: 'Algebra & Numbers',
    subcategory: 'Surds & Logarithms',
    content: 'log(ab) = log a + log b  |  log(a/b) = log a - log b  |  log_b a = (log a)/(log b)  |  Digits in aⁿ = ⌊n log10(a)⌋ + 1',
    variables: {
      'log_b a': 'Logarithm of a to base b',
      'Digits in aⁿ': 'Number of digits in large power expressions'
    },
    tip: 'log(1) = 0 for any base. log_a a = 1. a^(log_a x) = x.',
    example: 'Number of digits in 2⁶⁴ (log10(2) ≈ 0.3010): Digits = ⌊64 × 0.3010⌋ + 1 = ⌊19.264⌋ + 1 = 20 digits.'
  },
  {
    id: 'alg-surd-1',
    name: 'Surds: Infinite Nested Radical Shortcuts',
    category: 'Algebra & Numbers',
    subcategory: 'Surds & Logarithms',
    content: '√(x + √(x + ...)) = (1 + √(1+4x)) / 2  |  √(x - √(x - ...)) = (-1 + √(1+4x)) / 2  |  √(x √(x ...)) = x',
    variables: {
      x: 'Positive constant under repeated root'
    },
    tip: 'If x factors as n(n+1), then √(x + √(x + ...)) = (n+1) and √(x - √(x - ...)) = n directly.',
    example: '√(12 + √(12 + √(12...))) = 4 (since 12 = 3 × 4). √(6 - √(6 - √(6...))) = 2 (since 6 = 2 × 3).'
  },

  // =========================================================================
  // 5. GEOMETRY, MENSURATION & TRIGONOMETRY
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
    id: 'geo-tri-4',
    name: 'Triangles: Sine Rule & Cosine Rule',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'Sine Rule: a/sin(A) = b/sin(B) = c/sin(C) = 2R  |  Cosine: cos(A) = (b² + c² - a²) / (2bc)',
    variables: {
      'a, b, c': 'Sides opposite to angles A, B, C',
      R: 'Circumradius of triangle'
    },
    tip: 'Use Cosine rule to find angles given 3 sides, or to find 3rd side given 2 sides and included angle.',
    example: 'In triangle with b=3, c=5, A=60°: a² = 3² + 5² - 2(3)(5)cos(60°) = 9 + 25 - 15 = 19 -> a = √19.'
  },
  {
    id: 'geo-tri-5',
    name: 'Triangles: Angle Bisector Theorem & Centroid',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'Angle Bisector: AB / AC = BD / DC  |  Centroid G divides median in 2 : 1 ratio',
    variables: {
      AD: 'Internal angle bisector from vertex A meeting BC at D',
      G: 'Centroid (intersection of all 3 medians)'
    },
    tip: 'Area of triangle formed by medians = (4/3) × Area of original triangle.',
    example: 'In triangle ABC, AB=6, AC=8, BC=7. Bisector AD divides BC into BD and DC: BD/DC = 6/8 = 3/4 -> BD = 3, DC = 4.'
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
    id: 'geo-cir-3',
    name: 'Circles: Cyclic Quadrilateral (Brahmagupta & Ptolemy)',
    category: 'Geometry & Mensuration',
    subcategory: 'Circles & Tangents',
    content: 'Area = √[(s-a)(s-b)(s-c)(s-d)]  |  Ptolemy: d1 × d2 = (a × c) + (b × d)',
    variables: {
      'a, b, c, d': 'Sides of cyclic quadrilateral in order',
      s: 'Semi-perimeter = (a + b + c + d) / 2',
      'd1, d2': 'Lengths of the two diagonals'
    },
    tip: 'Opposite angles of a cyclic quadrilateral always sum to 180°.',
    example: 'Cyclic quadrilateral with sides 1, 2, 3, 4: s = 5. Area = √[(4)(3)(2)(1)] = √24 = 2√6.'
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
    id: 'geo-quad-1',
    name: 'Quadrilaterals: Rhombus, Trapezium & Parallelogram Areas',
    category: 'Geometry & Mensuration',
    subcategory: 'Triangles & Polygons',
    content: 'Rhombus: Area = 1/2 × d1 × d2, Side a = 1/2√(d1² + d2²) | Trapezium: 1/2 × (a + b) × h',
    variables: {
      'd1, d2': 'Diagonals of rhombus (intersect at 90°)',
      'a, b': 'Parallel sides of trapezium',
      h: 'Perpendicular distance between parallel sides'
    },
    tip: '4 × a² = d1² + d2² for any rhombus.',
    example: 'Rhombus diagonals 12cm and 16cm: Area = 1/2(12)(16) = 96 cm². Side = 1/2√(144+256) = 1/2(20) = 10 cm.'
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
    id: 'geo-sol-3',
    name: '3D Mensuration: Cuboid, Cube & Diagonal Formula',
    category: 'Geometry & Mensuration',
    subcategory: '3D Solids & Mensuration',
    content: 'Cuboid: V = lbh, TSA = 2(lb + bh + hl), Diag = √(l² + b² + h²) | Cube: V = a³, Diag = a√3',
    variables: {
      'l, b, h': 'Length, breadth, height of room / cuboid',
      Diag: 'Longest rod that can be placed inside the room'
    },
    tip: 'Longest rod in a room is the 3D space diagonal = √(l² + b² + h²).',
    example: 'Room of 10m × 10m × 5m: Longest rod = √(100 + 100 + 25) = √225 = 15 meters.'
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
    id: 'geo-trig-2',
    name: 'Trigonometry: Maximum and Minimum Value of a sin(θ) + b cos(θ)',
    category: 'Geometry & Mensuration',
    subcategory: 'Trigonometry & Heights',
    content: 'Max = +√(a² + b²)  |  Min = -√(a² + b²)',
    variables: {
      'a, b': 'Coefficients of sin(θ) and cos(θ)'
    },
    tip: 'For a sin²(θ) + b csc²(θ) or a tan²(θ) + b cot²(θ), minimum value is 2√(ab).',
    example: 'For 3 sin(θ) + 4 cos(θ): Maximum value = +√(9 + 16) = 5. Minimum value = -5.'
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
    id: 'mod-pc-4',
    name: 'Combinatorics: Lines, Handshakes & Diagonals from n Points',
    category: 'Modern Math & Stats',
    subcategory: 'Permutations & Combinations',
    content: 'Handshakes / Lines = nC2 = n(n-1)/2  |  Triangles = nC3  |  Diagonals = n(n-3)/2',
    variables: {
      n: 'Total number of people or non-collinear vertices'
    },
    tip: 'If m points out of n are collinear, triangles formed = nC3 - mC3.',
    example: '12 people shake hands with each other once: Total handshakes = 12(11)/2 = 66.'
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
    id: 'mod-prob-2',
    name: 'Probability: Binomial Distribution (Successes in n Trials)',
    category: 'Modern Math & Stats',
    subcategory: 'Probability & Bayes',
    content: 'P(X = k) = nCk × p^k × (1-p)^(n-k)  |  Mean = np  |  Variance = np(1-p)',
    variables: {
      n: 'Number of independent repeated trials',
      k: 'Exact number of successful outcomes desired',
      p: 'Probability of success in a single trial'
    },
    tip: 'Variance is always strictly less than the mean in a Binomial distribution.',
    example: 'Rolling a 6 in 5 dice tosses: n=5, p=1/6, k=2 -> P(X=2) = 5C2 × (1/6)² × (5/6)³ = 10 × (1/36) × (125/216).'
  },
  {
    id: 'mod-venn-1',
    name: 'Set Theory & Venn Diagrams: 3-Set Union & Intersection',
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
  {
    id: 'mod-cagr-1',
    name: 'Data Interpretation: Compound Annual Growth Rate (CAGR)',
    category: 'Modern Math & Stats',
    subcategory: 'Statistics',
    content: 'CAGR = [ (Ending_Value / Beginning_Value)^(1 / n) - 1 ] × 100%',
    variables: {
      Ending_Value: 'Value at final year',
      Beginning_Value: 'Value at base year',
      n: 'Number of compounding periods / years'
    },
    tip: 'CAGR smoothens out annual fluctuations to provide annualized constant growth percentage.',
    example: 'Revenue grows from $100M to $144M in 2 years: CAGR = √(144/100) - 1 = 1.2 - 1 = 20% annual growth.'
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
    id: 'trk-sq-4',
    name: 'Squaring Repeated 1s and Repeated 9s',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(11..1)² = 123..k..321  |  (99..9)² = (9..9 8 0..0 1)',
    variables: {
      k: 'Number of digits of 1s',
      '(999)²': '998001 (Number of 9s minus 1, followed by 8, equal count of 0s, ends in 1)'
    },
    tip: 'Saves time in competitive quantitative aptitude simplification questions.',
    example: '1111² = 1234321. 9999² = 99980001.'
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
    id: 'trk-root-1',
    name: 'Fast Square Root Estimation for Non-Perfect Squares',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '√(N) ≈ √(A) + (N - A) / [ 2√(A) ]',
    variables: {
      N: 'Target non-perfect square number',
      A: 'Nearest known perfect square to N'
    },
    tip: 'Derived from first-order Taylor expansion; accurate to 2 decimal places.',
    example: '√67: Nearest square A=64 (√64=8). √67 ≈ 8 + (67 - 64)/(2 × 8) = 8 + 3/16 = 8 + 0.1875 = 8.1875 (Actual ≈ 8.185).'
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
    content: '1/2=50% | 1/3=33.33% | 1/4=25% | 1/5=20% | 1/6=16.67% | 1/7=14.28% | 1/8=12.5% | 1/9=11.11% | 1/11=9.09% | 1/12=8.33% | 1/15=6.67% | 1/16=6.25% | 1/20=5% | 1/25=4%',
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
  },

  // =========================================================================
  // FINANCIAL & COMMERCIAL MATHEMATICS (Banking, Discount, Perpetuity, Shares)
  // =========================================================================
  {
    id: 'fin-ear-1',
    name: 'Effective Annual Rate (EAR) from Nominal Compounding',
    category: 'Arithmetic',
    subcategory: 'Financial Math',
    content: 'EAR = (1 + r / m)^m - 1',
    variables: {
      EAR: 'Effective annual percentage yield / true interest earned per year',
      r: 'Nominal annual interest rate (in decimal format, e.g. 0.12 for 12%)',
      m: 'Compounding frequency per year (m=2 half-yearly, m=4 quarterly, m=12 monthly)'
    },
    tip: 'For continuous compounding: EAR = e^r - 1.',
    example: '12% nominal compounded quarterly (m=4): EAR = (1 + 0.12/4)⁴ - 1 = (1.03)⁴ - 1 = 1.1255 - 1 = 12.55%.'
  },
  {
    id: 'fin-perp-1',
    name: 'Perpetuity & Growing Perpetuity Present Value',
    category: 'Arithmetic',
    subcategory: 'Financial Math',
    content: 'PV_constant = C / r  |  PV_growing = C1 / (r - g)',
    variables: {
      PV: 'Present value of infinite cash flows',
      C: 'Constant periodic cash flow amount',
      C1: 'First period cash flow in growing perpetuity',
      r: 'Discount rate / required rate of return per period',
      g: 'Constant perpetual growth rate of cash flow (where r > g)'
    },
    tip: 'Crucial for RBI Grade B & SEBI Grade A finance and valuation questions.',
    example: 'A perpetual bond pays ₹6,000 annually at a 10% discount rate: PV = 6000 / 0.10 = ₹60,000.'
  },
  {
    id: 'fin-disc-1',
    name: "True Discount, Banker's Discount & Banker's Gain",
    category: 'Arithmetic',
    subcategory: 'Commercial & Discount Math',
    content: 'BG = BD - TD = (TD)² / PW = (TD × r × t) / 100  |  Sum = (BD × TD) / (BD - TD)',
    variables: {
      PW: 'Present Worth (the money value right now)',
      TD: 'True Discount (Interest on Present Worth: PW × r × t / 100)',
      BD: 'Banker’s Discount (Simple Interest on the face value / bill sum: Sum × r × t / 100)',
      BG: 'Banker’s Gain (the difference BD - TD, which equals simple interest on TD)',
      Sum: 'Face value / Total bill amount payable at future due date'
    },
    tip: 'Banker’s Gain is ALWAYS the simple interest on the True Discount.',
    example: 'If BD = ₹360 and TD = ₹300: Sum = (360 × 300)/(360 - 300) = 108000/60 = ₹1,800. Banker’s Gain BG = 360 - 300 = ₹60.'
  },
  {
    id: 'fin-shares-1',
    name: 'Stocks, Shares, Dividend Yield & Rate of Return',
    category: 'Arithmetic',
    subcategory: 'Stocks & Shares',
    content: 'Annual Income = No. of Shares × Face Value × (Dividend Rate / 100)  |  Yield % = (Dividend / Market Value) × 100',
    variables: {
      'Face Value': 'Nominal / par value printed on the share certificate (usually ₹10 or ₹100)',
      'Market Value': 'Current buying / selling cash price per share in the market',
      'Dividend %': 'Percentage dividend declared on FACE VALUE (never on market value)',
      'Yield %': 'Actual percentage rate of return earned on the invested money'
    },
    tip: 'Dividend is ALWAYS calculated on Face Value. Investment is ALWAYS calculated on Market Value + Brokerage.',
    example: 'A ₹100 share bought at ₹125 pays 15% dividend: Annual Income = 100 × 15% = ₹15. Yield % = (15 / 125) × 100 = 12%.'
  },

  // =========================================================================
  // KINEMATICS & PHYSICS APTITUDE (SSC JE, RRB NTPC, CDS, NDA, CSAT)
  // =========================================================================
  {
    id: 'kin-motion-1',
    name: 'Uniform Acceleration Kinematics & n-th Second Distance',
    category: 'Speed, Time & Motion',
    subcategory: 'Kinematics & Motion',
    content: 'v = u + at  |  s = ut + (1/2)at²  |  v² = u² + 2as  |  s_n = u + (a/2)(2n - 1)',
    variables: {
      u: 'Initial velocity (m/s)',
      v: 'Final velocity after time t (m/s)',
      a: 'Constant acceleration (m/s²)',
      t: 'Time elapsed (seconds)',
      s: 'Total displacement covered in t seconds (m)',
      s_n: 'Displacement covered exclusively during the n-th second (m)'
    },
    tip: 'Under free fall: replace a with +g (downward, ≈ 9.8 m/s²) or -g (upward).',
    example: 'Body starts from rest (u=0) with a=4 m/s²: Distance in 5th second s₅ = 0 + (4/2)(2×5 - 1) = 2 × 9 = 18 meters.'
  },
  {
    id: 'kin-proj-1',
    name: 'Projectile Motion: Time of Flight, Max Height & Range',
    category: 'Speed, Time & Motion',
    subcategory: 'Kinematics & Motion',
    content: 'T = (2u sin θ) / g  |  H_max = (u² sin² θ) / (2g)  |  R = (u² sin 2θ) / g',
    variables: {
      u: 'Launch projection speed (m/s)',
      θ: 'Angle of projection with the horizontal ground (degrees)',
      g: 'Acceleration due to gravity (≈ 9.8 or 10 m/s²)',
      T: 'Total flight time in air until landing',
      H_max: 'Maximum vertical height reached at apex',
      R: 'Horizontal distance / range covered from launch to landing'
    },
    tip: 'Maximum range occurs at angle θ = 45°, where R_max = u² / g.',
    example: 'u = 20 m/s, θ = 30°, g = 10 m/s²: T = (2 × 20 × sin 30°)/10 = (40 × 0.5)/10 = 2s. Range R = (400 × sin 60°)/10 = 40 × 0.866 = 34.64m.'
  },
  {
    id: 'kin-circ-1',
    name: 'Circular Motion: Angular Velocity & Centripetal Acceleration',
    category: 'Speed, Time & Motion',
    subcategory: 'Kinematics & Motion',
    content: 'ω = 2π / T = 2πf  |  v = r × ω  |  a_c = v² / r = ω² × r',
    variables: {
      ω: 'Angular velocity (rad/s)',
      T: 'Time period for one complete revolution (s)',
      f: 'Frequency of rotation (Hz or rev/s)',
      v: 'Linear tangential speed (m/s)',
      r: 'Radius of the circular trajectory (m)',
      a_c: 'Centripetal radial acceleration directed toward the center (m/s²)'
    },
    tip: 'In a clock: Minute hand ω = 360° / 60 min = 6°/min; Hour hand ω = 360° / 720 min = 0.5°/min.',
    example: 'Radius r = 2m, rotates at 3 rad/s: Linear speed v = 2 × 3 = 6 m/s. Centripetal acceleration a_c = 6² / 2 = 18 m/s².'
  },

  // =========================================================================
  // ADVANCED COORDINATE GEOMETRY & CONICS
  // =========================================================================
  {
    id: 'geo-shoe-1',
    name: 'Shoelace Formula: Area of Any Polygon from Coordinates',
    category: 'Geometry & Mensuration',
    subcategory: 'Coordinate Geometry',
    content: 'Area = (1/2) | (x1·y2 + x2·y3 + ... + xn·y1) - (y1·x2 + y2·x3 + ... + yn·x1) |',
    variables: {
      '(x1,y1), ...': 'Coordinates of the polygon vertices listed in strict counter-clockwise or clockwise order',
      Area: 'Absolute enclosed polygonal area'
    },
    tip: 'Works universally for triangles (3 vertices), quadrilaterals (4 vertices), and n-gons.',
    example: 'Triangle (0,0), (4,0), (0,3): Cross products (0×0 + 4×3 + 0×0) - (0×4 + 0×0 + 3×0) = 12 - 0 = 12. Area = 12 / 2 = 6 sq units.'
  },
  {
    id: 'geo-circle-eqn',
    name: 'General Equation of Circle, Center, Radius & Tangent Length',
    category: 'Geometry & Mensuration',
    subcategory: 'Conics & Circles',
    content: 'x² + y² + 2gx + 2fy + c = 0  ==>  Center = (-g, -f), Radius = √(g² + f² - c)  |  Tangent Length L = √(x1² + y1² + 2gx1 + 2fy1 + c)',
    variables: {
      'Center (-g, -f)': 'Center coordinates of the circle',
      Radius: '√(g² + f² - c) [requires g² + f² - c ≥ 0]',
      '(x1, y1)': 'External point coordinates from which tangents are drawn to the circle',
      L: 'Length of the tangent segment from external point to the point of contact'
    },
    tip: 'If (x1, y1) lies on the circle, L = 0. If inside the circle, L is imaginary (no real tangents).',
    example: 'Circle x² + y² - 6x + 8y - 11 = 0: g=-3, f=4, c=-11. Center=(3, -4), Radius = √(9 + 16 - (-11)) = √36 = 6.'
  },
  {
    id: 'geo-parabola-1',
    name: 'Standard Parabola: Vertex, Focus, Directrix & Tangent Slope Form',
    category: 'Geometry & Mensuration',
    subcategory: 'Conics & Circles',
    content: 'y² = 4ax  ==>  Focus = (a, 0), Directrix: x = -a, Latus Rectum = 4a  |  Tangent (slope m): y = mx + a/m',
    variables: {
      a: 'Focal parameter distance (vertex to focus)',
      'Latus Rectum': 'Chord passing through focus perpendicular to axis (length = 4a)',
      m: 'Slope of the tangent line (m ≠ 0)'
    },
    tip: 'The condition for line y = mx + c to touch parabola y² = 4ax is c = a / m.',
    example: 'For y² = 12x (4a=12 => a=3): Focus = (3, 0), Directrix: x = -3. Tangent with slope m=1 is y = 1x + 3/1 => y = x + 3.'
  },
  {
    id: 'geo-ellipse-1',
    name: 'Standard Ellipse: Eccentricity, Foci, Latus Rectum & Area',
    category: 'Geometry & Mensuration',
    subcategory: 'Conics & Circles',
    content: '(x² / a²) + (y² / b²) = 1  ==>  e = √(1 - b²/a²)  |  Foci = (±ae, 0)  |  Latus Rectum = 2b²/a  |  Area = π·a·b',
    variables: {
      a: 'Semi-major axis length (where a > b)',
      b: 'Semi-minor axis length',
      e: 'Eccentricity (0 < e < 1 for ellipse)',
      Area: 'Total enclosed ellipse area = πab'
    },
    tip: 'If a = b, the ellipse becomes a circle with eccentricity e = 0 and Area = πa².',
    example: 'x²/25 + y²/16 = 1 (a=5, b=4): e = √(1 - 16/25) = √(9/25) = 3/5 = 0.6. Foci = (±3, 0). Area = π × 5 × 4 = 20π.'
  },

  // =========================================================================
  // LOGICAL & ANALYTICAL REASONING EXPANSIONS
  // =========================================================================
  {
    id: 'lr-ineq-1',
    name: 'Mathematical Inequalities & Coded Reasoning Rules',
    category: 'Logical Reasoning',
    subcategory: 'Inequalities & Coding',
    content: 'Priority Hierarchy: [ > ] over [ >= ] over [ = ]  |  Opposite Signs (e.g. A > B < C) ==> No Definite Relation',
    variables: {
      'Direct Path': 'If all signs point in the same direction, highest priority operator wins (e.g. A >= B > C = D ==> A > D is True)',
      'Blocked Path': 'Presence of opposing signs (like > and <, or >= and <=) breaks direct chain; conclusion is "Cannot be Determined"',
      'Either-Or Rule': 'If relation is blocked, check for 3 possibilities (<, =, >) between same subject-predicate'
    },
    tip: 'Super high frequency in Banking (IBPS PO, SBI PO, RBI) reasoning sections.',
    example: 'Statement: P >= Q = R > S. Conclusion 1: P > S (True, > overrides >=). Conclusion 2: P = S (False).'
  },
  {
    id: 'lr-circle-seat',
    name: 'Circular & Linear Seating Arrangement Orientations',
    category: 'Logical Reasoning',
    subcategory: 'Seating Arrangement',
    content: 'Facing Center: Left = Clockwise, Right = Anti-Clockwise  |  Facing Outside: Left = Anti-Clockwise, Right = Clockwise',
    variables: {
      'Opposite in 8-person circle': 'Opposite person is exactly (n/2) = 4 positions away in either direction',
      'Immediate Left / Right': 'Adjacent seat in specified rotation direction',
      'Linear North': 'Right is to the viewer’s right, Left is to the viewer’s left',
      'Linear South': 'Right is to the viewer’s left, Left is to the viewer’s right'
    },
    tip: 'Always start circular puzzles from the person with the most connected placement clues.',
    example: '8 people facing center: A is sitting opposite E (4 seats away). B is second to left of A => B is 2 positions clockwise from A.'
  },
  {
    id: 'lr-mat-puzzle',
    name: 'Missing Number & Matrix Reasoning Patterns',
    category: 'Logical Reasoning',
    subcategory: 'Matrix & Puzzles',
    content: 'Row/Col Patterns: (A + B) × C  |  A² + B² = C  |  (A × B) / K = C  |  Sum of all elements = Constant',
    variables: {
      'Row-wise Scan': 'Check horizontal sum, product, square relations between elements',
      'Column-wise Scan': 'Check vertical arithmetic progressions or powers',
      'Center Box Puzzles': 'Central number is often generated by operations on the 4 surrounding corner numbers'
    },
    tip: 'If numbers increase dramatically in the bottom row/column, look for multiplication or sum of squares.',
    example: 'Row 1: [3, 4, 25] (3² + 4² = 25). Row 2: [5, 12, 169] (5² + 12² = 169). Row 3: [7, 24, ?] => 7² + 24² = 49 + 576 = 625.'
  },

  // =========================================================================
  // ADVANCED ALGEBRA, NUMBER THEORY & SEQUENCES
  // =========================================================================
  {
    id: 'alg-euler-totient',
    name: "Euler's Totient Function φ(N) & Euler's Remainder Theorem",
    category: 'Algebra & Numbers',
    subcategory: 'Number Theory',
    content: 'φ(N) = N × ∏ (1 - 1/p)  |  a^φ(N) ≡ 1 (mod N)  [when gcd(a, N) = 1]',
    variables: {
      N: 'Positive integer with prime factorization N = p1^a1 · p2^a2 · ...',
      'φ(N)': 'Count of positive integers up to N that are coprime to N',
      'p1, p2, ...': 'Distinct prime factors of N',
      a: 'Any integer coprime to N'
    },
    tip: 'Fermat’s Little Theorem is just the special prime case of Euler’s Theorem where φ(p) = p - 1.',
    example: 'For N = 12 (prime factors 2 and 3): φ(12) = 12 × (1 - 1/2) × (1 - 1/3) = 12 × (1/2) × (2/3) = 4 (coprimes are 1, 5, 7, 11). Remainder of 5⁴ mod 12 = 1.'
  },
  {
    id: 'alg-hp-seq',
    name: 'Harmonic Progression (HP) Term & AM-GM-HM Relation',
    category: 'Algebra & Numbers',
    subcategory: 'Progressions & Series',
    content: 'n-th term of HP = 1 / [ a + (n - 1)d ]  |  HM of two numbers (a, b) = 2ab / (a + b)  |  GM² = AM × HM',
    variables: {
      'HP sequence': 'A sequence whose reciprocals form an Arithmetic Progression (AP)',
      a: 'First term of the corresponding reciprocal AP',
      d: 'Common difference of reciprocal AP',
      AM: '(a + b) / 2',
      GM: '√(a · b)',
      HM: '2ab / (a + b)'
    },
    tip: 'For positive numbers, AM ≥ GM ≥ HM always holds; equality occurs only when all numbers are equal.',
    example: 'Find HM of 4 and 12: HM = (2 × 4 × 12) / (4 + 12) = 96 / 16 = 6. Check: AM = (4+12)/2 = 8, GM = √(4×12) = √48. GM² = 48 = 8 × 6 = AM × HM.'
  },
  {
    id: 'alg-newton-roots',
    name: 'Newton-Girard Sum of Roots for Quadratics & Cubics',
    category: 'Algebra & Numbers',
    subcategory: 'Quadratic & Polynomials',
    content: 'For ax² + bx + c = 0 with roots α, β:  α² + β² = S1² - 2P  |  α³ + β³ = S1³ - 3P·S1',
    variables: {
      S1: 'Sum of roots = α + β = -b / a',
      P: 'Product of roots = α · β = c / a',
      'α² + β²': '(α + β)² - 2αβ',
      'α³ + β³': '(α + β)³ - 3αβ(α + β)'
    },
    tip: 'Allows calculating high-power symmetric expressions without ever solving for individual irrational roots.',
    example: 'x² - 5x + 6 = 0 (S1=5, P=6): α² + β² = 5² - 2(6) = 25 - 12 = 13. α³ + β³ = 5³ - 3(6)(5) = 125 - 90 = 35.'
  },
  {
    id: 'alg-crt-1',
    name: 'Chinese Remainder Theorem (Coprime Moduli)',
    category: 'Algebra & Numbers',
    subcategory: 'Number Theory',
    content: 'If x ≡ r1 (mod m1) and x ≡ r2 (mod m2) with gcd(m1, m2) = 1:  x ≡ (r1·M1·y1 + r2·M2·y2) (mod M)',
    variables: {
      'm1, m2': 'Pairwise coprime moduli (e.g. 3 and 5)',
      M: 'Total product modulus = m1 × m2',
      M1: 'M / m1 = m2, M2 = M / m2 = m1',
      'y1, y2': 'Modular inverses: (M1 · y1) ≡ 1 (mod m1), (M2 · y2) ≡ 1 (mod m2)'
    },
    tip: 'Quick check: Test multiples of largest modulus m2 added to remainder r2 until condition for m1 is satisfied.',
    example: 'Find smallest x where x ≡ 2 (mod 3) and x ≡ 3 (mod 5): Test numbers mod 5: 3 (3 mod 3=0), 3+5=8 (8 mod 3=2 ✓). Smallest solution x = 8.'
  },

  // =========================================================================
  // VEDIC & MENTAL MATH SHORTCUTS
  // =========================================================================
  {
    id: 'trk-cube-2digit',
    name: 'Fast Cubing of 2-Digit Numbers (Algebraic Ratio Method)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(10a + b)³ = a³ || (3a²b) || (3ab²) || b³',
    variables: {
      a: 'Tens digit of the 2-digit number',
      b: 'Units digit of the 2-digit number',
      Method: 'Write 4 terms: a³, a²b, ab², b³ in row 1; double the middle two terms in row 2; add vertically with carries'
    },
    tip: 'Much faster than multiplying the number by itself three times.',
    example: '12³ (a=1, b=2): Terms are 1, 2, 4, 8. Double middle: -, 4, 8, -. Add columns: 1 | (2+4) | (4+8) | 8 = 1 | 6 | 12 | 8 = 1728.'
  },
  {
    id: 'trk-cbrt-exact',
    name: 'Instant Cube Root of Perfect Cubes (Up to 6 Digits)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: 'Step 1: Units digit is unique mapping | Step 2: Strike last 3 digits; find nearest cube root for remaining digits',
    variables: {
      'Unique Endings': '1->1, 4->4, 5->5, 6->6, 9->9, 0->0',
      'Swap Pairs': '2 <-> 8 and 3 <-> 7 (sum is 10)',
      'Remaining Group': 'Remaining leading digits determine the tens digit of the answer'
    },
    tip: 'Every single digit 0-9 has a distinct unique cube ending. Cube roots of perfect cubes take < 3 seconds.',
    example: '∛175616: Last digit 6 => units digit is 6. Strike 616, remaining is 175. Nearest cube <= 175 is 125 (5³). Answer = 56.'
  },
  {
    id: 'trk-pct-swap',
    name: 'Percentage Reversal / Swap Shortcut (x% of y = y% of x)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: 'x% of y = (x × y) / 100 = y% of x',
    variables: {
      'Swap Principle': 'Multiplication is commutative, so swapping percentage and base produces identical result',
      Utility: 'Turns awkward percentage calculations into trivial mental math fractions'
    },
    tip: 'If calculating x% of y looks hard, flip it to y% of x immediately.',
    example: 'Find 84% of 50: Swap to 50% of 84 = 84 / 2 = 42. Find 16% of 25: Swap to 25% of 16 = 16 / 4 = 4.'
  },
  {
    id: 'trk-urdhva-mult',
    name: 'Vedic Vertical & Crosswise Multiplication (Urdhva Tiryagbhyam)',
    category: 'Tricks & Shortcuts',
    subcategory: 'Vedic & Mental Math',
    content: '(ab) × (cd) = (a × c) || (a·d + b·c) || (b × d)  [Single-line 2x2 Multiplication]',
    variables: {
      Step1: 'Multiply right column: b × d (write unit digit, carry over)',
      Step2: 'Cross multiply and add: (a × d) + (b × c) + carry (write unit, carry over)',
      Step3: 'Multiply left column: a × c + carry'
    },
    tip: 'Computes any 2-digit by 2-digit multiplication in a single mental line from right to left.',
    example: '32 × 41: Right = 2×1 = 2. Cross = (3×1) + (2×4) = 3 + 8 = 11 (write 1, carry 1). Left = 3×4 + 1 = 13. Result = 1312.'
  }
];

