import React from 'react';
import { createSlice } from '@reduxjs/toolkit';

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    isLogginActive: true,
    name: '',
    notificationSystem: null,
  },
  reducers: {
    setRef: (state, action) => {
      state.notificationSystem = action.payload
    },
    changeName: (state, action) => {
      state.name = action.payload
    },
    createNotification: (state, action) => {
      state.notificationSystem.current.addNotification({
        message: action.payload[0],
        level: action.payload[1],
      });
    },
    changeState: (state) => {
      let rightSide = document.getElementsByClassName('right-side')[0]
      if (state.isLogginActive) {
        rightSide.classList.remove("right");
        rightSide.classList.add("left");
      } else {
        rightSide.classList.remove("left");
        rightSide.classList.add("right");
      }
      state.isLogginActive = !state.isLogginActive
    }
  },
})

export const { changeName, createNotification, setRef, changeState } = appSlice.actions

export default appSlice.reducer
