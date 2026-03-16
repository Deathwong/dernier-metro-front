import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function createJsonResponse(payload, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
}

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("charge les stations au demarrage", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (String(url).includes("/stations")) {
        return createJsonResponse({
          stations: [
            {
              id: 1,
              name: "Châtelet",
              headway_minutes: 3,
              last_metro_time: "01:15:00",
            },
          ],
        });
      }

      return createJsonResponse({});
    });

    render(<App />);

    expect(await screen.findByText("1 stations")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Châtelet" })).toBeInTheDocument();
    expect(screen.getByText("01:15")).toBeInTheDocument();
  });

  test("affiche le prochain metro apres soumission", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (String(url).includes("/stations")) {
        return createJsonResponse({
          stations: [
            {
              id: 1,
              name: "Châtelet",
              headway_minutes: 3,
              last_metro_time: "01:15:00",
            },
          ],
        });
      }

      if (String(url).includes("/next-metro")) {
        return createJsonResponse({
          station: "Châtelet",
          nextArrival: "11:00",
          isLast: false,
          headwayMin: 3,
        });
      }

      return createJsonResponse({});
    });

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("1 stations");
    await user.click(screen.getByRole("button", { name: "Voir le prochain metro" }));

    expect(await screen.findByText("11:00")).toBeInTheDocument();
    expect(screen.getByText(/Le service circule normalement/)).toBeInTheDocument();
  });

  test("affiche le message de service ferme", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (String(url).includes("/stations")) {
        return createJsonResponse({
          stations: [
            {
              id: 1,
              name: "Châtelet",
              headway_minutes: 3,
              last_metro_time: "01:15:00",
            },
          ],
        });
      }

      if (String(url).includes("/next-metro")) {
        return createJsonResponse({
          station: "Châtelet",
          service: "closed",
          message: "Le metro est ferme (01:15-05:30)",
        });
      }

      return createJsonResponse({});
    });

    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("1 stations");
    await user.click(screen.getByRole("button", { name: "Voir le prochain metro" }));

    expect(await screen.findByText("Service ferme")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Le metro est ferme/)).toBeInTheDocument();
    });
  });
});
