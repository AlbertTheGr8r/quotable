import { describe, expect, it } from "vitest";
import { type Project, ProjectCodec } from "./project-store";

describe("ProjectCodec", () => {
  const sampleProject: Project = {
    id: "test-id-123",
    name: "Test Project",
    yamlUrl: "/rates/test.yaml",
    createdAt: "2026-04-30T06:28:45.080Z",
    updatedAt: "2026-04-30T07:56:26.646Z",
    quoteItems: [
      {
        id: "item-1",
        serviceId: "test-service",
        quantity: 1,
        unit: "ha",
        params: {},
        modifiers: {},
      },
    ],
  };

  it("should encode and decode a project accurately", () => {
    const encoded = ProjectCodec.encode(sampleProject);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = ProjectCodec.decode(encoded);
    expect(decoded).toEqual(sampleProject);
  });

  it("should handle empty project name and quote items", () => {
    const emptyProject: Project = {
      ...sampleProject,
      name: "",
      quoteItems: [],
    };

    const encoded = ProjectCodec.encode(emptyProject);
    const decoded = ProjectCodec.decode(encoded);
    expect(decoded).toEqual(emptyProject);
  });

  it("should handle special characters in project name", () => {
    const specialProject: Project = {
      ...sampleProject,
      name: "Project with 🎉 emojis & special chars! @#$%",
    };

    const encoded = ProjectCodec.encode(specialProject);
    const decoded = ProjectCodec.decode(encoded);
    expect(decoded).toEqual(specialProject);
  });

  it("should return null for invalid base64 payloads", () => {
    const decoded = ProjectCodec.decode("invalid-base64!");
    expect(decoded).toBeNull();
  });
});
