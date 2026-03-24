import { render, screen } from "@testing-library/react";
import api from "../api/axios";
import Tasks from "../pages/tasks/Tasks";
import { UserProvider } from "../context/UserContext";
import { MemoryRouter } from "react-router-dom";

jest.mock("../api/axios");

// Mock useUser so the component gets an admin user immediately,
// without relying on UserProvider reading from localStorage.
jest.mock("../hooks/useUser", () => ({
    useUser: () => ({
        user: { isAdmin: true },
        setUser: jest.fn(),
    }),
}));

afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

test("admin sees all tasks", async () => {
    // Shape matches what Tasks.tsx actually reads:
    // res.data?.data?.AllTasks?.tasks  (for admin)
    // res.data?.data?.TaskGivenByYou   (for givenByMe)
    (api.get as jest.Mock).mockResolvedValue({
        data: {
            data: {
                TaskGivenByYou: [],
                AllTasks: {
                    tasks: [
                        { task_id: 1, title: "Admin Task 1", description: "", status: "pending", priority: "low", assigned_to_name: "", assigned_by_name: "", created_at: new Date().toISOString() },
                        { task_id: 2, title: "Admin Task 2", description: "", status: "pending", priority: "low", assigned_to_name: "", assigned_by_name: "", created_at: new Date().toISOString() },
                    ],
                },
            },
        },
    });

    // Second call is for /tasks/deleted (admin only)
    (api.get as jest.Mock).mockResolvedValueOnce({
        data: {
            data: {
                TaskGivenByYou: [],
                AllTasks: {
                    tasks: [
                        { task_id: 1, title: "Admin Task 1", description: "", status: "pending", priority: "low", assigned_to_name: "", assigned_by_name: "", created_at: new Date().toISOString() },
                        { task_id: 2, title: "Admin Task 2", description: "", status: "pending", priority: "low", assigned_to_name: "", assigned_by_name: "", created_at: new Date().toISOString() },
                    ],
                },
            },
        },
    }).mockResolvedValueOnce({
        data: { data: { DeletedTasks: [] } },
    });

    render(
        <MemoryRouter>
            <UserProvider>
                <Tasks />
            </UserProvider>
        </MemoryRouter>
    );

    expect(await screen.findByText("Admin Task 1")).toBeInTheDocument();
    expect(await screen.findByText("Admin Task 2")).toBeInTheDocument();
});
