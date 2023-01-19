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

import { getProducts } from "../../api/product";

import debounce from "debounce-promise";
let debouncedFetchProducts = debounce(getProducts, 1000);

/* pengelohan data dalam prosess */
export const startFetchingProducts = () => {
  return {
    type: START_FETCHING_PRODUCT,
  };
};

/* pengelohan data error */
export const errorFetchingProducts = () => {
  return {
    type: ERROR_FETCHING_PRODUCT,
  };
};

/* pengolahan data success */
export const successFetchingProducts = ({ data, count }) => {
  return {
    type: SUCCESS_FETCHING_PRODUCT,
    data,
    count,
  };
};

/* fetch data product */
export const fetchProducts = () => {
  return async (dispatch, getState) => {
    // dispatch `startFetchingProducts` menandakan _request_ produk dimulai
    dispatch(startFetchingProducts());

    let perPage = getState().products.perPage || 9;
    let currentPage = getState().products.currentPage || 1;
    let tags = getState().products.tags || [];
    let keyword = getState().products.keyword || "";
    let category = getState().products.category || "";

    const params = {
      limit: perPage,
      skip: currentPage * perPage - perPage,
      q: keyword,
      tags,
      category,
    };

    // menggunakan `getProducts` untuk mendapatkan data produk dari API
    try {
      let {
        data: { data, count },
      } = await debouncedFetchProducts(params);
      dispatch(successFetchingProducts({ data, count }));
    } catch (error) {
      // jika terjadi `error`
      dispatch(errorFetchingProducts());
    }
  };
};

/* untuk menentukan halaman aktif */
export const setPage = (number = 1) => {
  return {
    type: SET_PAGE,
    currentPage: number,
  };
};

/* untuk menentukan keyword filter */
export const setKeyword = (keyword) => {
  return {
    type: SET_KEYWORD,
    keyword,
  };
};

/* untuk menentukan kategori produk yang aktif */
export const setCategory = (category) => {
  return {
    type: SET_CATEGORY,
    category,
  };
};

/* untuk menentukan tags yang aktif */
export const setTags = (tags) => {
  return {
    type: SET_TAGS,
    tags,
  };
};

/* untuk action toggle tag */
export const toggleTag = (tag) => {
  return {
    type: TOGGLE_TAG,
    tag,
  };
};

/* action untuk halaman berikutnya */
export const goToNextPage = () => {
  return {
    type: NEXT_PAGE,
  };
};

/* action untuk halaman sebelumnya */
export const goToPrevPage = () => {
  return {
    type: PREV_PAGE,
  };
};
