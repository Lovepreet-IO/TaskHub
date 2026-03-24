import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../pages/auth/Register";
import "@testing-library/jest-dom";
// import {showError} from "../components/common/toast";
// Mock navigate
const mockNavigate = jest.fn();
const assignMock = jest.fn();

beforeEach(() => {
    Object.defineProperty(window, "location", {
        writable: true,
        value: {
            ...window.location,
            assign: assignMock,
        },
    });
});
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
        promise: jest.fn(),
    },
}));


jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// Mock useAuthRedirect
// jest.mock("../routes/useAuthRedirect", () => jest.fn());
jest.mock("../routes/useAuthRedirect", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../components/common/toast", () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showLoading: jest.fn(),
}));


// Mock fetch
(globalThis as any).fetch = jest.fn();

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Register />
        </BrowserRouter>
    );

describe("Register Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders form inputs", () => {
        renderComponent();

        expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    });

    test("shows validation error for short first name", () => {
        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "ab" },
        });

        expect(
            screen.getByText("First name must be at least 3 characters")
        ).toBeInTheDocument();
    });

    test("shows invalid email error", () => {
        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "invalid-email" },
        });

        expect(
            screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
    });

    test("checks email availability (available)", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ available: true }),
        });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });

        await waitFor(() => {
            expect(screen.getByText("Email available")).toBeInTheDocument();
        });
    });

    test("checks email availability (exists)", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ available: false }),
        });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "taken@example.com" },
        });

        await waitFor(() => {
            expect(screen.getByText("Email already exists")).toBeInTheDocument();
        });
    });

    test("submit button disabled when form invalid", () => {
        renderComponent();

        const button = screen.getByText("Continue");
        expect(button).toBeDisabled();
    });

    test("enables submit when form is valid", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ available: true }),
        });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "john@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        await waitFor(() => {
            expect(screen.getByText("Continue")).toBeEnabled();
        });
    });

    test("submits form and navigates", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ available: true }),
        });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "john@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        // ✅ wait until button enabled
        const button = await screen.findByText("Continue");

        await waitFor(() => expect(button).toBeEnabled());

        fireEvent.click(button);

        await waitFor(() => {
            expect(localStorage.getItem("register_data")).toBeTruthy();
            expect(mockNavigate).toHaveBeenCalledWith("/set-username");
        });
    });

    test("google login redirects", () => {
        const assignMock = jest.fn();

        delete (window as any).location;
        (window as any).location = {
            assign: assignMock,
        };

        renderComponent();

        fireEvent.click(screen.getByText("Sign in with Google"));

        expect(assignMock).toHaveBeenCalledWith(
            "http://localhost:8000/oauth/google"
        );
    });
});