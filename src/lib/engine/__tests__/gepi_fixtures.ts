import type { Service } from "../../schema/rates";

export const relocationSurvey: Service = {
  id: "relocation-survey",
  label: "Relocation Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "hectares",
  strategy: "lookup_table",
  table: {
    columns: [0, 10, 20, 30, 40, 50, 60],
    row_logic: [
      { id: "lt0.5", min: 0, max: 0.499 },
      { id: "0.5-1", min: 0.5, max: 1 },
      { id: "2", min: 2, max: 2 },
      { id: "3", min: 3, max: 3 },
      { id: "4", min: 4, max: 4 },
      { id: "5", min: 5, max: 5 },
      { id: "6", min: 6, max: 6 },
      { id: "7", min: 7, max: 7 },
      { id: "8", min: 8, max: 8 },
      { id: "9", min: 9, max: 9 },
      { id: "10", min: 10, max: 10 },
    ],
    rows: {
      "lt0.5": [25000],
      "0.5-1": [30000, 128500, 212000, 282000, 344500, 403000, 466500],
      "2": [40000, 137000, 219000, 289000, 351000, 409500, 471500],
      "3": [50000, 145500, 226000, 296000, 357500, 416000, 476500],
      "4": [60000, 154000, 233000, 303000, 364000, 422500, 481500],
      "5": [70000, 162500, 240000, 303000, 364000, 429000, 486500],
      "6": [80000, 171000, 247000, 310000, 370500, 435500, 491500],
      "7": [90000, 179500, 254000, 317000, 377000, 442000, 496500],
      "8": [100000, 188000, 261000, 324000, 383500, 448500, 501500],
      "9": [110000, 196500, 268000, 331000, 390000, 455000, 506500],
      "10": [120000, 205000, 275000, 338000, 396500, 461500, 511500],
    },
    excess_rate: 5000,
    excess_threshold: 70,
  },
  modifiers: [
    {
      id: "land-use",
      label: "Land Use Factor",
      type: "percentage_add",
      options: [
        { id: "residential", label: "Residential", value: 0.5 },
        { id: "commercial", label: "Commercial", value: 1.5 },
        { id: "industrial", label: "Industrial", value: 1.2 },
        { id: "agricultural", label: "Agricultural", value: 0.0 },
        { id: "institutional", label: "Institutional", value: 0.0 },
        { id: "govt_reservations", label: "Government Reservations", value: 0.0 },
        { id: "foreshore", label: "Foreshore Lands", value: 0.5 },
        { id: "forestlands", label: "Forestlands", value: 0.5 },
        { id: "protected_areas", label: "Protected Areas", value: 0.5 },
        { id: "ancestral_lands", label: "Ancestral Lands", value: 0.5 },
        { id: "mixed_use", label: "Mixed Use", value: 1.5 },
      ],
      default_option_id: "agricultural",
    },
  ],
};

export const originalSurvey: Service = {
  id: "original-survey",
  label: "Original Survey / Re-Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "hectares",
  strategy: "lookup_table",
  table: {
    columns: [0, 10, 20, 30, 40, 50, 60],
    row_logic: [
      { id: "lt0.5", min: 0, max: 0.499 },
      { id: "0.5-1", min: 0.5, max: 1 },
      { id: "2", min: 2, max: 2 },
      { id: "3", min: 3, max: 3 },
      { id: "4", min: 4, max: 4 },
      { id: "5", min: 5, max: 5 },
      { id: "6", min: 6, max: 6 },
      { id: "7", min: 7, max: 7 },
      { id: "8", min: 8, max: 8 },
      { id: "9", min: 9, max: 9 },
      { id: "10", min: 10, max: 10 },
    ],
    rows: {
      "lt0.5": [45000],
      "0.5-1": [60000, 257000, 424000, 564000, 689000, 806000, 933000],
      "2": [80000, 274000, 438000, 578000, 702000, 819000, 943000],
      "3": [100000, 291000, 452000, 592000, 715000, 832000, 953000],
      "4": [120000, 308000, 466000, 606000, 728000, 845000, 963000],
      "5": [140000, 325000, 480000, 606000, 728000, 858000, 973000],
      "6": [160000, 342000, 494000, 620000, 741000, 871000, 983000],
      "7": [180000, 359000, 508000, 634000, 754000, 884000, 993000],
      "8": [200000, 376000, 522000, 648000, 767000, 897000, 1003000],
      "9": [220000, 393000, 536000, 662000, 780000, 910000, 1013000],
      "10": [240000, 410000, 550000, 676000, 793000, 923000, 1023000],
    },
    excess_rate: 10000,
    excess_threshold: 70,
  },
  modifiers: [
    {
      id: "land-use",
      label: "Land Use Factor",
      type: "percentage_add",
      options: [
        { id: "residential", label: "Residential", value: 0.5 },
        { id: "commercial", label: "Commercial", value: 1.5 },
        { id: "industrial", label: "Industrial", value: 1.2 },
        { id: "agricultural", label: "Agricultural", value: 0.0 },
        { id: "institutional", label: "Institutional", value: 0.0 },
        { id: "govt_reservations", label: "Government Reservations", value: 0.0 },
        { id: "foreshore", label: "Foreshore Lands", value: 0.5 },
        { id: "forestlands", label: "Forestlands", value: 0.5 },
        { id: "protected_areas", label: "Protected Areas", value: 0.5 },
        { id: "ancestral_lands", label: "Ancestral Lands", value: 0.5 },
        { id: "mixed_use", label: "Mixed Use", value: 1.5 },
      ],
      default_option_id: "agricultural",
    },
  ],
};

