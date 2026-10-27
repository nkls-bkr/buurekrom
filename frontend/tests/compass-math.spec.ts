import { expect, test } from "@playwright/test";
import { angleDifference, compassHeading } from "../src/features/map/compass";

const north = { absolute: true, alpha: 0, beta: 0, gamma: 0 };

test("absolute headings and screen orientation follow compass directions", () => {
  expect(compassHeading(north, 0)).toBe(0);
  expect(compassHeading({ ...north, alpha: 270 }, 0)).toBe(90);
  expect(compassHeading({ ...north, alpha: 90 }, 0)).toBe(270);
  expect(compassHeading(north, 90)).toBe(90);
  expect(compassHeading(north, -90)).toBe(270);
  expect(compassHeading({ ...north, beta: 45, gamma: 45 }, 90)).toBeCloseTo(
    54.7356,
    3,
  );
});

test("Safari north at zero is valid and poor accuracy is rejected", () => {
  const safari = {
    ...north,
    absolute: false,
    webkitCompassHeading: 0,
    webkitCompassAccuracy: 10,
  };
  expect(compassHeading(safari, 0)).toBe(0);
  expect(compassHeading(safari, 90)).toBe(90);
  expect(compassHeading({ ...safari, webkitCompassHeading: 120 }, 0)).toBe(120);
  expect(
    compassHeading({ ...safari, webkitCompassAccuracy: -1 }, 0),
  ).toBeNull();
  expect(
    compassHeading({ ...safari, webkitCompassAccuracy: 60 }, 0),
  ).toBeNull();
});

test("relative, missing and near-vertical readings cannot rotate the map", () => {
  expect(compassHeading({ ...north, absolute: false }, 0)).toBeNull();
  expect(compassHeading({ ...north, alpha: null }, 0)).toBeNull();
  expect(compassHeading({ ...north, alpha: NaN }, 0)).toBeNull();
  expect(compassHeading({ ...north, beta: 90 }, 0)).toBeNull();
});

test("smoothing crosses north on the shortest arc", () => {
  expect(angleDifference(359, 1)).toBe(2);
  expect(angleDifference(1, 359)).toBe(-2);
  expect(angleDifference(270, 0)).toBe(90);
});
