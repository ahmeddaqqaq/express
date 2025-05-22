import { createContext, useState, ReactNode, useRef, useEffect } from "react";
import { NotificationsComponent } from "../../components/notification-component";

export type MessageObject = {
  id: string | undefined;
  title: string;
  status: "error" | "success" | "warning" | "loading";
  timeoutId?: NodeJS.Timeout;
  duration?: number | null;
  resolve?: () => void;
};

export const notificationsContext = createContext<{
  addMessage: (messageObject: MessageObject) => void;
  removeMessage: (id: string | undefined) => void;
  checkMessage: (id: string | undefined) => boolean;
  alterMessage: (id: string, newMessageObject: Partial<MessageObject>) => void;
  duration: number | undefined;
} | null>(null);

export function NotificationsProvider({
  children,
  duration,
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const messagesRef = useRef<MessageObject[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function addMessage(messageObject: MessageObject) {
    if (!messagesRef.current.find((obj) => obj.id === messageObject.id))
      setMessages([...messagesRef.current, messageObject]);
  }

  function removeMessage(id: string | undefined) {
    const messageObject = messagesRef.current.find(
      (messageObject) => messageObject.id === id
    );
    if (messageObject?.timeoutId) {
      clearTimeout(messageObject.timeoutId);
    }
    if (messageObject?.resolve) {
      messageObject.resolve();
    }

    setMessages(
      messagesRef.current.filter((messageObject) => messageObject.id !== id)
    );
  }

  function alterMessage(id: string, newMessageObject: Partial<MessageObject>) {
    setMessages(
      messagesRef.current.map((messageObject) =>
        messageObject.id === id
          ? { ...messageObject, ...newMessageObject }
          : { ...messageObject }
      )
    );
  }

  function checkMessage(id: string | undefined) {
    return messages.some((messageObject) => messageObject.id === id);
  }
  return (
    <notificationsContext.Provider
      value={{
        addMessage,
        removeMessage,
        checkMessage,
        duration,
        alterMessage,
      }}
    >
      {children}
      <NotificationsComponent
        removeMessage={removeMessage}
        messages={messages}
      />
    </notificationsContext.Provider>
  );
}