export const verificationSurvey: Service = {
  id: "verification-survey",
  label: "Verification Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "hectares",
  strategy: "lookup_table",
  table: {
    columns: [0, 10, 20, 30, 40, 50, 60],
    row_logic: [
      { id: "lt0.5", min: 0, max: 0.499 },
      { id: "0.5-1", min: 0.5, max: 1 },
      { id: "2", min: 2, max: 2 },
      { id: "3", min: 3, max: 3 },
      { id: "4", min: 4, max: 4 },
      { id: "5", min: 5, max: 5 },
      { id: "6", min: 6, max: 6 },
      { id: "7", min: 7, max: 7 },
      { id: "8", min: 8, max: 8 },
      { id: "9", min: 9, max: 9 },
      { id: "10", min: 10, max: 10 },
    ],
    rows: {
      "lt0.5": [55000],
      "0.5-1": [75000, 321250, 530000, 705000, 861250, 1007500, 1166250],
      "2": [100000, 342500, 547500, 722500, 877500, 1023750, 1178750],
      "3": [125000, 363750, 565000, 740000, 893750, 1040000, 1191250],
      "4": [150000, 385000, 582500, 757500, 910000, 1056250, 1203750],
      "5": [175000, 406250, 600000, 757500, 910000, 1072500, 1216250],
      "6": [200000, 427500, 617500, 775000, 926250, 1088750, 1228750],
      "7": [225000, 448750, 635000, 792500, 942500, 1105000, 1241250],
      "8": [250000, 470000, 652500, 810000, 958750, 1121250, 1253750],
      "9": [275000, 491250, 670000, 827500, 975000, 1137500, 1266250],
      "10": [300000, 512500, 687500, 845000, 991250, 1153750, 1278750],
    },
    excess_rate: 8000,
    excess_threshold: 70,
  },
  modifiers: [
    {
      id: "land-use",
      label: "Land Use Factor",
      type: "percentage_add",
      options: [
        { id: "residential", label: "Residential", value: 0.5 },
        { id: "commercial", label: "Commercial", value: 1.5 },
        { id: "industrial", label: "Industrial", value: 1.2 },
        { id: "agricultural", label: "Agricultural", value: 0.0 },
        { id: "institutional", label: "Institutional", value: 0.0 },
        { id: "govt_reservations", label: "Government Reservations", value: 0.0 },
        { id: "foreshore", label: "Foreshore Lands", value: 0.5 },
        { id: "forestlands", label: "Forestlands", value: 0.5 },
        { id: "protected_areas", label: "Protected Areas", value: 0.5 },
        { id: "ancestral_lands", label: "Ancestral Lands", value: 0.5 },
        { id: "mixed_use", label: "Mixed Use", value: 1.5 },
      ],
      default_option_id: "agricultural",
    },
  ],
};

export const leaseAreaSurvey: Service = {
  id: "lease-area-survey",
  label: "Lease Area Survey (NLA/GLA)",
  unit_type: "area",
  unit: "sqm",
  unit_display: "sq.m",
  strategy: "lookup_table",
  table: {
    columns: [0],
    row_logic: [
      { id: "lt200", min: 0, max: 199 },
      { id: "200-400", min: 200, max: 399 },
      { id: "400-600", min: 400, max: 599 },
      { id: "600-800", min: 600, max: 799 },
      { id: "800-1000", min: 800, max: 999 },
      { id: "1000-1500", min: 1000, max: 1499 },
      { id: "1500-2000", min: 1500, max: 2000 },
    ],
    rows: {
      lt200: [15000],
      "200-400": [20500],
      "400-600": [26000],
      "600-800": [31500],
      "800-1000": [38000],
      "1000-1500": [51750],
      "1500-2000": [65500],
    },
  },
  modifiers: [
    {
      id: "location",
      label: "Location Premium",
      type: "percentage_add",
      options: [
        { id: "metro_city", label: "Metro Manila / Metro City", value: 0.3 },
        { id: "provincial", label: "Provincial", value: 0.0 },
      ],
      default_option_id: "provincial",
    },
    {
      id: "multi_tenancy",
      label: "Multi-Tenancy Discount",
      type: "multiplier",
      options: [
        { id: "single", label: "Single Unit", value: 1.0 },
        { id: "multiple", label: "Multiple Units (One Visit)", value: 0.66 },
      ],
      default_option_id: "single",
    },
  ],
};

