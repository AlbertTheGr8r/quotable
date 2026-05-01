import { describe, expect, it } from "vitest";
import { computeServiceCost, computeProjectCost } from "../index";
import * as fixtures from "./gepi_fixtures";

describe("GEPI 2020-2023 Boundary Analysis", () => {
  describe("lookup_table - Relocation Survey", () => {
    const service = fixtures.relocationSurvey;

    describe("Row Boundaries", () => {
      it("0.1 ha = 25000", () => {
        const result = computeServiceCost(service, 0.1);
        expect(result.subtotal).toBe(25000);
      });

      it("0.5 ha = 30000", () => {
        const result = computeServiceCost(service, 0.5);
        expect(result.subtotal).toBe(30000);
      });

      it("1 ha = 30000", () => {
        const result = computeServiceCost(service, 1);
        expect(result.subtotal).toBe(30000);
      });

      it("2 ha = 40000", () => {
        const result = computeServiceCost(service, 2);
        expect(result.subtotal).toBe(40000);
      });

      it("5 ha = 70000", () => {
        const result = computeServiceCost(service, 5);
        expect(result.subtotal).toBe(70000);
      });

      it("10 ha = 120000", () => {
        const result = computeServiceCost(service, 10);
        expect(result.subtotal).toBe(120000);
      });
    });

    describe("Excess Rate (threshold: 70, rate: 5000)", () => {
      it("70 ha = 511500 (no excess)", () => {
        const result = computeServiceCost(service, 70);
        expect(result.subtotal).toBe(511500);
      });

      it("71 ha = 516500 (1 * 5000 excess)", () => {
        const result = computeServiceCost(service, 71);
        expect(result.subtotal).toBe(516500);
      });

      it("75 ha = 536500 (5 * 5000 excess)", () => {
        const result = computeServiceCost(service, 75);
        expect(result.subtotal).toBe(536500);
      });
    });

    describe("Land Use Modifiers", () => {
      it("residential +50%", () => {
        const result = computeServiceCost(service, 5, { modifiers: { "land-use": "residential" } });
        expect(result.subtotal).toBe(70000);
        expect(result.total).toBe(105000);
      });

      it("commercial +150%", () => {
        const result = computeServiceCost(service, 5, { modifiers: { "land-use": "commercial" } });
        expect(result.subtotal).toBe(70000);
        expect(result.total).toBe(175000);
      });
    });
  });

  describe("lookup_table - Original Survey", () => {
    const service = fixtures.originalSurvey;

    it("0.5 ha = 60000", () => {
      const result = computeServiceCost(service, 0.5);
      expect(result.subtotal).toBe(60000);
    });

    it("10 ha = 240000", () => {
      const result = computeServiceCost(service, 10);
      expect(result.subtotal).toBe(240000);
    });

    it("70 ha = 1023000", () => {
      const result = computeServiceCost(service, 70);
      expect(result.subtotal).toBe(1023000);
    });

    it("75 ha = 1073000 (excess: 5 * 10000)", () => {
      const result = computeServiceCost(service, 75);
      expect(result.subtotal).toBe(1073000);
    });
  });

  describe("lookup_table - Verification Survey", () => {
    const service = fixtures.verificationSurvey;

    it("0.5 ha = 75000", () => {
      const result = computeServiceCost(service, 0.5);
      expect(result.subtotal).toBe(75000);
    });

    it("10 ha = 300000", () => {
      const result = computeServiceCost(service, 10);
      expect(result.subtotal).toBe(300000);
    });

    it("70 ha = 1278750", () => {
      const result = computeServiceCost(service, 70);
      expect(result.subtotal).toBe(1278750);
    });

    it("75 ha = 1318750 (excess: 5 * 8000)", () => {
      const result = computeServiceCost(service, 75);
      expect(result.subtotal).toBe(1318750);
    });
  });

  describe("lookup_table - Lease Area Survey", () => {
    const service = fixtures.leaseAreaSurvey;

    it("100 sqm = 15000", () => {
      const result = computeServiceCost(service, 100);
      expect(result.subtotal).toBe(15000);
    });

    it("500 sqm = 26000 (range 400-600)", () => {
      const result = computeServiceCost(service, 500);
      expect(result.subtotal).toBe(26000);
    });

    it("1000 sqm = 51750", () => {
      const result = computeServiceCost(service, 1000);
      expect(result.subtotal).toBe(51750);
    });

    it("1500 sqm = 65500", () => {
      const result = computeServiceCost(service, 1500);
      expect(result.subtotal).toBe(65500);
    });

    it("metro city +30% = 26000 + 7800 = 33800", () => {
      const result = computeServiceCost(service, 500, { modifiers: { location: "metro_city" } });
      expect(result.total).toBe(33800);
    });
  });

  describe("tiered_base_plus_unit - Residential Subdivision", () => {
    const service = fixtures.residentialSubdivision;

    it("2 lots = 38000", () => {
      const result = computeServiceCost(service, 2);
      expect(result.subtotal).toBe(38000);
    });

    it("5 lots = 62000", () => {
      const result = computeServiceCost(service, 5);
      expect(result.subtotal).toBe(62000);
    });

    it("10 lots = 108000", () => {
      const result = computeServiceCost(service, 10);
      expect(result.subtotal).toBe(108000);
    });

    it("20 lots = 207000", () => {
      const result = computeServiceCost(service, 20);
      expect(result.subtotal).toBe(207000);
    });

    it("50 lots = 477000", () => {
      const result = computeServiceCost(service, 50);
      expect(result.subtotal).toBe(477000);
    });

    it("100 lots = 558000", () => {
      const result = computeServiceCost(service, 100);
      expect(result.subtotal).toBe(558000);
    });

    it("200 lots = 1201500", () => {
      const result = computeServiceCost(service, 200);
      expect(result.subtotal).toBe(1201500);
    });

    it("1000 lots = 3387500", () => {
      const result = computeServiceCost(service, 1000);
      expect(result.subtotal).toBe(3387500);
    });

    it("1500 lots = 3887500 (1000 excess)", () => {
      const result = computeServiceCost(service, 1500);
      expect(result.subtotal).toBe(3887500);
    });
  });

  describe("tiered_base_plus_unit - Agricultural Subdivision", () => {
    const service = fixtures.agriculturalSubdivision;

    it("1 lot = 25000", () => {
      const result = computeServiceCost(service, 1);
      expect(result.subtotal).toBe(25000);
    });

    it("5 lots = 38000", () => {
      const result = computeServiceCost(service, 5);
      expect(result.subtotal).toBe(38000);
    });

    it("10 lots = 64000", () => {
      const result = computeServiceCost(service, 10);
      expect(result.subtotal).toBe(64000);
    });

    it("100 lots = 616500", () => {
      const result = computeServiceCost(service, 100);
      expect(result.subtotal).toBe(616500);
    });
  });

  describe("tiered_base_plus_unit - Institutional Subdivision", () => {
    const service = fixtures.institutionalSubdivision;

    it("1 lot = 30000", () => {
      const result = computeServiceCost(service, 1);
      expect(result.subtotal).toBe(30000);
    });

    it("5 lots = 43000", () => {
      const result = computeServiceCost(service, 5);
      expect(result.subtotal).toBe(43000);
    });

    it("10 lots = 69000", () => {
      const result = computeServiceCost(service, 10);
      expect(result.subtotal).toBe(69000);
    });
  });

  describe("tiered_per_unit - Topographic Survey", () => {
    const service = fixtures.topographicSurvey;

    it("1 ha @ 0.5m = 50000", () => {
      const result = computeServiceCost(service, 1, { parameters: { contour: "0.5m" } });
      expect(result.subtotal).toBe(50000);
    });

    it("5 ha @ 0.5m = 170000", () => {
      const result = computeServiceCost(service, 5, { parameters: { contour: "0.5m" } });
      expect(result.subtotal).toBe(170000);
    });

    it("10 ha @ 0.5m = 320000", () => {
      const result = computeServiceCost(service, 10, { parameters: { contour: "0.5m" } });
      expect(result.subtotal).toBe(320000);
    });

    it("25 ha @ 0.5m = 595000 (1*50000 + 9*30000 + 10*20000 + 5*15000)", () => {
      const result = computeServiceCost(service, 25, { parameters: { contour: "0.5m" } });
      expect(result.subtotal).toBe(595000);
    });

    it("slope +50%", () => {
      const result = computeServiceCost(service, 5, {
        parameters: { contour: "0.5m" },
        modifiers: { slope: "yes" },
      });
      expect(result.total).toBe(255000);
    });
  });

  describe("tiered_per_unit - Hydrographic Survey", () => {
    const service = fixtures.hydrographicSurvey;

    it("1 ha = 50000", () => {
      const result = computeServiceCost(service, 1);
      expect(result.subtotal).toBe(50000);
    });

    it("5 ha = 230000", () => {
      const result = computeServiceCost(service, 5);
      expect(result.subtotal).toBe(230000);
    });
  });

  describe("flat_per_unit - Control Points", () => {
    const service = fixtures.controlPoints;

    it("geodetic 5 points = 100000", () => {
      const result = computeServiceCost(service, 5, { parameters: { geodetic: "true" } });
      expect(result.subtotal).toBe(100000);
    });

    it("project 10 points = 150000", () => {
      const result = computeServiceCost(service, 10, { parameters: { project: "true" } });
      expect(result.subtotal).toBe(150000);
    });
  });

  describe("flat_per_unit - Memorial Park Survey", () => {
    const service = fixtures.memorialParkSurvey;

    it("100 lots with standard enabled = 36000", () => {
      const result = computeServiceCost(service, 100, { parameters: { standard: "true" } });
      expect(result.subtotal).toBe(36000);
    });
  });

  describe("flat - Court Appearance", () => {
    const service = fixtures.courtAppearance;

    it("fixed 5000 regardless of quantity", () => {
      const result = computeServiceCost(service, 1);
      expect(result.subtotal).toBe(5000);

      const result2 = computeServiceCost(service, 100);
      expect(result2.subtotal).toBe(5000);
    });
  });

  describe("time_based - Consulting Services", () => {
    const service = fixtures.consultingServices;

    it("1 hour with min 4 = 4000", () => {
      const result = computeServiceCost(service, 1, { parameters: { role: "consultation" } });
      expect(result.subtotal).toBe(4000);
    });

    it("3 hours with min 4 = 4000", () => {
      const result = computeServiceCost(service, 3, { parameters: { role: "consultation" } });
      expect(result.subtotal).toBe(4000);
    });

    it("4 hours = 4000 (minimum met)", () => {
      const result = computeServiceCost(service, 4, { parameters: { role: "consultation" } });
      expect(result.subtotal).toBe(4000);
    });

    it("5 hours = 5000 (4 minimum + 1 additional)", () => {
      const result = computeServiceCost(service, 5, { parameters: { role: "consultation" } });
      expect(result.subtotal).toBe(5000);
    });
  });

  describe("time_based - Honoraria Lecturer", () => {
    const service = fixtures.honorariaLecturer;

    it("ge_pd at 1 hour with min 4 = 13176 (4 * 3294)", () => {
      const result = computeServiceCost(service, 1, { parameters: { role: "ge_pd" } });
      expect(result.subtotal).toBe(13176);
    });

    it("ge_pd at 4 hours = 13176", () => {
      const result = computeServiceCost(service, 4, { parameters: { role: "ge_pd" } });
      expect(result.subtotal).toBe(13176);
    });

    it("ge_i at 1 hour with min 4 = 2956 (4 * 739)", () => {
      const result = computeServiceCost(service, 1, { parameters: { role: "ge_i" } });
      expect(result.subtotal).toBe(2956);
    });
  });

  describe("Integration", () => {
    it("combines multiple services", () => {
      const relocationCost = computeServiceCost(fixtures.relocationSurvey, 5);
      const subdivisionCost = computeServiceCost(fixtures.residentialSubdivision, 10);

      const projectCost = computeProjectCost([relocationCost, subdivisionCost], []);

      expect(projectCost.base_service_cost).toBe(70000 + 108000);
    });
  });
});