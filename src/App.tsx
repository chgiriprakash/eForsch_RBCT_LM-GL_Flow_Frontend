import { Provider } from 'react-redux';
import './App.css'
import { store } from './store/store';
import MainRoutes from './routes/MainRoutes';
import { Suspense } from 'react';

function App() {

  return (
    // <Provider store={store}>
    //   <MainRoutes />
    // </Provider>
    <Provider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <MainRoutes />
      </Suspense>
    </Provider>
  );
}

export default App