export const residentialSubdivision: Service = {
  id: "residential-subdivision",
  label: "Residential Subdivision",
  unit_type: "count",
  unit: "lot",
  unit_display: "lots",
  strategy: "tiered_base_plus_unit",
  tiered_base: {
    tiers: [
      { range: [2, 4], base: 38000, per_unit: 12000, excess_above: 2 },
      { range: [5, 9], base: 62000, per_unit: 11500, excess_above: 5 },
      { range: [10, 19], base: 108000, per_unit: 11000, excess_above: 10 },
      { range: [20, 29], base: 207000, per_unit: 10500, excess_above: 20 },
      { range: [30, 39], base: 301500, per_unit: 10000, excess_above: 30 },
      { range: [40, 49], base: 391500, per_unit: 9500, excess_above: 40 },
      { range: [50, 99], base: 477000, per_unit: 9000, excess_above: 50 },
      { range: [100, 199], base: 558000, per_unit: 6500, excess_above: 100 },
      { range: [200, 299], base: 1201500, per_unit: 5000, excess_above: 200 },
      { range: [300, 399], base: 1696500, per_unit: 4000, excess_above: 300 },
      { range: [400, 499], base: 2092500, per_unit: 3000, excess_above: 400 },
      { range: [500, 999], base: 2389500, per_unit: 2000, excess_above: 500 },
      { range: [1000, null], base: 3387500, per_unit: 1000, excess_above: 1000 },
    ],
  },
};

export const agriculturalSubdivision: Service = {
  id: "agricultural-subdivision",
  label: "Agricultural Subdivision",
  unit_type: "count",
  unit: "lot",
  unit_display: "lots",
  strategy: "tiered_base_plus_unit",
  tiered_base: {
    tiers: [
      { range: [1, 4], base: 25000, per_unit: 6500, excess_above: 2 },
      { range: [5, 9], base: 38000, per_unit: 6000, excess_above: 5 },
      { range: [10, 19], base: 64000, per_unit: 5500, excess_above: 10 },
      { range: [20, 29], base: 122500, per_unit: 5000, excess_above: 20 },
      { range: [30, 39], base: 181000, per_unit: 4500, excess_above: 30 },
      { range: [40, 49], base: 239500, per_unit: 4000, excess_above: 40 },
      { range: [50, 99], base: 298000, per_unit: 3500, excess_above: 50 },
      { range: [100, null], base: 616500, per_unit: 2500, excess_above: 100 },
    ],
  },
};

export const institutionalSubdivision: Service = {
  id: "institutional-subdivision",
  label: "Institutional Subdivision",
  unit_type: "count",
  unit: "lot",
  unit_display: "lots",
  strategy: "tiered_base_plus_unit",
  tiered_base: {
    tiers: [
      { range: [1, 4], base: 30000, per_unit: 6500, excess_above: 2 },
      { range: [5, 9], base: 43000, per_unit: 6000, excess_above: 5 },
      { range: [10, 19], base: 69000, per_unit: 5500, excess_above: 10 },
      { range: [20, 29], base: 127500, per_unit: 5000, excess_above: 20 },
      { range: [30, 39], base: 186000, per_unit: 4500, excess_above: 30 },
      { range: [40, 49], base: 244500, per_unit: 4000, excess_above: 40 },
      { range: [50, 99], base: 303000, per_unit: 3500, excess_above: 50 },
      { range: [100, null], base: 621500, per_unit: 2500, excess_above: 100 },
    ],
  },
};

export const topographicSurvey: Service = {
  id: "topographic-survey",
  label: "Topographic Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "hectares",
  strategy: "tiered_per_unit",
  parameters: [
    {
      id: "contour",
      label: "Contour Interval",
      type: "select",
      options: [
        { id: "0.5m", label: "0.5m", rates: [50000, 30000, 20000, 15000] },
        { id: "1.0m", label: "1.0m", rates: [45000, 25000, 15000, 10000] },
        { id: "2.0m", label: "2.0m", rates: [40000, 20000, 10000, 8000] },
        { id: "5.0m", label: "5.0m", rates: [35000, 15000, 8000, 6000] },
      ],
    },
  ],
  tiered_per: {
    tiers: [
      { label: "First 1 ha", up_to: 1 },
      { label: "Succeeding up to 10 ha", up_to: 10 },
      { label: "Succeeding up to 20 ha", up_to: 20 },
      { label: "In excess of 20 ha", up_to: null },
    ],
  },
  modifiers: [
    {
      id: "slope",
      label: "Slope > 18%",
      type: "percentage_add",
      options: [
        { id: "yes", label: "Yes", value: 0.5 },
        { id: "no", label: "No", value: 0 },
      ],
      default_option_id: "no",
    },
  ],
};

