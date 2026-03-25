import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing WebSocket connection
 * Handles connection lifecycle and provides methods to interact with the socket
 *
 * @param onMessageCallback - Optional callback to handle incoming WebSocket messages
 * @returns Object containing socket ref, connection status, and sendMessage function
 */
export const useSocket = (onMessageCallback?: (event: MessageEvent) => void) => {
    // Reference to the WebSocket connection
    const socket = useRef<WebSocket | null>(null);

    // Track connection status: "connecting" | "connected" | "error" | "disconnected"
    const [status, setStatus] = useState<string>("connecting");

    useEffect(() => {
        // Create new WebSocket connection
        const ws = new WebSocket("ws://localhost:8080");
        socket.current = ws;

        // Connection successful
        ws.onopen = () => {
            console.log("Connected");
            setStatus("connected");
        };

        // Handle incoming messages - use callback if provided
        ws.onmessage = (event) => {
            console.log(JSON.stringify(event));
            // Call the custom handler if provided
            if (onMessageCallback) {
                onMessageCallback(event);
            }
        };

        // Connection error occurred
        ws.onerror = (err) => {
            console.error("Error:", err);
            setStatus("error");
        };

        // Connection closed
        ws.onclose = () => {
            console.log("Disconnected");
            setStatus("disconnected");
        };

        // Cleanup: close connection when component unmounts
        return () => {
            ws.close();
        };
    }, [onMessageCallback]); // Re-run if callback changes

    /**
     * Send a message through the WebSocket
     * @param msg - The message string to send
     */
    const sendMessage = (msg: string) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(msg);
        } else {
            console.log("Socket not ready");
        }
    };

    return { status, socket, sendMessage };
};
