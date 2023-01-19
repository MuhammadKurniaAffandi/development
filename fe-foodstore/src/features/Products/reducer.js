import {
  START_FETCHING_PRODUCT,
  ERROR_FETCHING_PRODUCT,
  SUCCESS_FETCHING_PRODUCT,
  SET_PAGE,
  SET_CATEGORY,
  SET_KEYWORD,
  SET_TAGS,
  NEXT_PAGE,
  PREV_PAGE,
  TOGGLE_TAG,
} from "./constants";

const statuslist = {
  idle: "idle",
  process: "process",
  success: "success",
  error: "error",
};

const initialState = {
  data: [],
  currentPage: 1,
  totalItems: -1,
  perPage: 6,
  keyword: "",
  category: "",
  tags: [],
  status: statuslist.idle,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    /* pengolahan data dalam proses */
    case START_FETCHING_PRODUCT:
      return { ...state, status: statuslist.process };

    /* pengolahan data error */
    case ERROR_FETCHING_PRODUCT:
      return { ...state, status: statuslist.error };

    /* pengolahan data success */
    case SUCCESS_FETCHING_PRODUCT:
      return {
        ...state,
        status: statuslist.success,
        data: action.data,
        totalItems: action.count,
      };

    /* untuk menentukan halaman aktif */
    case SET_PAGE:
      return { ...state, currentPage: action.currentPage };

    /* untuk menentukan keyword filter */
    case SET_KEYWORD:
      return { ...state, keyword: action.keyword, category: "", tags: [] };

    /* untuk menentukan kategori produk yang aktif */
    case SET_CATEGORY:
      return {
        ...state,
        currentPage: 1,
        tags: [],
        category: action.category,
        keyword: "",
      };

    /* untuk menentukan tags yang aktif */

    case SET_TAGS:
      return { ...state, tags: action.tags };

    /* untuk action toggle tag */
    case TOGGLE_TAG:
      if (!state.tags.includes(action.tag)) {
        return { ...state, currentPage: 1, tags: [...state.tags, action.tag] };
      } else {
        return {
          ...state,
          currentPage: 1,
          tags: state.tags.filter((tag) => tag !== action.tag),
        };
      }

    /* action untuk halaman berikutnya */
    case NEXT_PAGE:
      return { ...state, currentPage: state.currentPage + 1 };

    /* action untuk halaman sebelumnya */
    case PREV_PAGE:
      return { ...state, currentPage: state.currentPage - 1 };

    default:
      return state;
  }
}
