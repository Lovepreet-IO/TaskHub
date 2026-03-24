import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../pages/auth/Login";
import { BrowserRouter } from "react-router-dom";
import api from "../api/axios";

jest.mock("../api/axios");

describe("Login Page", () => {

    test("renders login form", () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    test("calls API on submit", async () => {
        (api.post as jest.Mock).mockResolvedValue({
            data: { access_token: "123" },
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        await userEvent.type(screen.getByPlaceholderText(/email/i), "test1234@gmail.com");
        await userEvent.type(screen.getByPlaceholderText(/password/i), "654321");

        await userEvent.click(screen.getByRole("button", { name: /login/i }));

        expect(api.post).toHaveBeenCalled();
    });

});