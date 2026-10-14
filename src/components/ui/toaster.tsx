import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
        },
        success: {
          iconTheme: {
            primary: "#00c853",
            secondary: "var(--bg-primary)",
          },
        },
        error: {
          iconTheme: {
            primary: "#f44336",
            secondary: "var(--bg-primary)",
          },
        },
      }}
    />
  );
}
