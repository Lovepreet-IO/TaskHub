import toast from "react-hot-toast";

// 🔄 Loading Toast
export const showLoading = (message: string, id: string) => {
    toast.loading(message, { id });
};

export const showSuccess = (message: string, id?: string) => {
    toast.success(message, {
        id, // ✅ prevents duplicate
        duration: 3000,
        position: "top-right",
        style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #22d3ee",
        },
    });
};

export const showError = (message: string, id?: string) => {
    toast.error(message, {
        id,
        duration: 3000,
        position: "top-right",
        style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #ef4444",
        },
    });
};

export const showInfo = (message: string, id?: string) => {
    toast(message, {
        id,
        duration: 2500,
        position: "top-right",
        style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #94a3b8",
        },
    });
};

// ⚠️ Warning Toast (optional)
export const showWarning = (message: string) => {
    toast(message, {
        icon: "⚠️",
        style: {
            background: "#f59e0b",
            color: "#fff",
        },
    });
};

// 🔥 Promise-based Toast (BEST for API calls)
export const toastPromise = <T>(
    promise: Promise<T>,
    messages: {
    loading: string;
    success: string;
    error: string;
}
) => {
    return toast.promise(promise, messages);
};