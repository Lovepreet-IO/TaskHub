import { render, screen } from "@testing-library/react";
import { UserProvider } from "../context/UserContext";
import { MemoryRouter } from "react-router-dom";
import api from "../api/axios";
import Dashboard from "../pages/dashboard/Dashboard";

jest.mock("../api/axios");

// We need two different user states across tests, so we use a mutable mock.
const mockUseUser = {
    user: { isAdmin: true } as { isAdmin: boolean } | null,
    setUser: jest.fn(),
};

jest.mock("../hooks/useUser", () => ({
    useUser: () => mockUseUser,
}));

afterEach(() => {
    jest.clearAllMocks();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

// Shape that matches what Dashboard.tsx actually reads from res.data?.data
const makeAdminApiResponse = () => ({
    data: {
        data: {
            profile: { isAdmin: true },
            total_tasks: {
                total: 10,
                pending: 4,
                in_progress: 2,
                waiting_for_review: 1,
                completed: 3,
            },
            assigned_by_me: {
                total: 5,
                pending: 2,
                in_progress: 1,
                waiting_for_review: 0,
                completed: 2,
            },
        },
    },
});

const makeUserApiResponse = () => ({
    data: {
        data: {
            profile: { isAdmin: false },
            assigned_to_me: {
                total: 3,
                pending: 1,
                in_progress: 1,
                waiting_for_review: 0,
                completed: 1,
            },
            assigned_by_me: {
                total: 2,
                pending: 1,
                in_progress: 0,
                waiting_for_review: 0,
                completed: 1,
            },
        },
    },
});

// ── Tests ─────────────────────────────────────────────────────────────────────

test("renders dashboard heading", async () => {
    mockUseUser.user = { isAdmin: true };
    (api.get as jest.Mock).mockResolvedValue(makeAdminApiResponse());

    render(
        <MemoryRouter>
            <UserProvider>
                <Dashboard />
            </UserProvider>
        </MemoryRouter>
    );

    // Use heading role to avoid matching the sidebar nav link
    expect(await screen.findByRole("heading", { name: /all tasks overview/i })).toBeInTheDocument();
});

test("fetches and displays task summary for admin", async () => {
    mockUseUser.user = { isAdmin: true };
    (api.get as jest.Mock).mockResolvedValue(makeAdminApiResponse());

    render(
        <MemoryRouter>
            <UserProvider>
                <Dashboard />
            </UserProvider>
        </MemoryRouter>
    );

    const totalTasksElements = await screen.findAllByText("Total Tasks");
    expect(totalTasksElements.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findAllByText("10")).toBeTruthy();
});

test("admin sees 'All Tasks Overview' heading", async () => {
    mockUseUser.user = { isAdmin: true };
    (api.get as jest.Mock).mockResolvedValue(makeAdminApiResponse());

    render(
        <MemoryRouter>
            <UserProvider>
                <Dashboard />
            </UserProvider>
        </MemoryRouter>
    );

    expect(await screen.findByText(/all tasks overview/i)).toBeInTheDocument();
});

test("normal user sees 'Tasks Assigned To You' heading", async () => {
    mockUseUser.user = { isAdmin: false };
    (api.get as jest.Mock).mockResolvedValue(makeUserApiResponse());

    render(
        <MemoryRouter>
            <UserProvider>
                <Dashboard />
            </UserProvider>
        </MemoryRouter>
    );

    expect(await screen.findByText(/tasks assigned to you/i)).toBeInTheDocument();
});
