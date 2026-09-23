import { useState } from 'react';

/**
 * Hook that manages the guest auth modal state.
 * Returns visibility state + open/close handlers.
 * Wire up <GuestAuthModal> in your screen using these values.
 */
export function useGuestAuth() {
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  const promptGuestAuth = () => {
    setGuestModalVisible(true);
  };

  const closeGuestModal = () => {
    setGuestModalVisible(false);
  };

  return { guestModalVisible, promptGuestAuth, closeGuestModal };
}

