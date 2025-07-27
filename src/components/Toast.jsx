import { useEffect } from "react";
import { Alert } from "@chakra-ui/react"

export default function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <Alert.Root status={type}>
            <Alert.Indicator />
            <Alert.Title>{message}</Alert.Title>
        </Alert.Root>
    );
};
