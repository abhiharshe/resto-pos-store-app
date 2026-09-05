/**
 * Simple confirmation hook used across the application.
 * It returns an async function that resolves to true if the user confirms,
 * otherwise false. This implementation uses the native `window.confirm`
 * dialog, which is sufficient for functionality while keeping the hook
 * lightweight and framework agnostic.
 *
 * The hook signature mirrors common patterns where a component calls
 * `await confirm({ title, message })`.
 */
export const useConfirm = () => {
  /**
   * Displays a confirmation prompt.
   * @param options.title Optional title (ignored in this simple implementation).
   * @param options.message Message shown to the user.
   * @param options.confirmLabel Label for the confirm button (ignored).
   * @param options.variant UI variant (ignored).
   * @returns Promise resolving to true if confirmed, false otherwise.
   */
  const confirm = async (options: {
    title?: string;
    message?: string;
    confirmLabel?: string;
    variant?: string;
  } = {}): Promise<boolean> => {
    const { message, title } = options;
    const prompt = message ?? title ?? 'Are you sure?';
    // Using native confirm dialog for simplicity.
    // In production, replace with a custom modal if desired.
    return window.confirm(prompt);
  };

  return confirm;
};
