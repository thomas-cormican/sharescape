export default function AuthReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload.user,
        isFetching: false,
        error: false,
      };

    case "LOGOUT":
      return {
        user: null,
        isFetching: false,
        error: false,
      };

    case "FETCHING":
      return {
        user: null,
        isFetching: true,
        error: false,
      };

    case "ERROR":
      return {
        user: null,
        isFetching: false,
        error: true,
      };

    case "UPDATE USER":
      return {
        user: action.payload.user,
        isFetching: false,
        error: false,
      };

    case "FOLLOW USER":
      return {
        user: {
          ...state.user,
          following: [...state.user.following, action.payload],
        },
        isFetching: false,
        error: false,
      };

    case "UNFOLLOW USER":
      return {
        user: {
          ...state.user,
          following: state.user.following.filter(
            (followedUser) => followedUser !== action.payload
          ),
        },
        isFetching: false,
        error: false,
      };

    case "READ NOTIFICATIONS":
      return {
        user: {
          ...state.user,
          notifications: action.payload,
        },
        isFetching: false,
        error: false,
      };
    default:
      break;
  }
}
