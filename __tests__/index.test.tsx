import * as React from "react";
import { render } from "@testing-library/react";
import Search from "../pages/index";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";

describe("Search", () => {
  it("renders a heading", async () => {
    const { getByRole } = render(<Search />);

    await act(async () => new Promise((r) => setTimeout(r, 500)));
    const heading = getByRole("heading", {
      name: /Article Search/i,
    });

    expect(heading).toBeInTheDocument();
  });
});