export const hydrographicSurvey: Service = {
  id: "hydrographic-survey",
  label: "Hydrographic Survey",
  unit_type: "area",
  unit: "ha",
  unit_display: "hectares",
  strategy: "tiered_per_unit",
  parameters: [
    {
      id: "interval",
      label: "Depth-Curve Interval",
      type: "select",
      options: [{ id: "1.0m", label: "1.0m", rates: [50000, 45000, 40000, 35000, 30000] }],
    },
  ],
  tiered_per: {
    tiers: [
      { label: "First 1 ha", up_to: 1 },
      { label: "Succeeding up to 10 ha", up_to: 10 },
      { label: "Succeeding up to 20 ha", up_to: 20 },
      { label: "Succeeding up to 50 ha", up_to: 50 },
      { label: "In excess of 50 ha", up_to: null },
    ],
  },
};

export const controlPoints: Service = {
  id: "control-points",
  label: "Control Points",
  unit_type: "count",
  unit: "point",
  unit_display: "points",
  strategy: "flat_per_unit",
  flat_rates: {
    rates: {
      geodetic: 20000,
      project: 15000,
    },
  },
};

export const courtAppearance: Service = {
  id: "court-appearance",
  label: "Court Appearance",
  unit_type: "count",
  unit: "appearance",
  unit_display: "appearances",
  strategy: "flat",
  base_fee: 5000,
  warnings: ["Or Hourly Rate whichever is higher."],
};

export const consultingServices: Service = {
  id: "consulting-services",
  label: "Consulting Services",
  unit_type: "time",
  unit: "hour",
  unit_display: "hours",
  strategy: "time_based",
  time_based: {
    roles: {
      consultation: 1000,
    },
    minimum_hours: 4,
  },
  parameters: [
    {
      id: "activity",
      label: "Consulting Activity",
      type: "select",
      options: [
        { id: "court_appearance", label: "Legal Court Appearance", rate: 5000 },
        { id: "joint_survey_observer", label: "Joint Survey (Observer)", rate: 5000 },
        { id: "joint_survey_team", label: "Joint Survey (with Team)", rate: 20000 },
      ],
    },
  ],
};

export const honorariaLecturer: Service = {
  id: "honoraria-lecturer",
  label: "Honoraria (Lecturer/Resource Person)",
  unit_type: "time",
  unit: "hour",
  unit_display: "hours",
  strategy: "time_based",
  time_based: {
    roles: {
      ge_pd: 3294,
      sge_pm: 2883,
      ge_pm: 2522,
      ge_v: 2183,
      ge_iv: 1671,
      ge_iii: 1280,
      ge_ii: 997,
      ge_i: 739,
    },
    minimum_hours: 4,
  },
  warnings: ["Based on 50 participants; increased proportionately for more."],
};

export const staffHourlyRates: Service = {
  id: "staff-hourly-rates",
  label: "Professional Staff Hourly Rates",
  unit_type: "time",
  unit: "hour",
  unit_display: "hours",
  strategy: "time_based",
  time_based: {
    roles: {
      ge_project_director: 1918,
      sr_ge_project_manager: 1567,
      ge_project_manager: 1371,
      ge_v_party_chief: 1144,
      ge_iv_sr_supervising: 843,
      ge_iii_supervising: 646,
      ge_ii_project_ge: 484,
      ge_i_entry_level: 359,
    },
  },
};

export const memorialParkSurvey: Service = {
  id: "memorial-park-survey",
  label: "Memorial Park Survey",
  unit_type: "count",
  unit: "lot",
  unit_display: "lots",
  strategy: "flat_per_unit",
  flat_rates: {
    rates: {
      standard: 360,
    },
  },
  warnings: ["Or 1% of the selling cost, whichever is higher."],
};

export const constructionSetout: Service = {
  id: "construction-setout",
  label: "Construction Set-out",
  unit_type: "count",
  unit: "point",
  unit_display: "points",
  strategy: "flat_per_unit",
  flat_rates: {
    rates: {
      per_point: 1000,
    },
  },
  additional_fees: [
    {
      id: "visitation-fee",
      label: "Survey Team Visitation Fee",
      type: "flat",
      value: 10000,
      category: "misc",
    },
  ],
};
