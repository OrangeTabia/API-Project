import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import SpotsLanding from './components/Spots/SpotsLanding'; 
import SpotDetails from './components/Spots/SpotDetails';
import CreateSpot from './components/Spots/CreateSpot'; 
import UpdateSpot from './components/Spots/UpdateSpot';
import CreateReview from './components/Spots/CreateReview'; 
import ManageSpots from './components/Spots/ManageSpots'; 
import Navigation from './components/Navigation/Navigation-bonus';
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotsLanding />
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '/spots', 
        element: <CreateSpot />
      }, 
      {
        path: '/spots/:spotId',
        element: <UpdateSpot />
      }, 
      {
        path: '/spots/:spotId/reviews',
        element: <CreateReview />
      },
      {
        path: '/spots/current',
        element: <ManageSpots />
      }, 
      // {
      //   path: 'login',
      //   element: <LoginFormPage />
      // },
      // {
      //   path: 'signup',
      //   element: <SignupFormPage />
      // }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
