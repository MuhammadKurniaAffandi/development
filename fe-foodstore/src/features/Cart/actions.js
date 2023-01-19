import { ADD_ITEM, REMOVE_ITEM, CLEAR_ITEMS, SET_ITEMS } from "./constants";

/* untuk action Tambah Items */
export function addItem(item) {
  // UDPATE BUG FIXING 23/07/2021
  return {
    type: ADD_ITEM,
    // perubahan BUG
    item: {
      ...item,
      product: item.product || item,
    },
  };
}

/* untuk action Hapus Items */
export function removeItem(item) {
  return {
    type: REMOVE_ITEM,
    item,
  };
}

/* untuk action Bersihkan Items */
export function clearItems() {
  return {
    type: CLEAR_ITEMS,
  };
}

/* untuk action Set Items */
export function setItems(items) {
  return {
    type: SET_ITEMS,
    items,
  };
}
