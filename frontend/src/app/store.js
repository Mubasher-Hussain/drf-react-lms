import { configureStore } from '@reduxjs/toolkit'
import appSlice from '../reduxStore/appSlice'
import bookSlice from '../reduxStore/bookSlice'

export default configureStore({
  reducer: {
    app: appSlice,
    book: bookSlice,
  },
})