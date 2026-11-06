import { expect, test } from "vitest";
import { API_URL, PROFILE_UPDATE_URL } from "./api";

test("profile updates use the registered update endpoint", () => {
  expect(PROFILE_UPDATE_URL).toBe(`${API_URL}/users/update`);
});
