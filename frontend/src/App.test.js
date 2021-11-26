import { render, screen } from '@testing-library/react';
import {Login} from './login';
import { Provider } from 'react-redux'
import store from './app/store'

test('renders learn react link', () => {
  render(<Provider store={store}><Login /></Provider>);
});
