import { ADD_ITEM, REMOVE_ITEM, CLEAR_ITEMS, SET_ITEMS } from "./constants";

const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : [];

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    /* untuk action Tambah Item */
    case ADD_ITEM:
      if (state.find((item) => item._id === action.item._id)) {
        return state.map((item) => ({
          ...item,
          qty: item._id === action.item._id ? item.qty + 1 : item.qty,
        }));
      } else {
        return [...state, { ...action.item, qty: 1 }];
      }

    /* untuk action Hapus Item */
    case REMOVE_ITEM:
      return state
        .map((item) => ({
          ...item,
          qty: item._id === action.item._id ? item.qty - 1 : item.qty,
        }))
        .filter((item) => item.qty > 0);

    /* untuk action Bersihkan Items */
    case CLEAR_ITEMS:
      return [];

    /* untuk action Set Items */
    case SET_ITEMS:
      return action.items;

    default:
      return state;
  }
}
