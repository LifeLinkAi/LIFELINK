type RootState = {
  notifications: {
    unreadCount: number;
  };
};

const defaultState: RootState = {
  notifications: {
    unreadCount: 0,
  },
};

export function useAppSelector<TSelected>(selector: (state: RootState) => TSelected) {
  return selector(defaultState);
}
