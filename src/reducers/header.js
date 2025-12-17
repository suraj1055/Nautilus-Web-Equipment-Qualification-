import { SET_HEADER_TITLE } from '../actions/types';

const initialState = {
  title: 'Databases', // Default title
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_HEADER_TITLE:
      return {
        ...state,
        title: payload,
      };
    default:
      return state;
  }
}

