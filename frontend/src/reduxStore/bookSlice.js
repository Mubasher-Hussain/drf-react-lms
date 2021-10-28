import { createSlice } from '@reduxjs/toolkit';

export const bookSlice = createSlice({
  name: 'book',
  initialState: {
    bookData: {
        cover: null,
        title: '',
        summary: '',
        author: '',
        published_on: '',
        category: '',
        quantity: 0,},
  },
  reducers: {
    changeState: (state, action) => {
      state.bookData = action.payload
    },
    
  },
})

export const { changeState } = bookSlice.actions

export default bookSlice.reducer
