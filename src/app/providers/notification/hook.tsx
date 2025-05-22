import { useContext } from "react";
import { MessageObject, notificationsContext } from "./provider";

export function useNotification() {
  const { addMessage, removeMessage, checkMessage, duration, alterMessage } =
    useContext(notificationsContext)!;

  function showNotification(messageObject: MessageObject) {
    return new Promise<void>((resolve) => {
      if (!checkMessage(messageObject.id)) {
        let dur;
        if (messageObject.duration === undefined) dur = duration;
        else if (messageObject.duration === null) dur = 500000;
        else dur = messageObject.duration;
        const timeoutId = setTimeout(() => {
          removeMessage(messageObject.id);
        }, dur);
        addMessage({ ...messageObject, timeoutId, resolve });
      }
    });
  }

  async function showAsyncNotification<T>(
    promise: Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string | ((error: unknown) => string),
    successDuration?: number
  ) {
    const id = Math.random().toString(36).substring(7);
    const messageObject: MessageObject = {
      id,
      title: loadingMessage,
      status: "loading",
      duration: null,
    };
    showNotification(messageObject);
    return await promise
      .then((value) => {
        alterMessage(id, {
          title: successMessage,
          status: "success",
        });
        setTimeout(() => {
          removeMessage(id);
        }, successDuration ?? 3000);
        return value;
      })
      .catch((error) => {
        alterMessage(id, {
          title:
            typeof errorMessage === "string"
              ? errorMessage
              : errorMessage(error),
          status: "error",
        });
        return error;
      });
  }

  return { showNotification, removeMessage, showAsyncNotification };
}
